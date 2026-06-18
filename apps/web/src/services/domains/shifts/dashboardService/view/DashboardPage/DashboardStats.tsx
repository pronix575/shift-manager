import { StatsSummary } from 'api/generated/api.types';
import { formatDurationFromMinutes } from 'services/domains/shifts/shiftFormat';
import { Panel } from 'ui/components/Panel';

import { DASHBOARD_STATS_LIMIT } from './DashboardPage.constants';

type DashboardStatsProps = {
  summary: StatsSummary | null;
};

export function DashboardStats({ summary }: DashboardStatsProps) {
  return (
    <>
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
            {(summary?.byEmployee ?? [])
              .slice(0, DASHBOARD_STATS_LIMIT)
              .map((item) => (
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
            {(summary?.byDepartment ?? [])
              .slice(0, DASHBOARD_STATS_LIMIT)
              .map((item) => (
                <StatRow
                  key={item.id}
                  label={item.name}
                  value={formatDurationFromMinutes(item.durationMinutes)}
                />
              ))}
          </div>
        </Panel>
      </div>
    </>
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
