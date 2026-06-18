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

import logoMark from '../../assets/shift-manager-logo-tiles-badge.png';

import { UserRole } from 'api/generated/api.types';
import { useAuth } from 'services/core/auth/auth.hooks';

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
  const hideTopMenuOnMobile = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';

  return (
    <div className="app-shell min-h-screen lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-5 lg:block">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={logoMark}
              alt=""
              aria-hidden="true"
              className="h-12 w-12 shrink-0 rounded-lg object-contain"
            />
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold text-slate-950">
                Shift Manager
              </div>
              <div className="mt-1 truncate text-xs text-slate-500">
                {menuUserLabel}
              </div>
            </div>
          </div>
          <Button
            isIconOnly
            size="sm"
            className="shrink-0 lg:hidden"
            variant="secondary"
            onClick={() => void logout()}
          >
            <LogOut size={16} />
          </Button>
        </div>
        <nav
          className={[
            hideTopMenuOnMobile ? 'hidden' : 'flex',
            'gap-1 overflow-x-auto px-3 pb-3 lg:block lg:flex-1 lg:space-y-1 lg:overflow-visible',
          ].join(' ')}
        >
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
        <div className="hidden px-5 py-5 lg:mt-auto lg:block lg:shrink-0">
          <Button fullWidth onClick={() => void logout()} variant="secondary">
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
