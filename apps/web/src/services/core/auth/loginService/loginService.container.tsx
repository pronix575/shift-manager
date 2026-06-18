import { useNavigate } from 'react-router-dom';

import { useAuth } from 'services/core/auth/auth.hooks';

import { LoginPage } from './view/LoginPage/LoginPage';

export function LoginContainer() {
  const navigate = useNavigate();
  const { error, isLoginPending, login } = useAuth();

  async function handleLogin(loginValue: string, password: string) {
    try {
      await login(loginValue, password);
      navigate('/');
    } catch {
      // Ошибка уже нормализована и сохранена в loginService.
    }
  }

  return (
    <LoginPage
      error={error}
      isLoginPending={isLoginPending}
      onLogin={handleLogin}
    />
  );
}
