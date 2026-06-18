import { Button } from '@heroui/react';
import { Archive, Pencil, Plus } from 'lucide-react';
import { FormEvent } from 'react';

import { Department } from 'api/generated/api.types';
import { PaginatedResponse } from 'api/pagination';
import { DataTable, DataTableColumn } from 'ui/components/DataTable';
import { Panel } from 'ui/components/Panel';
import { TextField } from 'ui/components/TextField';

type DepartmentsPanelProps = {
  departmentName: string;
  departmentsPage: PaginatedResponse<Department>;
  onArchiveDepartment: (id: string) => void;
  onCreateDepartment: () => void;
  onDepartmentNameChange: (name: string) => void;
  onEditDepartment: (department: Department) => void;
  onPageChange: (page: number) => void;
};

export function DepartmentsPanel({
  departmentName,
  departmentsPage,
  onArchiveDepartment,
  onCreateDepartment,
  onDepartmentNameChange,
  onEditDepartment,
  onPageChange,
}: DepartmentsPanelProps) {
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
            onClick={() => onArchiveDepartment(department.id)}
          >
            <Archive size={14} />
          </Button>
        </div>
      ),
    },
  ];

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onCreateDepartment();
  }

  return (
    <Panel title="Департаменты">
      <form
        className="mb-4 grid items-end gap-3 md:grid-cols-[1fr_auto]"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <TextField
          label="Название департамента"
          value={departmentName}
          onChange={(event) => onDepartmentNameChange(event.target.value)}
        />
        <Button type="submit" variant="primary">
          <Plus size={16} />
          Добавить
        </Button>
      </form>
      <DataTable
        ariaLabel="Департаменты"
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
