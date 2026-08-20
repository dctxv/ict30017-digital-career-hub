import { test, expect } from '@playwright/test'

/**
 * Verifies the application-context selectors added for the context-routed
 * reviewer: they render, their choices travel inside the multipart upload, and
 * the coarse market toggle stays consistent with the employer selector.
 *
 * The analysis endpoint is mocked; whether the context changes the AI's answer
 * is proven separately against live output. This spec pins the client's half of
 * the contract: without these fields in the request, the routing engine
 * downstream receives nothing and silently does nothing.
 */

const MIN_PDF = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n')

test.use({ viewport: { width: 1280, height: 900 } })

async function openWithFile(page) {
  await page.goto('/resume-review')
  await page.locator('input[type="file"]').setInputFiles({
    name: 'good.pdf', mimeType: 'application/pdf', buffer: MIN_PDF,
  })
  await expect(page.getByRole('button', { name: /analyse my resume/i })).toBeVisible()
}

test('the four context selectors render with their defaults', async ({ page }) => {
  await openWithFile(page)

  for (const id of ['ctx-applicationChannel', 'ctx-employerType', 'ctx-candidateStage', 'ctx-targetSector']) {
    await expect(page.locator(`#${id}`), `${id} should render`).toBeVisible()
    await expect(page.locator(`#${id}`)).toHaveValue('unknown')
  }
})

test('chosen context fields travel inside the upload; untouched ones are omitted', async ({ page }) => {
  let body = null
  await page.route('**/api/resume/analyze-stream', async (route) => {
    body = route.request().postData() ?? ''
    await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'stub' }) })
  })

  await openWithFile(page)
  await page.locator('#ctx-applicationChannel').selectOption('government_form')
  await page.locator('#ctx-candidateStage').selectOption('fresher')
  // employerType and targetSector deliberately left at "Not sure".

  await page.getByRole('button', { name: /analyse my resume/i }).click()
  await expect(page.locator('.rr-error')).toBeVisible({ timeout: 15000 })

  expect(body, 'request should have been captured').not.toBeNull()
  expect(body).toContain('name="applicationChannel"')
  expect(body).toContain('government_form')
  expect(body).toContain('name="candidateStage"')
  expect(body).toContain('fresher')
  // A field left at "Not sure" must be absent, not sent as the string "unknown".
  expect(body).not.toContain('name="targetSector"')
  expect(body).not.toContain('name="employerType"')
})

test('the market toggle and the employer selector stay consistent', async ({ page }) => {
  await openWithFile(page)

  const employer = page.locator('#ctx-employerType')
  const intlBtn = page.getByRole('button', { name: /international \/ multinational/i })
  const bdBtn = page.getByRole('button', { name: /bangladesh employers/i })

  // Choosing the multinational employer flips the toggle to international.
  await employer.selectOption('multinational')
  await expect(intlBtn).toHaveClass(/market-mode-btn--active/)

  // Choosing a local employer flips it back.
  await employer.selectOption('local_traditional')
  await expect(bdBtn).toHaveClass(/market-mode-btn--active/)

  // Clicking the international toggle promotes the employer to multinational,
  // so the pair can never contradict each other.
  await intlBtn.click()
  await expect(employer).toHaveValue('multinational')

  // And back: the toggle releases the employer to "Not sure" rather than
  // guessing a specific local type.
  await bdBtn.click()
  await expect(employer).toHaveValue('unknown')
})
