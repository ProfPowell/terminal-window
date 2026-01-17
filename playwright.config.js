import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx vite --port 5174',
    url: 'http://localhost:5174/test/test-page.html',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
