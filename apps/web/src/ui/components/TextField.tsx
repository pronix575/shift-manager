import {
  Input,
  Label,
  TextField as HeroTextField,
} from '@heroui/react';
import { InputHTMLAttributes, ReactNode } from 'react';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  endAdornment?: ReactNode;
};

export function TextField({
  label,
  className = '',
  endAdornment,
  ...props
}: TextFieldProps) {
  return (
    <HeroTextField fullWidth className={className}>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          {...props}
          fullWidth
          className={endAdornment ? 'h-10 pr-12' : 'h-10'}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-1 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>
    </HeroTextField>
  );
}
