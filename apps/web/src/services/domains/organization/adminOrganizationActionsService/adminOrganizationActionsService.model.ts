import { createEffect, createEvent, createStore, sample } from 'effector';

import type { Api } from 'api/generated/api.types';
import {
  archiveAdminOrganizationDepartmentRequest,
  archiveAdminOrganizationUserRequest,
  archiveOrganizationRequest,
  createAdminOrganizationDepartmentRequest,
  createAdminOrganizationUserRequest,
  createAdminRequest,
  createOrganizationRequest,
  updateAdminOrganizationDepartmentRequest,
  updateAdminOrganizationUserRequest,
  type AdminUpdateUserPayload,
  type CreateOrganizationPayload,
  type CreateUserPayload,
  type CreateUserResponse,
} from 'api/organization.api';
import { toApiError } from 'services/core/apiError';

import { adminOrganizationsService } from '../adminOrganizationsService/adminOrganizationsService.model';

type CredentialsMessage = {
  login?: string;
  password?: string;
} | null;

type CreateOrganizationResult = {
  organization: Api.OrganizationsControllerCreate.ResponseBody;
};

type CreateAdminPayload = {
  payload: Api.AdminsControllerCreate.RequestBody;
  password: string;
};

type CreateAdminResult = {
  response: CreateUserResponse;
  password: string;
};

type CreateDepartmentPayload = {
  organizationId: string;
  name: string;
};

type UpdateDepartmentPayload = CreateDepartmentPayload & {
  departmentId: string;
};

type CreateOrganizationUserPayload = {
  organizationId: string;
  payload: CreateUserPayload;
  password: string;
};

type CreateOrganizationUserResult = {
  response: CreateUserResponse;
  password: string;
};

type UpdateOrganizationUserPayload = {
  organizationId: string;
  userId: string;
  payload: AdminUpdateUserPayload;
};

type ArchiveOrganizationUserPayload = {
  organizationId: string;
  userId: string;
};

type ArchiveDepartmentPayload = {
  organizationId: string;
  departmentId: string;
};

const feedbackCleared = createEvent();

const createOrganizationFx = createEffect<
  CreateOrganizationPayload,
  CreateOrganizationResult,
  Error
>(async (payload) => {
  try {
    return { organization: await createOrganizationRequest(payload) };
  } catch (error) {
    throw await toApiError(error);
  }
});

const createAdminFx = createEffect<CreateAdminPayload, CreateAdminResult, Error>(
  async ({ payload, password }) => {
    try {
      return { response: await createAdminRequest(payload), password };
    } catch (error) {
      throw await toApiError(error);
    }
  },
);

const createDepartmentFx = createEffect<CreateDepartmentPayload, void, Error>(
  async ({ organizationId, name }) => {
    try {
      await createAdminOrganizationDepartmentRequest(organizationId, name);
    } catch (error) {
      throw await toApiError(error);
    }
  },
);

const updateDepartmentFx = createEffect<UpdateDepartmentPayload, void, Error>(
  async ({ organizationId, departmentId, name }) => {
    try {
      await updateAdminOrganizationDepartmentRequest(
        organizationId,
        departmentId,
        name,
      );
    } catch (error) {
      throw await toApiError(error);
    }
  },
);

const createOrganizationUserFx = createEffect<
  CreateOrganizationUserPayload,
  CreateOrganizationUserResult,
  Error
>(async ({ organizationId, payload, password }) => {
  try {
    return {
      response: await createAdminOrganizationUserRequest(organizationId, payload),
      password,
    };
  } catch (error) {
    throw await toApiError(error);
  }
});

const updateOrganizationUserFx = createEffect<
  UpdateOrganizationUserPayload,
  void,
  Error
>(async ({ organizationId, userId, payload }) => {
  try {
    await updateAdminOrganizationUserRequest(organizationId, userId, payload);
  } catch (error) {
    throw await toApiError(error);
  }
});

const archiveOrganizationUserFx = createEffect<
  ArchiveOrganizationUserPayload,
  void,
  Error
>(async ({ organizationId, userId }) => {
  try {
    await archiveAdminOrganizationUserRequest(organizationId, userId);
  } catch (error) {
    throw await toApiError(error);
  }
});

const archiveDepartmentFx = createEffect<ArchiveDepartmentPayload, void, Error>(
  async ({ organizationId, departmentId }) => {
    try {
      await archiveAdminOrganizationDepartmentRequest(
        organizationId,
        departmentId,
      );
    } catch (error) {
      throw await toApiError(error);
    }
  },
);

const archiveOrganizationFx = createEffect<string, string, Error>(
  async (organizationId) => {
    try {
      await archiveOrganizationRequest(organizationId);

      return organizationId;
    } catch (error) {
      throw await toApiError(error);
    }
  },
);

const $credentials = createStore<CredentialsMessage>(null)
  .reset(
    feedbackCleared,
    createOrganizationFx,
    createAdminFx,
    createDepartmentFx,
    updateDepartmentFx,
    createOrganizationUserFx,
    updateOrganizationUserFx,
    archiveOrganizationUserFx,
    archiveDepartmentFx,
    archiveOrganizationFx,
  )
  .on(createOrganizationUserFx.doneData, (_, result) => ({
    login: result.response.credentials.login,
    password: result.password,
  }));

