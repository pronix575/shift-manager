import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      api: new URL('./src/api', import.meta.url).pathname,
      core: new URL('./src/core', import.meta.url).pathname,
      telegram: new URL('./src/telegram', import.meta.url).pathname,
      generated: new URL('./src/generated', import.meta.url).pathname,
    },
  },
});
