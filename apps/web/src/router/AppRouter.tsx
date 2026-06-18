import { Spinner } from '@heroui/react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from 'services/core/auth/auth.hooks';
import { LoginContainer } from 'services/core/auth/loginService';
import { AdminOrganizationsContainer } from 'services/domains/organization/adminOrganizationsService';
import { EmployeesContainer } from 'services/domains/organization/employeesService';
import { OrganizationSettingsContainer } from 'services/domains/organization/organizationSettingsService';
import { DashboardContainer } from 'services/domains/shifts/dashboardService';
import { MyShiftsContainer } from 'services/domains/shifts/myShiftsService';
import { ShiftsRegistryContainer } from 'services/domains/shifts/shiftsRegistryService';
import { AppShell } from 'ui/layout/AppShell';

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
        <Route path="/login" element={<LoginContainer />} />
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate replace to={getDefaultRoute(user.role)} />} />
        <Route path="/dashboard" element={<DashboardContainer />} />
        <Route path="/my-shifts" element={<MyShiftsContainer />} />
        <Route path="/shifts" element={<ShiftsRegistryContainer />} />
        <Route path="/employees" element={<EmployeesContainer />} />
        <Route path="/organization" element={<OrganizationSettingsContainer />} />
        <Route path="/admin/organizations" element={<AdminOrganizationsContainer />} />
        <Route
          path="/admin/organizations/:organizationId"
          element={<AdminOrganizationsContainer />}
        />
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
