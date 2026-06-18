import { createEvent, createStore } from 'effector';

import { sessionStorageService } from './sessionStorage';

function readStoredAccessToken() {
  return typeof window === 'undefined'
    ? null
    : sessionStorageService.getAccessToken();
}

function readStoredRefreshToken() {
  return typeof window === 'undefined'
    ? null
    : sessionStorageService.getRefreshToken();
}

const accessTokenChanged = createEvent<string>();
const refreshTokenChanged = createEvent<string>();
const sessionCleared = createEvent();

const $accessToken = createStore<string | null>(readStoredAccessToken())
  .on(accessTokenChanged, (_, token) => token)
  .reset(sessionCleared);

const $refreshToken = createStore<string | null>(readStoredRefreshToken())
  .on(refreshTokenChanged, (_, token) => token)
  .reset(sessionCleared);

accessTokenChanged.watch((token) => {
  sessionStorageService.setAccessToken(token);
});

refreshTokenChanged.watch((token) => {
  sessionStorageService.setRefreshToken(token);
});

sessionCleared.watch(() => {
  sessionStorageService.clear();
});

export const sessionModel = {
  inputs: {
    accessTokenChanged,
    refreshTokenChanged,
    sessionCleared,
  },
  outputs: {
    $accessToken,
    $refreshToken,
  },
};
