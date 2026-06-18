import { Shift } from 'api/generated/api.types';
import {
  formatDateTime,
  formatPersonName,
  getShiftDuration,
} from 'services/domains/shifts/shiftFormat';
import { DataTableColumn } from 'ui/components/DataTable';
import { StatusPill } from 'ui/components/StatusPill';

export const shiftsRegistryColumns: DataTableColumn<Shift>[] = [
  {
    key: 'employee',
    label: 'Сотрудник',
    isRowHeader: true,
    render: (shift) => formatPersonName(shift.employee),
  },
  {
    key: 'department',
    label: 'Департамент',
    render: (shift) => shift.department?.name ?? '—',
  },
  {
    key: 'startedAt',
    label: 'Начало',
    render: (shift) => formatDateTime(shift.startedAt),
  },
  {
    key: 'endedAt',
    label: 'Окончание',
    render: (shift) => formatDateTime(shift.endedAt),
  },
  {
    key: 'hours',
    label: 'Длительность',
    render: (shift) => getShiftDuration(shift),
  },
  {
    key: 'source',
    label: 'Источник',
    render: (shift) => shift.source,
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
