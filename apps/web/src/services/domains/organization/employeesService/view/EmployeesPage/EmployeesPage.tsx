import { Button } from '@heroui/react';
import { RefreshCcw } from 'lucide-react';
import { useState } from 'react';

import { OrganizationUser } from 'api/generated/api.types';
import { Notice } from 'ui/components/Notice';

import { ArchiveEmployeeModal } from './ArchiveEmployeeModal';
import { EditEmployeeModal } from './EditEmployeeModal';
import { EmployeesCreateForm } from './EmployeesCreateForm';
import {
  EmployeeModalState,
  EmployeeModalType,
  EmployeesPageProps,
} from './EmployeesPage.types';
import {
  getDepartmentOptions,
  getEditableRole,
  getEmptyUserForm,
  getUserDepartmentIds,
  getUserUpdatePayload,
} from './EmployeesPage.utils';
import { EmployeesTable } from './EmployeesTable';

export function EmployeesPage({
  credentials,
  departments,
  error,
  message,
  submittingModal,
  usersPage,
  onArchiveUser,
  onCreateUser,
  onPageChange,
  onRefresh,
  onUpdateUser,
}: EmployeesPageProps) {
  const [form, setForm] = useState(getEmptyUserForm);
  const [editForm, setEditForm] = useState(getEmptyUserForm);
  const [modal, setModal] = useState<EmployeeModalState>(null);
  const departmentOptions = getDepartmentOptions(departments);

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

  async function createUser() {
    try {
      const userPassword = form.password;
      await onCreateUser({
        payload: form,
        password: userPassword,
      });
      setForm(getEmptyUserForm());
    } catch {
      // Ошибка уже сохранена в employeesService.
    }
  }

  async function updateUser() {
    if (modal?.type !== 'editUser') {
      return;
    }

    try {
      await onUpdateUser({
        id: modal.user.id,
        payload: getUserUpdatePayload(editForm),
      });
      closeModal();
    } catch {
      // Ошибка уже сохранена в employeesService.
    }
  }

  async function archiveUser() {
    if (modal?.type !== 'archiveUser') {
      return;
    }

    try {
      await onArchiveUser(modal.user.id);
      closeModal();
    } catch {
      // Ошибка уже сохранена в employeesService.
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold text-slate-950">Сотрудники</h1>
        <Button variant="secondary" onClick={onRefresh}>
          <RefreshCcw size={16} />
          Обновить
        </Button>
      </div>

      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="danger">{error}</Notice>}

      <EmployeesCreateForm
        credentials={credentials}
        departmentOptions={departmentOptions}
        form={form}
        onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        onSubmit={() => void createUser()}
      />

      <EmployeesTable
        usersPage={usersPage}
        onArchiveClick={(user) => setModal({ type: 'archiveUser', user })}
        onEditClick={openEditUserModal}
        onPageChange={onPageChange}
      />

      <EditEmployeeModal
        departmentOptions={departmentOptions}
        form={editForm}
        isSubmitting={isModalSubmitting('editUser')}
        modal={modal}
        onChange={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
        onClose={closeModal}
        onOpenChange={handleModalOpenChange}
        onSubmit={() => void updateUser()}
      />

      <ArchiveEmployeeModal
        isSubmitting={isModalSubmitting('archiveUser')}
        modal={modal}
        onArchive={() => void archiveUser()}
        onClose={closeModal}
        onOpenChange={handleModalOpenChange}
      />
    </div>
  );
}
