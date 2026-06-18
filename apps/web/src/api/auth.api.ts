import type { Api } from './generated/api.types';
import { apiClient } from './http/client';

export function loginRequest(login: string, password: string) {
  const payload: Api.AuthControllerLogin.RequestBody = { login, password };

  return apiClient
    .post('auth/login', {
      json: payload,
    })
    .json<Api.AuthControllerLogin.ResponseBody>();
}

export function logoutRequest(refreshToken: string | null) {
  const payload: Api.AuthControllerLogout.RequestBody = { refreshToken };

  return apiClient
    .post('auth/logout', {
      json: payload,
    })
    .json<Api.AuthControllerLogout.ResponseBody>();
}

export function getMeRequest() {
  return apiClient.get('auth/me').json<Api.AuthControllerMe.ResponseBody>();
}

export function createTelegramLinkCodeRequest() {
  return apiClient
    .post('auth/telegram/link-code')
    .json<Api.AuthControllerCreateTelegramLinkCode.ResponseBody>();
}
