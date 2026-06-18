import { Button } from '@heroui/react';
import {
  ArrowLeft,
  Archive,
  Building2,
  Pencil,
  Plus,
  RefreshCcw,
  ShieldPlus,
  UserPlus,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Department,
  Organization,
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
  archiveAdminOrganizationDepartmentRequest,
  archiveAdminOrganizationUserRequest,
  archiveOrganizationRequest,
  createAdminOrganizationDepartmentRequest,
  createAdminOrganizationUserRequest,
  createAdminRequest,
  createOrganizationRequest,
  getAdminOrganizationRequest,
  listAdminOrganizationDepartmentsRequest,
  listAdminOrganizationDepartmentsPageRequest,
  listAdminOrganizationUsersPageRequest,
  listOrganizationsPageRequest,
  updateAdminOrganizationDepartmentRequest,
  updateAdminOrganizationUserRequest,
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

type OrganizationUserForm = {
  lastName: string;
  firstName: string;
  middleName: string;
  password: string;
  role: Exclude<UserRole, 'ADMIN'>;
  departmentIds: string[];
};

type AdminModalState =
  | { type: 'createOrganization' }
  | { type: 'createAdmin' }
  | { type: 'createUser' }
  | { type: 'createDepartment' }
  | { type: 'editDepartment'; department: Department }
  | { type: 'editUser'; user: OrganizationUser }
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

const emptyAdminForm = {
  lastName: '',
  firstName: '',
  middleName: '',
  password: '',
};

function getEmptyUserForm(): OrganizationUserForm {
  return {
    lastName: '',
    firstName: '',
    middleName: '',
    password: '',
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

function getUserUpdatePayload(form: OrganizationUserForm) {
  const { password, ...payload } = form;

  return password ? { ...payload, password } : payload;
}

function getOrganizationProfilePath(organizationId: string) {
  return `/admin/organizations/${organizationId}`;
}

export function AdminOrganizationsPage() {
  const navigate = useNavigate();
  const { organizationId: profileOrganizationId } = useParams<{
    organizationId: string;
  }>();
  const [organizationsPage, setOrganizationsPage] = useState(() =>
    getEmptyPaginatedResponse<Organization>(),
  );
  const [organizationsPagination, setOrganizationsPagination] =
    useState<PaginationQuery>({
      page: DEFAULT_PAGE,
      perPage: DEFAULT_PER_PAGE,
    });
  const [profileOrganization, setProfileOrganization] =
    useState<Organization | null>(null);
  const [organizationUsersPage, setOrganizationUsersPage] = useState(() =>
    getEmptyPaginatedResponse<OrganizationUser>(),
  );
  const [organizationUsersPagination, setOrganizationUsersPagination] =
    useState<PaginationQuery>({
      page: DEFAULT_PAGE,
      perPage: DEFAULT_PER_PAGE,
    });
  const [departmentsPage, setDepartmentsPage] = useState(() =>
    getEmptyPaginatedResponse<Department>(),
  );
  const [departmentsPagination, setDepartmentsPagination] =
    useState<PaginationQuery>({
      page: DEFAULT_PAGE,
      perPage: DEFAULT_PER_PAGE,
    });
  const [departmentOptionsList, setDepartmentOptionsList] = useState<
    Department[]
  >([]);
  const [organizationName, setOrganizationName] = useState('');
  const [admin, setAdmin] = useState(emptyAdminForm);
  const [departmentName, setDepartmentName] = useState('');
  const [editDepartmentName, setEditDepartmentName] = useState('');
  const [userForm, setUserForm] = useState(getEmptyUserForm);
  const [editUserForm, setEditUserForm] = useState(getEmptyUserForm);
  const [modal, setModal] = useState<AdminModalState>(null);
  const [submittingModal, setSubmittingModal] = useState<AdminModalType | null>(
    null,
  );
  const [credentials, setCredentials] = useState<{
    login?: string;
    password?: string;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(nextOrganizationsPagination = organizationsPagination) {
    const nextOrganizations = await listOrganizationsPageRequest(
      nextOrganizationsPagination,
    );

    setOrganizationsPage(nextOrganizations);
    setOrganizationsPagination({
      page: nextOrganizations.meta.page,
      perPage: nextOrganizations.meta.perPage,
    });
  }

  async function loadOrganizationDetails(
    organizationId: string,
    nextUsersPagination = organizationUsersPagination,
    nextDepartmentsPagination = departmentsPagination,
  ) {
    const [
      nextOrganization,
      nextUsers,
      nextDepartments,
      nextDepartmentOptions,
    ] = await Promise.all([
      getAdminOrganizationRequest(organizationId),
      listAdminOrganizationUsersPageRequest(organizationId, nextUsersPagination),
      listAdminOrganizationDepartmentsPageRequest(
        organizationId,
        nextDepartmentsPagination,
      ),
      listAdminOrganizationDepartmentsRequest(organizationId),
    ]);

    setProfileOrganization(nextOrganization);
    setOrganizationUsersPage(nextUsers);
    setOrganizationUsersPagination({
      page: nextUsers.meta.page,
      perPage: nextUsers.meta.perPage,
    });
    setDepartmentsPage(nextDepartments);
    setDepartmentsPagination({
      page: nextDepartments.meta.page,
      perPage: nextDepartments.meta.perPage,
    });
    setDepartmentOptionsList(nextDepartmentOptions);
  }

  async function loadOrganizationUsersPage(
    organizationId: string,
    nextUsersPagination: PaginationQuery,
  ) {
    const nextUsers = await listAdminOrganizationUsersPageRequest(
      organizationId,
      nextUsersPagination,
    );
    setOrganizationUsersPage(nextUsers);
    setOrganizationUsersPagination({
      page: nextUsers.meta.page,
      perPage: nextUsers.meta.perPage,
    });
  }

  async function loadDepartmentsPage(
    organizationId: string,
    nextDepartmentsPagination: PaginationQuery,
  ) {
    const nextDepartments = await listAdminOrganizationDepartmentsPageRequest(
      organizationId,
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

  useEffect(() => {
    if (!profileOrganizationId) {
      setProfileOrganization(null);
      setOrganizationUsersPage(getEmptyPaginatedResponse<OrganizationUser>());
      setOrganizationUsersPagination({
        page: DEFAULT_PAGE,
        perPage: DEFAULT_PER_PAGE,
      });
      setDepartmentsPage(getEmptyPaginatedResponse<Department>());
      setDepartmentsPagination({
        page: DEFAULT_PAGE,
        perPage: DEFAULT_PER_PAGE,
      });
      setDepartmentOptionsList([]);
      return;
    }

    void loadOrganizationDetails(
      profileOrganizationId,
      { page: DEFAULT_PAGE, perPage: DEFAULT_PER_PAGE },
      { page: DEFAULT_PAGE, perPage: DEFAULT_PER_PAGE },
    ).catch(async (requestError) =>
      setError(await readApiError(requestError)),
    );
  }, [profileOrganizationId]);

  async function refreshCurrentView() {
    setError(null);

    try {
      await Promise.all([
        load(),
        profileOrganizationId
          ? loadOrganizationDetails(profileOrganizationId)
          : Promise.resolve(),
      ]);
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  function isModalOpen(type: AdminModalType) {
    return modal?.type === type;
  }

  function isModalSubmitting(type: AdminModalType) {
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
      password: '',
      role: getEditableRole(user),
      departmentIds: getUserDepartmentIds(user),
    });
    setModal({ type: 'editUser', user });
  }

  function openEditDepartmentModal(department: Department) {
    setEditDepartmentName(department.name);
    setModal({ type: 'editDepartment', department });
  }

  async function createOrganization(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setCredentials(null);
    setSubmittingModal('createOrganization');

    try {
      const created = await createOrganizationRequest({
        name: organizationName,
      });
      setOrganizationName('');
      await load();
      navigate(getOrganizationProfilePath(created.id));
      setMessage(`Организация «${created.name}» создана`);
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    } finally {
      setSubmittingModal((current) =>
        current === 'createOrganization' ? null : current,
      );
    }
  }

  async function createAdmin(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setCredentials(null);
    setSubmittingModal('createAdmin');

    try {
      const adminPassword = admin.password;
      const response = await createAdminRequest(admin);
      setAdmin(emptyAdminForm);
      setMessage(
        `Логин: ${response.credentials.login}. Пароль: ${adminPassword}`,
      );
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    } finally {
      setSubmittingModal((current) =>
        current === 'createAdmin' ? null : current,
      );
    }
  }

  async function createDepartment(event: FormEvent) {
    event.preventDefault();

    if (!profileOrganizationId) {
      return;
    }

    setError(null);
    setMessage(null);
    setCredentials(null);
    setSubmittingModal('createDepartment');

    try {
      await createAdminOrganizationDepartmentRequest(
        profileOrganizationId,
        departmentName,
      );
      setDepartmentName('');
      await loadOrganizationDetails(profileOrganizationId);
      await load();
      setMessage('Департамент создан');
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    } finally {
      setSubmittingModal((current) =>
        current === 'createDepartment' ? null : current,
      );
    }
  }

  async function updateDepartment(event: FormEvent) {
    event.preventDefault();

    if (!profileOrganizationId || modal?.type !== 'editDepartment') {
      return;
    }

    setError(null);
    setMessage(null);
    setCredentials(null);
    setSubmittingModal('editDepartment');

    try {
      await updateAdminOrganizationDepartmentRequest(
        profileOrganizationId,
        modal.department.id,
        editDepartmentName,
      );
      setEditDepartmentName('');
      await loadOrganizationDetails(profileOrganizationId);
      await load();
      setMessage('Департамент обновлен');
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    } finally {
      setSubmittingModal((current) =>
        current === 'editDepartment' ? null : current,
      );
    }
  }

  async function createOrganizationUser(event: FormEvent) {
    event.preventDefault();

    if (!profileOrganizationId) {
      return;
    }

    setError(null);
    setMessage(null);
    setCredentials(null);
    setSubmittingModal('createUser');

    try {
      const userPassword = userForm.password;
      const response = await createAdminOrganizationUserRequest(
        profileOrganizationId,
        userForm,
      );

      setCredentials({
        login: response.credentials.login,
        password: userPassword,
      });
      setUserForm(getEmptyUserForm());
      await loadOrganizationDetails(profileOrganizationId);
      await load();
      setMessage('Пользователь создан');
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    } finally {
      setSubmittingModal((current) =>
        current === 'createUser' ? null : current,
      );
    }
  }

  async function updateOrganizationUser(event: FormEvent) {
    event.preventDefault();

    if (!profileOrganizationId || modal?.type !== 'editUser') {
      return;
    }

    setError(null);
    setMessage(null);
    setCredentials(null);
    setSubmittingModal('editUser');

    try {
      await updateAdminOrganizationUserRequest(
        profileOrganizationId,
        modal.user.id,
        getUserUpdatePayload(editUserForm),
      );
      await loadOrganizationDetails(profileOrganizationId);
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
    if (!profileOrganizationId || modal?.type !== 'archiveUser') {
      return;
    }

    setError(null);
    setMessage(null);
    setCredentials(null);
    setSubmittingModal('archiveUser');

    try {
      await archiveAdminOrganizationUserRequest(
        profileOrganizationId,
        modal.user.id,
      );
      await loadOrganizationDetails(profileOrganizationId);
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

  async function archiveDepartment() {
    if (!profileOrganizationId || modal?.type !== 'archiveDepartment') {
      return;
    }

    setError(null);
    setMessage(null);
    setCredentials(null);
    setSubmittingModal('archiveDepartment');

    try {
      await archiveAdminOrganizationDepartmentRequest(
        profileOrganizationId,
        modal.department.id,
      );
      await loadOrganizationDetails(profileOrganizationId);
      await load();
      setMessage('Департамент отправлен в архив');
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    } finally {
      setSubmittingModal((current) =>
        current === 'archiveDepartment' ? null : current,
      );
    }
  }

  async function archiveOrganization() {
    if (modal?.type !== 'archiveOrganization') {
      return;
    }

    setError(null);
    setMessage(null);
    setCredentials(null);
    setSubmittingModal('archiveOrganization');

    try {
      await archiveOrganizationRequest(modal.organization.id);
      await load();
      if (profileOrganizationId === modal.organization.id) {
        navigate('/admin/organizations');
      }
      setMessage('Организация отправлена в архив');
      closeModal();
    } catch (requestError) {
      setError(await readApiError(requestError));
    } finally {
      setSubmittingModal((current) =>
        current === 'archiveOrganization' ? null : current,
      );
    }
  }

  async function handleOrganizationsPageChange(page: number) {
    setError(null);

    try {
      await load({ ...organizationsPagination, page });
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  async function handleOrganizationUsersPageChange(page: number) {
    if (!profileOrganizationId) {
      return;
    }

    setError(null);

    try {
      await loadOrganizationUsersPage(profileOrganizationId, {
        ...organizationUsersPagination,
        page,
      });
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  async function handleDepartmentsPageChange(page: number) {
    if (!profileOrganizationId) {
      return;
    }

    setError(null);

    try {
      await loadDepartmentsPage(profileOrganizationId, {
        ...departmentsPagination,
        page,
      });
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  const departmentOptions = departmentOptionsList.map((department) => ({
    value: department.id,
    label: department.name,
  }));

  return (
    <div className="space-y-5">
      {profileOrganizationId ? (
        <div className="space-y-3">
          <Button
            className="w-fit"
            variant="ghost"
            onClick={() => navigate('/admin/organizations')}
          >
            <ArrowLeft size={16} />
            Назад
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">
                {profileOrganization?.name ?? 'Профиль организации'}
              </h1>
              {profileOrganization && (
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <StatusPill
                    tone={
                      profileOrganization.status === 'ACTIVE'
                        ? 'green'
                        : 'slate'
                    }
                  >
                    {profileOrganization.status === 'ACTIVE'
                      ? 'Активна'
                      : 'Архив'}
                  </StatusPill>
                  <span>
                    Пользователи: {profileOrganization._count?.users ?? 0}
                  </span>
                  <span>Смены: {profileOrganization._count?.shifts ?? 0}</span>
                </div>
              )}
            </div>
            <Button
              variant="secondary"
              onClick={() => void refreshCurrentView()}
            >
              <RefreshCcw size={16} />
              Обновить
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-slate-950">
            Организации
          </h1>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              onClick={() => setModal({ type: 'createOrganization' })}
            >
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
      )}

      {message && <Notice tone="success">{message}</Notice>}
      {credentials && (
        <Notice tone="success">
          {[
            credentials.login ? `Логин: ${credentials.login}.` : '',
            credentials.password ? `Пароль: ${credentials.password}` : '',
          ]
            .filter(Boolean)
            .join(' ')}
        </Notice>
      )}
      {error && <Notice tone="danger">{error}</Notice>}

      {profileOrganizationId ? (
        <>
          <Panel
            title="Пользователи"
            action={
              <Button variant="primary" onClick={openCreateUserModal}>
                <UserPlus size={16} />
                Добавить
              </Button>
            }
          >
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
                meta: organizationUsersPage.meta,
                onPageChange: (page) =>
                  void handleOrganizationUsersPageChange(page),
              }}
              rows={organizationUsersPage.items}
            />
          </Panel>

          <Panel
            title="Департаменты"
            action={
              <Button
                variant="primary"
                onClick={() => setModal({ type: 'createDepartment' })}
              >
                <Plus size={16} />
                Добавить
              </Button>
            }
          >
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
                          setModal({ type: 'archiveDepartment', department })
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
        </>
      ) : (
        <Panel
          title="Список организаций"
          action={
            <Button
              variant="secondary"
              onClick={() => void refreshCurrentView()}
            >
              <RefreshCcw size={16} />
              Обновить
            </Button>
          }
        >
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
                      onClick={() =>
                        navigate(getOrganizationProfilePath(organization.id))
                      }
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
            getRowKey={(organization) => organization.id}
            pagination={{
              meta: organizationsPage.meta,
              onPageChange: (page) => void handleOrganizationsPageChange(page),
            }}
            rows={organizationsPage.items}
          />
        </Panel>
      )}

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
            <Button
              form="create-organization-form"
              type="submit"
              isDisabled={isModalSubmitting('createOrganization')}
              variant="primary"
            >
              {isModalSubmitting('createOrganization') ? (
                <ButtonSpinner />
              ) : (
                <Plus size={16} />
              )}
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
            <Button
              form="create-admin-form"
              type="submit"
              isDisabled={isModalSubmitting('createAdmin')}
              variant="primary"
            >
              {isModalSubmitting('createAdmin') ? (
                <ButtonSpinner />
              ) : (
                <ShieldPlus size={16} />
              )}
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
          <UserPasswordField
            required
            className="sm:col-span-2"
            label="Пароль"
            value={admin.password}
            onChange={(password) => setAdmin((prev) => ({ ...prev, password }))}
            onGenerate={() =>
              setAdmin((prev) => ({
                ...prev,
                password: generateUserPassword(),
              }))
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
            <Button
              form="create-user-form"
              type="submit"
              isDisabled={isModalSubmitting('createUser')}
              variant="primary"
            >
              {isModalSubmitting('createUser') ? (
                <ButtonSpinner />
              ) : (
                <UserPlus size={16} />
              )}
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
              setUserForm((prev) => ({
                ...prev,
                firstName: event.target.value,
              }))
            }
          />
          <TextField
            label="Отчество"
            value={userForm.middleName}
            onChange={(event) =>
              setUserForm((prev) => ({
                ...prev,
                middleName: event.target.value,
              }))
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
          <UserPasswordField
            required
            className="sm:col-span-2"
            label="Пароль"
            value={userForm.password}
            onChange={(password) =>
              setUserForm((prev) => ({ ...prev, password }))
            }
            onGenerate={() =>
              setUserForm((prev) => ({
                ...prev,
                password: generateUserPassword(),
              }))
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
            <Button
              form="create-department-form"
              type="submit"
              isDisabled={isModalSubmitting('createDepartment')}
              variant="primary"
            >
              {isModalSubmitting('createDepartment') ? (
                <ButtonSpinner />
              ) : (
                <Plus size={16} />
              )}
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
        isOpen={isModalOpen('editDepartment')}
        title="Редактировать департамент"
        size="sm"
        onOpenChange={handleModalOpenChange}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Отмена
            </Button>
            <Button
              form="edit-department-form"
              type="submit"
              isDisabled={isModalSubmitting('editDepartment')}
              variant="primary"
            >
              {isModalSubmitting('editDepartment') ? (
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
          <UserPasswordField
            className="sm:col-span-2"
            label="Новый пароль"
            value={editUserForm.password}
            onChange={(password) =>
              setEditUserForm((prev) => ({ ...prev, password }))
            }
            onGenerate={() =>
              setEditUserForm((prev) => ({
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
              isDisabled={isModalSubmitting('archiveDepartment')}
              variant="danger"
              onClick={() => void archiveDepartment()}
            >
              {isModalSubmitting('archiveDepartment') ? (
                <ButtonSpinner />
              ) : (
                <Archive size={16} />
              )}
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
              isDisabled={isModalSubmitting('archiveOrganization')}
              variant="danger"
              onClick={() => void archiveOrganization()}
            >
              {isModalSubmitting('archiveOrganization') ? (
                <ButtonSpinner />
              ) : (
                <Archive size={16} />
              )}
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
