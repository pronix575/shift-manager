import { Shift } from 'api/generated/api.types';
import { PaginatedResponse } from 'api/pagination';

export type MyShiftDepartmentOption = {
  id: string;
  name: string;
};

export type MyShiftsPageProps = {
  departmentId: string;
  departments: MyShiftDepartmentOption[];
  error: string | null;
  isLoading: boolean;
  message: string | null;
  nowMs: number;
  openShift: Shift | null;
  shiftsPage: PaginatedResponse<Shift>;
  onDepartmentChange: (departmentId: string) => void;
  onFinishShift: (shiftId: string) => void;
  onPageChange: (page: number) => void;
  onStartShift: () => void;
};
