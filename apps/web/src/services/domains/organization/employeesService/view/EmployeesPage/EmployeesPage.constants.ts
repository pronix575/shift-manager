import { UserRole } from 'api/generated/api.types';

export const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Админ',
  ORG_MANAGER: 'Менеджер',
  EMPLOYEE: 'Сотрудник',
};

export const creatableRoleOptions = [
  { value: 'EMPLOYEE', label: 'Сотрудник' },
  { value: 'ORG_MANAGER', label: 'Менеджер' },
];
