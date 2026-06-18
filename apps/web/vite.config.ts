import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const RESOLVE_ALIAS = {
  App: '/src/App',
  api: '/src/api',
  router: '/src/router',
  'services/core': '/src/services/core',
  'services/domains': '/src/services/domains',
  styles: '/src/styles',
  ui: '/src/ui',
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: RESOLVE_ALIAS,
  },
  server: {
    port: 3005,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    reportCompressedSize: false,
  },
});
