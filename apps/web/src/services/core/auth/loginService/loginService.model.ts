import { createEffect, createEvent, createStore, sample } from 'effector';

import { loginRequest } from 'api/auth.api';
import type { Api } from 'api/generated/api.types';
import { toApiError } from 'services/core/apiError';
import { sessionModel } from 'services/core/session/session.model';

import { currentUserService } from '../currentUserService';

type LoginPayload = {
  login: string;
  password: string;
};

const clearError = createEvent();

const loginFx = createEffect<
  LoginPayload,
  Api.AuthControllerLogin.ResponseBody,
  Error
>(async ({ login, password }) => {
  try {
    return await loginRequest(login, password);
  } catch (error) {
    throw await toApiError(error);
  }
});

const $error = createStore<string | null>(null)
  .reset(clearError, loginFx)
  .on(loginFx.failData, (_, error) => error.message);

sample({
  clock: loginFx.doneData,
  fn: (response) => response.accessToken,
  target: sessionModel.inputs.accessTokenChanged,
});

sample({
  clock: loginFx.doneData,
  fn: (response) => response.refreshToken,
  target: sessionModel.inputs.refreshTokenChanged,
});

sample({
  clock: loginFx.doneData,
  fn: (response) => response.user,
  target: currentUserService.inputs.setCurrentUser,
});

export const loginService = {
  inputs: {
    loginFx,
    clearError,
  },
  outputs: {
    $error,
    $isLoading: loginFx.pending,
  },
};
