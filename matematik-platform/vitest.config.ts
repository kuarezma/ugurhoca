import { defineConfig, configDefaults } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'e2e/**'],
    coverage: {
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        'src/features/games/components/games/**',
        'src/features/games/utils/gameAudio.ts',
      ],
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
      'server-only': path.resolve(__dirname, './src/test/empty-module.ts'),
      'client-only': path.resolve(__dirname, './src/test/empty-module.ts'),
    },
  },
});
