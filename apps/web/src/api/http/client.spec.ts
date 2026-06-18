import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SessionUser } from 'api/generated/api.types';
import { sessionStorageService } from 'services/core/session/sessionStorage';

import { apiClient, isSessionRefreshSkipped, resolveApiUrl } from './client';

const sessionUser: SessionUser = {
  id: 'user-id',
  organizationId: 'organization-id',
  role: 'EMPLOYEE',
  firstName: 'Иван',
  lastName: 'Петров',
  middleName: null,
  status: 'ACTIVE',
  departments: [],
  telegramLinked: false,
  mustChangePassword: false,
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function getRequest(input: RequestInfo | URL) {
  return input instanceof Request ? input : new Request(input);
}

describe('apiClient auth refresh policy', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it('skips refresh only for anonymous session endpoints', () => {
    expect(isSessionRefreshSkipped('/api/auth/login')).toBe(true);
    expect(isSessionRefreshSkipped('/api/auth/refresh')).toBe(true);
    expect(isSessionRefreshSkipped('/api/auth/logout')).toBe(true);

    expect(isSessionRefreshSkipped('/api/auth/me')).toBe(false);
    expect(isSessionRefreshSkipped('/api/auth/telegram/link-code')).toBe(false);
    expect(isSessionRefreshSkipped('/api/shifts')).toBe(false);
  });

  it('supports absolute API urls from env config', () => {
    expect(isSessionRefreshSkipped('https://api.example.com/api/auth/refresh')).toBe(
      true,
    );
    expect(isSessionRefreshSkipped('https://api.example.com/api/auth/me')).toBe(
      false,
    );
  });

  it('resolves relative API urls against current origin for ky', () => {
    expect(resolveApiUrl('/api')).toBe('http://localhost:3000/api');
    expect(resolveApiUrl('https://api.example.com/api')).toBe(
      'https://api.example.com/api',
    );
  });

  it('refreshes protected auth endpoints after an unauthorized response', async () => {
    sessionStorageService.setAccessToken('expired-access-token');
    sessionStorageService.setRefreshToken('valid-refresh-token');

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const request = getRequest(input);

      if (
        request.url.endsWith('/api/auth/me') &&
        request.headers.get('Authorization') === 'Bearer expired-access-token'
      ) {
        return new Response(null, { status: 401 });
      }

      if (request.url.endsWith('/api/auth/refresh')) {
        await expect(request.json()).resolves.toEqual({
          refreshToken: 'valid-refresh-token',
        });

        return jsonResponse({
          accessToken: 'fresh-access-token',
          refreshToken: 'fresh-refresh-token',
          user: sessionUser,
        });
      }

      if (
        request.url.endsWith('/api/auth/me') &&
        request.headers.get('Authorization') === 'Bearer fresh-access-token'
      ) {
        return jsonResponse(sessionUser);
      }

      return new Response(null, { status: 500 });
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient.get('auth/me').json()).resolves.toEqual(sessionUser);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(sessionStorageService.getAccessToken()).toBe('fresh-access-token');
    expect(sessionStorageService.getRefreshToken()).toBe('fresh-refresh-token');
  });
});
