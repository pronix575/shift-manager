import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CurrentUser } from 'core/auth/current-user.types';
import { UserRole } from 'generated/prisma/enums';

import { ROUTE_ROLES } from './roles.decorator';

type RequestWithUser = {
  currentUser?: CurrentUser;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROUTE_ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const currentUser = request.currentUser;

    if (!currentUser || !roles.includes(currentUser.role)) {
      throw new ForbiddenException('Недостаточно прав');
    }

    return true;
  }
}
