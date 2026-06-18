import {
  Department,
  OrganizationUser,
  UserRole,
} from 'api/generated/api.types';
import { PaginatedResponse } from 'api/pagination';
import {
  CreateUserPayload,
  UpdateUserPayload,
} from 'api/organization.api';

export type UserForm = {
  firstName: string;
  lastName: string;
  middleName: string;
  password: string;
  role: Exclude<UserRole, 'ADMIN'>;
  departmentIds: string[];
};

export type EmployeeModalState =
  | { type: 'editUser'; user: OrganizationUser }
  | { type: 'archiveUser'; user: OrganizationUser }
  | null;

export type EmployeeModalType = NonNullable<EmployeeModalState>['type'];

export type CredentialsMessage = {
  login?: string;
  password?: string;
} | null;

export type DepartmentOption = {
  value: string;
  label: string;
};

export type EmployeesPageProps = {
  credentials: CredentialsMessage;
  departments: Department[];
  error: string | null;
  message: string | null;
  submittingModal: EmployeeModalType | null;
  usersPage: PaginatedResponse<OrganizationUser>;
  onArchiveUser: (id: string) => Promise<void>;
  onCreateUser: (payload: {
    payload: CreateUserPayload;
    password: string;
  }) => Promise<unknown>;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onUpdateUser: (payload: {
    id: string;
    payload: UpdateUserPayload;
  }) => Promise<void>;
};
