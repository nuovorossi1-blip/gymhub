import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', workers: 1, timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:3187', browserName: 'chromium', channel: process.env.CI ? undefined : 'msedge', headless: true, viewport: { width: 412, height: 915 }, trace: 'retain-on-failure' },
  webServer: { command: 'npm run preview', url: 'http://127.0.0.1:3187', reuseExistingServer: !process.env.CI },
  reporter: 'list'
});
