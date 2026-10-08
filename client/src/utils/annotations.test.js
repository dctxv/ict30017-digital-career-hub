import test from 'node:test'
import assert from 'node:assert/strict'

import { collectAnnotations } from './annotations.js'

const review = {
  formatting: {
    issues: [
      { section: 'Experience', issue: 'Mixed date styles', suggestion: 'Pick one', quotes: ['Jan 2020', '01/2021'] },
      { section: 'Whole document', issue: 'Too long', suggestion: 'Cut to two pages', quotes: [] },
    ],
  },
  content_quality: {
    weak_bullets: [{ quote: 'Responsible for clients', issue: 'No outcome', suggestion: 'Say what changed' }],
  },
  language_grammar: { issues: [{ original: 'I has managed', corrected: 'I managed', type: 'grammar' }] },
  ats_analysis: {
    heading_risks: [{ original: 'My Journey', issue: 'Not recognised', recommended: 'Experience' }],
    keyword_gaps: ['Docker'],
  },
  job_match: {
    matched_keywords: ['SQL'],
    missing_keywords: [{ keyword: 'AWS', priority: 'high' }],
  },
}

test('orders annotations by priority: headings, language, content, formatting, keywords', () => {
  const { annotations } = collectAnnotations(review)
  assert.deepEqual(annotations.map(a => a.category), ['heading', 'grammar', 'content', 'format', 'keyword'])
})

test('carries the quote, the problem and the fix for each kind', () => {
  const [heading, grammar, content, format, keyword] = collectAnnotations(review).annotations
  assert.deepEqual(heading.quotes, ['My Journey'])
  assert.equal(heading.fix, 'Experience')
  assert.equal(grammar.kind, 'GRAMMAR')
  assert.equal(grammar.fix, 'I managed')
  assert.equal(content.detail, 'No outcome')
  assert.deepEqual(format.quotes, ['Jan 2020', '01/2021'])
  assert.equal(keyword.term, true)
})

test('a formatting issue with nothing to quote goes to the whole-document list', () => {
  const { wholeDocument } = collectAnnotations(review)
  assert.deepEqual(wholeDocument, [{ section: 'Whole document', issue: 'Too long', suggestion: 'Cut to two pages' }])
})

test('missing keywords come from the job ad when there is one, else from the ATS gaps', () => {
  assert.deepEqual(collectAnnotations(review).missingKeywords, ['AWS'])
  assert.deepEqual(collectAnnotations({ ...review, job_match: null }).missingKeywords, ['Docker'])
})

test('without a job ad no keyword is painted as a match', () => {
  const { annotations } = collectAnnotations({ ...review, job_match: null })
  assert.equal(annotations.some(a => a.category === 'keyword'), false)
})

test('an old saved review with no quote fields still produces what it can', () => {
  const { annotations, wholeDocument } = collectAnnotations({
    formatting: { issues: [{ section: 'Header', issue: 'Missing LinkedIn', suggestion: 'Add it' }] },
    language_grammar: { issues: [{ original: 'teh', corrected: 'the', type: 'SPELLING' }] },
  })
  assert.deepEqual(annotations.map(a => a.category), ['grammar'])
  assert.equal(wholeDocument.length, 1)
})

test('copes with no review at all', () => {
  assert.deepEqual(collectAnnotations(null), { annotations: [], wholeDocument: [], missingKeywords: [] })
})
