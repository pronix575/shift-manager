import { Department, Organization } from 'api/generated/api.types';
import { PaginatedResponse } from 'api/pagination';
import { UpdateOrganizationPayload } from 'api/organization.api';

export type DepartmentModalState = {
  type: 'editDepartment';
  department: Department;
} | null;

export type OrganizationSettingsPageProps = {
  departmentsPage: PaginatedResponse<Department>;
  error: string | null;
  isUpdatingDepartment: boolean;
  message: string | null;
  organization: Organization | null;
  onArchiveDepartment: (id: string) => Promise<void>;
  onCreateDepartment: (name: string) => Promise<unknown>;
  onDepartmentsPageChange: (page: number) => void;
  onSaveOrganization: (payload: UpdateOrganizationPayload) => Promise<unknown>;
  onUpdateDepartment: (payload: {
    id: string;
    name: string;
  }) => Promise<void>;
};
