import { test, expect } from '@playwright/test'

/**
 * Verifies H4 (analysis failure stranded the user in the results shell),
 * H5 (partial failure copy was reused for total failure) and H6 (file type and
 * size were only filtered by the picker dialog, not validated).
 */

const MIN_PDF = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n')

test.use({ viewport: { width: 1280, height: 900 } })

async function openUpload(page) {
  await page.goto('/resume-review')
  await expect(page.locator('.drop-zone')).toBeVisible()
}

test.describe('H6 client side file validation', () => {
  test('a .txt file is rejected on the drop zone with no upload attempt', async ({ page }) => {
    let uploadAttempted = false
    // Match only the analysis endpoints. /api/resume/quota is a legitimate
    // page-load call and must not count as an upload attempt.
    await page.route('**/api/resume/analyze**', route => { uploadAttempted = true; route.abort() })

    await openUpload(page)
    await page.locator('input[type="file"]').setInputFiles({
      name: 'resume.txt', mimeType: 'text/plain', buffer: Buffer.from('plain text resume'),
    })

    await expect(page.locator('.drop-zone__error')).toContainText(/not supported/i)
    // Never offered the analyse action, and nothing was sent.
    await expect(page.getByRole('button', { name: /analyse my resume/i })).toHaveCount(0)
    expect(uploadAttempted, 'no request should have been made').toBeFalsy()
  })

  test('an oversized PDF is rejected before upload and names the limit', async ({ page }) => {
    let uploadAttempted = false
    // Match only the analysis endpoints. /api/resume/quota is a legitimate
    // page-load call and must not count as an upload attempt.
    await page.route('**/api/resume/analyze**', route => { uploadAttempted = true; route.abort() })

    await openUpload(page)
    const oversized = Buffer.concat([MIN_PDF, Buffer.alloc(3 * 1024 * 1024, 0x20)])
    await page.locator('input[type="file"]').setInputFiles({
      name: 'huge.pdf', mimeType: 'application/pdf', buffer: oversized,
    })

    await expect(page.locator('.drop-zone__error')).toContainText(/3 MB or smaller/i)
    await expect(page.getByRole('button', { name: /analyse my resume/i })).toHaveCount(0)
    expect(uploadAttempted).toBeFalsy()
  })

  test('a valid PDF is accepted and offers the analyse action', async ({ page }) => {
    await openUpload(page)
    await page.locator('input[type="file"]').setInputFiles({
      name: 'good.pdf', mimeType: 'application/pdf', buffer: MIN_PDF,
    })

    await expect(page.locator('.drop-zone__error')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /analyse my resume/i })).toBeVisible()
  })
})

test.describe('H4 / H5 a failed analysis is recoverable', () => {
  test('a total failure shows the error view with both recovery actions, never the loading shell', async ({ page }) => {
    await openUpload(page)
    await page.locator('input[type="file"]').setInputFiles({
      name: 'good.pdf', mimeType: 'application/pdf', buffer: MIN_PDF,
    })

    // Force an upstream failure on the analysis call.
    await page.route('**/api/resume/analyze-stream', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Analysis failed' }) }))
    await page.route('**/api/resume/analyze', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Analysis failed' }) }))

    await page.getByRole('button', { name: /analyse my resume/i }).click()

    // The error view, not the results shell.
    const errorPanel = page.locator('.rr-error')
    await expect(errorPanel).toBeVisible({ timeout: 15000 })
    await expect(errorPanel).toContainText(/could not be completed/i)

    // Both recovery actions present, which is what was missing before.
    await expect(errorPanel.getByRole('button', { name: /try again/i })).toBeVisible()
    await expect(errorPanel.getByRole('button', { name: /upload new resume/i })).toBeVisible()

    // The partial failure wording must not be used for a total failure.
    await expect(page.locator('.stream-warning')).toHaveCount(0)
    await expect(page.getByText(/feedback may be incomplete/i)).toHaveCount(0)
  })

  test('Upload new resume returns to the drop zone without a page reload', async ({ page }) => {
    await openUpload(page)
    await page.locator('input[type="file"]').setInputFiles({
      name: 'good.pdf', mimeType: 'application/pdf', buffer: MIN_PDF,
    })
    await page.route('**/api/resume/analyze**', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Analysis failed' }) }))

    await page.getByRole('button', { name: /analyse my resume/i }).click()
    await expect(page.locator('.rr-error')).toBeVisible({ timeout: 15000 })

    await page.getByRole('button', { name: /upload new resume/i }).click()
    await expect(page.locator('.drop-zone')).toBeVisible()
    await expect(page.locator('.rr-error')).toHaveCount(0)
  })
})

test.describe('L4 the review counter comes from the server', () => {
  test('a guest is told the daily limit rather than a fabricated remaining count', async ({ page }) => {
    await openUpload(page)
    await page.locator('input[type="file"]').setInputFiles({
      name: 'good.pdf', mimeType: 'application/pdf', buffer: MIN_PDF,
    })

    const notice = page.locator('.free-notice')
    await expect(notice).toBeVisible()
    // The old copy said "3 reviews remaining this month" and linked to /register.
    await expect(notice).not.toContainText(/this month/i)
    await expect(notice).toContainText(/per day|remaining today/i)
    await expect(page.locator('.free-notice__upgrade')).toHaveCount(0)
  })
})
