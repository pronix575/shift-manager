import { Checkbox, CheckboxGroup, Label } from '@heroui/react';

type CheckboxListFieldOption = {
  value: string;
  label: string;
};

type CheckboxListFieldProps = {
  label: string;
  value: string[];
  options: CheckboxListFieldOption[];
  onChange: (value: string[]) => void;
  className?: string;
};

export function CheckboxListField({
  label,
  value,
  options,
  onChange,
  className = '',
}: CheckboxListFieldProps) {
  return (
    <CheckboxGroup
      className={className}
      value={value}
      onChange={(nextValue) => onChange([...nextValue])}
    >
      <Label>{label}</Label>
      <div className="flex min-h-10 flex-wrap gap-2 rounded-md bg-slate-50 p-2">
        {options.length === 0 ? (
          <span className="px-1 text-sm text-slate-500">Нет департаментов</span>
        ) : (
          options.map((option) => (
            <Checkbox key={option.value} value={option.value}>
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                {option.label}
              </Checkbox.Content>
            </Checkbox>
          ))
        )}
      </div>
    </CheckboxGroup>
  );
}
