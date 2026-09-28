import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const outputDir = process.env.PLAYWRIGHT_OUTPUT_DIR ?? 'test-results';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: Number(process.env.PLAYWRIGHT_WORKERS ?? 3),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['json', { outputFile: `${outputDir}/demo-review.json` }], ['html', { open: 'never', outputFolder: `${outputDir}-html` }]],
  use: { baseURL, locale: 'ko-KR', reducedMotion: 'reduce', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'npm run dev -- --port 3000', url: baseURL, reuseExistingServer: !process.env.CI, timeout: 120_000,
  },
});
