import { test, expect } from '@playwright/test'

/**
 * HYG: nothing in the UI linked to /admin, so an administrator had to type the
 * URL. The entry must appear for admins and stay hidden from everyone else
 * (the hidden case is covered in auth-session.spec.js).
 *
 * ADMIN_EMAIL is created and promoted by scripts/quota_verify.mjs.
 */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const PASSWORD = 'CorrectHorseBattery1'

test.skip(!ADMIN_EMAIL, 'ADMIN_EMAIL not supplied')
test.use({ viewport: { width: 1280, height: 900 } })

test('an admin sees the Admin navigation entry and can reach the dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('you@example.com').fill(ADMIN_EMAIL)
  await page.locator('input[type="password"]').first().fill(PASSWORD)
  await page.getByRole('button', { name: /^log in$/i }).click()
  await expect(page).toHaveURL(/\/$/, { timeout: 10000 })

  const adminLink = page.getByRole('link', { name: /^admin$/i }).first()
  await expect(adminLink).toBeVisible()

  await adminLink.click()
  await expect(page).toHaveURL(/\/admin/, { timeout: 10000 })
})
