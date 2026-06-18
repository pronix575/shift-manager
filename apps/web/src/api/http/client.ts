import ky, { HTTPError } from 'ky';

import type { Api } from 'api/generated/api.types';
import { sessionModel } from 'services/core/session/session.model';
import { sessionStorageService } from 'services/core/session/sessionStorage';

const apiUrl = resolveApiUrl(import.meta.env.VITE_API_URL || '/api');

let refreshPromise: Promise<Api.AuthControllerRefresh.ResponseBody | null> | null =
  null;

export const apiClient = ky.create({
  prefixUrl: apiUrl,
  retry: { limit: 0 },
  timeout: 30_000,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = getAccessToken();

        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        const shouldSkipRefresh = isSessionRefreshSkipped(request.url);

        if (response.status !== 401 || shouldSkipRefresh) {
          return response;
        }

        const refreshed = await refreshSession();

        if (!refreshed) {
          sessionModel.inputs.sessionCleared();
          return response;
        }

        request.headers.set('Authorization', `Bearer ${refreshed.accessToken}`);

        return ky(request, options);
      },
    ],
  },
});

export async function readApiError(error: unknown): Promise<string> {
  if (error instanceof HTTPError) {
    try {
      const body = (await error.response.json()) as { message?: unknown };

      if (Array.isArray(body.message)) {
        return body.message.join(', ');
      }

      if (typeof body.message === 'string') {
        return body.message;
      }
    } catch {
      return error.message;
    }
  }

  return error instanceof Error ? error.message : 'Неизвестная ошибка';
}

export function resolveApiUrl(url: string) {
  return new URL(url, window.location.origin).toString().replace(/\/$/, '');
}

export function isSessionRefreshSkipped(url: string) {
  const pathname = new URL(url, window.location.origin).pathname;

  return ['/auth/login', '/auth/refresh', '/auth/logout'].some((authPath) =>
    pathname.endsWith(authPath),
  );
}

async function refreshSession(): Promise<Api.AuthControllerRefresh.ResponseBody | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  refreshPromise ??= ky
    .post('auth/refresh', {
      prefixUrl: apiUrl,
      json: { refreshToken } satisfies Api.AuthControllerRefresh.RequestBody,
      retry: { limit: 0 },
    })
    .json<Api.AuthControllerRefresh.ResponseBody>()
    .then((response) => {
      sessionModel.inputs.accessTokenChanged(response.accessToken);
      sessionModel.inputs.refreshTokenChanged(response.refreshToken);

      return response;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function getAccessToken() {
  return (
    sessionModel.outputs.$accessToken.getState() ??
    sessionStorageService.getAccessToken()
  );
}

function getRefreshToken() {
  return (
    sessionModel.outputs.$refreshToken.getState() ??
    sessionStorageService.getRefreshToken()
  );
}
