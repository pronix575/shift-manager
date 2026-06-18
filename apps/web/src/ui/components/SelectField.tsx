import { Label, ListBox, Select } from '@heroui/react';
import { Key } from 'react';

type SelectFieldOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  options: SelectFieldOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Выберите',
  className = '',
}: SelectFieldProps) {
  function handleSelectionChange(key: Key | null) {
    onChange(key === null ? '' : String(key));
  }

  return (
    <Select
      aria-label={label}
      className={className}
      fullWidth
      placeholder={placeholder}
      selectedKey={value || null}
      onSelectionChange={handleSelectionChange}
    >
      <Label>{label}</Label>
      <Select.Trigger className="h-10 items-center">
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
              {option.label}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
