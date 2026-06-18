import { Shift } from 'api/generated/api.types';
import { PaginatedResponse } from 'api/pagination';
import { ShiftFilterQuery } from 'api/shifts.api';

export type ShiftsRegistryPageProps = {
  error: string | null;
  shiftsPage: PaginatedResponse<Shift>;
  onExport: () => void;
  onPageChange: (page: number) => void;
  onQueryChange: (query: Partial<ShiftFilterQuery>) => void;
  onSubmit: () => void;
};
