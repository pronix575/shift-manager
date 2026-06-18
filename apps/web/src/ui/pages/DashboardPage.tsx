import { Button } from '@heroui/react';
import { Download, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Organization, Shift, StatsSummary } from 'api/generated/api.types';
import { getOrganizationRequest } from 'api/organization.api';
import {
  DEFAULT_PAGE,
  getEmptyPaginatedResponse,
  PaginationQuery,
} from 'api/pagination';
import {
  exportShiftsRequest,
  getStatsSummaryRequest,
  listShiftsRequest,
} from 'api/shifts.api';
import { readApiError } from 'api/http/client';
import {
  formatDateTime,
  formatDurationFromMinutes,
  formatPersonName,
  getShiftDuration,
} from 'services/domains/shifts/shiftFormat';
import { DataTable } from 'ui/components/DataTable';
import { Notice } from 'ui/components/Notice';
import { Panel } from 'ui/components/Panel';
import { StatusPill } from 'ui/components/StatusPill';

export function DashboardPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [shiftsPage, setShiftsPage] = useState(() =>
    getEmptyPaginatedResponse<Shift>(8),
  );
  const [shiftsPagination, setShiftsPagination] = useState<PaginationQuery>({
    page: DEFAULT_PAGE,
    perPage: 8,
  });
  const [error, setError] = useState<string | null>(null);

  async function load(nextShiftsPagination = shiftsPagination) {
    const [nextOrganization, nextSummary, nextShifts] = await Promise.all([
      getOrganizationRequest(),
      getStatsSummaryRequest(),
      listShiftsRequest(nextShiftsPagination),
    ]);
    setOrganization(nextOrganization);
    setSummary(nextSummary);
    setShiftsPage(nextShifts);
    setShiftsPagination({
      page: nextShifts.meta.page,
      perPage: nextShifts.meta.perPage,
    });
  }

  async function loadShiftsPage(nextShiftsPagination: PaginationQuery) {
    const nextShifts = await listShiftsRequest(nextShiftsPagination);
    setShiftsPage(nextShifts);
    setShiftsPagination({
      page: nextShifts.meta.page,
      perPage: nextShifts.meta.perPage,
    });
  }

  useEffect(() => {
    void load().catch(async (requestError) =>
      setError(await readApiError(requestError)),
    );
  }, []);

  async function exportXlsx() {
    const blob = await exportShiftsRequest();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shifts.xlsx';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleShiftsPageChange(page: number) {
    setError(null);

    try {
      await loadShiftsPage({ ...shiftsPagination, page });
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">
            {organization?.name ?? 'Статистика'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Часовой пояс: {organization?.timezone ?? '—'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void load()}>
            <RefreshCcw size={16} />
            Обновить
          </Button>
          <Button variant="primary" onClick={() => void exportXlsx()}>
            <Download size={16} />
            Экспорт XLSX
          </Button>
        </div>
      </div>

      {error && (
        <Notice tone="danger">
          {error}
        </Notice>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Всего смен" value={summary?.totalShifts ?? 0} />
        <Metric title="Открытые" value={summary?.openShifts ?? 0} />
        <Metric title="Закрытые" value={summary?.closedShifts ?? 0} />
        <Metric
          title="Время смен"
          value={formatDurationFromMinutes(summary?.totalDurationMinutes ?? 0)}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="По сотрудникам">
          <div className="space-y-3">
            {(summary?.byEmployee ?? []).slice(0, 6).map((item) => (
              <StatRow
                key={item.id}
                label={item.name}
                value={formatDurationFromMinutes(item.durationMinutes)}
              />
            ))}
          </div>
        </Panel>
        <Panel title="По департаментам">
          <div className="space-y-3">
            {(summary?.byDepartment ?? []).slice(0, 6).map((item) => (
              <StatRow
                key={item.id}
                label={item.name}
                value={formatDurationFromMinutes(item.durationMinutes)}
              />
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Последние смены">
        <DataTable
          ariaLabel="Последние смены"
          columns={[
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
              key: 'status',
              label: 'Статус',
              render: (shift) => (
                <StatusPill tone={shift.status === 'OPEN' ? 'green' : 'slate'}>
                  {shift.status === 'OPEN' ? 'Открыта' : 'Закрыта'}
                </StatusPill>
              ),
            },
          ]}
          getRowKey={(shift) => shift.id}
          pagination={{
            meta: shiftsPage.meta,
            onPageChange: (page) => void handleShiftsPageChange(page),
          }}
          rows={shiftsPage.items}
        />
      </Panel>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <Panel>
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-950">{value}</div>
    </Panel>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-slate-50 px-3 py-2">
      <span className="truncate text-sm text-slate-700">{label}</span>
      <span className="text-sm font-semibold text-slate-950">{value}</span>
    </div>
  );
}
