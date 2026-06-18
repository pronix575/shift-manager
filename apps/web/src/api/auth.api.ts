import { AuthResponse, SessionUser } from './generated/api.types';
import { apiClient } from './http/client';

export function loginRequest(login: string, password: string) {
  return apiClient
    .post('auth/login', {
      json: { login, password },
    })
    .json<AuthResponse>();
}

export function logoutRequest(refreshToken: string | null) {
  return apiClient
    .post('auth/logout', {
      json: { refreshToken },
    })
    .json<{ ok: boolean }>();
}

export function getMeRequest() {
  return apiClient.get('auth/me').json<SessionUser>();
}

export function createTelegramLinkCodeRequest() {
  return apiClient
    .post('auth/telegram/link-code')
    .json<{ code: string; expiresAt: string }>();
}
