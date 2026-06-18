import { useUnit } from 'effector-react';

import { currentUserService } from './currentUserService';
import { loginService } from './loginService';
import { logoutService } from './logoutService';

export function useAuth() {
  const {
    clearCurrentUserError,
    clearLoginError,
    clearLogoutError,
    currentUserError,
    loginError,
    logoutError,
    fetchCurrentUser,
    isAuthenticated,
    isInitialized,
    isLoginPending,
    login,
    logout,
    user,
  } = useUnit({
    user: currentUserService.outputs.$currentUser,
    isInitialized: currentUserService.outputs.$isInitialized,
    isAuthenticated: currentUserService.outputs.$isAuthenticated,
    currentUserError: currentUserService.outputs.$error,
    loginError: loginService.outputs.$error,
    logoutError: logoutService.outputs.$error,
    isLoginPending: loginService.outputs.$isLoading,
    login: loginService.inputs.loginFx,
    logout: logoutService.inputs.logoutClicked,
    fetchCurrentUser: currentUserService.inputs.fetchCurrentUserFx,
    clearCurrentUserError: currentUserService.inputs.clearError,
    clearLoginError: loginService.inputs.clearError,
    clearLogoutError: logoutService.inputs.clearError,
  });

  return {
    user,
    isInitialized,
    isAuthenticated,
    error: loginError ?? currentUserError ?? logoutError,
    isLoginPending,
    login: (loginValue: string, password: string) =>
      login({ login: loginValue, password }),
    logout,
    refreshMe: fetchCurrentUser,
    clearError: () => {
      clearCurrentUserError();
      clearLoginError();
      clearLogoutError();
    },
  };
}
