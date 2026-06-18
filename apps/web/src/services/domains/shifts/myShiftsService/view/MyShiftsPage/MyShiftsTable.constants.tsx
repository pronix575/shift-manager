import { Shift } from 'api/generated/api.types';
import {
  formatDateTime,
  getShiftDuration,
} from 'services/domains/shifts/shiftFormat';
import { DataTableColumn } from 'ui/components/DataTable';
import { StatusPill } from 'ui/components/StatusPill';

export const myShiftsColumns: DataTableColumn<Shift>[] = [
  {
    key: 'startedAt',
    label: 'Начало',
    isRowHeader: true,
    render: (shift) => formatDateTime(shift.startedAt),
  },
  {
    key: 'endedAt',
    label: 'Окончание',
    render: (shift) => formatDateTime(shift.endedAt),
  },
  {
    key: 'department',
    label: 'Департамент',
    render: (shift) => shift.department?.name ?? '—',
  },
  {
    key: 'hours',
    label: 'Длительность',
    render: (shift) => getShiftDuration(shift),
  },
  {
    key: 'status',
    label: 'Статус',
    render: (shift) => (
      <StatusPill tone={shift.status === 'OPEN' ? 'green' : 'slate'}>
        {shift.status === 'OPEN' ? 'Открыта' : 'Закрыта'}
      </StatusPill>
    ),
  },
];
