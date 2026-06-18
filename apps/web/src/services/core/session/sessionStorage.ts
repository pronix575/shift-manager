const ACCESS_TOKEN_KEY = 'shift-manager.access-token';
const REFRESH_TOKEN_KEY = 'shift-manager.refresh-token';

export const sessionStorageService = {
  getAccessToken() {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  getRefreshToken() {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  clear() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
