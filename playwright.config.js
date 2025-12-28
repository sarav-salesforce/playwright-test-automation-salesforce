// @ts-check
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries:1,

  timeout: 30 * 1000,
  expect: { timeout: 30 * 1000 },
  reporter: [["line"], ["allure-playwright"], ['html']],

  use: {
    browserName: 'chromium',
    headless: false,
  },
});