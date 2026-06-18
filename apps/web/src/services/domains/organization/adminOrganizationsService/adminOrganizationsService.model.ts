import { createEffect, createEvent, createStore, sample } from 'effector';

import type { Department, Organization, OrganizationUser } from 'api/generated/api.types';
import {
  getAdminOrganizationRequest,
  listAdminOrganizationDepartmentsPageRequest,
  listAdminOrganizationDepartmentsRequest,
  listAdminOrganizationUsersPageRequest,
  listOrganizationsPageRequest,
} from 'api/organization.api';
import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  getEmptyPaginatedResponse,
  type PaginatedResponse,
  type PaginationQuery,
} from 'api/pagination';
import { toApiError } from 'services/core/apiError';

type OrganizationDetailsPayload = {
  organizationId: string;
  usersPagination: PaginationQuery;
  departmentsPagination: PaginationQuery;
};

type OrganizationDetailsResult = {
  organization: Organization;
  usersPage: PaginatedResponse<OrganizationUser>;
  departmentsPage: PaginatedResponse<Department>;
  departmentOptions: Department[];
};

const defaultPagination = {
  page: DEFAULT_PAGE,
  perPage: DEFAULT_PER_PAGE,
};

const pageStarted = createEvent();
const refreshClicked = createEvent();
const profileOrganizationChanged = createEvent<string | null>();
const organizationsPageChanged = createEvent<number>();
const organizationUsersPageChanged = createEvent<number>();
const departmentsPageChanged = createEvent<number>();
const profileReset = createEvent();
const profileReloadRequested = createEvent();
const organizationsReloadRequested = createEvent();

const loadOrganizationsFx = createEffect<
  PaginationQuery,
  PaginatedResponse<Organization>,
  Error
>(async (pagination) => {
  try {
    return await listOrganizationsPageRequest(pagination);
  } catch (error) {
    throw await toApiError(error);
  }
});

const loadOrganizationDetailsFx = createEffect<
  OrganizationDetailsPayload,
  OrganizationDetailsResult,
  Error
>(async ({ organizationId, usersPagination, departmentsPagination }) => {
  try {
    const [organization, usersPage, departmentsPage, departmentOptions] =
      await Promise.all([
        getAdminOrganizationRequest(organizationId),
        listAdminOrganizationUsersPageRequest(organizationId, usersPagination),
        listAdminOrganizationDepartmentsPageRequest(
          organizationId,
          departmentsPagination,
        ),
        listAdminOrganizationDepartmentsRequest(organizationId),
      ]);

    return { organization, usersPage, departmentsPage, departmentOptions };
  } catch (error) {
    throw await toApiError(error);
  }
});

const loadOrganizationUsersPageFx = createEffect<
  { organizationId: string; pagination: PaginationQuery },
  PaginatedResponse<OrganizationUser>,
  Error
>(async ({ organizationId, pagination }) => {
  try {
    return await listAdminOrganizationUsersPageRequest(
      organizationId,
      pagination,
    );
  } catch (error) {
    throw await toApiError(error);
  }
});

const loadDepartmentsPageFx = createEffect<
  { organizationId: string; pagination: PaginationQuery },
  PaginatedResponse<Department>,
  Error
>(async ({ organizationId, pagination }) => {
  try {
    return await listAdminOrganizationDepartmentsPageRequest(
      organizationId,
      pagination,
    );
  } catch (error) {
    throw await toApiError(error);
  }
});

const $profileOrganizationId = createStore<string | null>(null).on(
  profileOrganizationChanged,
  (_, organizationId) => organizationId,
);

const $organizationsPage = createStore(
  getEmptyPaginatedResponse<Organization>(),
).on(loadOrganizationsFx.doneData, (_, organizationsPage) => organizationsPage);

const $organizationsPagination = createStore<PaginationQuery>(
  defaultPagination,
).on(loadOrganizationsFx.doneData, (_, organizationsPage) => ({
  page: organizationsPage.meta.page,
  perPage: organizationsPage.meta.perPage,
}));

const $profileOrganization = createStore<Organization | null>(null)
  .on(loadOrganizationDetailsFx.doneData, (_, result) => result.organization)
  .reset(profileReset);

const $organizationUsersPage = createStore(
  getEmptyPaginatedResponse<OrganizationUser>(),
)
  .on(loadOrganizationDetailsFx.doneData, (_, result) => result.usersPage)
  .on(loadOrganizationUsersPageFx.doneData, (_, usersPage) => usersPage)
  .reset(profileReset);

const $organizationUsersPagination =
  createStore<PaginationQuery>(defaultPagination)
    .on(loadOrganizationDetailsFx.doneData, (_, result) => ({
      page: result.usersPage.meta.page,
      perPage: result.usersPage.meta.perPage,
    }))
    .on(loadOrganizationUsersPageFx.doneData, (_, usersPage) => ({
      page: usersPage.meta.page,
      perPage: usersPage.meta.perPage,
    }))
    .reset(profileReset);

