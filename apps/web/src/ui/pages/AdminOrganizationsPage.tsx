import { Button } from '@heroui/react';
import {
  Archive,
  Building2,
  KeyRound,
  Pencil,
  Plus,
  RefreshCcw,
  ShieldPlus,
  UserPlus,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import { Department, Organization, OrganizationUser, UserRole } from 'api/generated/api.types';
import {
  archiveAdminOrganizationDepartmentRequest,
  archiveAdminOrganizationUserRequest,
  archiveOrganizationRequest,
  createAdminOrganizationDepartmentRequest,
  createAdminOrganizationUserRequest,
  createAdminRequest,
  createOrganizationRequest,
  listAdminOrganizationDepartmentsRequest,
  listAdminOrganizationUsersRequest,
  listOrganizationsRequest,
  resetAdminOrganizationUserPasswordRequest,
  updateAdminOrganizationUserRequest,
} from 'api/organization.api';
import { readApiError } from 'api/http/client';
import { formatPersonName } from 'services/domains/shifts/shiftFormat';
import { ActionModal } from 'ui/components/ActionModal';
import { DataTable } from 'ui/components/DataTable';
import { MultiSelectField } from 'ui/components/MultiSelectField';
import { Notice } from 'ui/components/Notice';
import { Panel } from 'ui/components/Panel';
import { SelectField } from 'ui/components/SelectField';
import { StatusPill } from 'ui/components/StatusPill';
import { TextField } from 'ui/components/TextField';

type OrganizationUserForm = {
  lastName: string;
  firstName: string;
  middleName: string;
  role: Exclude<UserRole, 'ADMIN'>;
  departmentIds: string[];
};

type AdminModalState =
  | { type: 'createOrganization' }
  | { type: 'createAdmin' }
  | { type: 'createUser' }
  | { type: 'createDepartment' }
  | { type: 'editUser'; user: OrganizationUser }
  | { type: 'resetPassword'; user: OrganizationUser }
  | { type: 'archiveUser'; user: OrganizationUser }
  | { type: 'archiveDepartment'; department: Department }
  | { type: 'archiveOrganization'; organization: Organization }
  | null;

type AdminModalType = NonNullable<AdminModalState>['type'];

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Админ',
  ORG_MANAGER: 'Менеджер',
  EMPLOYEE: 'Сотрудник',
};

const creatableUserRoleOptions = [
  { value: 'ORG_MANAGER', label: 'Менеджер' },
  { value: 'EMPLOYEE', label: 'Сотрудник' },
];

const emptyAdminForm = { lastName: '', firstName: '', middleName: '' };

function getEmptyUserForm(): OrganizationUserForm {
  return {
    lastName: '',
    firstName: '',
    middleName: '',
    role: 'ORG_MANAGER',
    departmentIds: [],
  };
}

function getUserDepartmentIds(user: OrganizationUser) {
  return user.departments.map(({ department }) => department.id);
}

function getEditableRole(user: OrganizationUser): Exclude<UserRole, 'ADMIN'> {
  return user.role === 'EMPLOYEE' ? 'EMPLOYEE' : 'ORG_MANAGER';
}

