import { test, expect } from '@playwright/test'
import { logInThroughForm } from './login.js'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * HYG: nothing in the UI linked to /admin, so an administrator had to type the
 * URL by hand. The entry must appear for admins and stay hidden from everyone
 * else (the hidden case is covered in auth-session.spec.js).
 *
 * There is deliberately no API that can mint an admin, so this test seeds its
 * own: it registers a fresh user over HTTP, then promotes the row directly in
 * PostgreSQL using the credentials from server/.env. Previously it needed an
 * ADMIN_EMAIL passed in by hand and skipped silently without one, which meant
 * the admin path was usually not tested at all.
 *
 * If psql or the database is unreachable the test skips with a reason rather
 * than failing the suite on an environment problem.
 *
 * Against the fake API (E2E_FAKE_API=1, as in CI) there is no database to
 * promote in, so the role is set through the fake's test-only
 * /api/test/promote instead, and the test name says so. Everything after the
 * promotion — the login, the redirect, the navigation entry — is unchanged.
 */

const PASSWORD = 'CorrectHorseBattery1'
const FAKE_API = process.env.E2E_FAKE_API === '1'
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

function loadServerEnv() {
  const raw = readFileSync(join(REPO_ROOT, 'server', '.env'), 'utf8')
  return Object.fromEntries(
    raw.split(/\r?\n/)
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
  )
}

/**
 * Runs one SQL statement via psql; returns null when psql, the database or
 * server/.env (where the credentials come from) is unavailable.
 */
function sql(query) {
  let env
  try {
    env = loadServerEnv()
  } catch {
    return null
  }
  const candidates = [
    process.env.PSQL_PATH,
    'C:/Program Files/PostgreSQL/18/bin/psql.exe',
    'psql',
  ].filter(Boolean)

  for (const psql of candidates) {
    try {
      return execFileSync(
        psql,
        ['-h', env.DB_HOST, '-p', env.DB_PORT, '-U', env.DB_USER, '-d', env.DB_NAME, '-tAc', query],
        { env: { ...process.env, PGPASSWORD: env.DB_PASSWORD }, encoding: 'utf8', timeout: 15000 }
      ).trim()
    } catch {
      // Try the next candidate; fall through to null when all fail.
    }
  }
  return null
}

test.use({ viewport: { width: 1280, height: 900 } })

const TITLE = 'an admin sees the Admin navigation entry and can reach the dashboard'

test(FAKE_API
  ? `${TITLE} (mocked: admin role set through the fake API's /api/test/promote, no database in CI)`
  : TITLE, async ({ page }) => {
  const email = `e2e.admin.${Date.now()}@example.com`

  const registered = await page.request.post('http://localhost:3000/api/auth/register', {
    data: { full_name: 'E2E Admin', email, password: PASSWORD, plan: 'free' },
  })
  expect(registered.ok(), 'admin seed registration should succeed').toBeTruthy()

  if (FAKE_API) {
    const promoted = await page.request.post('http://localhost:3000/api/test/promote', {
      data: { email, role: 'admin' },
    })
    expect(promoted.ok(), 'the fake API should promote the seeded user').toBeTruthy()
    expect((await promoted.json()).role).toBe('admin')
  } else {
    // Two plain statements rather than UPDATE...RETURNING: psql appends the
    // command tag ("UPDATE 1") to RETURNING output even under -tAc, which made a
    // single-call assertion compare against "admin\nUPDATE 1".
    const updated = sql(`UPDATE users SET role = 'admin' WHERE email = '${email}'`)
    test.skip(updated === null, 'psql, the database or server/.env not reachable in this environment, cannot seed an admin')
    expect(sql(`SELECT role FROM users WHERE email = '${email}'`)).toBe('admin')
  }

  await logInThroughForm(page, email, PASSWORD)
  // Login.jsx sends an admin straight to the dashboard and everyone else to
  // "/", so this lands on /admin rather than the home page.
  await expect(page).toHaveURL(/\/admin/, { timeout: 10000 })

  // The navigation entry is the thing under test, so look for it from a page
  // that is not already the dashboard.
  await page.goto('/')
  const adminLink = page.getByRole('link', { name: /^admin$/i }).first()
  await expect(adminLink).toBeVisible()

  await adminLink.click()
  await expect(page).toHaveURL(/\/admin/, { timeout: 10000 })
})
