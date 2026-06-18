import { Button } from '@heroui/react';
import { Play, Square } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { Shift } from 'api/generated/api.types';
import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  getEmptyPaginatedResponse,
  PaginationQuery,
} from 'api/pagination';
import {
  finishShiftRequest,
  listMyShiftsRequest,
  startShiftRequest,
} from 'api/shifts.api';
import { readApiError } from 'api/http/client';
import { useAuth } from 'services/core/auth/AuthProvider';
import type { DurationParts } from 'services/domains/shifts/shiftFormat';
import {
  formatDateTime,
  formatDurationPartsLabel,
  getDurationPartsFromMilliseconds,
  getShiftDuration,
} from 'services/domains/shifts/shiftFormat';
import { DataTable } from 'ui/components/DataTable';
import { Notice } from 'ui/components/Notice';
import { Panel } from 'ui/components/Panel';
import { SelectField } from 'ui/components/SelectField';
import { StatusPill } from 'ui/components/StatusPill';

import { MyShiftHistoryList } from './MyShiftHistoryList';

const shiftActionButtonClassName = 'w-full lg:w-auto';
const elapsedTimerUnits = [
  { key: 'days', label: 'Дни' },
  { key: 'hours', label: 'Часы' },
  { key: 'minutes', label: 'Минуты' },
  { key: 'seconds', label: 'Секунды' },
] as const;

export function MyShiftsPage() {
  const { user } = useAuth();
  const [shiftsPage, setShiftsPage] = useState(() =>
    getEmptyPaginatedResponse<Shift>(),
  );
  const [pagination, setPagination] = useState<PaginationQuery>({
    page: DEFAULT_PAGE,
    perPage: DEFAULT_PER_PAGE,
  });
  const [openShift, setOpenShift] = useState<Shift | null>(null);
  const [departmentId, setDepartmentId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  async function load(nextPagination = pagination) {
    const response = await listMyShiftsRequest(nextPagination);

    setShiftsPage(response);
    setPagination({
      page: response.meta.page,
      perPage: response.meta.perPage,
    });

    if (response.meta.page === DEFAULT_PAGE) {
      setOpenShift(response.items.find((shift) => shift.status === 'OPEN') ?? null);
      return;
    }

    const firstPage = await listMyShiftsRequest({
      page: DEFAULT_PAGE,
      perPage: 1,
    });
    setOpenShift(firstPage.items.find((shift) => shift.status === 'OPEN') ?? null);
  }

  useEffect(() => {
    void load().catch(async (requestError) =>
      setError(await readApiError(requestError)),
    );
  }, []);

  useEffect(() => {
    if (!openShift) {
      return undefined;
    }

    setNowMs(Date.now());
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 1_000);

    return () => window.clearInterval(intervalId);
  }, [openShift?.id, openShift?.startedAt]);

  async function runAction(action: () => Promise<unknown>) {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await action();
      await load();
    } catch (requestError) {
      setError(await readApiError(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function handlePageChange(page: number) {
    setError(null);

    try {
      await load({ ...pagination, page });
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold text-slate-950">Мои смены</h1>

      <Panel>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="text-sm text-slate-500">Статус</div>
            <div className="mt-2 flex items-center gap-3">
              <StatusPill tone={openShift ? 'green' : 'slate'}>
                {openShift ? 'Открыта' : 'Нет открытой смены'}
              </StatusPill>
              {openShift && (
                <span className="text-sm text-slate-600">
                  Начало: {formatDateTime(openShift.startedAt)}
                </span>
              )}
            </div>
            {openShift && (
              <ShiftElapsedTimer startedAt={openShift.startedAt} nowMs={nowMs} />
            )}
          </div>

          <div className="flex flex-wrap items-end gap-2">
            {!openShift && (user?.departments.length ?? 0) > 1 && (
              <SelectField
                label="Департамент"
                className="min-w-52"
                options={(user?.departments ?? []).map((department) => ({
                  value: department.id,
                  label: department.name,
                }))}
                value={departmentId}
                onChange={setDepartmentId}
              />
            )}
            {!openShift ? (
              <Button
                className={shiftActionButtonClassName}
                isDisabled={isLoading}
                variant="primary"
                onClick={() =>
                  void runAction(() =>
                    startShiftRequest({
                      departmentId: departmentId || undefined,
                    }),
                  )
                }
              >
                <Play size={16} />
                Начать смену
              </Button>
            ) : (
              <Button
                className={shiftActionButtonClassName}
                isDisabled={isLoading}
                variant="primary"
                onClick={() =>
                  void runAction(() => finishShiftRequest(openShift.id))
                }
              >
                <Square size={16} />
                Завершить
              </Button>
            )}
          </div>
        </div>
        {message && (
          <Notice tone="success" className="mt-4">
            {message}
          </Notice>
        )}
        {error && (
          <Notice tone="danger" className="mt-4">
            {error}
          </Notice>
        )}
      </Panel>

      <Panel title="История">
        <div className="md:hidden">
          <MyShiftHistoryList
            pagination={{
              ariaLabel: 'История смен',
              meta: shiftsPage.meta,
              onPageChange: (page) => void handlePageChange(page),
            }}
            shifts={shiftsPage.items}
          />
        </div>
        <div className="hidden md:block">
          <DataTable
            ariaLabel="История смен"
            columns={[
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
                  <StatusPill
                    tone={shift.status === 'OPEN' ? 'green' : 'slate'}
                  >
                    {shift.status === 'OPEN' ? 'Открыта' : 'Закрыта'}
                  </StatusPill>
                ),
              },
            ]}
            getRowKey={(shift) => shift.id}
            pagination={{
              meta: shiftsPage.meta,
              onPageChange: (page) => void handlePageChange(page),
            }}
            rows={shiftsPage.items}
          />
        </div>
      </Panel>
    </div>
  );
}

type ShiftElapsedTimerProps = {
  startedAt: string;
  nowMs: number;
};

function ShiftElapsedTimer({ startedAt, nowMs }: ShiftElapsedTimerProps) {
  const startedMs = new Date(startedAt).getTime();
  const parts = getDurationPartsFromMilliseconds(nowMs - startedMs);
  const visibleUnits =
    parts.days > 0 ? elapsedTimerUnits : elapsedTimerUnits.slice(1);

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

function formatTimerValue(value: DurationParts[keyof DurationParts]) {
  return value.toString().padStart(2, '0');
}
