import { defineConfig } from '@playwright/test';

const PORT = 8181;
export const BASE_URL = `http://localhost:${PORT}`;
export const SITE_DIR = '.site';

export default defineConfig({
  testDir: './specs',
  // Visual baselines (VISUAL=1 only), gitignored.
  snapshotPathTemplate: '{testDir}/../.visual/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    // System Chrome, not Playwright's bundled Chromium: the bundled build cannot
    // decode the homepage MP4s, so video tests would fail for the wrong reason.
    // GitHub's ubuntu runners ship Chrome; locally it must be installed.
    channel: 'chrome',
    viewport: { width: 1366, height: 900 },
    trace: 'retain-on-failure',
  },
  // Test a static build, not `hugo server`. Overriding --baseURL on `hugo server`
  // makes pages load CSS and JS from https://dapr.io, so tests would pass
  // against production assets instead of the code under test.
  webServer: {
    command: `cd .. && hugo --quiet --cleanDestinationDir --baseURL ${BASE_URL}/ --destination tests/${SITE_DIR} && node tests/serve.js tests/${SITE_DIR} ${PORT}`,
    url: BASE_URL,
    // Always rebuild. Reusing a server left over from an earlier run serves a
    // stale build, and tests then pass against code that no longer exists.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
