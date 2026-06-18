import { Calendar } from '@heroui/react/calendar';
import { DateInputGroup } from '@heroui/react/date-input-group';
import { DatePicker } from '@heroui/react/date-picker';
import { Label } from '@heroui/react/label';
import type { DateValue } from '@heroui/react/rac';
import { useState } from 'react';

type DatePickerFieldProps = {
  label: string;
  onChange: (value: string) => void;
  className?: string;
};

export function DatePickerField({
  label,
  onChange,
  className = '',
}: DatePickerFieldProps) {
  const [isOpen, setOpen] = useState(false);

  function handleChange(value: DateValue | null) {
    onChange(value?.toString() ?? '');
  }

  return (
    <DatePicker
      aria-label={label}
      className={`w-full ${className}`}
      granularity="day"
      isOpen={isOpen}
      onChange={handleChange}
      onOpenChange={setOpen}
    >
      <Label>{label}</Label>
      <DateInputGroup
        fullWidth
        className="h-10"
        onClick={() => setOpen(true)}
      >
        <DateInputGroup.Input>
          {(segment) => (
            <DateInputGroup.Segment segment={segment} />
          )}
        </DateInputGroup.Input>
        <DateInputGroup.Suffix>
          <DatePicker.Trigger className="h-6 w-6 justify-center rounded-md p-0">
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateInputGroup.Suffix>
      </DateInputGroup>
      <DatePicker.Popover placement="bottom start">
        <Calendar>
          <Calendar.Header>
            <Calendar.NavButton slot="previous" />
            <Calendar.Heading />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => <Calendar.Cell date={date} />}
            </Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}
