import { Shift } from 'api/generated/api.types';
import { PaginatedResponse } from 'api/pagination';
import { DataTable } from 'ui/components/DataTable';
import { Panel } from 'ui/components/Panel';

import { MyShiftHistoryList } from '../MyShiftHistoryList/MyShiftHistoryList';
import { myShiftsColumns } from './MyShiftsTable.constants';

type MyShiftsHistoryPanelProps = {
  shiftsPage: PaginatedResponse<Shift>;
  onPageChange: (page: number) => void;
};

export function MyShiftsHistoryPanel({
  shiftsPage,
  onPageChange,
}: MyShiftsHistoryPanelProps) {
  return (
    <Panel title="История">
      <div className="md:hidden">
        <MyShiftHistoryList
          pagination={{
            ariaLabel: 'История смен',
            meta: shiftsPage.meta,
            onPageChange,
          }}
          shifts={shiftsPage.items}
        />
      </div>
      <div className="hidden md:block">
        <DataTable
          ariaLabel="История смен"
          columns={myShiftsColumns}
          getRowKey={(shift) => shift.id}
          pagination={{
            meta: shiftsPage.meta,
            onPageChange,
          }}
          rows={shiftsPage.items}
        />
      </div>
    </Panel>
  );
}
