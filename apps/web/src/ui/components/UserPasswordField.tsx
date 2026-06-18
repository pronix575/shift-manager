import { Button } from '@heroui/react';
import { KeyRound } from 'lucide-react';

import { TextField } from './TextField';

type UserPasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  className?: string;
  required?: boolean;
};

export function UserPasswordField({
  label,
  value,
  onChange,
  onGenerate,
  className = '',
  required = false,
}: UserPasswordFieldProps) {
  return (
    <div
      className={`grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end ${className}`}
    >
      <TextField
        required={required}
        autoComplete="new-password"
        label={label}
        minLength={8}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Button type="button" variant="secondary" onClick={onGenerate}>
        <KeyRound size={16} />
        Сгенерировать
      </Button>
    </div>
  );
}
