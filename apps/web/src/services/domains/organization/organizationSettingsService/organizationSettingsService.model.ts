import { createEffect, createEvent, createStore, sample } from 'effector';

import type { Api, Department, Organization } from 'api/generated/api.types';
import {
  archiveDepartmentRequest,
  createDepartmentRequest,
  getOrganizationRequest,
  listDepartmentsPageRequest,
  updateDepartmentRequest,
  updateOrganizationRequest,
} from 'api/organization.api';
import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  getEmptyPaginatedResponse,
  type PaginatedResponse,
  type PaginationQuery,
} from 'api/pagination';
import { toApiError } from 'services/core/apiError';

type LoadResult = {
  organization: Organization;
  departmentsPage: PaginatedResponse<Department>;
};

type SaveOrganizationPayload = Api.OrganizationControllerUpdateOwn.RequestBody;

type UpdateDepartmentPayload = {
  id: string;
  name: string;
};

const pageStarted = createEvent();
const departmentsPageChanged = createEvent<number>();
const feedbackCleared = createEvent();

const loadSettingsFx = createEffect<PaginationQuery, LoadResult, Error>(
  async (pagination) => {
    try {
      const [organization, departmentsPage] = await Promise.all([
        getOrganizationRequest(),
        listDepartmentsPageRequest(pagination),
      ]);

      return { organization, departmentsPage };
    } catch (error) {
      throw await toApiError(error);
    }
  },
);

const loadDepartmentsPageFx = createEffect<
  PaginationQuery,
  PaginatedResponse<Department>,
  Error
>(async (pagination) => {
  try {
    return await listDepartmentsPageRequest(pagination);
  } catch (error) {
    throw await toApiError(error);
  }
});

const saveOrganizationFx = createEffect<
  SaveOrganizationPayload,
  Organization,
  Error
>(async (payload) => {
  try {
    return await updateOrganizationRequest(payload);
  } catch (error) {
    throw await toApiError(error);
  }
});

const createDepartmentFx = createEffect<string, void, Error>(async (name) => {
  try {
    await createDepartmentRequest(name);
  } catch (error) {
    throw await toApiError(error);
  }
});

const updateDepartmentFx = createEffect<UpdateDepartmentPayload, void, Error>(
  async ({ id, name }) => {
    try {
      await updateDepartmentRequest(id, name);
    } catch (error) {
      throw await toApiError(error);
    }
  },
);

const archiveDepartmentFx = createEffect<string, void, Error>(async (id) => {
  try {
    await archiveDepartmentRequest(id);
  } catch (error) {
    throw await toApiError(error);
  }
});

const $organization = createStore<Organization | null>(null)
  .on(loadSettingsFx.doneData, (_, result) => result.organization)
  .on(saveOrganizationFx.doneData, (_, organization) => organization);

const $departmentsPage = createStore(getEmptyPaginatedResponse<Department>())
  .on(loadSettingsFx.doneData, (_, result) => result.departmentsPage)
  .on(loadDepartmentsPageFx.doneData, (_, departmentsPage) => departmentsPage);

const $departmentsPagination = createStore<PaginationQuery>({
  page: DEFAULT_PAGE,
  perPage: DEFAULT_PER_PAGE,
})
  .on(loadSettingsFx.doneData, (_, result) => ({
    page: result.departmentsPage.meta.page,
    perPage: result.departmentsPage.meta.perPage,
  }))
  .on(loadDepartmentsPageFx.doneData, (_, departmentsPage) => ({
    page: departmentsPage.meta.page,
    perPage: departmentsPage.meta.perPage,
  }));

const $message = createStore<string | null>(null)
  .reset(
    feedbackCleared,
    saveOrganizationFx,
    createDepartmentFx,
    updateDepartmentFx,
    archiveDepartmentFx,
  )
  .on(saveOrganizationFx.done, () => 'Организация сохранена')
  .on(createDepartmentFx.done, () => 'Департамент создан')
  .on(updateDepartmentFx.done, () => 'Департамент обновлен')
  .on(archiveDepartmentFx.done, () => 'Департамент отправлен в архив');

const $error = createStore<string | null>(null)
  .reset(
    feedbackCleared,
    loadSettingsFx,
    loadDepartmentsPageFx,
    saveOrganizationFx,
    createDepartmentFx,
    updateDepartmentFx,
    archiveDepartmentFx,
  )
  .on(loadSettingsFx.failData, (_, error) => error.message)
  .on(loadDepartmentsPageFx.failData, (_, error) => error.message)
  .on(saveOrganizationFx.failData, (_, error) => error.message)
  .on(createDepartmentFx.failData, (_, error) => error.message)
  .on(updateDepartmentFx.failData, (_, error) => error.message)
  .on(archiveDepartmentFx.failData, (_, error) => error.message);

const $isDepartmentUpdating = updateDepartmentFx.pending;

sample({
  clock: pageStarted,
  source: $departmentsPagination,
  target: loadSettingsFx,
});

sample({
  clock: departmentsPageChanged,
  source: $departmentsPagination,
  fn: (pagination, page) => ({ ...pagination, page }),
  target: loadDepartmentsPageFx,
});

sample({
  clock: createDepartmentFx.done,
  source: $departmentsPagination,
  target: loadSettingsFx,
});

sample({
  clock: updateDepartmentFx.done,
  source: $departmentsPagination,
  target: loadSettingsFx,
});

sample({
  clock: archiveDepartmentFx.done,
  source: $departmentsPagination,
  target: loadSettingsFx,
});

export const organizationSettingsService = {
  inputs: {
    pageStarted,
    departmentsPageChanged,
    feedbackCleared,
    saveOrganizationFx,
    createDepartmentFx,
    updateDepartmentFx,
    archiveDepartmentFx,
  },
  outputs: {
    $organization,
    $departmentsPage,
    $departmentsPagination,
    $message,
    $error,
    $isDepartmentUpdating,
  },
};
