import { defineConfig } from 'vitest/config';
import os from 'node:os';

const cpuHalf = Math.max(1, Math.floor(os.cpus().length / 2));
const maxThreads = Math.min(4, cpuHalf);

export default defineConfig({
  test: {
    pool: 'threads',
    maxThreads: maxThreads,
    minThreads: 1,
    poolOptions: {
      threads: {
        maxThreads: maxThreads,
        minThreads: 1,
      },
    },
    include: ['tests/**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'tests/simulation/record_screenshots_scenarios.test.ts',
    ],
    environment: 'node',
    globals: false,
  } as any,
  resolve: {
    alias: {
      '@domain': new URL('./src/domain', import.meta.url).pathname,
      '@server': new URL('./src/server', import.meta.url).pathname,
      '@client': new URL('./src/client', import.meta.url).pathname,
    },
  },
});
