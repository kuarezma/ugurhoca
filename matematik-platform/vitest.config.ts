import { defineConfig, configDefaults } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'e2e/**'],
    slowTestThreshold: 2000,
    testTimeout: 30000,
    coverage: {
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        'src/features/games/utils/gameAudio.ts',
        'src/features/games/utils/ambientAudio.ts',
      ],
      thresholds: {
        // Ölçülen (2026-11, oyunlar dahil - ses hariç):
        // branches ~59.95%, functions ~64.34%, lines ~69.17%, statements ~67.29%.
        // Eşikler gerilemeyi yakalar, v8 dalgalanmasında güvenlik marjı bırakır.
        branches: 55,
        functions: 60,
        lines: 65,
        statements: 63,
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
