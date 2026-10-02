import { expect } from '@playwright/test'

/**
 * Signs in through the real login form, captcha included.
 *
 * Registering through the API leaves the new account signed in (the register
 * endpoint sets the session cookie when no email check applies), and the login
 * page redirects a signed-in visitor away, so the cookie jar is cleared first.
 *
 * The server refuses a captcha token less than a second old, as a guard
 * against scripted submissions; a person takes longer than that to reach the
 * button, and this waits the same.
 */
export async function logInThroughForm(page, email, password) {
  await page.context().clearCookies()
  await page.goto('/login')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.locator('input[type="password"]').first().fill(password)

  const captcha = page.getByRole('checkbox', { name: /not a robot/i })
  await captcha.click()
  await expect(captcha).toHaveAttribute('aria-checked', 'true')
  await page.waitForTimeout(1100)

  await page.getByRole('button', { name: /^log in$/i }).click()
}
