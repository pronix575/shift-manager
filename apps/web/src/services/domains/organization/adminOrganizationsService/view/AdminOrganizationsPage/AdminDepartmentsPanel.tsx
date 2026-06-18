import { Button } from '@heroui/react';
import { Archive, Pencil, Plus } from 'lucide-react';

import { Department } from 'api/generated/api.types';
import { PaginatedResponse } from 'api/pagination';
import { DataTable, DataTableColumn } from 'ui/components/DataTable';
import { Panel } from 'ui/components/Panel';

type AdminDepartmentsPanelProps = {
  departmentsPage: PaginatedResponse<Department>;
  onArchiveDepartment: (department: Department) => void;
  onCreateDepartment: () => void;
  onEditDepartment: (department: Department) => void;
  onPageChange: (page: number) => void;
};

export function AdminDepartmentsPanel({
  departmentsPage,
  onArchiveDepartment,
  onCreateDepartment,
  onEditDepartment,
  onPageChange,
}: AdminDepartmentsPanelProps) {
  const columns: DataTableColumn<Department>[] = [
    {
      key: 'name',
      label: 'Название',
      isRowHeader: true,
      render: (department) => department.name,
    },
    {
      key: 'users',
      label: 'Сотрудники',
      render: (department) => department._count?.users ?? 0,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (department) => (
        <div className="flex justify-end gap-2">
          <Button
            isIconOnly
            aria-label="Редактировать департамент"
            size="sm"
            variant="secondary"
            onClick={() => onEditDepartment(department)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            isIconOnly
            aria-label="Архивировать департамент"
            size="sm"
            variant="danger-soft"
            onClick={() => onArchiveDepartment(department)}
          >
            <Archive size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Panel
      title="Департаменты"
      action={
        <Button variant="primary" onClick={onCreateDepartment}>
          <Plus size={16} />
          Добавить
        </Button>
      }
    >
      <DataTable
        ariaLabel="Департаменты организации"
        columns={columns}
        getRowKey={(department) => department.id}
        pagination={{
          meta: departmentsPage.meta,
          onPageChange,
        }}
        rows={departmentsPage.items}
      />
    </Panel>
  );
}