const $message = createStore<string | null>(null)
  .reset(
    feedbackCleared,
    createOrganizationFx,
    createAdminFx,
    createDepartmentFx,
    updateDepartmentFx,
    createOrganizationUserFx,
    updateOrganizationUserFx,
    archiveOrganizationUserFx,
    archiveDepartmentFx,
    archiveOrganizationFx,
  )
  .on(
    createOrganizationFx.doneData,
    (_, result) => `Организация «${result.organization.name}» создана`,
  )
  .on(
    createAdminFx.doneData,
    (_, result) =>
      `Логин: ${result.response.credentials.login}. Пароль: ${result.password}`,
  )
  .on(createDepartmentFx.done, () => 'Департамент создан')
  .on(updateDepartmentFx.done, () => 'Департамент обновлен')
  .on(createOrganizationUserFx.done, () => 'Пользователь создан')
  .on(updateOrganizationUserFx.done, () => 'Пользователь обновлен')
  .on(archiveOrganizationUserFx.done, () => 'Пользователь отправлен в архив')
  .on(archiveDepartmentFx.done, () => 'Департамент отправлен в архив')
  .on(archiveOrganizationFx.done, () => 'Организация отправлена в архив');

const $error = createStore<string | null>(null)
  .reset(
    feedbackCleared,
    createOrganizationFx,
    createAdminFx,
    createDepartmentFx,
    updateDepartmentFx,
    createOrganizationUserFx,
    updateOrganizationUserFx,
    archiveOrganizationUserFx,
    archiveDepartmentFx,
    archiveOrganizationFx,
  )
  .on(createOrganizationFx.failData, (_, error) => error.message)
  .on(createAdminFx.failData, (_, error) => error.message)
  .on(createDepartmentFx.failData, (_, error) => error.message)
  .on(updateDepartmentFx.failData, (_, error) => error.message)
  .on(createOrganizationUserFx.failData, (_, error) => error.message)
  .on(updateOrganizationUserFx.failData, (_, error) => error.message)
  .on(archiveOrganizationUserFx.failData, (_, error) => error.message)
  .on(archiveDepartmentFx.failData, (_, error) => error.message)
  .on(archiveOrganizationFx.failData, (_, error) => error.message);

const $submittingModal = createStore<string | null>(null)
  .on(createOrganizationFx, () => 'createOrganization')
  .on(createAdminFx, () => 'createAdmin')
  .on(createDepartmentFx, () => 'createDepartment')
  .on(updateDepartmentFx, () => 'editDepartment')
  .on(createOrganizationUserFx, () => 'createUser')
  .on(updateOrganizationUserFx, () => 'editUser')
  .on(archiveOrganizationUserFx, () => 'archiveUser')
  .on(archiveDepartmentFx, () => 'archiveDepartment')
  .on(archiveOrganizationFx, () => 'archiveOrganization')
  .reset(
    createOrganizationFx.finally,
    createAdminFx.finally,
    createDepartmentFx.finally,
    updateDepartmentFx.finally,
    createOrganizationUserFx.finally,
    updateOrganizationUserFx.finally,
    archiveOrganizationUserFx.finally,
    archiveDepartmentFx.finally,
    archiveOrganizationFx.finally,
  );

sample({
  clock: createDepartmentFx.done,
  fn: () => undefined,
  target: adminOrganizationsService.inputs.profileReloadRequested,
});

sample({
  clock: updateDepartmentFx.done,
  fn: () => undefined,
  target: adminOrganizationsService.inputs.profileReloadRequested,
});

sample({
  clock: createOrganizationUserFx.done,
  fn: () => undefined,
  target: adminOrganizationsService.inputs.profileReloadRequested,
});

sample({
  clock: updateOrganizationUserFx.done,
  fn: () => undefined,
  target: adminOrganizationsService.inputs.profileReloadRequested,
});

sample({
  clock: archiveOrganizationUserFx.done,
  fn: () => undefined,
  target: adminOrganizationsService.inputs.profileReloadRequested,
});

sample({
  clock: archiveDepartmentFx.done,
  fn: () => undefined,
  target: adminOrganizationsService.inputs.profileReloadRequested,
});

sample({
  clock: createOrganizationFx.done,
  fn: () => undefined,
  target: adminOrganizationsService.inputs.organizationsReloadRequested,
});

sample({
  clock: archiveOrganizationFx.done,
  fn: () => undefined,
  target: adminOrganizationsService.inputs.organizationsReloadRequested,
});

export const adminOrganizationActionsService = {
  inputs: {
    feedbackCleared,
    createOrganizationFx,
    createAdminFx,
    createDepartmentFx,
    updateDepartmentFx,
    createOrganizationUserFx,
    updateOrganizationUserFx,
    archiveOrganizationUserFx,
    archiveDepartmentFx,
    archiveOrganizationFx,
  },
  outputs: {
    $credentials,
    $message,
    $error,
    $submittingModal,
  },
};
