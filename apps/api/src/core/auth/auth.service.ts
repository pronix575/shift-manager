import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';

import { parseDurationMs } from 'core/config/env';
import { PrismaService } from 'core/prisma/prisma.service';
import { UserStatus } from 'generated/prisma/enums';

import { CurrentUser } from './current-user.types';
import { generateRefreshToken, hashRefreshToken } from './token.utils';

export type SessionUser = CurrentUser & {
  middleName: string | null;
  status: UserStatus;
  departments: Array<{ id: string; name: string }>;
  telegramLinked: boolean;
  mustChangePassword: boolean;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(login: string, password: string) {
    const identity = await this.prisma.passwordIdentity.findUnique({
      where: { login },
      include: {
        user: {
          include: {
            organization: true,
            departments: { include: { department: true } },
            telegram: true,
            password: true,
          },
        },
      },
    });

    if (!identity || !(await compare(password, identity.passwordHash))) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    if (identity.user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Пользователь архивирован');
    }

    if (
      identity.user.organization &&
      identity.user.organization.status !== 'ACTIVE'
    ) {
      throw new ForbiddenException('Организация архивирована');
    }

    return this.issueSession(identity.user.id);
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.getRefreshTokenHash(refreshToken);
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now() ||
      session.user.status !== UserStatus.ACTIVE
    ) {
      throw new UnauthorizedException('Сессия недействительна');
    }

    await this.prisma.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return this.issueSession(session.userId);
  }

  async logout(refreshToken: string | null) {
    if (!refreshToken) {
      return;
    }

    await this.prisma.refreshSession.updateMany({
      where: {
        tokenHash: this.getRefreshTokenHash(refreshToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: string) {
    return this.getSessionUser(userId);
  }

  async verifyAccessToken(token: string): Promise<CurrentUser> {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      return {
        id: user.id,
        organizationId: user.organizationId,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    } catch {
      throw new UnauthorizedException('Сессия истекла');
    }
  }

  async createTelegramLinkCode(user: CurrentUser) {
    const ttlMinutes = this.configService.getOrThrow<number>(
      'TELEGRAM_LINK_CODE_TTL_MINUTES',
    );
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await this.prisma.telegramLinkCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    return { code, expiresAt };
  }

  async linkTelegramByCode(code: string, telegramId: string, username?: string) {
    const linkCode = await this.prisma.telegramLinkCode.findUnique({
      where: { code },
      include: { user: true },
    });

    if (
      !linkCode ||
      linkCode.usedAt ||
      linkCode.expiresAt.getTime() <= Date.now() ||
      linkCode.user.status !== UserStatus.ACTIVE
    ) {
      throw new ForbiddenException('Код привязки недействителен');
    }

    await this.prisma.$transaction([
      this.prisma.telegramIdentity.upsert({
        where: { userId: linkCode.userId },
        create: { userId: linkCode.userId, telegramId, username },
        update: { telegramId, username },
      }),
      this.prisma.telegramLinkCode.update({
        where: { id: linkCode.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.auditLog.create({
        data: {
          organizationId: linkCode.user.organizationId,
          actorId: linkCode.userId,
          action: 'LINK_TELEGRAM',
          entityType: 'User',
          entityId: linkCode.userId,
          details: { telegramId, username },
        },
      }),
    ]);
  }

  async getUserByTelegramId(telegramId: string): Promise<CurrentUser | null> {
    const identity = await this.prisma.telegramIdentity.findUnique({
      where: { telegramId },
      include: { user: true },
    });

    if (!identity || identity.user.status !== UserStatus.ACTIVE) {
      return null;
    }

    return {
      id: identity.user.id,
      organizationId: identity.user.organizationId,
      role: identity.user.role,
      firstName: identity.user.firstName,
      lastName: identity.user.lastName,
    };
  }

  private async issueSession(userId: string) {
    const user = await this.getSessionUser(userId);
    const accessTtl = this.configService.getOrThrow<string>(
      'JWT_ACCESS_TTL',
    ) as `${number}${'s' | 'm' | 'h' | 'd'}`;
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        organizationId: user.organizationId,
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessTtl,
      },
    );
    const refreshToken = generateRefreshToken();
    const refreshTtl = parseDurationMs(
      this.configService.getOrThrow<string>('JWT_REFRESH_TTL'),
    );

    await this.prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash: this.getRefreshTokenHash(refreshToken),
        expiresAt: new Date(Date.now() + refreshTtl),
      },
    });

    return { accessToken, refreshToken, user };
  }

  private async getSessionUser(userId: string): Promise<SessionUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        departments: {
          where: { department: { archivedAt: null } },
          include: { department: true },
        },
        telegram: true,
        password: true,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return {
      id: user.id,
      organizationId: user.organizationId,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      status: user.status,
      departments: user.departments.map(({ department }) => ({
        id: department.id,
        name: department.name,
      })),
      telegramLinked: Boolean(user.telegram),
      mustChangePassword: user.password?.mustChangePassword ?? false,
    };
  }

  private getRefreshTokenHash(refreshToken: string): string {
    return hashRefreshToken(
      refreshToken,
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    );
  }
}
