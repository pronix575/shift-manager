import { useState } from 'react';

import { Department, OrganizationUser } from 'api/generated/api.types';

import { AdminArchiveOrganizationModal } from './AdminArchiveOrganizationModal';
import { AdminCreateModals } from './AdminCreateModals';
import { AdminDepartmentModals } from './AdminDepartmentModals';
import { AdminDepartmentsPanel } from './AdminDepartmentsPanel';
import { AdminFeedback } from './AdminFeedback';
import { AdminOrganizationsHeader } from './AdminOrganizationsHeader';
import { AdminOrganizationsTable } from './AdminOrganizationsTable';
import {
  AdminModalState,
  AdminModalType,
  AdminOrganizationsPageProps,
} from './AdminOrganizationsPage.types';
import {
  emptyAdminForm,
  getDepartmentOptions,
  getEditableRole,
  getEmptyUserForm,
  getUserDepartmentIds,
  getUserUpdatePayload,
} from './AdminOrganizationsPage.utils';
import { AdminOrganizationUsersPanel } from './AdminOrganizationUsersPanel';
import { AdminUserModals } from './AdminUserModals';

export function AdminOrganizationsPage({
  credentials,
  departmentsPage,
  departmentOptionsList,
  error,
  message,
  organizationUsersPage,
  organizationsPage,
  profileOrganization,
  profileOrganizationId,
  submittingModal,
  onArchiveDepartment,
  onArchiveOrganization,
  onArchiveOrganizationUser,
  onBackToList,
  onCreateAdmin,
  onCreateDepartment,
  onCreateOrganization,
  onCreateOrganizationUser,
  onDepartmentsPageChange,
  onFeedbackClear,
  onOpenOrganizationProfile,
  onOrganizationsPageChange,
  onOrganizationUsersPageChange,
  onRefresh,
  onUpdateDepartment,
  onUpdateOrganizationUser,
}: AdminOrganizationsPageProps) {
  const [organizationName, setOrganizationName] = useState('');
  const [admin, setAdmin] = useState(emptyAdminForm);
  const [departmentName, setDepartmentName] = useState('');
  const [editDepartmentName, setEditDepartmentName] = useState('');
  const [userForm, setUserForm] = useState(getEmptyUserForm);
  const [editUserForm, setEditUserForm] = useState(getEmptyUserForm);
  const [modal, setModal] = useState<AdminModalState>(null);
  const departmentOptions = getDepartmentOptions(departmentOptionsList);

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

  function openCreateOrganizationModal() {
    onFeedbackClear();
    setModal({ type: 'createOrganization' });
  }

  function openCreateAdminModal() {
    onFeedbackClear();
    setAdmin(emptyAdminForm);
    setModal({ type: 'createAdmin' });
  }

  function openCreateDepartmentModal() {
    onFeedbackClear();
    setDepartmentName('');
    setModal({ type: 'createDepartment' });
  }

  function openCreateUserModal() {
    onFeedbackClear();
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

  async function createOrganization() {
    try {
      const { organization: created } = await onCreateOrganization({
        name: organizationName,
      });
      setOrganizationName('');
      onOpenOrganizationProfile(created.id);
      closeModal();
    } catch {
      // Ошибка уже сохранена в adminOrganizationActionsService.
    }
  }

  async function createAdmin() {
    try {
      const adminPassword = admin.password;
      await onCreateAdmin({
        payload: admin,
        password: adminPassword,
      });
      setAdmin(emptyAdminForm);
      closeModal();
    } catch {
      // Ошибка уже сохранена в adminOrganizationActionsService.
    }
  }

  async function createDepartment() {
    if (!profileOrganizationId) {
      return;
    }

    try {
      await onCreateDepartment({
        organizationId: profileOrganizationId,
        name: departmentName,
      });
      setDepartmentName('');
      closeModal();
    } catch {
      // Ошибка уже сохранена в adminOrganizationActionsService.
    }
  }

  async function updateDepartment() {
    if (!profileOrganizationId || modal?.type !== 'editDepartment') {
      return;
    }

    try {
      await onUpdateDepartment({
        organizationId: profileOrganizationId,
        departmentId: modal.department.id,
        name: editDepartmentName,
      });
      setEditDepartmentName('');
      closeModal();
    } catch {
      // Ошибка уже сохранена в adminOrganizationActionsService.
    }
  }

  async function createOrganizationUser() {
    if (!profileOrganizationId) {
      return;
    }

    try {
      const userPassword = userForm.password;
      await onCreateOrganizationUser({
        organizationId: profileOrganizationId,
        payload: userForm,
        password: userPassword,
      });
      setUserForm(getEmptyUserForm());
      closeModal();
    } catch {
      // Ошибка уже сохранена в adminOrganizationActionsService.
    }
  }

  async function updateOrganizationUser() {
    if (!profileOrganizationId || modal?.type !== 'editUser') {
      return;
    }

    try {
      await onUpdateOrganizationUser({
        organizationId: profileOrganizationId,
        userId: modal.user.id,
        payload: getUserUpdatePayload(editUserForm),
      });
      closeModal();
    } catch {
      // Ошибка уже сохранена в adminOrganizationActionsService.
    }
  }

  async function archiveUser() {
    if (!profileOrganizationId || modal?.type !== 'archiveUser') {
      return;
    }

    try {
      await onArchiveOrganizationUser({
        organizationId: profileOrganizationId,
        userId: modal.user.id,
      });
      closeModal();
    } catch {
      // Ошибка уже сохранена в adminOrganizationActionsService.
    }
  }

  async function archiveDepartment() {
    if (!profileOrganizationId || modal?.type !== 'archiveDepartment') {
      return;
    }

    try {
      await onArchiveDepartment({
        organizationId: profileOrganizationId,
        departmentId: modal.department.id,
      });
      closeModal();
    } catch {
      // Ошибка уже сохранена в adminOrganizationActionsService.
    }
  }

  async function archiveOrganization() {
    if (modal?.type !== 'archiveOrganization') {
      return;
    }

    try {
      const archivedOrganizationId = await onArchiveOrganization(
        modal.organization.id,
      );

      if (profileOrganizationId === archivedOrganizationId) {
        onBackToList();
      }

      closeModal();
    } catch {
      // Ошибка уже сохранена в adminOrganizationActionsService.
    }
  }

  return (
    <div className="space-y-5">
      <AdminOrganizationsHeader
        profileOrganization={profileOrganization}
        profileOrganizationId={profileOrganizationId}
        onBackToList={onBackToList}
        onOpenCreateAdmin={openCreateAdminModal}
        onOpenCreateOrganization={openCreateOrganizationModal}
        onRefresh={onRefresh}
      />

      <AdminFeedback
        credentials={credentials}
        error={error}
        message={message}
      />

      {profileOrganizationId ? (
        <>
          <AdminOrganizationUsersPanel
            usersPage={organizationUsersPage}
            onArchiveUser={(user) => setModal({ type: 'archiveUser', user })}
            onCreateUser={openCreateUserModal}
            onEditUser={openEditUserModal}
            onPageChange={onOrganizationUsersPageChange}
          />

          <AdminDepartmentsPanel
            departmentsPage={departmentsPage}
            onArchiveDepartment={(department) =>
              setModal({ type: 'archiveDepartment', department })
            }
            onCreateDepartment={openCreateDepartmentModal}
            onEditDepartment={openEditDepartmentModal}
            onPageChange={onDepartmentsPageChange}
          />
        </>
      ) : (
        <AdminOrganizationsTable
          organizationsPage={organizationsPage}
          onArchiveOrganization={(organization) =>
            setModal({ type: 'archiveOrganization', organization })
          }
          onOpenOrganization={onOpenOrganizationProfile}
          onPageChange={onOrganizationsPageChange}
          onRefresh={onRefresh}
        />
      )}

      <AdminCreateModals
        admin={admin}
        departmentName={departmentName}
        isCreateAdminSubmitting={isModalSubmitting('createAdmin')}
        isCreateDepartmentSubmitting={isModalSubmitting('createDepartment')}
        isCreateOrganizationSubmitting={isModalSubmitting('createOrganization')}
        modal={modal}
        organizationName={organizationName}
        onAdminChange={(patch) => setAdmin((prev) => ({ ...prev, ...patch }))}
        onClose={closeModal}
        onCreateAdmin={() => void createAdmin()}
        onCreateDepartment={() => void createDepartment()}
        onCreateOrganization={() => void createOrganization()}
        onDepartmentNameChange={setDepartmentName}
        onOpenChange={handleModalOpenChange}
        onOrganizationNameChange={setOrganizationName}
      />

      <AdminUserModals
        departmentOptions={departmentOptions}
        editUserForm={editUserForm}
        isArchiveUserSubmitting={isModalSubmitting('archiveUser')}
        isCreateUserSubmitting={isModalSubmitting('createUser')}
        isEditUserSubmitting={isModalSubmitting('editUser')}
        modal={modal}
        userForm={userForm}
        onArchiveUser={() => void archiveUser()}
        onClose={closeModal}
        onCreateUser={() => void createOrganizationUser()}
        onEditUserChange={(patch) =>
          setEditUserForm((prev) => ({ ...prev, ...patch }))
        }
        onOpenChange={handleModalOpenChange}
        onUpdateUser={() => void updateOrganizationUser()}
        onUserChange={(patch) =>
          setUserForm((prev) => ({ ...prev, ...patch }))
        }
      />

      <AdminDepartmentModals
        editDepartmentName={editDepartmentName}
        isArchiveDepartmentSubmitting={isModalSubmitting('archiveDepartment')}
        isEditDepartmentSubmitting={isModalSubmitting('editDepartment')}
        modal={modal}
        onArchiveDepartment={() => void archiveDepartment()}
        onClose={closeModal}
        onEditDepartmentNameChange={setEditDepartmentName}
        onOpenChange={handleModalOpenChange}
        onUpdateDepartment={() => void updateDepartment()}
      />

      <AdminArchiveOrganizationModal
        isSubmitting={isModalSubmitting('archiveOrganization')}
        modal={modal}
        onArchiveOrganization={() => void archiveOrganization()}
        onClose={closeModal}
        onOpenChange={handleModalOpenChange}
      />
    </div>
  );
}
