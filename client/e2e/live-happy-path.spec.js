import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

/**
 * The success path end to end through the browser, against real model output.
 * Everything else in the suite mocks the analysis endpoint; this one does not.
 */
const PASSWORD = 'CorrectHorseBattery1'
const PDF = readFileSync('../docs/database/BD_Resume_Test_01.pdf')

test.use({ viewport: { width: 1280, height: 900 } })
test.setTimeout(120000)

test('a signed in user uploads a real resume and sees real AI feedback', async ({ page }) => {
  const email = `ui.${Date.now()}@example.com`
  const res = await page.request.post('http://localhost:3000/api/auth/register', {
    data: { full_name: 'UI Tester', email, password: PASSWORD, plan: 'free' },
  })
  expect(res.ok()).toBeTruthy()

  await page.goto('/login')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.locator('input[type="password"]').first().fill(PASSWORD)
  await page.getByRole('button', { name: /^log in$/i }).click()
  await expect(page).toHaveURL(/\/$/, { timeout: 10000 })

  await page.goto('/resume-review')

  await page.locator('input[type="file"]').setInputFiles({
    name: 'BD_Resume_Test_01.pdf', mimeType: 'application/pdf', buffer: PDF,
  })
  await expect(page.locator('.drop-zone__error')).toHaveCount(0)

  // The counter is bound to the server, so it must show the real allowance.
  // It renders only once a file has been accepted.
  await expect(page.locator('.free-notice')).toContainText(/3 of 3|remaining today/i)
  await page.getByRole('button', { name: /analyse my resume/i }).click()

  // Real analysis, so allow generous time.
  await expect(page.locator('.rr-error')).toHaveCount(0)
  const overall = page.locator('text=/Overall/i').first()
  await expect(overall).toBeVisible({ timeout: 90000 })

  // A real score must render, not the perpetual loading dots.
  const body = await page.locator('body').innerText()
  expect(body).toMatch(/\d{1,3}\s*\/\s*100|\b\d{2}\b/)
  expect(body).not.toMatch(/feedback may be incomplete/i)

  // Recovery action is present on a successful result too.
  await expect(page.getByRole('button', { name: /upload new resume/i }).first()).toBeVisible()
})
