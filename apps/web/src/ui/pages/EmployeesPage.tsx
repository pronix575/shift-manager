import { Button } from '@heroui/react';
import { Archive, Pencil, Plus, RefreshCcw } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import {
  Department,
  OrganizationUser,
  UserRole,
} from 'api/generated/api.types';
import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  getEmptyPaginatedResponse,
  PaginationQuery,
} from 'api/pagination';
import {
  archiveUserRequest,
  createUserRequest,
  listDepartmentsRequest,
  listUsersPageRequest,
  updateUserRequest,
} from 'api/organization.api';
import { readApiError } from 'api/http/client';
import { generateUserPassword } from 'services/core/password/passwordGenerator';
import { formatPersonName } from 'services/domains/shifts/shiftFormat';
import { ActionModal } from 'ui/components/ActionModal';
import { ButtonSpinner } from 'ui/components/ButtonSpinner';
import { DataTable } from 'ui/components/DataTable';
import { MultiSelectField } from 'ui/components/MultiSelectField';
import { Notice } from 'ui/components/Notice';
import { Panel } from 'ui/components/Panel';
import { SelectField } from 'ui/components/SelectField';
import { StatusPill } from 'ui/components/StatusPill';
import { TextField } from 'ui/components/TextField';
import { UserPasswordField } from 'ui/components/UserPasswordField';

type UserForm = {
  firstName: string;
  lastName: string;
  middleName: string;
  password: string;
  role: Exclude<UserRole, 'ADMIN'>;
  departmentIds: string[];
};

type EmployeeModalState =
  | { type: 'editUser'; user: OrganizationUser }
  | { type: 'archiveUser'; user: OrganizationUser }
  | null;

type EmployeeModalType = NonNullable<EmployeeModalState>['type'];

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Админ',
  ORG_MANAGER: 'Менеджер',
  EMPLOYEE: 'Сотрудник',
};

const creatableRoleOptions = [
  { value: 'EMPLOYEE', label: 'Сотрудник' },
  { value: 'ORG_MANAGER', label: 'Менеджер' },
];

function getEmptyUserForm(): UserForm {
  return {
    firstName: '',
    lastName: '',
    middleName: '',
    password: '',
    role: 'EMPLOYEE',
    departmentIds: [],
  };
}

function getUserDepartmentIds(user: OrganizationUser) {
  return user.departments.map(({ department }) => department.id);
}

function getEditableRole(user: OrganizationUser): Exclude<UserRole, 'ADMIN'> {
  return user.role === 'ORG_MANAGER' ? 'ORG_MANAGER' : 'EMPLOYEE';
}

function getUserUpdatePayload(form: UserForm) {
  const { password, ...payload } = form;

  return password ? { ...payload, password } : payload;
}

