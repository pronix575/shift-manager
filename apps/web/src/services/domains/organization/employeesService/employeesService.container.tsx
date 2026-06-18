import { useUnit } from 'effector-react';
import { useEffect } from 'react';

import { employeesService } from './employeesService.model';
import { EmployeesPage } from './view/EmployeesPage/EmployeesPage';

export function EmployeesContainer() {
  const {
    archiveEmployeeUser,
    createEmployeeUser,
    credentials,
    departments,
    employeesPageChanged,
    employeesPageStarted,
    employeesRefreshClicked,
    error,
    message,
    submittingModal,
    updateEmployeeUser,
    usersPage,
  } = useUnit({
    usersPage: employeesService.outputs.$usersPage,
    departments: employeesService.outputs.$departments,
    credentials: employeesService.outputs.$credentials,
    message: employeesService.outputs.$message,
    error: employeesService.outputs.$error,
    submittingModal: employeesService.outputs.$submittingModal,
    employeesPageStarted: employeesService.inputs.pageStarted,
    employeesRefreshClicked: employeesService.inputs.refreshClicked,
    employeesPageChanged: employeesService.inputs.pageChanged,
    createEmployeeUser: employeesService.inputs.createUserFx,
    updateEmployeeUser: employeesService.inputs.updateUserFx,
    archiveEmployeeUser: employeesService.inputs.archiveUserFx,
  });

  useEffect(() => {
    employeesPageStarted();
  }, [employeesPageStarted]);

  return (
    <EmployeesPage
      credentials={credentials}
      departments={departments}
      error={error}
      message={message}
      submittingModal={submittingModal}
      usersPage={usersPage}
      onArchiveUser={archiveEmployeeUser}
      onCreateUser={createEmployeeUser}
      onPageChange={employeesPageChanged}
      onRefresh={employeesRefreshClicked}
      onUpdateUser={updateEmployeeUser}
    />
  );
}
