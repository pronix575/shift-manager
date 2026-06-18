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
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className="min-w-0 text-left text-lg font-semibold text-slate-950">
                {title}
              </h2>
            )}
          </div>
          {action && <div className="justify-self-end">{action}</div>}
        </div>
      )}
      <Card.Content>{children}</Card.Content>
    </Card>
  );
}
