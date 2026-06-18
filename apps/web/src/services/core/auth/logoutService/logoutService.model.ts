import { createEffect, createEvent, createStore, sample } from 'effector';

import { logoutRequest } from 'api/auth.api';
import { toApiError } from 'services/core/apiError';
import { sessionModel } from 'services/core/session/session.model';

const logoutClicked = createEvent();
const clearError = createEvent();

const logoutFx = createEffect<string | null, void, Error>(
  async (refreshToken) => {
    try {
      await logoutRequest(refreshToken);
    } catch (error) {
      throw await toApiError(error);
    }
  },
);

const $error = createStore<string | null>(null)
  .reset(clearError, logoutFx)
  .on(logoutFx.failData, (_, error) => error.message);

sample({
  clock: logoutClicked,
  source: sessionModel.outputs.$refreshToken,
  target: logoutFx,
});

sample({
  clock: logoutFx.finally,
  target: sessionModel.inputs.sessionCleared,
});

export const logoutService = {
  inputs: {
    logoutClicked,
    logoutFx,
    clearError,
  },
  outputs: {
    $error,
    $isLoading: logoutFx.pending,
  },
};
