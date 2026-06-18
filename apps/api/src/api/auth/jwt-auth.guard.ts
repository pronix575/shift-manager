import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { AuthService } from 'core/auth/auth.service';

import { IS_PUBLIC_ROUTE } from './public.decorator';

type RequestWithUser = Request & {
  currentUser?: Awaited<ReturnType<AuthService['verifyAccessToken']>>;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.readBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Необходима авторизация');
    }

    request.currentUser = await this.authService.verifyAccessToken(token);

    return true;
  }

  private readBearerToken(request: Request): string | null {
    const header = request.headers.authorization;

    if (!header) {
      return null;
    }

    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
