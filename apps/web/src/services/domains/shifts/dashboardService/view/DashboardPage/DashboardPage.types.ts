import { Organization, Shift, StatsSummary } from 'api/generated/api.types';
import { PaginatedResponse } from 'api/pagination';

export type DashboardPageProps = {
  error: string | null;
  organization: Organization | null;
  shiftsPage: PaginatedResponse<Shift>;
  summary: StatsSummary | null;
  onExport: () => void;
  onRefresh: () => void;
  onShiftsPageChange: (page: number) => void;
};
