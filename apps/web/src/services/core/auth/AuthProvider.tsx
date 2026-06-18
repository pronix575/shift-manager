import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getMeRequest,
  loginRequest,
  logoutRequest,
} from 'api/auth.api';
import { SessionUser } from 'api/generated/api.types';
import { readApiError } from 'api/http/client';
import { sessionStorageService } from 'services/core/session/sessionStorage';

type AuthContextValue = {
  user: SessionUser | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isInitialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMe = useCallback(async () => {
    const accessToken = sessionStorageService.getAccessToken();

    if (!accessToken) {
      setInitialized(true);
      return;
    }

    try {
      setUser(await getMeRequest());
    } catch (requestError) {
      sessionStorageService.clear();
      setUser(null);
      setError(await readApiError(requestError));
    } finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const login = useCallback(async (loginValue: string, password: string) => {
    setError(null);

    try {
      const response = await loginRequest(loginValue, password);
      sessionStorageService.setAccessToken(response.accessToken);
      sessionStorageService.setRefreshToken(response.refreshToken);
      setUser(response.user);
    } catch (requestError) {
      setError(await readApiError(requestError));
      throw requestError;
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = sessionStorageService.getRefreshToken();

    try {
      await logoutRequest(refreshToken);
    } finally {
      sessionStorageService.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isInitialized,
      isAuthenticated: Boolean(user),
      error,
      login,
      logout,
      refreshMe,
      clearError: () => setError(null),
    }),
    [error, isInitialized, login, logout, refreshMe, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
