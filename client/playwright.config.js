import { defineConfig, devices } from '@playwright/test'

/**
 * Locally, assumes both dev servers are already running:
 *   API   http://localhost:3000  (npm run dev --prefix server)
 *   Vite  http://localhost:5173  (npm run dev --prefix client)
 *
 * E2E_BASE_URL and E2E_API_ORIGIN move the suite onto a different pair, which
 * is how it is run against the fake in e2e/fake-api while the real server is
 * still up on :3000 — or when that server's AI allowance for the day is gone
 * and no interview can be generated through it.
 *
 * In CI (CI=true, set by GitHub Actions) Playwright starts the fake API and
 * Vite itself, and writes an HTML report to playwright-report/. The workflow
 * also sets E2E_FAKE_API=1, which the two specs that would otherwise need a
 * database or an AI key read to say in their names that they are mocked.
 */
const CI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: false,
  workers: 1,
  // A failure is reported, never retried away.
  retries: 0,
  forbidOnly: CI,
  reporter: CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: CI
    ? [
        {
          command: 'node e2e/fake-api/server.js',
          url: 'http://localhost:3000/api/health',
          reuseExistingServer: false,
          timeout: 30000,
        },
        {
          command: 'npm run dev -- --port 5173 --strictPort',
          url: 'http://localhost:5173',
          reuseExistingServer: false,
          timeout: 60000,
        },
      ]
    : undefined,
})
