import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    headless: true,
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium-headless',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          channel: 'chrome',
          args: [
            '--headless=new',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--mute-audio',
            '--enable-automation',
          ],
        },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
