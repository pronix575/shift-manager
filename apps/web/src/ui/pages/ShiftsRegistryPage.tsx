import { Button } from '@heroui/react';
import { Download, RefreshCcw } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import { Shift } from 'api/generated/api.types';
import {
  exportShiftsRequest,
  listShiftsRequest,
  ShiftQuery,
} from 'api/shifts.api';
import { readApiError } from 'api/http/client';
import {
  formatDateTime,
  formatPersonName,
  getShiftDuration,
} from 'services/domains/shifts/shiftFormat';
import { DatePickerField } from 'ui/components/DatePickerField';
import { DataTable } from 'ui/components/DataTable';
import { Notice } from 'ui/components/Notice';
import { Panel } from 'ui/components/Panel';
import { StatusPill } from 'ui/components/StatusPill';

export function ShiftsRegistryPage() {
  const [query, setQuery] = useState<ShiftQuery>({});
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load(nextQuery = query) {
    setShifts(await listShiftsRequest(nextQuery));
  }

  useEffect(() => {
    void load().catch(async (requestError) =>
      setError(await readApiError(requestError)),
    );
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await load(query);
    } catch (requestError) {
      setError(await readApiError(requestError));
    }
  }

  async function exportXlsx() {
    const blob = await exportShiftsRequest(query);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shifts.xlsx';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold text-slate-950">Смены</h1>
        <Button variant="primary" onClick={() => void exportXlsx()}>
          <Download size={16} />
          Экспорт XLSX
        </Button>
      </div>

      <Panel>
        <form
          className="grid items-end gap-3 md:grid-cols-[1fr_1fr_auto]"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <DatePickerField
            label="С"
            onChange={(value) =>
              setQuery((prev) => ({
                ...prev,
                from: value ? `${value}T00:00:00.000Z` : '',
              }))
            }
          />
          <DatePickerField
            label="По"
            onChange={(value) =>
              setQuery((prev) => ({
                ...prev,
                to: value ? `${value}T23:59:59.999Z` : '',
              }))
            }
          />
          <Button type="submit" variant="primary">
            <RefreshCcw size={16} />
            Применить
          </Button>
        </form>
      </Panel>

      {error && (
        <Notice tone="danger">
          {error}
        </Notice>
      )}

      <Panel title="Реестр смен">
        <DataTable
          ariaLabel="Реестр смен"
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
          ]}
          getRowKey={(shift) => shift.id}
          rows={shifts}
        />
      </Panel>
    </div>
  );
}
