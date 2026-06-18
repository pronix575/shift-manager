import { SetMetadata } from '@nestjs/common';

import { UserRole } from 'generated/prisma/enums';

export const ROUTE_ROLES = 'routeRoles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROUTE_ROLES, roles);
