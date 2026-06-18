import {
  Department,
  Organization,
  OrganizationUser,
  UserRole,
} from './generated/api.types';
import { apiClient } from './http/client';

export type CreateOrganizationPayload = {
  name: string;
  timezone?: string;
};

export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  middleName?: string;
  role: Exclude<UserRole, 'ADMIN'>;
  departmentIds?: string[];
};

export type UpdateUserPayload = Partial<
  Pick<
    CreateUserPayload,
    'firstName' | 'lastName' | 'middleName' | 'role' | 'departmentIds'
  >
>;

export type AdminUpdateUserPayload = UpdateUserPayload &
  Partial<Pick<CreateUserPayload, 'role'>>;

export function listOrganizationsRequest() {
  return apiClient.get('organizations').json<Organization[]>();
}

export function createOrganizationRequest(payload: CreateOrganizationPayload) {
  return apiClient
    .post('organizations', { json: payload })
    .json<Organization>();
}

export function archiveOrganizationRequest(id: string) {
  return apiClient.post(`organizations/${id}/archive`).json<Organization>();
}

export function listAdminOrganizationDepartmentsRequest(
  organizationId: string,
) {
  return apiClient
    .get(`organizations/${organizationId}/departments`)
    .json<Department[]>();
}

export function createAdminOrganizationDepartmentRequest(
  organizationId: string,
  name: string,
) {
  return apiClient
    .post(`organizations/${organizationId}/departments`, { json: { name } })
    .json<Department>();
}

export function archiveAdminOrganizationDepartmentRequest(
  organizationId: string,
  departmentId: string,
) {
  return apiClient
    .delete(`organizations/${organizationId}/departments/${departmentId}`)
    .json<Department>();
}

export function listAdminOrganizationUsersRequest(organizationId: string) {
  return apiClient
    .get(`organizations/${organizationId}/users`)
    .json<OrganizationUser[]>();
}

export function createAdminOrganizationUserRequest(
  organizationId: string,
  payload: CreateUserPayload,
) {
  return apiClient
    .post(`organizations/${organizationId}/users`, { json: payload })
    .json<{
      user: OrganizationUser;
      credentials: { login: string; temporaryPassword: string };
    }>();
}

export function updateAdminOrganizationUserRequest(
  organizationId: string,
  userId: string,
  payload: AdminUpdateUserPayload,
) {
  return apiClient
    .patch(`organizations/${organizationId}/users/${userId}`, { json: payload })
    .json<OrganizationUser>();
}

export function archiveAdminOrganizationUserRequest(
  organizationId: string,
  userId: string,
) {
  return apiClient
    .delete(`organizations/${organizationId}/users/${userId}`)
    .json<OrganizationUser>();
}

export function resetAdminOrganizationUserPasswordRequest(
  organizationId: string,
  userId: string,
) {
  return apiClient
    .post(`organizations/${organizationId}/users/${userId}/reset-password`)
    .json<{ temporaryPassword: string }>();
}

export function createAdminRequest(payload: {
  firstName: string;
  lastName: string;
  middleName?: string;
}) {
  return apiClient.post('admins', { json: payload }).json<unknown>();
}

export function getOrganizationRequest() {
  return apiClient.get('organization').json<Organization>();
}

export function updateOrganizationRequest(
  payload: Partial<CreateOrganizationPayload>,
) {
  return apiClient
    .patch('organization', { json: payload })
    .json<Organization>();
}

export function listDepartmentsRequest() {
  return apiClient.get('organization/departments').json<Department[]>();
}

export function createDepartmentRequest(name: string) {
  return apiClient
    .post('organization/departments', { json: { name } })
    .json<Department>();
}

export function archiveDepartmentRequest(id: string) {
  return apiClient.delete(`organization/departments/${id}`).json<Department>();
}

export function listUsersRequest() {
  return apiClient.get('organization/users').json<OrganizationUser[]>();
}

export function createUserRequest(payload: CreateUserPayload) {
  return apiClient.post('organization/users', { json: payload }).json<{
    user: OrganizationUser;
    credentials: { login: string; temporaryPassword: string };
  }>();
}

export function updateUserRequest(id: string, payload: UpdateUserPayload) {
  return apiClient
    .patch(`organization/users/${id}`, { json: payload })
    .json<OrganizationUser>();
}

export function archiveUserRequest(id: string) {
  return apiClient.delete(`organization/users/${id}`).json<OrganizationUser>();
}

export function resetPasswordRequest(id: string) {
  return apiClient
    .post(`organization/users/${id}/reset-password`)
    .json<{ temporaryPassword: string }>();
}
