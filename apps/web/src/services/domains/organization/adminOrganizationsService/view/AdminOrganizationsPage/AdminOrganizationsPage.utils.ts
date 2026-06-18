import {
  Department,
  OrganizationUser,
  UserRole,
} from 'api/generated/api.types';
import { AdminUpdateUserPayload } from 'api/organization.api';

import {
  AdminForm,
  DepartmentOption,
  OrganizationUserForm,
} from './AdminOrganizationsPage.types';

export const emptyAdminForm: AdminForm = {
  lastName: '',
  firstName: '',
  middleName: '',
  password: '',
};

export function getEmptyUserForm(): OrganizationUserForm {
  return {
    lastName: '',
    firstName: '',
    middleName: '',
    password: '',
    role: 'ORG_MANAGER',
    departmentIds: [],
  };
}

export function getUserDepartmentIds(user: OrganizationUser) {
  return user.departments.map(({ department }) => department.id);
}

export function getEditableRole(
  user: OrganizationUser,
): Exclude<UserRole, 'ADMIN'> {
  return user.role === 'EMPLOYEE' ? 'EMPLOYEE' : 'ORG_MANAGER';
}

export function getUserUpdatePayload(
  form: OrganizationUserForm,
): AdminUpdateUserPayload {
  const { password, ...payload } = form;

  return password ? { ...payload, password } : payload;
}

export function getDepartmentOptions(
  departments: Department[],
): DepartmentOption[] {
  return departments.map((department) => ({
    value: department.id,
    label: department.name,
  }));
}