export function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(
    null,
  );
  const [organizationUsers, setOrganizationUsers] = useState<OrganizationUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [organizationName, setOrganizationName] = useState('');
  const [admin, setAdmin] = useState(emptyAdminForm);
  const [departmentName, setDepartmentName] = useState('');
  const [userForm, setUserForm] = useState(getEmptyUserForm);
  const [editUserForm, setEditUserForm] = useState(getEmptyUserForm);
  const [modal, setModal] = useState<AdminModalState>(null);
  const [credentials, setCredentials] = useState<{
    login?: string;
    temporaryPassword?: string;
  } | null>(null);
  const [passwordResetResult, setPasswordResetResult] = useState<{
    login?: string;
    temporaryPassword: string;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const nextOrganizations = await listOrganizationsRequest();

    setOrganizations(nextOrganizations);
    setSelectedOrganizationId((currentId) => {
      if (currentId && nextOrganizations.some(({ id }) => id === currentId)) {
        return currentId;
      }

      return nextOrganizations[0]?.id ?? null;
    });
  }

  async function loadOrganizationDetails(organizationId: string) {
    const [nextUsers, nextDepartments] = await Promise.all([
      listAdminOrganizationUsersRequest(organizationId),
      listAdminOrganizationDepartmentsRequest(organizationId),
    ]);

    setOrganizationUsers(nextUsers);
    setDepartments(nextDepartments);
  }

  useEffect(() => {
    void load().catch(async (requestError) =>
      setError(await readApiError(requestError)),
    );
  }, []);

  useEffect(() => {
    if (!selectedOrganizationId) {
      setOrganizationUsers([]);
      setDepartments([]);
      return;
    }

    void loadOrganizationDetails(selectedOrganizationId).catch(async (requestError) =>
      setError(await readApiError(requestError)),
    );
  }, [selectedOrganizationId]);

  function isModalOpen(type: AdminModalType) {
    return modal?.type === type;
  }

  function closeModal() {
    setModal(null);
  }

  function handleModalOpenChange(isOpen: boolean) {
    if (!isOpen) {
      closeModal();
    }
  }

  function openCreateUserModal() {
    setCredentials(null);
    setUserForm(getEmptyUserForm());
    setModal({ type: 'createUser' });
  }

  function openEditUserModal(user: OrganizationUser) {
    setEditUserForm({
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName ?? '',
      role: getEditableRole(user),
      departmentIds: getUserDepartmentIds(user),
    });
    setModal({ type: 'editUser', user });
  }

  function openResetPasswordModal(user: OrganizationUser) {
    setPasswordResetResult(null);
    setModal({ type: 'resetPassword', user });
  }

  async function createOrganization(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setCredentials(null);

    try {
      const created = await createOrganizationRequest({ name: organizationName });
      setOrganizationName('');
      await load();
      setSelectedOrganizationId(created.id);
      setMessage(`Организация «${created.name}» создана`);
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  async function createAdmin(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setCredentials(null);

    try {
      const response = (await createAdminRequest(admin)) as {
        credentials?: { login: string; temporaryPassword: string };
      };
      setAdmin(emptyAdminForm);
      setMessage(
        response.credentials
          ? `Логин: ${response.credentials.login}. Пароль: ${response.credentials.temporaryPassword}`
          : 'Админ создан',
      );
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  async function createDepartment(event: FormEvent) {
    event.preventDefault();

    if (!selectedOrganizationId) {
      return;
    }

    setError(null);
    setMessage(null);
    setCredentials(null);

    try {
      await createAdminOrganizationDepartmentRequest(
        selectedOrganizationId,
        departmentName,
      );
      setDepartmentName('');
      await loadOrganizationDetails(selectedOrganizationId);
      await load();
      setMessage('Департамент создан');
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  async function createOrganizationUser(event: FormEvent) {
    event.preventDefault();

    if (!selectedOrganizationId) {
      return;
    }

    setError(null);
    setMessage(null);
    setCredentials(null);

    try {
      const response = await createAdminOrganizationUserRequest(
        selectedOrganizationId,
        userForm,
      );

      setCredentials(response.credentials);
      setUserForm(getEmptyUserForm());
      await loadOrganizationDetails(selectedOrganizationId);
      await load();
      setMessage('Пользователь создан');
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  async function updateOrganizationUser(event: FormEvent) {
    event.preventDefault();

    if (!selectedOrganizationId || modal?.type !== 'editUser') {
      return;
    }

    setError(null);
    setMessage(null);
    setCredentials(null);

    try {
      await updateAdminOrganizationUserRequest(
        selectedOrganizationId,
        modal.user.id,
        editUserForm,
      );
      await loadOrganizationDetails(selectedOrganizationId);
      await load();
      setMessage('Пользователь обновлен');
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  async function resetUserPassword() {
    if (!selectedOrganizationId || modal?.type !== 'resetPassword') {
      return;
    }

    setError(null);
    setPasswordResetResult(null);
    setCredentials(null);

    try {
      const response = await resetAdminOrganizationUserPasswordRequest(
        selectedOrganizationId,
        modal.user.id,
      );
      setPasswordResetResult({
        login: modal.user.password?.login ?? undefined,
        temporaryPassword: response.temporaryPassword,
      });
      await loadOrganizationDetails(selectedOrganizationId);
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  async function archiveUser() {
    if (!selectedOrganizationId || modal?.type !== 'archiveUser') {
      return;
    }

    setError(null);
    setMessage(null);
    setCredentials(null);

    try {
      await archiveAdminOrganizationUserRequest(selectedOrganizationId, modal.user.id);
      await loadOrganizationDetails(selectedOrganizationId);
      await load();
      setMessage('Пользователь отправлен в архив');
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  async function archiveDepartment() {
    if (!selectedOrganizationId || modal?.type !== 'archiveDepartment') {
      return;
    }

    setError(null);
    setMessage(null);
    setCredentials(null);

    try {
      await archiveAdminOrganizationDepartmentRequest(
        selectedOrganizationId,
        modal.department.id,
      );
      await loadOrganizationDetails(selectedOrganizationId);
      await load();
      setMessage('Департамент отправлен в архив');
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  async function archiveOrganization() {
    if (modal?.type !== 'archiveOrganization') {
      return;
    }

    setError(null);
    setMessage(null);
    setCredentials(null);

    try {
      await archiveOrganizationRequest(modal.organization.id);
      await load();
      setMessage('Организация отправлена в архив');
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  const selectedOrganization = organizations.find(
    ({ id }) => id === selectedOrganizationId,
  );
  const departmentOptions = departments.map((department) => ({
    value: department.id,
    label: department.name,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold text-slate-950">Организации</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => setModal({ type: 'createOrganization' })}>
            <Plus size={16} />
            Организация
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setAdmin(emptyAdminForm);
              setModal({ type: 'createAdmin' });
            }}
          >
            <ShieldPlus size={16} />
            Админ
          </Button>
        </div>
      </div>

      {message && (
        <Notice tone="success">
          {message}
        </Notice>
      )}
      {credentials && (
        <Notice tone="success">
          {[
            credentials.login ? `Логин: ${credentials.login}.` : '',
            credentials.temporaryPassword
              ? `Пароль: ${credentials.temporaryPassword}`
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
        </Notice>
      )}
      {error && (
        <Notice tone="danger">
          {error}
        </Notice>
      )}

      <Panel title="Управление организацией">
        <div className="mb-5 grid items-end gap-3 md:grid-cols-[1fr_auto]">
          <SelectField
            label="Организация"
            options={organizations.map((organization) => ({
              value: organization.id,
              label: organization.name,
            }))}
            value={selectedOrganizationId ?? ''}
            onChange={(value) => setSelectedOrganizationId(value || null)}
          />
          <Button variant="secondary" onClick={() => void load()}>
            <RefreshCcw size={16} />
            Обновить
          </Button>
        </div>

        {!selectedOrganization ? (
          <p className="text-sm text-slate-500">
            Создайте организацию, чтобы добавить менеджера.
          </p>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-950">
                  Пользователи: {selectedOrganization.name}
                </h2>
                <Button variant="primary" onClick={openCreateUserModal}>
                  <UserPlus size={16} />
                  Добавить
                </Button>
              </div>
              <DataTable
                ariaLabel="Пользователи организации"
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
                          aria-label="Сменить пароль"
                          size="sm"
                          variant="secondary"
                          onClick={() => openResetPasswordModal(user)}
                        >
                          <KeyRound size={14} />
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
                rows={organizationUsers}
              />
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-950">
                  Департаменты
                </h2>
                <Button
                  variant="primary"
                  onClick={() => setModal({ type: 'createDepartment' })}
                >
                  <Plus size={16} />
                  Добавить
                </Button>
              </div>
              <DataTable
                ariaLabel="Департаменты организации"
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
                      <Button
                        isIconOnly
                        aria-label="Архивировать департамент"
                        size="sm"
                        variant="danger-soft"
                        onClick={() =>
                          setModal({ type: 'archiveDepartment', department })
                        }
                      >
                        <Archive size={14} />
                      </Button>
                    ),
                  },
                ]}
                getRowKey={(department) => department.id}
                rows={departments}
              />
            </div>
          </div>
        )}
      </Panel>

      <Panel title="Список организаций">
        <DataTable
          ariaLabel="Список организаций"
          columns={[
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
                    onClick={() => setSelectedOrganizationId(organization.id)}
                  >
                    <Building2 size={14} />
                    Открыть
                  </Button>
                  <Button
                    isIconOnly
                    aria-label="Архивировать организацию"
                    size="sm"
                    variant="danger-soft"
                    onClick={() =>
                      setModal({ type: 'archiveOrganization', organization })
                    }
                  >
                    <Archive size={14} />
                  </Button>
                </div>
              ),
            },
          ]}
          getRowClassName={(organization) =>
            organization.id === selectedOrganizationId ? 'bg-teal-50/50' : ''
          }
          getRowKey={(organization) => organization.id}
          rows={organizations}
        />
      </Panel>

      <ActionModal
        isOpen={isModalOpen('createOrganization')}
        title="Создать организацию"
        size="sm"
        onOpenChange={handleModalOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Отмена
            </Button>
            <Button form="create-organization-form" type="submit" variant="primary">
              <Plus size={16} />
              Создать
            </Button>
          </>
        }
      >
        <form
          id="create-organization-form"
          className="space-y-4"
          onSubmit={(event) => void createOrganization(event)}
        >
          <TextField
            required
            label="Название"
            value={organizationName}
            onChange={(event) => setOrganizationName(event.target.value)}
          />
        </form>
      </ActionModal>

      <ActionModal
        isOpen={isModalOpen('createAdmin')}
        title="Создать админа"
        onOpenChange={handleModalOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Отмена
            </Button>
            <Button form="create-admin-form" type="submit" variant="primary">
              <ShieldPlus size={16} />
              Создать
            </Button>
          </>
        }
      >
        <form
          id="create-admin-form"
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => void createAdmin(event)}
        >
          <TextField
            required
            label="Фамилия"
            value={admin.lastName}
            onChange={(event) =>
              setAdmin((prev) => ({ ...prev, lastName: event.target.value }))
            }
          />
          <TextField
            required
            label="Имя"
            value={admin.firstName}
            onChange={(event) =>
              setAdmin((prev) => ({ ...prev, firstName: event.target.value }))
            }
          />
          <TextField
            className="sm:col-span-2"
            label="Отчество"
            value={admin.middleName}
            onChange={(event) =>
              setAdmin((prev) => ({ ...prev, middleName: event.target.value }))
            }
          />
        </form>
      </ActionModal>

      <ActionModal
        isOpen={isModalOpen('createUser')}
        title="Добавить пользователя"
        size="lg"
        onOpenChange={handleModalOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Отмена
            </Button>
            <Button form="create-user-form" type="submit" variant="primary">
              <UserPlus size={16} />
              Создать
            </Button>
          </>
        }
      >
        <form
          id="create-user-form"
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => void createOrganizationUser(event)}
        >
          <TextField
            required
            label="Фамилия"
            value={userForm.lastName}
            onChange={(event) =>
              setUserForm((prev) => ({ ...prev, lastName: event.target.value }))
            }
          />
          <TextField
            required
            label="Имя"
            value={userForm.firstName}
            onChange={(event) =>
              setUserForm((prev) => ({ ...prev, firstName: event.target.value }))
            }
          />
          <TextField
            label="Отчество"
            value={userForm.middleName}
            onChange={(event) =>
              setUserForm((prev) => ({ ...prev, middleName: event.target.value }))
            }
          />
          <SelectField
            label="Роль"
            options={creatableUserRoleOptions}
            value={userForm.role}
            onChange={(value) =>
              setUserForm((prev) => ({
                ...prev,
                role: value as Exclude<UserRole, 'ADMIN'>,
              }))
            }
          />
          <MultiSelectField
            className="sm:col-span-2"
            label="Департаменты"
            options={departmentOptions}
            value={userForm.departmentIds}
            onChange={(departmentIds) =>
              setUserForm((prev) => ({ ...prev, departmentIds }))
            }
          />
        </form>
      </ActionModal>

      <ActionModal
        isOpen={isModalOpen('createDepartment')}
        title="Добавить департамент"
        size="sm"
        onOpenChange={handleModalOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Отмена
            </Button>
            <Button form="create-department-form" type="submit" variant="primary">
              <Plus size={16} />
              Добавить
            </Button>
          </>
        }
      >
        <form
          id="create-department-form"
          className="space-y-4"
          onSubmit={(event) => void createDepartment(event)}
        >
          <TextField
            required
            label="Название департамента"
            value={departmentName}
            onChange={(event) => setDepartmentName(event.target.value)}
          />
        </form>
      </ActionModal>

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
            <Button form="edit-user-form" type="submit" variant="primary">
              <Pencil size={16} />
              Сохранить
            </Button>
          </>
        }
      >
        <form
          id="edit-user-form"
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => void updateOrganizationUser(event)}
        >
          <TextField
            required
            label="Фамилия"
            value={editUserForm.lastName}
            onChange={(event) =>
              setEditUserForm((prev) => ({
                ...prev,
                lastName: event.target.value,
              }))
            }
          />
          <TextField
            required
            label="Имя"
            value={editUserForm.firstName}
            onChange={(event) =>
              setEditUserForm((prev) => ({
                ...prev,
                firstName: event.target.value,
              }))
            }
          />
          <TextField
            label="Отчество"
            value={editUserForm.middleName}
            onChange={(event) =>
              setEditUserForm((prev) => ({
                ...prev,
                middleName: event.target.value,
              }))
            }
          />
          <SelectField
            label="Роль"
            options={creatableUserRoleOptions}
            value={editUserForm.role}
            onChange={(value) =>
              setEditUserForm((prev) => ({
                ...prev,
                role: value as Exclude<UserRole, 'ADMIN'>,
              }))
            }
          />
          <MultiSelectField
            className="sm:col-span-2"
            label="Департаменты"
            options={departmentOptions}
            value={editUserForm.departmentIds}
            onChange={(departmentIds) =>
              setEditUserForm((prev) => ({ ...prev, departmentIds }))
            }
          />
        </form>
      </ActionModal>

      <ActionModal
        isOpen={isModalOpen('resetPassword')}
        title="Сменить пароль"
        size="sm"
        onOpenChange={handleModalOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Закрыть
            </Button>
            <Button type="button" variant="primary" onClick={() => void resetUserPassword()}>
              <KeyRound size={16} />
              Сгенерировать
            </Button>
          </>
        }
      >
        {modal?.type === 'resetPassword' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Будет создан временный пароль для {formatPersonName(modal.user)}.
            </p>
            {passwordResetResult && (
              <Notice tone="success">
                {[
                  passwordResetResult.login
                    ? `Логин: ${passwordResetResult.login}.`
                    : '',
                  `Пароль: ${passwordResetResult.temporaryPassword}`,
                ]
                  .filter(Boolean)
                  .join(' ')}
              </Notice>
            )}
          </div>
        )}
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
            <Button type="button" variant="danger" onClick={() => void archiveUser()}>
              <Archive size={16} />
              Архивировать
            </Button>
          </>
        }
      >
        {modal?.type === 'archiveUser' && (
          <p className="text-sm text-slate-600">
            Пользователь {formatPersonName(modal.user)} будет скрыт из активного списка.
          </p>
        )}
      </ActionModal>

      <ActionModal
        isOpen={isModalOpen('archiveDepartment')}
        title="Архивировать департамент"
        size="sm"
        onOpenChange={handleModalOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Отмена
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => void archiveDepartment()}
            >
              <Archive size={16} />
              Архивировать
            </Button>
          </>
        }
      >
        {modal?.type === 'archiveDepartment' && (
          <p className="text-sm text-slate-600">
            Департамент «{modal.department.name}» будет отправлен в архив.
          </p>
        )}
      </ActionModal>

      <ActionModal
        isOpen={isModalOpen('archiveOrganization')}
        title="Архивировать организацию"
        size="sm"
        onOpenChange={handleModalOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Отмена
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => void archiveOrganization()}
            >
              <Archive size={16} />
              Архивировать
            </Button>
          </>
        }
      >
        {modal?.type === 'archiveOrganization' && (
          <p className="text-sm text-slate-600">
            Организация «{modal.organization.name}» будет отправлена в архив.
          </p>
        )}
      </ActionModal>
    </div>
  );
}
