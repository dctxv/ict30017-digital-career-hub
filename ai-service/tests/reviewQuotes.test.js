/**
 * The verbatim quotes the results page uses to place issues on the resume.
 *
 * They are optional and forgiving by design: a review saved before they
 * existed must still parse, and one bad quote must cost one highlight, never
 * the whole review.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { ReviewResponseSchema } from '../src/schemas/resumeSchema.js';

const base = () => ({
  formatting: {
    score: 70,
    feedback: 'ok',
    issues: [{ section: 'Experience', issue: 'Mixed date styles', suggestion: 'Pick one' }],
  },
  content_quality: { score: 60, feedback: 'ok', strengths: [], weaknesses: [] },
  language_grammar: { score: 80, feedback: 'ok', issues: [] },
  action_items: ['Fix dates'],
  overall_score: 68,
});

test('a review with no quote fields still parses, with empty defaults', () => {
  const result = ReviewResponseSchema.safeParse(base());
  assert.equal(result.success, true);
  assert.deepEqual(result.data.formatting.issues[0].quotes, []);
  assert.deepEqual(result.data.content_quality.weak_bullets, []);
});

test('formatting quotes keep strings, drop junk, and cap at four', () => {
  const review = base();
  review.formatting.issues[0].quotes = ['  Jan 2020 – Mar 2021 ', 42, null, 'x', '01/2021', 'a1', 'b2', 'c3'];
  const { data } = ReviewResponseSchema.safeParse(review);
  assert.deepEqual(data.formatting.issues[0].quotes, ['Jan 2020 – Mar 2021', '01/2021', 'a1', 'b2']);
});

test('one malformed weak bullet is dropped without failing the review', () => {
  const review = base();
  review.content_quality.weak_bullets = [
    { quote: 'Responsible for handling clients', issue: 'No outcome', suggestion: 'Say what changed' },
    { issue: 'quote missing' },
    'not an object',
    { quote: 'Helped the team', issue: 'Vague' },
  ];
  const result = ReviewResponseSchema.safeParse(review);
  assert.equal(result.success, true);
  assert.deepEqual(result.data.content_quality.weak_bullets, [
    { quote: 'Responsible for handling clients', issue: 'No outcome', suggestion: 'Say what changed' },
    { quote: 'Helped the team', issue: 'Vague', suggestion: '' },
  ]);
});