export function EmployeesPage() {
  const [usersPage, setUsersPage] = useState(() =>
    getEmptyPaginatedResponse<OrganizationUser>(),
  );
  const [usersPagination, setUsersPagination] = useState<PaginationQuery>({
    page: DEFAULT_PAGE,
    perPage: DEFAULT_PER_PAGE,
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState(getEmptyUserForm);
  const [editForm, setEditForm] = useState(getEmptyUserForm);
  const [modal, setModal] = useState<EmployeeModalState>(null);
  const [submittingModal, setSubmittingModal] =
    useState<EmployeeModalType | null>(null);
  const [credentials, setCredentials] = useState<{
    login?: string;
    password?: string;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(nextUsersPagination = usersPagination) {
    const [nextUsers, nextDepartments] = await Promise.all([
      listUsersPageRequest(nextUsersPagination),
      listDepartmentsRequest(),
    ]);
    setUsersPage(nextUsers);
    setUsersPagination({
      page: nextUsers.meta.page,
      perPage: nextUsers.meta.perPage,
    });
    setDepartments(nextDepartments);
  }

  async function loadUsersPage(nextUsersPagination: PaginationQuery) {
    const nextUsers = await listUsersPageRequest(nextUsersPagination);
    setUsersPage(nextUsers);
    setUsersPagination({
      page: nextUsers.meta.page,
      perPage: nextUsers.meta.perPage,
    });
  }

  useEffect(() => {
    void load().catch(async (requestError) =>
      setError(await readApiError(requestError)),
    );
  }, []);

  function isModalOpen(type: EmployeeModalType) {
    return modal?.type === type;
  }

  function isModalSubmitting(type: EmployeeModalType) {
    return submittingModal === type;
  }

  function closeModal() {
    setModal(null);
  }

  function handleModalOpenChange(isOpen: boolean) {
    if (!isOpen) {
      closeModal();
    }
  }

  function openEditUserModal(user: OrganizationUser) {
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName ?? '',
      password: '',
      role: getEditableRole(user),
      departmentIds: getUserDepartmentIds(user),
    });
    setModal({ type: 'editUser', user });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setCredentials(null);

    try {
      const userPassword = form.password;
      const response = await createUserRequest(form);
      setCredentials({
        login: response.credentials.login,
        password: userPassword,
      });
      setForm(getEmptyUserForm());
      await load();
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  async function updateUser(event: FormEvent) {
    event.preventDefault();

    if (modal?.type !== 'editUser') {
      return;
    }

    setError(null);
    setMessage(null);
    setCredentials(null);
    setSubmittingModal('editUser');

    try {
      await updateUserRequest(modal.user.id, getUserUpdatePayload(editForm));
      await load();
      setMessage('Пользователь обновлен');
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    } finally {
      setSubmittingModal((current) =>
        current === 'editUser' ? null : current,
      );
    }
  }

  async function archiveUser() {
    if (modal?.type !== 'archiveUser') {
      return;
    }

    setError(null);
    setMessage(null);
    setCredentials(null);
    setSubmittingModal('archiveUser');

    try {
      await archiveUserRequest(modal.user.id);
      await load();
      setMessage('Пользователь отправлен в архив');
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    } finally {
      setSubmittingModal((current) =>
        current === 'archiveUser' ? null : current,
      );
    }
  }

  async function handleUsersPageChange(page: number) {
    setError(null);

    try {
      await loadUsersPage({ ...usersPagination, page });
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  const departmentOptions = departments.map((department) => ({
    value: department.id,
    label: department.name,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold text-slate-950">Сотрудники</h1>
        <Button variant="secondary" onClick={() => void load()}>
          <RefreshCcw size={16} />
          Обновить
        </Button>
      </div>

      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="danger">{error}</Notice>}

      <Panel title="Создать аккаунт">
        <form
          className="grid items-end gap-3 md:grid-cols-2"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <TextField
            label="Фамилия"
            value={form.lastName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, lastName: event.target.value }))
            }
          />
          <TextField
            label="Имя"
            value={form.firstName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, firstName: event.target.value }))
            }
          />
          <TextField
            label="Отчество"
            value={form.middleName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, middleName: event.target.value }))
            }
          />
          <SelectField
            label="Роль"
            options={creatableRoleOptions}
            value={form.role}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                role: value as Exclude<UserRole, 'ADMIN'>,
              }))
            }
          />
          <MultiSelectField
            label="Департаменты"
            options={departmentOptions}
            value={form.departmentIds}
            onChange={(departmentIds) =>
              setForm((prev) => ({
                ...prev,
                departmentIds,
              }))
            }
          />
          <UserPasswordField
            required
            className="md:col-span-2"
            label="Пароль"
            value={form.password}
            onChange={(password) => setForm((prev) => ({ ...prev, password }))}
            onGenerate={() =>
              setForm((prev) => ({
                ...prev,
                password: generateUserPassword(),
              }))
            }
          />
          <Button type="submit" variant="primary">
            <Plus size={16} />
            Создать
          </Button>
        </form>
        {credentials && (
          <Notice tone="success" className="mt-4">
            {[
              credentials.login ? `Логин: ${credentials.login}.` : '',
              credentials.password ? `Пароль: ${credentials.password}` : '',
            ]
              .filter(Boolean)
              .join(' ')}
          </Notice>
        )}
      </Panel>

      <Panel title="Аккаунты">
        <DataTable
          ariaLabel="Аккаунты"
          columns={[
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
                user.departments
                  .map(({ department }) => department.name)
                  .join(', ') || '—',
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
                    onClick={() => openEditUserModal(user)}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    isIconOnly
                    aria-label="Архивировать пользователя"
                    size="sm"
                    variant="danger-soft"
                    onClick={() => setModal({ type: 'archiveUser', user })}
                  >
                    <Archive size={14} />
                  </Button>
                </div>
              ),
            },
          ]}
          getRowKey={(user) => user.id}
          pagination={{
            meta: usersPage.meta,
            onPageChange: (page) => void handleUsersPageChange(page),
          }}
          rows={usersPage.items}
        />
      </Panel>

      <ActionModal
        isOpen={isModalOpen('editUser')}
        title="Редактировать пользователя"
        size="lg"
        onOpenChange={handleModalOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Отмена
            </Button>
            <Button
              form="edit-user-form"
              type="submit"
              isDisabled={isModalSubmitting('editUser')}
              variant="primary"
            >
              {isModalSubmitting('editUser') ? (
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
          id="edit-user-form"
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => void updateUser(event)}
        >
          <TextField
            required
            label="Фамилия"
            value={editForm.lastName}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                lastName: event.target.value,
              }))
            }
          />
          <TextField
            required
            label="Имя"
            value={editForm.firstName}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                firstName: event.target.value,
              }))
            }
          />
          <TextField
            label="Отчество"
            value={editForm.middleName}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                middleName: event.target.value,
              }))
            }
          />
          <SelectField
            label="Роль"
            options={creatableRoleOptions}
            value={editForm.role}
            onChange={(value) =>
              setEditForm((prev) => ({
                ...prev,
                role: value as Exclude<UserRole, 'ADMIN'>,
              }))
            }
          />
          <MultiSelectField
            className="sm:col-span-2"
            label="Департаменты"
            options={departmentOptions}
            value={editForm.departmentIds}
            onChange={(departmentIds) =>
              setEditForm((prev) => ({ ...prev, departmentIds }))
            }
          />
          <UserPasswordField
            className="sm:col-span-2"
            label="Новый пароль"
            value={editForm.password}
            onChange={(password) =>
              setEditForm((prev) => ({ ...prev, password }))
            }
            onGenerate={() =>
              setEditForm((prev) => ({
                ...prev,
                password: generateUserPassword(),
              }))
            }
          />
        </form>
      </ActionModal>

      <ActionModal
        isOpen={isModalOpen('archiveUser')}
        title="Архивировать пользователя"
        size="sm"
        onOpenChange={handleModalOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Отмена
            </Button>
            <Button
              type="button"
              isDisabled={isModalSubmitting('archiveUser')}
              variant="danger"
              onClick={() => void archiveUser()}
            >
              {isModalSubmitting('archiveUser') ? (
                <ButtonSpinner />
              ) : (
                <Archive size={16} />
              )}
              Архивировать
            </Button>
          </>
        }
      >
        {modal?.type === 'archiveUser' && (
          <p className="text-sm text-slate-600">
            Пользователь {formatPersonName(modal.user)} будет скрыт из активного
            списка.
          </p>
        )}
      </ActionModal>
    </div>
  );
}
