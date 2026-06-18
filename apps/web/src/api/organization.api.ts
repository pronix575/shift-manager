import type {
  Api,
  Department,
  Organization,
  OrganizationUser,
} from './generated/api.types';
import { apiClient } from './http/client';
import {
  cleanPaginationQuery,
  PaginatedResponse,
  PaginationQuery,
} from './pagination';

export type CreateOrganizationPayload =
  Api.OrganizationsControllerCreate.RequestBody;
export type UpdateOrganizationPayload =
  Api.OrganizationControllerUpdateOwn.RequestBody;
export type CreateUserPayload = Api.OrganizationControllerCreateUser.RequestBody;
export type UpdateUserPayload = Api.OrganizationControllerUpdateUser.RequestBody;
export type AdminUpdateUserPayload =
  Api.OrganizationsControllerUpdateUser.RequestBody;
export type CreateUserResponse = {
  user: OrganizationUser;
  credentials: { login: string };
};

export function listOrganizationsRequest() {
  return apiClient
    .get('organizations')
    .json<Api.OrganizationsControllerList.ResponseBody>();
}

export function listOrganizationsPageRequest(query: PaginationQuery) {
  return apiClient
    .get('organizations', { searchParams: cleanPaginationQuery(query) })
    .json<PaginatedResponse<Organization>>();
}

export function getAdminOrganizationRequest(id: string) {
  return apiClient
    .get(`organizations/${id}`)
    .json<Api.OrganizationsControllerGet.ResponseBody>();
}

export function createOrganizationRequest(payload: CreateOrganizationPayload) {
  return apiClient
    .post('organizations', { json: payload })
    .json<Api.OrganizationsControllerCreate.ResponseBody>();
}

export function archiveOrganizationRequest(id: string) {
  return apiClient
    .post(`organizations/${id}/archive`)
    .json<Api.OrganizationsControllerArchive.ResponseBody>();
}

export function listAdminOrganizationDepartmentsRequest(
  organizationId: string,
) {
  return apiClient
    .get(`organizations/${organizationId}/departments`)
    .json<Api.OrganizationsControllerListDepartments.ResponseBody>();
}

export function listAdminOrganizationDepartmentsPageRequest(
  organizationId: string,
  query: PaginationQuery,
) {
  return apiClient
    .get(`organizations/${organizationId}/departments`, {
      searchParams: cleanPaginationQuery(query),
    })
    .json<PaginatedResponse<Department>>();
}

export function createAdminOrganizationDepartmentRequest(
  organizationId: string,
  name: string,
) {
  return apiClient
    .post(`organizations/${organizationId}/departments`, { json: { name } })
    .json<Api.OrganizationsControllerCreateDepartment.ResponseBody>();
}

export function updateAdminOrganizationDepartmentRequest(
  organizationId: string,
  departmentId: string,
  name: string,
) {
  return apiClient
    .patch(`organizations/${organizationId}/departments/${departmentId}`, {
      json: { name },
    })
    .json<Api.OrganizationsControllerUpdateDepartment.ResponseBody>();
}

export function archiveAdminOrganizationDepartmentRequest(
  organizationId: string,
  departmentId: string,
) {
  return apiClient
    .delete(`organizations/${organizationId}/departments/${departmentId}`)
    .json<Api.OrganizationsControllerArchiveDepartment.ResponseBody>();
}

export function listAdminOrganizationUsersRequest(organizationId: string) {
  return apiClient
    .get(`organizations/${organizationId}/users`)
    .json<Api.OrganizationsControllerListUsers.ResponseBody>();
}

export function listAdminOrganizationUsersPageRequest(
  organizationId: string,
  query: PaginationQuery,
) {
  return apiClient
    .get(`organizations/${organizationId}/users`, {
      searchParams: cleanPaginationQuery(query),
    })
    .json<PaginatedResponse<OrganizationUser>>();
}

export function createAdminOrganizationUserRequest(
  organizationId: string,
  payload: CreateUserPayload,
) {
  return apiClient
    .post(`organizations/${organizationId}/users`, { json: payload })
    .json<CreateUserResponse>();
}

export function updateAdminOrganizationUserRequest(
  organizationId: string,
  userId: string,
  payload: AdminUpdateUserPayload,
) {
  return apiClient
    .patch(`organizations/${organizationId}/users/${userId}`, { json: payload })
    .json<Api.OrganizationsControllerUpdateUser.ResponseBody>();
}

export function archiveAdminOrganizationUserRequest(
  organizationId: string,
  userId: string,
) {
  return apiClient
    .delete(`organizations/${organizationId}/users/${userId}`)
    .json<Api.OrganizationsControllerArchiveUser.ResponseBody>();
}

export function createAdminRequest(
  payload: Api.AdminsControllerCreate.RequestBody,
) {
  return apiClient
    .post('admins', { json: payload })
    .json<CreateUserResponse>();
}

export function getOrganizationRequest() {
  return apiClient
    .get('organization')
    .json<Api.OrganizationControllerGetOwn.ResponseBody>();
}

export function updateOrganizationRequest(
  payload: Api.OrganizationControllerUpdateOwn.RequestBody,
) {
  return apiClient
    .patch('organization', { json: payload })
    .json<Api.OrganizationControllerUpdateOwn.ResponseBody>();
}

export function listDepartmentsRequest() {
  return apiClient
    .get('organization/departments')
    .json<Api.OrganizationControllerListDepartments.ResponseBody>();
}

export function listDepartmentsPageRequest(query: PaginationQuery) {
  return apiClient
    .get('organization/departments', {
      searchParams: cleanPaginationQuery(query),
    })
    .json<PaginatedResponse<Department>>();
}

export function createDepartmentRequest(name: string) {
  return apiClient
    .post('organization/departments', { json: { name } })
    .json<Api.OrganizationControllerCreateDepartment.ResponseBody>();
}

export function updateDepartmentRequest(id: string, name: string) {
  return apiClient
    .patch(`organization/departments/${id}`, { json: { name } })
    .json<Api.OrganizationControllerUpdateDepartment.ResponseBody>();
}

export function archiveDepartmentRequest(id: string) {
  return apiClient
    .delete(`organization/departments/${id}`)
    .json<Api.OrganizationControllerArchiveDepartment.ResponseBody>();
}

export function listUsersRequest() {
  return apiClient
    .get('organization/users')
    .json<Api.OrganizationControllerListUsers.ResponseBody>();
}

export function listUsersPageRequest(query: PaginationQuery) {
  return apiClient
    .get('organization/users', { searchParams: cleanPaginationQuery(query) })
    .json<PaginatedResponse<OrganizationUser>>();
}

export function createUserRequest(payload: CreateUserPayload) {
  return apiClient
    .post('organization/users', { json: payload })
    .json<CreateUserResponse>();
}

export function updateUserRequest(id: string, payload: UpdateUserPayload) {
  return apiClient
    .patch(`organization/users/${id}`, { json: payload })
    .json<Api.OrganizationControllerUpdateUser.ResponseBody>();
}

export function archiveUserRequest(id: string) {
  return apiClient
    .delete(`organization/users/${id}`)
    .json<Api.OrganizationControllerArchiveUser.ResponseBody>();
}
