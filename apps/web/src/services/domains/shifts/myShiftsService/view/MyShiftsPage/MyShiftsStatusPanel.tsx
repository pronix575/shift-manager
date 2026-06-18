import { Button } from '@heroui/react';
import { Play, Square } from 'lucide-react';

import { Shift } from 'api/generated/api.types';
import { formatDateTime } from 'services/domains/shifts/shiftFormat';
import { Notice } from 'ui/components/Notice';
import { Panel } from 'ui/components/Panel';
import { SelectField } from 'ui/components/SelectField';
import { StatusPill } from 'ui/components/StatusPill';

import { SHIFT_ACTION_BUTTON_CLASS_NAME } from './MyShiftsPage.constants';
import { MyShiftDepartmentOption } from './MyShiftsPage.types';
import { ShiftElapsedTimer } from './ShiftElapsedTimer';

type MyShiftsStatusPanelProps = {
  departmentId: string;
  departments: MyShiftDepartmentOption[];
  error: string | null;
  isLoading: boolean;
  message: string | null;
  nowMs: number;
  openShift: Shift | null;
  onDepartmentChange: (departmentId: string) => void;
  onFinishShift: (shiftId: string) => void;
  onStartShift: () => void;
};

export function MyShiftsStatusPanel({
  departmentId,
  departments,
  error,
  isLoading,
  message,
  nowMs,
  openShift,
  onDepartmentChange,
  onFinishShift,
  onStartShift,
}: MyShiftsStatusPanelProps) {
  return (
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
          {!openShift && departments.length > 1 && (
            <SelectField
              label="Департамент"
              className="min-w-52"
              options={departments.map((department) => ({
                value: department.id,
                label: department.name,
              }))}
              value={departmentId}
              onChange={onDepartmentChange}
            />
          )}
          {!openShift ? (
            <Button
              className={SHIFT_ACTION_BUTTON_CLASS_NAME}
              isDisabled={isLoading}
              variant="primary"
              onClick={onStartShift}
            >
              <Play size={16} />
              Начать смену
            </Button>
          ) : (
            <Button
              className={SHIFT_ACTION_BUTTON_CLASS_NAME}
              isDisabled={isLoading}
              variant="primary"
              onClick={() => onFinishShift(openShift.id)}
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
  );
}
