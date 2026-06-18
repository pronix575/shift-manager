import ky, { HTTPError } from 'ky';

import { AuthResponse } from 'api/generated/api.types';
import { sessionStorageService } from 'services/core/session/sessionStorage';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

let refreshPromise: Promise<AuthResponse | null> | null = null;

export const apiClient = ky.create({
  prefixUrl: apiUrl,
  retry: { limit: 0 },
  timeout: 30_000,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = sessionStorageService.getAccessToken();

        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        const isAuthRequest = request.url.includes('/auth/');

        if (response.status !== 401 || isAuthRequest) {
          return response;
        }

        const refreshed = await refreshSession();

        if (!refreshed) {
          sessionStorageService.clear();
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

async function refreshSession(): Promise<AuthResponse | null> {
  const refreshToken = sessionStorageService.getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  refreshPromise ??= ky
    .post('auth/refresh', {
      prefixUrl: apiUrl,
      json: { refreshToken },
      retry: { limit: 0 },
    })
    .json<AuthResponse>()
    .then((response) => {
      sessionStorageService.setAccessToken(response.accessToken);
      sessionStorageService.setRefreshToken(response.refreshToken);

      return response;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}
