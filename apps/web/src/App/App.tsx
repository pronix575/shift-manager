import { useGate } from 'effector-react';
import { BrowserRouter } from 'react-router-dom';

import { AppRouter } from 'router/AppRouter';
import { currentUserService } from 'services/core/auth/currentUserService';

import { Bootstrap } from './Bootstrap';

export function App() {
  useGate(currentUserService.gates.CurrentUserGate);

  return (
    <BrowserRouter>
      <Bootstrap>
        <AppRouter />
      </Bootstrap>
    </BrowserRouter>
  );
}
