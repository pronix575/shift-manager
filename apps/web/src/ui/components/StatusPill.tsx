import { Chip } from '@heroui/react';

type StatusPillProps = {
  tone: 'green' | 'blue' | 'amber' | 'slate';
  children: string;
};

const toneColor = {
  green: 'success',
  blue: 'accent',
  amber: 'warning',
  slate: 'default',
} as const;

export function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <Chip color={toneColor[tone]} size="sm" variant="soft">
      {children}
    </Chip>
  );
}