const $departmentsPage = createStore(getEmptyPaginatedResponse<Department>())
  .on(loadOrganizationDetailsFx.doneData, (_, result) => result.departmentsPage)
  .on(loadDepartmentsPageFx.doneData, (_, departmentsPage) => departmentsPage)
  .reset(profileReset);

const $departmentsPagination = createStore<PaginationQuery>(defaultPagination)
  .on(loadOrganizationDetailsFx.doneData, (_, result) => ({
    page: result.departmentsPage.meta.page,
    perPage: result.departmentsPage.meta.perPage,
  }))
  .on(loadDepartmentsPageFx.doneData, (_, departmentsPage) => ({
    page: departmentsPage.meta.page,
    perPage: departmentsPage.meta.perPage,
  }))
  .reset(profileReset);

const $departmentOptions = createStore<Department[]>([])
  .on(loadOrganizationDetailsFx.doneData, (_, result) => result.departmentOptions)
  .reset(profileReset);

const $error = createStore<string | null>(null)
  .reset(
    loadOrganizationsFx,
    loadOrganizationDetailsFx,
    loadOrganizationUsersPageFx,
    loadDepartmentsPageFx,
  )
  .on(loadOrganizationsFx.failData, (_, error) => error.message)
  .on(loadOrganizationDetailsFx.failData, (_, error) => error.message)
  .on(loadOrganizationUsersPageFx.failData, (_, error) => error.message)
  .on(loadDepartmentsPageFx.failData, (_, error) => error.message);

sample({
  clock: pageStarted,
  source: $organizationsPagination,
  target: loadOrganizationsFx,
});

sample({
  clock: refreshClicked,
  source: $organizationsPagination,
  target: loadOrganizationsFx,
});

sample({
  clock: refreshClicked,
  source: {
    organizationId: $profileOrganizationId,
    usersPagination: $organizationUsersPagination,
    departmentsPagination: $departmentsPagination,
  },
  filter: ({ organizationId }) => Boolean(organizationId),
  fn: ({ organizationId, usersPagination, departmentsPagination }) => ({
    organizationId: organizationId as string,
    usersPagination,
    departmentsPagination,
  }),
  target: loadOrganizationDetailsFx,
});

sample({
  clock: profileOrganizationChanged,
  filter: (organizationId): organizationId is string => Boolean(organizationId),
  fn: (organizationId) => ({
    organizationId: organizationId as string,
    usersPagination: defaultPagination,
    departmentsPagination: defaultPagination,
  }),
  target: loadOrganizationDetailsFx,
});

sample({
  clock: profileOrganizationChanged,
  filter: (organizationId) => !organizationId,
  target: profileReset,
});

sample({
  clock: organizationsPageChanged,
  source: $organizationsPagination,
  fn: (pagination, page) => ({ ...pagination, page }),
  target: loadOrganizationsFx,
});

sample({
  clock: organizationUsersPageChanged,
  source: {
    organizationId: $profileOrganizationId,
    pagination: $organizationUsersPagination,
  },
  filter: ({ organizationId }) => Boolean(organizationId),
  fn: ({ organizationId, pagination }, page) => ({
    organizationId: organizationId as string,
    pagination: { ...pagination, page },
  }),
  target: loadOrganizationUsersPageFx,
});

sample({
  clock: departmentsPageChanged,
  source: {
    organizationId: $profileOrganizationId,
    pagination: $departmentsPagination,
  },
  filter: ({ organizationId }) => Boolean(organizationId),
  fn: ({ organizationId, pagination }, page) => ({
    organizationId: organizationId as string,
    pagination: { ...pagination, page },
  }),
  target: loadDepartmentsPageFx,
});

sample({
  clock: profileReloadRequested,
  source: {
    organizationId: $profileOrganizationId,
    usersPagination: $organizationUsersPagination,
    departmentsPagination: $departmentsPagination,
  },
  filter: ({ organizationId }) => Boolean(organizationId),
  fn: ({ organizationId, usersPagination, departmentsPagination }) => ({
    organizationId: organizationId as string,
    usersPagination,
    departmentsPagination,
  }),
  target: loadOrganizationDetailsFx,
});

sample({
  clock: profileReloadRequested,
  source: $organizationsPagination,
  target: loadOrganizationsFx,
});

sample({
  clock: organizationsReloadRequested,
  source: $organizationsPagination,
  target: loadOrganizationsFx,
});

export const adminOrganizationsService = {
  inputs: {
    pageStarted,
    refreshClicked,
    profileOrganizationChanged,
    organizationsPageChanged,
    organizationUsersPageChanged,
    departmentsPageChanged,
    profileReloadRequested,
    organizationsReloadRequested,
  },
  outputs: {
    $profileOrganizationId,
    $organizationsPage,
    $organizationsPagination,
    $profileOrganization,
    $organizationUsersPage,
    $organizationUsersPagination,
    $departmentsPage,
    $departmentsPagination,
    $departmentOptions,
    $error,
  },
};
