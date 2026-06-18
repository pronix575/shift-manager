import { I18nProvider } from '@heroui/react';
import { PropsWithChildren } from 'react';

export function Bootstrap({ children }: PropsWithChildren) {
  return <I18nProvider locale="ru-RU">{children}</I18nProvider>;
}
