import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: true,
  retries: 1,
  workers: 4,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
  use: {
    baseURL: 'https://conduit.bondaracademy.com',
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  projects: [
    // ── Auth setup project ──────────────────────────────────
    {
      name: 'setup',
      testDir: './tests/api',
      testMatch: /auth\.setup\.ts/,
    },

    // ── Browser projects (depend on setup for auth state) ──
    {
      name: 'chromium',
      use: {
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        storageState: 'playwright/.auth/user.json',
        browserName: 'firefox',
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        storageState: 'playwright/.auth/user.json',
        browserName: 'webkit',
      },
      dependencies: ['setup'],
    },
  ],
});
