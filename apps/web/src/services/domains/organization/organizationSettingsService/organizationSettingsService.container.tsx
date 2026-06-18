import { useUnit } from 'effector-react';
import { useEffect } from 'react';

import { organizationSettingsService } from './organizationSettingsService.model';
import { OrganizationSettingsPage } from './view/OrganizationSettingsPage/OrganizationSettingsPage';

export function OrganizationSettingsContainer() {
  const {
    archiveOrganizationDepartment,
    createOrganizationDepartment,
    departmentsPage,
    error,
    isUpdatingDepartment,
    message,
    organization,
    organizationSettingsDepartmentsPageChanged,
    organizationSettingsPageStarted,
    saveOrganizationProfile,
    updateOrganizationDepartment,
  } = useUnit({
    organization: organizationSettingsService.outputs.$organization,
    departmentsPage: organizationSettingsService.outputs.$departmentsPage,
    message: organizationSettingsService.outputs.$message,
    error: organizationSettingsService.outputs.$error,
    isUpdatingDepartment: organizationSettingsService.outputs.$isDepartmentUpdating,
    organizationSettingsPageStarted: organizationSettingsService.inputs.pageStarted,
    organizationSettingsDepartmentsPageChanged:
      organizationSettingsService.inputs.departmentsPageChanged,
    saveOrganizationProfile:
      organizationSettingsService.inputs.saveOrganizationFx,
    createOrganizationDepartment:
      organizationSettingsService.inputs.createDepartmentFx,
    updateOrganizationDepartment:
      organizationSettingsService.inputs.updateDepartmentFx,
    archiveOrganizationDepartment:
      organizationSettingsService.inputs.archiveDepartmentFx,
  });

  useEffect(() => {
    organizationSettingsPageStarted();
  }, [organizationSettingsPageStarted]);

  return (
    <OrganizationSettingsPage
      departmentsPage={departmentsPage}
      error={error}
      isUpdatingDepartment={isUpdatingDepartment}
      message={message}
      organization={organization}
      onArchiveDepartment={archiveOrganizationDepartment}
      onCreateDepartment={createOrganizationDepartment}
      onDepartmentsPageChange={organizationSettingsDepartmentsPageChanged}
      onSaveOrganization={saveOrganizationProfile}
      onUpdateDepartment={updateOrganizationDepartment}
    />
  );
}
