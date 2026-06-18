import { Shift } from 'api/generated/api.types';
import {
  formatDateTime,
  getShiftDuration,
} from 'services/domains/shifts/shiftFormat';
import { StatusPill } from 'ui/components/StatusPill';

type MyShiftHistoryListProps = {
  shifts: Shift[];
};

export function MyShiftHistoryList({ shifts }: MyShiftHistoryListProps) {
  if (shifts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
        Смен пока нет
      </div>
    );
  }

  return (
    <ul className="space-y-3" aria-label="История смен">
      {shifts.map((shift) => (
        <li
          key={shift.id}
          className="rounded-lg border border-slate-200 bg-slate-50/70 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-medium uppercase text-slate-500">
                Длительность
              </div>
              <div className="mt-1 break-words text-base font-semibold text-slate-950">
                {getShiftDuration(shift)}
              </div>
            </div>
            <StatusPill tone={shift.status === 'OPEN' ? 'green' : 'slate'}>
              {shift.status === 'OPEN' ? 'Открыта' : 'Закрыта'}
            </StatusPill>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
            <ShiftHistoryValue label="Начало">
              {formatDateTime(shift.startedAt)}
            </ShiftHistoryValue>
            <ShiftHistoryValue label="Окончание">
              {formatDateTime(shift.endedAt)}
            </ShiftHistoryValue>
          </dl>
        </li>
      ))}
    </ul>
  );
}

type ShiftHistoryValueProps = {
  label: string;
  children: string;
  className?: string;
};

function ShiftHistoryValue({
  label,
  children,
  className = '',
}: ShiftHistoryValueProps) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-medium text-slate-800">
        {children}
      </dd>
    </div>
  );
}
