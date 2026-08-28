// @ts-check
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 1,

  timeout: 30 * 1000,
  expect: { timeout: 30 * 1000 },
  reporter: [["line"], ["allure-playwright"], ['html']],

  use: {
    browserName: 'chromium',
    headless: false,
  },

  // JS and TS copies of every spec live side by side.
  //   npm test          -> TS set   (playwright test --project=ts)
  //   npm run test:js    -> JS set   (playwright test --project=js)
  //   npm run test:all   -> both
  projects: [
    { name: 'ts', testMatch: /.*\.spec\.ts$/ },
    { name: 'js', testMatch: /.*\.spec\.js$/ },
  ],
});