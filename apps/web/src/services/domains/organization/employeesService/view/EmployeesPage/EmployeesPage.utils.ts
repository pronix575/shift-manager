import {
  OrganizationUser,
  UserRole,
} from 'api/generated/api.types';
import { UpdateUserPayload } from 'api/organization.api';

import {
  DepartmentOption,
  UserForm,
} from './EmployeesPage.types';

export function getEmptyUserForm(): UserForm {
  return {
    firstName: '',
    lastName: '',
    middleName: '',
    password: '',
    role: 'EMPLOYEE',
    departmentIds: [],
  };
}

export function getUserDepartmentIds(user: OrganizationUser) {
  return user.departments.map(({ department }) => department.id);
}

export function getEditableRole(
  user: OrganizationUser,
): Exclude<UserRole, 'ADMIN'> {
  return user.role === 'ORG_MANAGER' ? 'ORG_MANAGER' : 'EMPLOYEE';
}

export function getUserUpdatePayload(form: UserForm): UpdateUserPayload {
  const { password, ...payload } = form;

  return password ? { ...payload, password } : payload;
}

export function getDepartmentOptions(
  departments: Array<{ id: string; name: string }>,
): DepartmentOption[] {
  return departments.map((department) => ({
    value: department.id,
    label: department.name,
  }));
}
