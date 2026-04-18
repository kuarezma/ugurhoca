import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        branches: 40,
        functions: 60,
        lines: 60,
        statements: 60,
      },
      provider: 'v8',
      reporter: ['text', 'html'],
    },
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
