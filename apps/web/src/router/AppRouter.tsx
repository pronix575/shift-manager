import { Spinner } from '@heroui/react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from 'services/core/auth/AuthProvider';
import { AppShell } from 'ui/layout/AppShell';
import { AdminOrganizationsPage } from 'ui/pages/AdminOrganizationsPage';
import { DashboardPage } from 'ui/pages/DashboardPage';
import { EmployeesPage } from 'ui/pages/EmployeesPage';
import { LoginPage } from 'ui/pages/LoginPage';
import { MyShiftsPage } from 'ui/pages/MyShiftsPage';
import { OrganizationSettingsPage } from 'ui/pages/OrganizationSettingsPage';
import { ShiftsRegistryPage } from 'ui/pages/ShiftsRegistryPage';

export function AppRouter() {
  const { isAuthenticated, isInitialized, user } = useAuth();

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner aria-label="Загрузка" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate replace to={getDefaultRoute(user.role)} />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/my-shifts" element={<MyShiftsPage />} />
        <Route path="/shifts" element={<ShiftsRegistryPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/organization" element={<OrganizationSettingsPage />} />
        <Route path="/admin/organizations" element={<AdminOrganizationsPage />} />
        <Route path="*" element={<Navigate replace to={getDefaultRoute(user.role)} />} />
      </Routes>
    </AppShell>
  );
}

function getDefaultRoute(role: string) {
  if (role === 'ADMIN') {
    return '/admin/organizations';
  }

  if (role === 'ORG_MANAGER') {
    return '/dashboard';
  }

  return '/my-shifts';
}
