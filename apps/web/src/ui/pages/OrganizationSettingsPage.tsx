import { Button } from '@heroui/react';
import { Archive, Pencil, Plus, Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import { Department, Organization } from 'api/generated/api.types';
import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  getEmptyPaginatedResponse,
  PaginationQuery,
} from 'api/pagination';
import {
  archiveDepartmentRequest,
  createDepartmentRequest,
  getOrganizationRequest,
  listDepartmentsPageRequest,
  updateDepartmentRequest,
  updateOrganizationRequest,
} from 'api/organization.api';
import { readApiError } from 'api/http/client';
import { ActionModal } from 'ui/components/ActionModal';
import { ButtonSpinner } from 'ui/components/ButtonSpinner';
import { DataTable } from 'ui/components/DataTable';
import { Notice } from 'ui/components/Notice';
import { Panel } from 'ui/components/Panel';
import { TextField } from 'ui/components/TextField';

type DepartmentModalState = {
  type: 'editDepartment';
  department: Department;
} | null;

export function OrganizationSettingsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [departmentsPage, setDepartmentsPage] = useState(() =>
    getEmptyPaginatedResponse<Department>(),
  );
  const [departmentsPagination, setDepartmentsPagination] =
    useState<PaginationQuery>({
      page: DEFAULT_PAGE,
      perPage: DEFAULT_PER_PAGE,
    });
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('Europe/Moscow');
  const [departmentName, setDepartmentName] = useState('');
  const [editDepartmentName, setEditDepartmentName] = useState('');
  const [departmentModal, setDepartmentModal] =
    useState<DepartmentModalState>(null);
  const [isUpdatingDepartment, setIsUpdatingDepartment] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(nextDepartmentsPagination = departmentsPagination) {
    const [nextOrganization, nextDepartments] = await Promise.all([
      getOrganizationRequest(),
      listDepartmentsPageRequest(nextDepartmentsPagination),
    ]);
    setOrganization(nextOrganization);
    setDepartmentsPage(nextDepartments);
    setDepartmentsPagination({
      page: nextDepartments.meta.page,
      perPage: nextDepartments.meta.perPage,
    });
    setName(nextOrganization.name);
    setTimezone(nextOrganization.timezone);
  }

  async function loadDepartmentsPage(nextDepartmentsPagination: PaginationQuery) {
    const nextDepartments = await listDepartmentsPageRequest(
      nextDepartmentsPagination,
    );
    setDepartmentsPage(nextDepartments);
    setDepartmentsPagination({
      page: nextDepartments.meta.page,
      perPage: nextDepartments.meta.perPage,
    });
  }

  useEffect(() => {
    void load().catch(async (requestError) =>
      setError(await readApiError(requestError)),
    );
  }, []);

  async function saveOrganization(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setOrganization(await updateOrganizationRequest({ name, timezone }));
    setMessage('Организация сохранена');
  }

  async function createDepartment(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      await createDepartmentRequest(departmentName);
      setDepartmentName('');
      await load();
      setMessage('Департамент создан');
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  function openEditDepartmentModal(department: Department) {
    setEditDepartmentName(department.name);
    setDepartmentModal({ type: 'editDepartment', department });
  }

  function closeDepartmentModal() {
    setDepartmentModal(null);
  }

  function handleDepartmentModalOpenChange(isOpen: boolean) {
    if (!isOpen) {
      closeDepartmentModal();
    }
  }

  async function updateDepartment(event: FormEvent) {
    event.preventDefault();

    if (departmentModal?.type !== 'editDepartment') {
      return;
    }

    setError(null);
    setMessage(null);
    setIsUpdatingDepartment(true);

    try {
      await updateDepartmentRequest(
        departmentModal.department.id,
        editDepartmentName,
      );
      setEditDepartmentName('');
      await load();
      setMessage('Департамент обновлен');
      closeDepartmentModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    } finally {
      setIsUpdatingDepartment(false);
    }
  }

  async function handleDepartmentsPageChange(page: number) {
    setError(null);

    try {
      await loadDepartmentsPage({ ...departmentsPagination, page });
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold text-slate-950">Организация</h1>

      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="danger">{error}</Notice>}

      <Panel title="Профиль">
        <form
          className="grid items-end gap-3 md:grid-cols-[1fr_220px_auto]"
          onSubmit={(event) => void saveOrganization(event)}
        >
          <TextField
            label="Название"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextField
            label="Часовой пояс"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
          />
          <Button type="submit" variant="primary">
            <Save size={16} />
            Сохранить
          </Button>
        </form>
        {organization && (
          <p className="mt-4 text-sm text-slate-500">
            Статус: {organization.status}
          </p>
        )}
      </Panel>

      <Panel title="Департаменты">
        <form
          className="mb-4 grid items-end gap-3 md:grid-cols-[1fr_auto]"
          onSubmit={(event) => void createDepartment(event)}
        >
          <TextField
            label="Название департамента"
            value={departmentName}
            onChange={(event) => setDepartmentName(event.target.value)}
          />
          <Button type="submit" variant="primary">
            <Plus size={16} />
            Добавить
          </Button>
        </form>
        <DataTable
          ariaLabel="Департаменты"
          columns={[
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
                    onClick={() => openEditDepartmentModal(department)}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    isIconOnly
                    aria-label="Архивировать департамент"
                    size="sm"
                    variant="danger-soft"
                    onClick={() =>
                      void archiveDepartmentRequest(department.id).then(() =>
                        load(),
                      )
                    }
                  >
                    <Archive size={14} />
                  </Button>
                </div>
              ),
            },
          ]}
          getRowKey={(department) => department.id}
          pagination={{
            meta: departmentsPage.meta,
            onPageChange: (page) => void handleDepartmentsPageChange(page),
          }}
          rows={departmentsPage.items}
        />
      </Panel>

      <ActionModal
        isOpen={departmentModal?.type === 'editDepartment'}
        title="Редактировать департамент"
        size="sm"
        onOpenChange={handleDepartmentModalOpenChange}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={closeDepartmentModal}
            >
              Отмена
            </Button>
            <Button
              form="edit-department-form"
              type="submit"
              isDisabled={isUpdatingDepartment}
              variant="primary"
            >
              {isUpdatingDepartment ? (
                <ButtonSpinner />
              ) : (
                <Pencil size={16} />
              )}
              Сохранить
            </Button>
          </>
        }
      >
        <form
          id="edit-department-form"
          className="space-y-4"
          onSubmit={(event) => void updateDepartment(event)}
        >
          <TextField
            required
            label="Название департамента"
            value={editDepartmentName}
            onChange={(event) => setEditDepartmentName(event.target.value)}
          />
        </form>
      </ActionModal>
    </div>
  );
}
