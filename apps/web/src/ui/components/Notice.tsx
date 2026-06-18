import { Alert } from '@heroui/react';

type NoticeProps = {
  tone: 'success' | 'danger';
  children: string;
  className?: string;
};

export function Notice({ tone, children, className = '' }: NoticeProps) {
  return (
    <Alert className={className} status={tone}>
      <Alert.Content>
        <Alert.Description>{children}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
