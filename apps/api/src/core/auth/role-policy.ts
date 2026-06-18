import { UserRole } from 'generated/prisma/enums';

export const organizationScopedRoles = [
  UserRole.ORG_MANAGER,
  UserRole.EMPLOYEE,
] as const;

export const ownShiftWorkerRoles = [
  UserRole.ORG_MANAGER,
  UserRole.EMPLOYEE,
] as const;

export function isAdminRole(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

export function canManageOrganization(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.ORG_MANAGER;
}

export function canWorkWithOwnShifts(role: UserRole): boolean {
  return role === UserRole.ORG_MANAGER || role === UserRole.EMPLOYEE;
}

export function assertSameOrganization(
  actorOrganizationId: string | null,
  targetOrganizationId: string | null,
) {
  if (!actorOrganizationId || actorOrganizationId !== targetOrganizationId) {
    throw new Error('Доступ к другой организации запрещен');
  }
}
