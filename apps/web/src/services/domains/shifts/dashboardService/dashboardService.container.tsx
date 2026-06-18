import { useUnit } from 'effector-react';
import { useEffect } from 'react';

import { downloadShiftsXlsx } from 'services/domains/shifts/shiftExport.utils';

import { dashboardService } from './dashboardService.model';
import { DashboardPage } from './view/DashboardPage/DashboardPage';

export function DashboardContainer() {
  const {
    dashboardPageStarted,
    dashboardRefreshClicked,
    dashboardShiftsPageChanged,
    error,
    organization,
    shiftsPage,
    summary,
  } = useUnit({
    organization: dashboardService.outputs.$organization,
    summary: dashboardService.outputs.$summary,
    shiftsPage: dashboardService.outputs.$shiftsPage,
    error: dashboardService.outputs.$error,
    dashboardPageStarted: dashboardService.inputs.pageStarted,
    dashboardRefreshClicked: dashboardService.inputs.refreshClicked,
    dashboardShiftsPageChanged: dashboardService.inputs.shiftsPageChanged,
  });

  useEffect(() => {
    dashboardPageStarted();
  }, [dashboardPageStarted]);

  return (
    <DashboardPage
      error={error}
      organization={organization}
      shiftsPage={shiftsPage}
      summary={summary}
      onExport={() => void downloadShiftsXlsx()}
      onRefresh={dashboardRefreshClicked}
      onShiftsPageChange={dashboardShiftsPageChanged}
    />
  );
}
