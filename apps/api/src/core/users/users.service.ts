import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcryptjs';

import { CurrentUser } from 'core/auth/current-user.types';
import { DepartmentsService } from 'core/departments/departments.service';
import {
  buildPaginatedResult,
  getPaginationRange,
  type PaginationParams,
} from 'core/pagination/pagination';
import { PrismaService } from 'core/prisma/prisma.service';
import type { Prisma } from 'generated/prisma/client';
import { UserRole, UserStatus } from 'generated/prisma/enums';

import { buildLoginBase, getLoginCandidate } from './login-generator';

export type CreateUserInput = {
  firstName: string;
  lastName: string;
  middleName?: string | null;
  role: UserRole;
  organizationId?: string | null;
  departmentIds?: string[];
  password: string;
};

export type UpdateUserInput = Partial<
  Pick<
    CreateUserInput,
    | 'firstName'
    | 'lastName'
    | 'middleName'
    | 'role'
    | 'departmentIds'
    | 'password'
  >
>;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly departmentsService: DepartmentsService,
  ) {}

  async listOrganizationUsers(
    actor: CurrentUser,
    pagination?: PaginationParams,
  ) {
    const organizationId = this.getActorOrganizationId(actor);

    return this.listUsersByOrganizationId(organizationId, pagination);
  }

  async listUsersByOrganizationId(
    organizationId: string,
    pagination?: PaginationParams,
  ) {
    const where = { organizationId, status: UserStatus.ACTIVE };
    const orderBy = [
      { lastName: 'asc' },
      { firstName: 'asc' },
    ] satisfies Prisma.UserFindManyArgs['orderBy'];
    const include = {
      password: { select: { login: true, mustChangePassword: true } },
      telegram: {
        select: { telegramId: true, username: true, linkedAt: true },
      },
      departments: { include: { department: true } },
    } as const;

    if (pagination) {
      const total = await this.prisma.user.count({ where });
      const range = getPaginationRange(pagination, total);
      const items = await this.prisma.user.findMany({
        where,
        orderBy,
        include,
        skip: range.skip,
        take: range.take,
      });

      return buildPaginatedResult(items, total, range);
    }

    return this.prisma.user.findMany({
      where,
      orderBy,
      include,
    });
  }

  async createUser(actor: CurrentUser, input: CreateUserInput) {
    const organizationId = this.resolveOrganizationForNewUser(actor, input);
    const departmentIds = input.departmentIds ?? [];

    if (organizationId) {
      await this.departmentsService.assertDepartmentsBelongToOrganization(
        departmentIds,
        organizationId,
      );
    }

    const login = await this.generateUniqueLogin(
      input.lastName,
      input.firstName,
    );
    const passwordHash = await hash(input.password, 12);

    const user = await this.prisma.user.create({
      data: {
        organizationId,
        role: input.role,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        middleName: input.middleName?.trim() || null,
        password: {
          create: {
            login,
            passwordHash,
            mustChangePassword: false,
            lastPasswordChangeAt: new Date(),
          },
        },
        departments: {
          create: departmentIds.map((departmentId) => ({ departmentId })),
        },
      },
      include: {
        password: { select: { login: true } },
        departments: { include: { department: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorId: actor.id,
        action: 'CREATE',
        entityType: 'User',
        entityId: user.id,
        details: { role: input.role, login },
      },
    });

    return { user, credentials: { login } };
  }

  async updateOrganizationUser(
    actor: CurrentUser,
    userId: string,
    input: UpdateUserInput,
  ) {
    const organizationId = this.getActorOrganizationId(actor);

    return this.updateUserInOrganization(actor, organizationId, userId, input);
  }

  async updateUserByOrganizationId(
    actor: CurrentUser,
    organizationId: string,
    userId: string,
    input: UpdateUserInput,
  ) {
    this.assertAdmin(actor);

    return this.updateUserInOrganization(actor, organizationId, userId, input);
  }

  private async updateUserInOrganization(
    actor: CurrentUser,
    organizationId: string,
    userId: string,
    input: UpdateUserInput,
  ) {
    const user = await this.getActiveUserInOrganization(userId, organizationId);

    if (input.role === UserRole.ADMIN) {
      throw new ForbiddenException(
        'Нельзя назначить роль админа пользователю организации',
      );
    }

    if (input.departmentIds) {
      await this.departmentsService.assertDepartmentsBelongToOrganization(
        input.departmentIds,
        organizationId,
      );
    }

    const passwordHash =
      input.password === undefined ? null : await hash(input.password, 12);

    return this.prisma.$transaction(async (tx) => {
      if (input.departmentIds) {
        await tx.userDepartment.deleteMany({ where: { userId } });
        await tx.userDepartment.createMany({
          data: input.departmentIds.map((departmentId) => ({
            userId,
            departmentId,
          })),
        });
      }

      if (passwordHash !== null) {
        await tx.passwordIdentity.update({
          where: { userId },
          data: {
            passwordHash,
            mustChangePassword: false,
            lastPasswordChangeAt: new Date(),
          },
        });
      }

      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          firstName: input.firstName?.trim() ?? user.firstName,
          lastName: input.lastName?.trim() ?? user.lastName,
          middleName:
            input.middleName === undefined
              ? user.middleName
              : input.middleName?.trim() || null,
          role: input.role ?? user.role,
        },
        include: {
          departments: { include: { department: true } },
          password: { select: { login: true, mustChangePassword: true } },
          telegram: true,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId,
          actorId: actor.id,
          action: 'UPDATE',
          entityType: 'User',
          entityId: userId,
          details: this.getUserUpdateAuditDetails(input, passwordHash !== null),
        },
      });

      return updated;
    });
  }

  async archiveOrganizationUser(actor: CurrentUser, userId: string) {
    const organizationId = this.getActorOrganizationId(actor);

    return this.archiveUserInOrganization(actor, organizationId, userId);
  }

  async archiveUserByOrganizationId(
    actor: CurrentUser,
    organizationId: string,
    userId: string,
  ) {
    this.assertAdmin(actor);

    return this.archiveUserInOrganization(actor, organizationId, userId);
  }

  private async archiveUserInOrganization(
    actor: CurrentUser,
    organizationId: string,
    userId: string,
  ) {
    await this.getActiveUserInOrganization(userId, organizationId);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.ARCHIVED,
        archivedAt: new Date(),
        auditLogs: {
          create: {
            organizationId,
            actorId: actor.id,
            action: 'ARCHIVE',
            entityType: 'User',
            entityId: userId,
          },
        },
      },
    });
  }

  private async generateUniqueLogin(lastName: string, firstName: string) {
    const base = buildLoginBase(lastName, firstName);

    for (let index = 1; index <= 999; index += 1) {
      const candidate = getLoginCandidate(base, index);
      const existing = await this.prisma.passwordIdentity.findUnique({
        where: { login: candidate },
        select: { id: true },
      });

      if (!existing) {
        return candidate;
      }
    }

    throw new Error('Не удалось сгенерировать уникальный логин');
  }

  private getUserUpdateAuditDetails(
    input: UpdateUserInput,
    passwordChanged: boolean,
  ) {
    return {
      ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
      ...(input.middleName !== undefined
        ? { middleName: input.middleName }
        : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.departmentIds !== undefined
        ? { departmentIds: input.departmentIds }
        : {}),
      ...(passwordChanged ? { passwordChanged: true } : {}),
    } satisfies Prisma.InputJsonObject;
  }

  private resolveOrganizationForNewUser(
    actor: CurrentUser,
    input: CreateUserInput,
  ): string | null {
    if (actor.role === UserRole.ADMIN) {
      if (input.role === UserRole.ADMIN) {
        return null;
      }

      if (!input.organizationId) {
        throw new ForbiddenException(
          'Для пользователя организации нужна организация',
        );
      }

      return input.organizationId;
    }

    if (
      actor.role === UserRole.ORG_MANAGER &&
      actor.organizationId &&
      input.role !== UserRole.ADMIN
    ) {
      return actor.organizationId;
    }

    throw new ForbiddenException('Недостаточно прав для создания пользователя');
  }

  private async getActiveUserInOrganization(
    userId: string,
    organizationId: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId, status: UserStatus.ACTIVE },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  private getActorOrganizationId(actor: CurrentUser): string {
    if (actor.role !== UserRole.ORG_MANAGER || !actor.organizationId) {
      throw new ForbiddenException('Доступно только менеджеру организации');
    }

    return actor.organizationId;
  }

  private assertAdmin(actor: CurrentUser) {
    if (actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Доступно только администратору');
    }
  }
}
