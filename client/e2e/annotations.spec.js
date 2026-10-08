import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

/**
 * The review drawn onto the resume.
 *
 * The analysis is mocked with quotes copied from the real sample documents, so
 * what is under test is the browser half: rendering the PDF or Word file,
 * finding each quote in it, and marking it. Whether the model quotes faithfully
 * is measured separately against saved model output.
 */

const PDF = readFileSync('../docs/database/bangladesh_resume_rafiqul_islam.pdf')
const DOCX = readFileSync('../docs/database/BD_Resume_Test_02.docx')

const base = {
  overall_score: 71,
  formatting: { score: 68, feedback: 'ok', issues: [] },
  content_quality: { score: 74, feedback: 'ok', strengths: [], weaknesses: [], weak_bullets: [] },
  language_grammar: { score: 82, feedback: 'ok', issues: [] },
  action_items: ['One', 'Two', 'Three'],
}

const PDF_REVIEW = {
  ...base,
  language_grammar: {
    ...base.language_grammar,
    issues: [{ original: 'Motivated and results-driven Software Engineer', corrected: 'Software Engineer', type: 'CLARITY' }],
  },
  content_quality: {
    ...base.content_quality,
    weak_bullets: [{ quote: 'Delivered features in a 5-member Agile team using Jira', issue: 'Process, not result', suggestion: 'Name a feature' }],
  },
  formatting: {
    ...base.formatting,
    issues: [{ section: 'Experience', issue: 'Mixed date styles', suggestion: 'Pick one', quotes: ['Jan 2023 – Present'] }],
  },
  ats_analysis: { heading_risks: [{ original: 'This heading is not in the document', issue: 'x', recommended: 'y' }] },
}

const DOCX_REVIEW = {
  ...base,
  language_grammar: {
    ...base.language_grammar,
    issues: [{ original: 'Medium command in written & spoken English', corrected: 'Intermediate English', type: 'GRAMMAR' }],
  },
}

async function analyse(page, file, review) {
  await page.route('**/api/resume/analyze-stream', route => route.fulfill({
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
    body: `data: ${JSON.stringify({ done: true, filename: file.name, feedback: review, reviewId: null })}\n\n`,
  }))
  await page.goto('/resume-review')
  await page.locator('input[type="file"]').setInputFiles(file)
  await page.getByRole('button', { name: /analyse my resume/i }).click()
  await page.getByRole('dialog').getByRole('button', { name: /^english$/i }).click()
}

test.use({ viewport: { width: 1440, height: 900 } })

test('a PDF opens on the marked-up resume, with each quoted issue placed', async ({ page }) => {
  await analyse(page, { name: 'resume.pdf', mimeType: 'application/pdf', buffer: PDF }, PDF_REVIEW)

  await expect(page.getByRole('tab', { name: /marked up/i })).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('.ar-panel__summary')).toHaveText(/3 issues marked/i, { timeout: 15000 })
  await expect(page.getByRole('button', { name: /^Issue 1:/ })).toBeVisible()

  // The heading quote is not in the document: listed, not drawn, and said so.
  await expect(page.locator('.ar-card__unplaced')).toHaveCount(1)

  // A card takes you to its mark.
  await page.locator('.ar-card').filter({ hasText: 'Delivered features' }).click()
  await expect(page.locator('.ar-mark--active').first()).toBeInViewport()
})

test('a Word document is previewed and marked too', async ({ page }) => {
  await analyse(page, {
    name: 'resume.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: DOCX,
  }, DOCX_REVIEW)

  await expect(page.locator('.ar-doc__note')).toBeVisible()
  await expect(page.locator('.ar-panel__summary')).toHaveText(/1 issue marked/i, { timeout: 15000 })
  await expect(page.getByRole('button', { name: /^Issue 1:/ })).toBeVisible()
})

test('the full report is a tab away, and the download still saves it', async ({ page }) => {
  await analyse(page, { name: 'resume.pdf', mimeType: 'application/pdf', buffer: PDF }, PDF_REVIEW)
  await expect(page.locator('.ar-mark').first()).toBeVisible({ timeout: 15000 })

  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: /download pdf/i }).click()
  expect((await download).suggestedFilename()).toMatch(/^Resume_Review_resume\.pdf$/)
  await expect(page.getByRole('tab', { name: /full report/i })).toHaveAttribute('aria-selected', 'true')
})
