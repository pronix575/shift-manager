import { useEffect, useState } from 'react';

import { Department } from 'api/generated/api.types';
import { Notice } from 'ui/components/Notice';

import { DepartmentsPanel } from './DepartmentsPanel';
import { EditDepartmentModal } from './EditDepartmentModal';
import { DEFAULT_ORGANIZATION_TIMEZONE } from './OrganizationSettingsPage.constants';
import {
  DepartmentModalState,
  OrganizationSettingsPageProps,
} from './OrganizationSettingsPage.types';
import { OrganizationProfileForm } from './OrganizationProfileForm';

export function OrganizationSettingsPage({
  departmentsPage,
  error,
  isUpdatingDepartment,
  message,
  organization,
  onArchiveDepartment,
  onCreateDepartment,
  onDepartmentsPageChange,
  onSaveOrganization,
  onUpdateDepartment,
}: OrganizationSettingsPageProps) {
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState(DEFAULT_ORGANIZATION_TIMEZONE);
  const [departmentName, setDepartmentName] = useState('');
  const [editDepartmentName, setEditDepartmentName] = useState('');
  const [departmentModal, setDepartmentModal] =
    useState<DepartmentModalState>(null);

  useEffect(() => {
    if (!organization) {
      return;
    }

    setName(organization.name);
    setTimezone(organization.timezone);
  }, [organization]);

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

  async function saveOrganization() {
    try {
      await onSaveOrganization({ name, timezone });
    } catch {
      // Ошибка уже сохранена в organizationSettingsService.
    }
  }

  async function createDepartment() {
    try {
      await onCreateDepartment(departmentName);
      setDepartmentName('');
    } catch {
      // Ошибка уже сохранена в organizationSettingsService.
    }
  }

  async function updateDepartment() {
    if (departmentModal?.type !== 'editDepartment') {
      return;
    }

    try {
      await onUpdateDepartment({
        id: departmentModal.department.id,
        name: editDepartmentName,
      });
      setEditDepartmentName('');
      closeDepartmentModal();
    } catch {
      // Ошибка уже сохранена в organizationSettingsService.
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold text-slate-950">Организация</h1>

      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="danger">{error}</Notice>}

      <OrganizationProfileForm
        name={name}
        organization={organization}
        timezone={timezone}
        onNameChange={setName}
        onSubmit={() => void saveOrganization()}
        onTimezoneChange={setTimezone}
      />

      <DepartmentsPanel
        departmentName={departmentName}
        departmentsPage={departmentsPage}
        onArchiveDepartment={(id) => void onArchiveDepartment(id)}
        onCreateDepartment={() => void createDepartment()}
        onDepartmentNameChange={setDepartmentName}
        onEditDepartment={openEditDepartmentModal}
        onPageChange={onDepartmentsPageChange}
      />

      <EditDepartmentModal
        departmentName={editDepartmentName}
        isUpdating={isUpdatingDepartment}
        modal={departmentModal}
        onClose={closeDepartmentModal}
        onNameChange={setEditDepartmentName}
        onOpenChange={handleDepartmentModalOpenChange}
        onSubmit={() => void updateDepartment()}
      />
    </div>
  );
}
