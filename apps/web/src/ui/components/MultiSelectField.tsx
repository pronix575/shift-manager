import { Label, ListBox, Popover } from '@heroui/react';
import { ChevronDown } from 'lucide-react';

type MultiSelectFieldOption = {
  value: string;
  label: string;
};

type MultiSelectFieldProps = {
  label: string;
  value: string[];
  options: MultiSelectFieldOption[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
};

export function MultiSelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Выберите',
  className = '',
}: MultiSelectFieldProps) {
  const selectedValues = new Set(value);
  const selectedLabels = options
    .filter((option) => selectedValues.has(option.value))
    .map((option) => option.label);
  const displayValue =
    selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder;

  return (
    <div className={`select select--full-width ${className}`}>
      <Label>{label}</Label>
      <Popover>
        <Popover.Trigger
          aria-label={label}
          className="select__trigger select__trigger--full-width h-10 items-center"
        >
          <span
            className="select__value truncate"
            data-placeholder={selectedLabels.length === 0}
          >
            {displayValue}
          </span>
          <ChevronDown className="select__indicator" size={16} />
        </Popover.Trigger>
        <Popover.Content className="select__popover" placement="bottom start">
          <ListBox
            aria-label={`${label}: варианты`}
            className="max-h-64 overflow-auto"
            renderEmptyState={() => (
              <div className="px-3 py-2 text-sm text-slate-500">
                Нет департаментов
              </div>
            )}
            selectedKeys={value}
            selectionBehavior="toggle"
            selectionMode="multiple"
            onSelectionChange={(keys) => {
              if (keys === 'all') {
                onChange(options.map((option) => option.value));
                return;
              }

              onChange(Array.from(keys, String));
            }}
          >
            {options.map((option) => (
              <ListBox.Item
                key={option.value}
                id={option.value}
                textValue={option.label}
              >
                {option.label}
              </ListBox.Item>
            ))}
          </ListBox>
        </Popover.Content>
      </Popover>
    </div>
  );
}
