import { UserRole } from 'api/generated/api.types';

export const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Админ',
  ORG_MANAGER: 'Менеджер',
  EMPLOYEE: 'Сотрудник',
};

export const creatableUserRoleOptions = [
  { value: 'ORG_MANAGER', label: 'Менеджер' },
  { value: 'EMPLOYEE', label: 'Сотрудник' },
];
