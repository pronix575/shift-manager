import {
  Input,
  Label,
  TextField as HeroTextField,
} from '@heroui/react';
import { InputHTMLAttributes } from 'react';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function TextField({ label, className = '', ...props }: TextFieldProps) {
  return (
    <HeroTextField fullWidth className={className}>
      <Label>{label}</Label>
      <Input {...props} fullWidth className="h-10" />
    </HeroTextField>
  );
}
