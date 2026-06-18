import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitest/config';

const srcAlias = (path: string) =>
  fileURLToPath(new URL(`./src/${path}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      App: srcAlias('App'),
      api: srcAlias('api'),
      router: srcAlias('router'),
      'services/core': srcAlias('services/core'),
      'services/domains': srcAlias('services/domains'),
      styles: srcAlias('styles'),
      ui: srcAlias('ui'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
  },
});
