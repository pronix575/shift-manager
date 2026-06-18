import { Button } from '@heroui/react';
import { Archive, Pencil, UserPlus } from 'lucide-react';

import { OrganizationUser } from 'api/generated/api.types';
import { PaginatedResponse } from 'api/pagination';
import { formatPersonName } from 'services/domains/shifts/shiftFormat';
import { DataTable, DataTableColumn } from 'ui/components/DataTable';
import { Panel } from 'ui/components/Panel';
import { StatusPill } from 'ui/components/StatusPill';

import { roleLabels } from './AdminOrganizationsPage.constants';

type AdminOrganizationUsersPanelProps = {
  usersPage: PaginatedResponse<OrganizationUser>;
  onArchiveUser: (user: OrganizationUser) => void;
  onCreateUser: () => void;
  onEditUser: (user: OrganizationUser) => void;
  onPageChange: (page: number) => void;
};

export function AdminOrganizationUsersPanel({
  usersPage,
  onArchiveUser,
  onCreateUser,
  onEditUser,
  onPageChange,
}: AdminOrganizationUsersPanelProps) {
  const columns: DataTableColumn<OrganizationUser>[] = [
    {
      key: 'name',
      label: 'ФИО',
      isRowHeader: true,
      render: (user) => formatPersonName(user),
    },
    {
      key: 'role',
      label: 'Роль',
      render: (user) => roleLabels[user.role],
    },
    {
      key: 'login',
      label: 'Логин',
      render: (user) => user.password?.login ?? '—',
    },
    {
      key: 'departments',
      label: 'Департаменты',
      render: (user) =>
        user.departments.map(({ department }) => department.name).join(', ') ||
        '—',
    },
    {
      key: 'telegram',
      label: 'Telegram',
      render: (user) => (
        <StatusPill tone={user.telegram ? 'green' : 'slate'}>
          {user.telegram ? 'Привязан' : 'Нет'}
        </StatusPill>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (user) => (
        <div className="flex justify-end gap-2">
          <Button
            isIconOnly
            aria-label="Редактировать пользователя"
            size="sm"
            variant="secondary"
            onClick={() => onEditUser(user)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            isIconOnly
            aria-label="Архивировать пользователя"
            size="sm"
            variant="danger-soft"
            onClick={() => onArchiveUser(user)}
          >
            <Archive size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Panel
      title="Пользователи"
      action={
        <Button variant="primary" onClick={onCreateUser}>
          <UserPlus size={16} />
          Добавить
        </Button>
      }
    >
      <DataTable
        ariaLabel="Пользователи организации"
        columns={columns}
        getRowKey={(user) => user.id}
        pagination={{
          meta: usersPage.meta,
          onPageChange,
        }}
        rows={usersPage.items}
      />
    </Panel>
  );
}
