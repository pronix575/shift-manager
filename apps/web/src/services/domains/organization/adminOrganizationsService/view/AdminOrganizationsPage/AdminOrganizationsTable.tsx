import { Button } from '@heroui/react';
import { Archive, Building2, RefreshCcw } from 'lucide-react';

import { Organization } from 'api/generated/api.types';
import { PaginatedResponse } from 'api/pagination';
import { DataTable, DataTableColumn } from 'ui/components/DataTable';
import { Panel } from 'ui/components/Panel';
import { StatusPill } from 'ui/components/StatusPill';

type AdminOrganizationsTableProps = {
  organizationsPage: PaginatedResponse<Organization>;
  onArchiveOrganization: (organization: Organization) => void;
  onOpenOrganization: (organizationId: string) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
};

export function AdminOrganizationsTable({
  organizationsPage,
  onArchiveOrganization,
  onOpenOrganization,
  onPageChange,
  onRefresh,
}: AdminOrganizationsTableProps) {
  const columns: DataTableColumn<Organization>[] = [
    {
      key: 'name',
      label: 'Название',
      isRowHeader: true,
      render: (organization) => organization.name,
    },
    {
      key: 'status',
      label: 'Статус',
      render: (organization) => (
        <StatusPill
          tone={organization.status === 'ACTIVE' ? 'green' : 'slate'}
        >
          {organization.status === 'ACTIVE' ? 'Активна' : 'Архив'}
        </StatusPill>
      ),
    },
    {
      key: 'users',
      label: 'Пользователи',
      render: (organization) => organization._count?.users ?? 0,
    },
    {
      key: 'shifts',
      label: 'Смены',
      render: (organization) => organization._count?.shifts ?? 0,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (organization) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onOpenOrganization(organization.id)}
          >
            <Building2 size={14} />
            Открыть
          </Button>
          <Button
            isIconOnly
            aria-label="Архивировать организацию"
            size="sm"
            variant="danger-soft"
            onClick={() => onArchiveOrganization(organization)}
          >
            <Archive size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Panel
      title="Список организаций"
      action={
        <Button variant="secondary" onClick={onRefresh}>
          <RefreshCcw size={16} />
          Обновить
        </Button>
      }
    >
      <DataTable
        ariaLabel="Список организаций"
        columns={columns}
        getRowKey={(organization) => organization.id}
        pagination={{
          meta: organizationsPage.meta,
          onPageChange,
        }}
        rows={organizationsPage.items}
      />
    </Panel>
  );
}
