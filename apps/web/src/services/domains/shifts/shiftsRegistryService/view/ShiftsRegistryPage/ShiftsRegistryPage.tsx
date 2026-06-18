import { Button } from '@heroui/react';
import { Download, RefreshCcw } from 'lucide-react';
import { FormEvent } from 'react';

import { DatePickerField } from 'ui/components/DatePickerField';
import { DataTable } from 'ui/components/DataTable';
import { Notice } from 'ui/components/Notice';
import { Panel } from 'ui/components/Panel';

import { shiftsRegistryColumns } from './ShiftsRegistryPage.constants';
import { ShiftsRegistryPageProps } from './ShiftsRegistryPage.types';

export function ShiftsRegistryPage({
  error,
  shiftsPage,
  onExport,
  onPageChange,
  onQueryChange,
  onSubmit,
}: ShiftsRegistryPageProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold text-slate-950">Смены</h1>
        <Button variant="primary" onClick={onExport}>
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
              onQueryChange({
                from: value ? `${value}T00:00:00.000Z` : '',
              })
            }
          />
          <DatePickerField
            label="По"
            onChange={(value) =>
              onQueryChange({
                to: value ? `${value}T23:59:59.999Z` : '',
              })
            }
          />
          <Button type="submit" variant="primary">
            <RefreshCcw size={16} />
            Применить
          </Button>
        </form>
      </Panel>

      {error && <Notice tone="danger">{error}</Notice>}

      <Panel title="Реестр смен">
        <DataTable
          ariaLabel="Реестр смен"
          columns={shiftsRegistryColumns}
          getRowKey={(shift) => shift.id}
          pagination={{
            meta: shiftsPage.meta,
            onPageChange,
          }}
          rows={shiftsPage.items}
        />
      </Panel>
    </div>
  );
}
