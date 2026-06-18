import {
  formatDurationPartsLabel,
  getDurationPartsFromMilliseconds,
} from 'services/domains/shifts/shiftFormat';

import { ELAPSED_TIMER_UNITS } from './MyShiftsPage.constants';
import { formatTimerValue } from './MyShiftsPage.utils';

type ShiftElapsedTimerProps = {
  startedAt: string;
  nowMs: number;
};

export function ShiftElapsedTimer({
  startedAt,
  nowMs,
}: ShiftElapsedTimerProps) {
  const startedMs = new Date(startedAt).getTime();
  const parts = getDurationPartsFromMilliseconds(nowMs - startedMs);
  const visibleUnits =
    parts.days > 0 ? ELAPSED_TIMER_UNITS : ELAPSED_TIMER_UNITS.slice(1);

  return (
    <div
      aria-label={`Длительность смены: ${formatDurationPartsLabel(parts)}`}
      className="mt-5"
      role="timer"
    >
      <div className="text-sm text-slate-500">Длительность</div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
        {visibleUnits.map((unit) => (
          <div key={unit.key} className="min-w-[4.75rem] text-center">
            <div aria-hidden="true" className="flex justify-center gap-1">
              {formatTimerValue(parts[unit.key])
                .split('')
                .map((digit, index) => (
                  <span
                    key={`${unit.key}-${index}`}
                    className="flex h-10 w-8 items-center justify-center rounded-md bg-blue-600 text-2xl font-semibold tabular-nums text-white shadow-sm sm:h-12 sm:w-9 sm:text-3xl"
                  >
                    {digit}
                  </span>
                ))}
            </div>
            <div className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
