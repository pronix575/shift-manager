import {
  Department,
  Organization,
  OrganizationUser,
  UserRole,
} from 'api/generated/api.types';
import {
  AdminUpdateUserPayload,
  CreateOrganizationPayload,
  CreateUserPayload,
} from 'api/organization.api';
import { PaginatedResponse } from 'api/pagination';

export type AdminForm = {
  lastName: string;
  firstName: string;
  middleName: string;
  password: string;
};

export type OrganizationUserForm = {
  lastName: string;
  firstName: string;
  middleName: string;
  password: string;
  role: Exclude<UserRole, 'ADMIN'>;
  departmentIds: string[];
};

export type AdminModalState =
  | { type: 'createOrganization' }
  | { type: 'createAdmin' }
  | { type: 'createUser' }
  | { type: 'createDepartment' }
  | { type: 'editDepartment'; department: Department }
  | { type: 'editUser'; user: OrganizationUser }
  | { type: 'archiveUser'; user: OrganizationUser }
  | { type: 'archiveDepartment'; department: Department }
  | { type: 'archiveOrganization'; organization: Organization }
  | null;

export type AdminModalType = NonNullable<AdminModalState>['type'];

export type CredentialsMessage = {
  login?: string;
  password?: string;
} | null;

export type DepartmentOption = {
  value: string;
  label: string;
};

export type AdminOrganizationsPageProps = {
  credentials: CredentialsMessage;
  departmentsPage: PaginatedResponse<Department>;
  departmentOptionsList: Department[];
  error: string | null;
  message: string | null;
  organizationUsersPage: PaginatedResponse<OrganizationUser>;
  organizationsPage: PaginatedResponse<Organization>;
  profileOrganization: Organization | null;
  profileOrganizationId: string | null;
  submittingModal: string | null;
  onArchiveDepartment: (payload: {
    organizationId: string;
    departmentId: string;
  }) => Promise<void>;
  onArchiveOrganization: (organizationId: string) => Promise<string>;
  onArchiveOrganizationUser: (payload: {
    organizationId: string;
    userId: string;
  }) => Promise<void>;
  onBackToList: () => void;
  onCreateAdmin: (payload: {
    payload: AdminForm;
    password: string;
  }) => Promise<unknown>;
  onCreateDepartment: (payload: {
    organizationId: string;
    name: string;
  }) => Promise<void>;
  onCreateOrganization: (
    payload: CreateOrganizationPayload,
  ) => Promise<{ organization: Organization }>;
  onCreateOrganizationUser: (payload: {
    organizationId: string;
    payload: CreateUserPayload;
    password: string;
  }) => Promise<unknown>;
  onDepartmentsPageChange: (page: number) => void;
  onFeedbackClear: () => void;
  onOpenOrganizationProfile: (organizationId: string) => void;
  onOrganizationsPageChange: (page: number) => void;
  onOrganizationUsersPageChange: (page: number) => void;
  onRefresh: () => void;
  onUpdateDepartment: (payload: {
    organizationId: string;
    departmentId: string;
    name: string;
  }) => Promise<void>;
  onUpdateOrganizationUser: (payload: {
    organizationId: string;
    userId: string;
    payload: AdminUpdateUserPayload;
  }) => Promise<void>;
};
