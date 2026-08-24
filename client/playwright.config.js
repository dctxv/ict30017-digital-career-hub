import { defineConfig } from '@playwright/test'

/**
 * Assumes both dev servers are already running:
 *   API   http://localhost:3000  (npm run dev --prefix server)
 *   Vite  http://localhost:5173  (npm run dev --prefix client)
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
})
