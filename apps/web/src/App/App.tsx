import { BrowserRouter } from 'react-router-dom';

import { AppRouter } from 'router/AppRouter';
import { AuthProvider } from 'services/core/auth/AuthProvider';

import { Bootstrap } from './Bootstrap';

export function App() {
  return (
    <BrowserRouter>
      <Bootstrap>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </Bootstrap>
    </BrowserRouter>
  );
}
