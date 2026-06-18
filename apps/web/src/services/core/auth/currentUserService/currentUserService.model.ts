import { createEffect, createEvent, createStore, sample } from 'effector';
import { createGate } from 'effector-react';

import { getMeRequest } from 'api/auth.api';
import type { SessionUser } from 'api/generated/api.types';
import { toApiError } from 'services/core/apiError';
import { sessionModel } from 'services/core/session/session.model';

const CurrentUserGate = createGate();

const setCurrentUser = createEvent<SessionUser>();
const currentUserSkipped = createEvent();
const clearError = createEvent();

const fetchCurrentUserFx = createEffect<void, SessionUser, Error>(async () => {
  try {
    return await getMeRequest();
  } catch (error) {
    throw await toApiError(error);
  }
});

const $currentUser = createStore<SessionUser | null>(null)
  .on(setCurrentUser, (_, user) => user)
  .on(fetchCurrentUserFx.doneData, (_, user) => user)
  .reset(sessionModel.inputs.sessionCleared);

const $isInitialized = createStore(false)
  .on(CurrentUserGate.open, () => false)
  .on(currentUserSkipped, () => true)
  .on(fetchCurrentUserFx.finally, () => true);

const $isAuthenticated = $currentUser.map(Boolean);

const $error = createStore<string | null>(null)
  .reset(clearError, fetchCurrentUserFx)
  .on(fetchCurrentUserFx.failData, (_, error) => error.message);

sample({
  clock: CurrentUserGate.open,
  source: sessionModel.outputs.$accessToken,
  filter: Boolean,
  fn: () => undefined,
  target: fetchCurrentUserFx,
});

sample({
  clock: CurrentUserGate.open,
  source: sessionModel.outputs.$accessToken,
  filter: (token) => !token,
  target: currentUserSkipped,
});

sample({
  clock: fetchCurrentUserFx.fail,
  target: sessionModel.inputs.sessionCleared,
});

export const currentUserService = {
  inputs: {
    setCurrentUser,
    fetchCurrentUserFx,
    clearError,
  },
  outputs: {
    $currentUser,
    $isInitialized,
    $isAuthenticated,
    $error,
  },
  gates: {
    CurrentUserGate,
  },
};
