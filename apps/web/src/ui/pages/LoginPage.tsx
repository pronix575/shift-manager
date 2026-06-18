import { Button, Card } from '@heroui/react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logoMark from '../../assets/shift-manager-logo-tiles-badge.png';

import { useAuth } from 'services/core/auth/AuthProvider';
import { Notice } from 'ui/components/Notice';
import { TextField } from 'ui/components/TextField';

export function LoginPage() {
  const navigate = useNavigate();
  const { error, login } = useAuth();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(loginValue, password);
      navigate('/');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1fr_520px]">
      <section className="hidden min-h-screen items-end bg-[linear-gradient(135deg,#0f766e,#172033_55%,#111827)] p-12 text-white lg:flex">
        <div className="max-w-xl">
          <img
            src={logoMark}
            alt=""
            aria-hidden="true"
            className="mb-5 h-20 w-20 rounded-2xl object-contain"
          />
          <h1 className="text-5xl font-semibold leading-tight">
            Shift Manager
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-slate-200">
            Управление сменами, сотрудниками и выгрузками организации.
          </p>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center bg-slate-50 px-5">
        <img
          src={logoMark}
          alt=""
          aria-hidden="true"
          className="mb-6 h-20 w-20 rounded-2xl object-contain lg:hidden"
        />
        <Card className="w-full max-w-sm">
          <Card.Header>
            <Card.Title>Вход</Card.Title>
          </Card.Header>
          <Card.Content>
            <form onSubmit={(event) => void handleSubmit(event)}>
              <div className="space-y-4">
                <TextField
                  label="Логин"
                  value={loginValue}
                  onChange={(event) => setLoginValue(event.target.value)}
                  autoComplete="username"
                />
                <TextField
                  label="Пароль"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <Notice tone="danger" className="mt-4">
                  {error}
                </Notice>
              )}
              <Button
                type="submit"
                className="mt-6"
                fullWidth
                isDisabled={isSubmitting}
                variant="primary"
              >
                Войти
              </Button>
            </form>
          </Card.Content>
        </Card>
      </section>
    </main>
  );
}
