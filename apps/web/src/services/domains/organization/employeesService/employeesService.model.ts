import { createEffect, createEvent, createStore, sample } from 'effector';

import type { Department, OrganizationUser } from 'api/generated/api.types';
import {
  archiveUserRequest,
  createUserRequest,
  listDepartmentsRequest,
  listUsersPageRequest,
  updateUserRequest,
  type CreateUserPayload,
  type CreateUserResponse,
  type UpdateUserPayload,
} from 'api/organization.api';
import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  getEmptyPaginatedResponse,
  type PaginatedResponse,
  type PaginationQuery,
} from 'api/pagination';
import { toApiError } from 'services/core/apiError';

type CredentialsMessage = {
  login?: string;
  password?: string;
} | null;

type LoadResult = {
  usersPage: PaginatedResponse<OrganizationUser>;
  departments: Department[];
};

type CreateUserEffectPayload = {
  payload: CreateUserPayload;
  password: string;
};

type UpdateUserEffectPayload = {
  id: string;
  payload: UpdateUserPayload;
};

const pageStarted = createEvent();
const refreshClicked = createEvent();
const pageChanged = createEvent<number>();
const feedbackCleared = createEvent();

const loadEmployeesFx = createEffect<PaginationQuery, LoadResult, Error>(
  async (pagination) => {
    try {
      const [usersPage, departments] = await Promise.all([
        listUsersPageRequest(pagination),
        listDepartmentsRequest(),
      ]);

      return { usersPage, departments };
    } catch (error) {
      throw await toApiError(error);
    }
  },
);

const loadUsersPageFx = createEffect<
  PaginationQuery,
  PaginatedResponse<OrganizationUser>,
  Error
>(async (pagination) => {
  try {
    return await listUsersPageRequest(pagination);
  } catch (error) {
    throw await toApiError(error);
  }
});

const createUserFx = createEffect<
  CreateUserEffectPayload,
  { response: CreateUserResponse; password: string },
  Error
>(async ({ payload, password }) => {
  try {
    return { response: await createUserRequest(payload), password };
  } catch (error) {
    throw await toApiError(error);
  }
});

const updateUserFx = createEffect<UpdateUserEffectPayload, void, Error>(
  async ({ id, payload }) => {
    try {
      await updateUserRequest(id, payload);
    } catch (error) {
      throw await toApiError(error);
    }
  },
);

const archiveUserFx = createEffect<string, void, Error>(async (id) => {
  try {
    await archiveUserRequest(id);
  } catch (error) {
    throw await toApiError(error);
  }
});

const $usersPage = createStore(getEmptyPaginatedResponse<OrganizationUser>())
  .on(loadEmployeesFx.doneData, (_, result) => result.usersPage)
  .on(loadUsersPageFx.doneData, (_, usersPage) => usersPage);

const $pagination = createStore<PaginationQuery>({
  page: DEFAULT_PAGE,
  perPage: DEFAULT_PER_PAGE,
})
  .on(loadEmployeesFx.doneData, (_, result) => ({
    page: result.usersPage.meta.page,
    perPage: result.usersPage.meta.perPage,
  }))
  .on(loadUsersPageFx.doneData, (_, usersPage) => ({
    page: usersPage.meta.page,
    perPage: usersPage.meta.perPage,
  }));

const $departments = createStore<Department[]>([]).on(
  loadEmployeesFx.doneData,
  (_, result) => result.departments,
);

const $credentials = createStore<CredentialsMessage>(null)
  .reset(feedbackCleared, createUserFx, updateUserFx, archiveUserFx)
  .on(createUserFx.doneData, (_, result) => ({
    login: result.response.credentials.login,
    password: result.password,
  }));

const $message = createStore<string | null>(null)
  .reset(feedbackCleared, createUserFx, updateUserFx, archiveUserFx)
  .on(updateUserFx.done, () => 'Пользователь обновлен')
  .on(archiveUserFx.done, () => 'Пользователь отправлен в архив');

const $error = createStore<string | null>(null)
  .reset(
    feedbackCleared,
    loadEmployeesFx,
    loadUsersPageFx,
    createUserFx,
    updateUserFx,
    archiveUserFx,
  )
  .on(loadEmployeesFx.failData, (_, error) => error.message)
  .on(loadUsersPageFx.failData, (_, error) => error.message)
  .on(createUserFx.failData, (_, error) => error.message)
  .on(updateUserFx.failData, (_, error) => error.message)
  .on(archiveUserFx.failData, (_, error) => error.message);

const $submittingModal = createStore<'editUser' | 'archiveUser' | null>(null)
  .on(updateUserFx, () => 'editUser' as const)
  .on(archiveUserFx, () => 'archiveUser' as const)
  .reset(updateUserFx.finally, archiveUserFx.finally);

sample({
  clock: pageStarted,
  source: $pagination,
  target: loadEmployeesFx,
});

sample({
  clock: refreshClicked,
  source: $pagination,
  target: loadEmployeesFx,
});

sample({
  clock: pageChanged,
  source: $pagination,
  fn: (pagination, page) => ({ ...pagination, page }),
  target: loadUsersPageFx,
});

sample({
  clock: createUserFx.done,
  source: $pagination,
  target: loadEmployeesFx,
});

sample({
  clock: updateUserFx.done,
  source: $pagination,
  target: loadEmployeesFx,
});

sample({
  clock: archiveUserFx.done,
  source: $pagination,
  target: loadEmployeesFx,
});

export const employeesService = {
  inputs: {
    pageStarted,
    refreshClicked,
    pageChanged,
    feedbackCleared,
    createUserFx,
    updateUserFx,
    archiveUserFx,
  },
  outputs: {
    $usersPage,
    $pagination,
    $departments,
    $credentials,
    $message,
    $error,
    $submittingModal,
  },
};
