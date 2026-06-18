import { Button } from '@heroui/react';
import {
  BarChart3,
  Building2,
  CalendarClock,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';

import { UserRole } from 'api/generated/api.types';
import { useAuth } from 'services/core/auth/AuthProvider';

type NavigationItem = {
  path: string;
  label: string;
  icon: typeof CalendarClock;
  roles: UserRole[];
};

const navigationItems: NavigationItem[] = [
  {
    path: '/dashboard',
    label: 'Статистика',
    icon: BarChart3,
    roles: ['ORG_MANAGER'],
  },
  {
    path: '/my-shifts',
    label: 'Мои смены',
    icon: CalendarClock,
    roles: ['ORG_MANAGER', 'EMPLOYEE'],
  },
  {
    path: '/shifts',
    label: 'Смены',
    icon: CalendarClock,
    roles: ['ORG_MANAGER'],
  },
  {
    path: '/employees',
    label: 'Сотрудники',
    icon: Users,
    roles: ['ORG_MANAGER'],
  },
  {
    path: '/organization',
    label: 'Организация',
    icon: Settings,
    roles: ['ORG_MANAGER'],
  },
  {
    path: '/admin/organizations',
    label: 'Организации',
    icon: Building2,
    roles: ['ADMIN'],
  },
];

export function AppShell({ children }: PropsWithChildren) {
  const { user, logout } = useAuth();
  const availableItems = navigationItems.filter(
    (item) => user && item.roles.includes(user.role),
  );
  const userName = [user?.lastName, user?.firstName].filter(Boolean).join(' ');
  const departmentNames = user?.departments.map(({ name }) => name).join(', ');
  const menuUserLabel = [userName, departmentNames].filter(Boolean).join(' · ');

  return (
    <div className="app-shell min-h-screen lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5 lg:block">
          <div>
            <div className="text-lg font-semibold text-slate-950">Shift Manager</div>
            <div className="mt-1 text-sm text-slate-500">
              {menuUserLabel}
            </div>
          </div>
          <Button
            isIconOnly
            size="sm"
            className="lg:hidden"
            variant="secondary"
            onClick={() => void logout()}
          >
            <LogOut size={16} />
          </Button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible">
          {availableItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-teal-50 text-teal-800'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                  ].join(' ')
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="hidden px-5 py-5 lg:block">
          <Button
            fullWidth
            onClick={() => void logout()}
            variant="secondary"
          >
            <LogOut size={16} />
            Выйти
          </Button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
