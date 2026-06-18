import { Button } from '@heroui/react';
import { Download, RefreshCcw } from 'lucide-react';

import { DataTable } from 'ui/components/DataTable';
import { Notice } from 'ui/components/Notice';
import { Panel } from 'ui/components/Panel';

import { latestShiftColumns } from './DashboardPage.constants';
import { DashboardPageProps } from './DashboardPage.types';
import { DashboardStats } from './DashboardStats';

export function DashboardPage({
  error,
  organization,
  shiftsPage,
  summary,
  onExport,
  onRefresh,
  onShiftsPageChange,
}: DashboardPageProps) {
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
          <Button variant="secondary" onClick={onRefresh}>
            <RefreshCcw size={16} />
            Обновить
          </Button>
          <Button variant="primary" onClick={onExport}>
            <Download size={16} />
            Экспорт XLSX
          </Button>
        </div>
      </div>

      {error && <Notice tone="danger">{error}</Notice>}

      <DashboardStats summary={summary} />

      <Panel title="Последние смены">
        <DataTable
          ariaLabel="Последние смены"
          columns={latestShiftColumns}
          getRowKey={(shift) => shift.id}
          pagination={{
            meta: shiftsPage.meta,
            onPageChange: onShiftsPageChange,
          }}
          rows={shiftsPage.items}
        />
      </Panel>
    </div>
  );
}
