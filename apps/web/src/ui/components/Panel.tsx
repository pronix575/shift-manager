import { Card } from '@heroui/react';
import { PropsWithChildren, ReactNode } from 'react';

type PanelProps = PropsWithChildren<{
  title?: string;
  action?: ReactNode;
  className?: string;
}>;

export function Panel({ title, action, className = '', children }: PanelProps) {
  return (
    <Card className={className}>
      {(title || action) && (
        <Card.Header className="flex items-center justify-between gap-3">
          {title && <Card.Title>{title}</Card.Title>}
          {action}
        </Card.Header>
      )}
      <Card.Content>{children}</Card.Content>
    </Card>
  );
}
