import { Notice } from 'ui/components/Notice';

import { CredentialsMessage } from './AdminOrganizationsPage.types';

type AdminFeedbackProps = {
  credentials: CredentialsMessage;
  error: string | null;
  message: string | null;
};

export function AdminFeedback({
  credentials,
  error,
  message,
}: AdminFeedbackProps) {
  return (
    <>
      {message && <Notice tone="success">{message}</Notice>}
      {credentials && (
        <Notice tone="success">
          {[
            credentials.login ? `Логин: ${credentials.login}.` : '',
            credentials.password ? `Пароль: ${credentials.password}` : '',
          ]
            .filter(Boolean)
            .join(' ')}
        </Notice>
      )}
      {error && <Notice tone="danger">{error}</Notice>}
    </>
  );
}
