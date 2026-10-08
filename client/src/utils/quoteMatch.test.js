import test from 'node:test'
import assert from 'node:assert/strict'

import { buildIndex, locateQuote } from './quoteMatch.js'

/** The text a located range covers, read back out of the runs. */
function covered(runs, range) {
  const [startRun, startOffset] = range.start
  const [endRun, endOffset] = range.end
  if (startRun === endRun) return runs[startRun].slice(startOffset, endOffset + 1)
  let out = runs[startRun].slice(startOffset)
  for (let i = startRun + 1; i < endRun; i += 1) out += runs[i]
  return out + runs[endRun].slice(0, endOffset + 1)
}

test('finds a quote split across PDF text items, ignoring spacing', () => {
  const runs = ['Helped in plan', 'ning below-the-', 'line (BTL) activities', ' for Pran']
  const result = locateQuote(buildIndex(runs), 'Helped in planning below-the-line (BTL) activities')
  assert.equal(result.status, 'exact')
  assert.equal(covered(runs, result.ranges[0]), 'Helped in planning below-the-line (BTL) activities')
})

test('ignores case, curly quotes, dashes and bullet glyphs', () => {
  const runs = ['• Managed the “Summer Sale” campaign — 3 cities']
  const result = locateQuote(buildIndex(runs), 'managed the "summer sale" campaign - 3 cities')
  assert.equal(result.status, 'exact')
})

test('a placeholder in the quote stands for the real detail in the document', () => {
  const runs = ['Rafiqul Islam', ' · Senior Officer at Dutch-Bangla Bank']
  const result = locateQuote(buildIndex(runs), '[NAME] · Senior Officer at Dutch-Bangla Bank')
  assert.equal(result.status, 'exact')
  assert.match(covered(runs, result.ranges[0]), /Senior Officer at Dutch-Bangla Bank$/)
})

test('a long quote with a small slip is placed as fuzzy', () => {
  const runs = ['Responsible for handling the client accounts of the Dhaka region']
  const result = locateQuote(buildIndex(runs), 'Responsible for handling client accounts of the Dhaka region')
  assert.equal(result.status, 'fuzzy')
})

test('a paraphrase is left unplaced rather than guessed', () => {
  const runs = ['Responsible for handling the client accounts of the Dhaka region']
  const result = locateQuote(buildIndex(runs), 'Looked after customers across Bangladesh')
  assert.equal(result.status, 'unplaced')
})

test('a quote too short to be distinctive is not placed', () => {
  assert.equal(locateQuote(buildIndex(['MS Office, MS Word']), 'MS').status, 'unplaced')
})

test('all occurrences on request, first only by default', () => {
  const index = buildIndex(['Excel reports', ' and Excel dashboards'])
  assert.equal(locateQuote(index, 'Excel').ranges.length, 1)
  assert.equal(locateQuote(index, 'Excel', { all: true }).ranges.length, 2)
})

test('works on Bangla text, combining marks included', () => {
  const runs = ['বিপণন বিভাগে ', 'কাজ করেছি']
  assert.equal(locateQuote(buildIndex(runs), 'বিপণন বিভাগে কাজ করেছি').status, 'exact')
})

test('expands ligatures from the PDF text layer', () => {
  const runs = ['Certiﬁed ﬁnancial analyst']
  assert.equal(locateQuote(buildIndex(runs), 'Certified financial analyst').status, 'exact')
})

test('a keyword may be a short acronym, but only as a whole word', () => {
  const index = buildIndex(['Built PHP services; ', 'used iOS and graphics'])
  assert.equal(locateQuote(index, 'PHP', { term: true }).status, 'exact')
  assert.equal(locateQuote(index, 'iOS', { term: true }).status, 'exact')
  // "phic" sits inside "graphics": not a whole word, so not a match.
  assert.equal(locateQuote(index, 'phic', { term: true }).status, 'unplaced')
})

test('an ellipsis in a quote is treated as a gap', () => {
  const runs = ['Lecturer at the department of Physics, Jagannath University, from February 2020 to till now.']
  const result = locateQuote(buildIndex(runs), 'Lecturer at the department of Physics... from February 2020 to till now.')
  assert.equal(result.status, 'exact')
})
