import { MyShiftsPageProps } from './MyShiftsPage.types';
import { MyShiftsHistoryPanel } from './MyShiftsHistoryPanel';
import { MyShiftsStatusPanel } from './MyShiftsStatusPanel';

export function MyShiftsPage(props: MyShiftsPageProps) {
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold text-slate-950">Мои смены</h1>

      <MyShiftsStatusPanel
        departmentId={props.departmentId}
        departments={props.departments}
        error={props.error}
        isLoading={props.isLoading}
        message={props.message}
        nowMs={props.nowMs}
        openShift={props.openShift}
        onDepartmentChange={props.onDepartmentChange}
        onFinishShift={props.onFinishShift}
        onStartShift={props.onStartShift}
      />

      <MyShiftsHistoryPanel
        shiftsPage={props.shiftsPage}
        onPageChange={props.onPageChange}
      />
    </div>
  );
}
