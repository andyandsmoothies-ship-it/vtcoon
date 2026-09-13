import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['tests/simulation/record_screenshots_scenarios.test.ts'],
      exclude: ['**/node_modules/**', '**/dist/**'],
    },
  })
);
