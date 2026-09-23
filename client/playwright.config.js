import { defineConfig } from '@playwright/test'

/**
 * Assumes both dev servers are already running:
 *   API   http://localhost:3000  (npm run dev --prefix server)
 *   Vite  http://localhost:5173  (npm run dev --prefix client)
 *
 * E2E_BASE_URL and E2E_API_ORIGIN move the suite onto a different pair, which
 * is how it is run against the fake in e2e/fake-api while the real server is
 * still up on :3000 — or when that server's AI allowance for the day is gone
 * and no interview can be generated through it.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
})
