import { useUnit } from 'effector-react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { adminOrganizationActionsService } from 'services/domains/organization/adminOrganizationActionsService/adminOrganizationActionsService.model';

import { adminOrganizationsService } from './adminOrganizationsService.model';
import { getOrganizationProfilePath } from './adminOrganizationsService.utils';
import { AdminOrganizationsPage } from './view/AdminOrganizationsPage/AdminOrganizationsPage';

export function AdminOrganizationsContainer() {
  const navigate = useNavigate();
  const { organizationId: profileOrganizationId } = useParams<{
    organizationId: string;
  }>();
  const {
    adminDepartmentsPageChanged,
    adminFeedbackCleared,
    adminOrganizationUsersPageChanged,
    adminOrganizationsPageChanged,
    adminOrganizationsPageStarted,
    adminOrganizationsRefreshClicked,
    adminProfileOrganizationChanged,
    archiveAdminDepartment,
    archiveAdminOrganization,
    archiveAdminOrganizationUser,
    createAdminAccount,
    createAdminDepartment,
    createAdminOrganization,
    createAdminOrganizationUser,
    credentials,
    departmentOptionsList,
    departmentsPage,
    actionError,
    loadError,
    message,
    organizationUsersPage,
    organizationsPage,
    profileOrganization,
    submittingModal,
    updateAdminDepartment,
    updateAdminOrganizationUser,
  } = useUnit({
    organizationsPage: adminOrganizationsService.outputs.$organizationsPage,
    profileOrganization: adminOrganizationsService.outputs.$profileOrganization,
    organizationUsersPage: adminOrganizationsService.outputs.$organizationUsersPage,
    departmentsPage: adminOrganizationsService.outputs.$departmentsPage,
    departmentOptionsList: adminOrganizationsService.outputs.$departmentOptions,
    credentials: adminOrganizationActionsService.outputs.$credentials,
    message: adminOrganizationActionsService.outputs.$message,
    loadError: adminOrganizationsService.outputs.$error,
    actionError: adminOrganizationActionsService.outputs.$error,
    submittingModal: adminOrganizationActionsService.outputs.$submittingModal,
    adminOrganizationsPageStarted:
      adminOrganizationsService.inputs.pageStarted,
    adminOrganizationsRefreshClicked:
      adminOrganizationsService.inputs.refreshClicked,
    adminProfileOrganizationChanged:
      adminOrganizationsService.inputs.profileOrganizationChanged,
    adminOrganizationsPageChanged:
      adminOrganizationsService.inputs.organizationsPageChanged,
    adminOrganizationUsersPageChanged:
      adminOrganizationsService.inputs.organizationUsersPageChanged,
    adminDepartmentsPageChanged:
      adminOrganizationsService.inputs.departmentsPageChanged,
    adminFeedbackCleared: adminOrganizationActionsService.inputs.feedbackCleared,
    createAdminOrganization:
      adminOrganizationActionsService.inputs.createOrganizationFx,
    createAdminAccount: adminOrganizationActionsService.inputs.createAdminFx,
    createAdminDepartment:
      adminOrganizationActionsService.inputs.createDepartmentFx,
    updateAdminDepartment:
      adminOrganizationActionsService.inputs.updateDepartmentFx,
    createAdminOrganizationUser:
      adminOrganizationActionsService.inputs.createOrganizationUserFx,
    updateAdminOrganizationUser:
      adminOrganizationActionsService.inputs.updateOrganizationUserFx,
    archiveAdminOrganizationUser:
      adminOrganizationActionsService.inputs.archiveOrganizationUserFx,
    archiveAdminDepartment:
      adminOrganizationActionsService.inputs.archiveDepartmentFx,
    archiveAdminOrganization:
      adminOrganizationActionsService.inputs.archiveOrganizationFx,
  });
  const error = actionError ?? loadError;

  useEffect(() => {
    adminOrganizationsPageStarted();
  }, [adminOrganizationsPageStarted]);

  useEffect(() => {
    adminProfileOrganizationChanged(profileOrganizationId ?? null);
  }, [adminProfileOrganizationChanged, profileOrganizationId]);

  return (
    <AdminOrganizationsPage
      credentials={credentials}
      departmentsPage={departmentsPage}
      departmentOptionsList={departmentOptionsList}
      error={error}
      message={message}
      organizationUsersPage={organizationUsersPage}
      organizationsPage={organizationsPage}
      profileOrganization={profileOrganization}
      profileOrganizationId={profileOrganizationId ?? null}
      submittingModal={submittingModal}
      onArchiveDepartment={archiveAdminDepartment}
      onArchiveOrganization={archiveAdminOrganization}
      onArchiveOrganizationUser={archiveAdminOrganizationUser}
      onBackToList={() => navigate('/admin/organizations')}
      onCreateAdmin={createAdminAccount}
      onCreateDepartment={createAdminDepartment}
      onCreateOrganization={createAdminOrganization}
      onCreateOrganizationUser={createAdminOrganizationUser}
      onDepartmentsPageChange={adminDepartmentsPageChanged}
      onFeedbackClear={adminFeedbackCleared}
      onOpenOrganizationProfile={(organizationId) =>
        navigate(getOrganizationProfilePath(organizationId))
      }
      onOrganizationsPageChange={adminOrganizationsPageChanged}
      onOrganizationUsersPageChange={adminOrganizationUsersPageChanged}
      onRefresh={adminOrganizationsRefreshClicked}
      onUpdateDepartment={updateAdminDepartment}
      onUpdateOrganizationUser={updateAdminOrganizationUser}
    />
  );
}
