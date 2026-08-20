/**
 * Regression test for the Bangladesh protected-heading backstop.
 *
 * Live testing on 2026-08-20 showed the model puts "Educational Qualification"
 * into ats_analysis.heading_risks on most Bangladeshi resumes despite the
 * prompt forbidding it, at both Iteration 6 and Iteration 7. Prompt wording
 * changes moved the rate but never reached zero, so the guarantee is enforced
 * in normalizeResponse instead. These cases pin that matcher list.
 *
 * Run: npm test --prefix ai-service
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { BANGLADESH_PROTECTED_HEADINGS } from '../src/config/reviewConstants.js';

const isProtected = (heading) =>
  BANGLADESH_PROTECTED_HEADINGS.some((re) => re.test(String(heading)));

/* Headings the Bangladesh market block protects. Never allowed in heading_risks. */
const PROTECTED = [
  'EDUCATIONAL QUALIFICATION',
  'Educational Qualifications',
  'ACADEMIC QUALIFICATION',
  'Academic Qualifications',
  'Career Objective',
  'CAREER OBJECTIVES',
  'TECHNICAL SKILLS',
  'Technical Skill',
  'PERSONAL INFORMATION',
  'Personal Details',
  'PERSONAL INFORMATIONS',
  'Declaration',
  'DECLARATIONS',
];

/* Genuinely non-standard headings that must still be flagged. Over-filtering
   here would inflate ats_score, which is derived from the heading_risks count. */
const NOT_PROTECTED = [
  'COMPUTER SKILLS',
  'Computer Knowledge',
  'WORK EXPERIANCE',
  'CO-CURRICULAR ACTIVITIES',
  'Education',
  'Skills',
  'Professional Summary',
  'Curriculum Vitae',
  'Objective',
  'Personal Statement',
];

describe('Bangladesh protected heading matchers', () => {
  for (const heading of PROTECTED) {
    it(`treats "${heading}" as protected`, () => {
      assert.equal(isProtected(heading), true);
    });
  }

  for (const heading of NOT_PROTECTED) {
    it(`leaves "${heading}" flaggable`, () => {
      assert.equal(isProtected(heading), false);
    });
  }

  it('tolerates surrounding whitespace', () => {
    assert.equal(isProtected('  Educational Qualification  '), true);
  });

  it('does not match a heading that merely contains a protected phrase', () => {
    assert.equal(isProtected('Educational Qualification and Training History'), false);
  });
});
