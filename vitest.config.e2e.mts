import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/e2e/**/*.e2e-spec.ts'],
    environment: 'node',
    globalSetup: ['./tests/e2e/global-setup.ts'],
    setupFiles: ['./tests/e2e/setup.ts'],
    testTimeout: 30_000,
    hookTimeout: 120_000,
    fileParallelism: false,
  },
});
