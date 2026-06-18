import { useUnit } from 'effector-react';
import { useEffect, useState } from 'react';

import { useAuth } from 'services/core/auth/auth.hooks';

import { myShiftsService } from './myShiftsService.model';
import { MyShiftsPage } from './view/MyShiftsPage/MyShiftsPage';

export function MyShiftsContainer() {
  const { user } = useAuth();
  const {
    departmentId,
    error,
    finishMyShiftClicked,
    isLoading,
    message,
    myShiftDepartmentChanged,
    myShiftsPageChanged,
    myShiftsPageStarted,
    openShift,
    shiftsPage,
    startMyShiftClicked,
  } = useUnit({
    shiftsPage: myShiftsService.outputs.$shiftsPage,
    openShift: myShiftsService.outputs.$openShift,
    departmentId: myShiftsService.outputs.$departmentId,
    message: myShiftsService.outputs.$message,
    error: myShiftsService.outputs.$error,
    isLoading: myShiftsService.outputs.$isActionPending,
    myShiftsPageStarted: myShiftsService.inputs.pageStarted,
    myShiftsPageChanged: myShiftsService.inputs.pageChanged,
    myShiftDepartmentChanged: myShiftsService.inputs.departmentChanged,
    startMyShiftClicked: myShiftsService.inputs.startShiftClicked,
    finishMyShiftClicked: myShiftsService.inputs.finishShiftClicked,
  });
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    myShiftsPageStarted();
  }, [myShiftsPageStarted]);

  useEffect(() => {
    if (!openShift) {
      return undefined;
    }

    setNowMs(Date.now());
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 1_000);

    return () => window.clearInterval(intervalId);
  }, [openShift?.id, openShift?.startedAt]);

  return (
    <MyShiftsPage
      departmentId={departmentId}
      departments={user?.departments ?? []}
      error={error}
      isLoading={isLoading}
      message={message}
      nowMs={nowMs}
      openShift={openShift}
      shiftsPage={shiftsPage}
      onDepartmentChange={myShiftDepartmentChanged}
      onFinishShift={finishMyShiftClicked}
      onPageChange={myShiftsPageChanged}
      onStartShift={startMyShiftClicked}
    />
  );
}
