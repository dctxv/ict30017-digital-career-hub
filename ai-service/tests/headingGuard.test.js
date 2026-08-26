/**
 * Regression tests for the protected-heading backstop.
 *
 * Live testing on 2026-08-20 showed the model putting "Educational Qualification"
 * into ats_analysis.heading_risks on five of six Bangladeshi resumes despite the
 * prompt forbidding it, at both Iteration 6 and Iteration 7. Prompt wording moved
 * the rate but never reached zero, so the guarantee is enforced in code.
 *
 * The matcher list is now resolved per context rather than per market mode,
 * because a heading protected for one applicant is a real problem for another.
 * These tests pin both halves: what is shielded, and what must stay flaggable.
 * Over-filtering is not a safe failure, because ats_score is derived from the
 * heading_risks count and suppressing genuine risks inflates it.
 *
 * Run: npm test --prefix ai-service
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveProtectedHeadings,
  isMandatedFieldRemovalAdvice,
  mandatesPersonalFields,
} from '../src/config/reviewConstants.js';
import { coerceStringList } from '../src/services/resumeReviewer.js';

const BD = { marketMode: 'bangladesh' };
const isProtected = (heading, context = BD) =>
  resolveProtectedHeadings(context).some((re) => re.test(String(heading)));

/* Established Bangladeshi conventions. Never a heading risk for a local employer. */
const PROTECTED_LOCALLY = [
  'EDUCATIONAL QUALIFICATION',
  'Educational Qualifications',
  'ACADEMIC QUALIFICATION',
  'Career Objective',
  'CAREER OBJECTIVES',
  'Career Summary',
  'Professional Summary',
  'TECHNICAL SKILLS',
  'Computer Skills',
  'COMPUTER SKILL',
  'Language Proficiency',
  'Training',
  'TRAININGS',
  'References',
  'PERSONAL INFORMATION',
  'Personal Details',
  'Declaration',
];

/* Genuinely problematic headings. Must survive filtering in every context. */
const ALWAYS_FLAGGABLE = [
  'Computer Knowledge',
  'WORK EXPERIANCE',
  'CO-CURRICULAR ACTIVITIES',
  'Education',
  'Skills',
  'Curriculum Vitae',
  'Resume Of',
  'Objective',
  'Personal Statement',
  'My Details',
];

describe('protected headings, local employer', () => {
  for (const heading of PROTECTED_LOCALLY) {
    it(`shields "${heading}"`, () => {
      assert.equal(isProtected(heading), true);
    });
  }

  for (const heading of ALWAYS_FLAGGABLE) {
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

describe('multinational employer protects nothing', () => {
  const intl = { marketMode: 'international', employerType: 'multinational' };

  it('resolves to an empty matcher list', () => {
    assert.equal(resolveProtectedHeadings(intl).length, 0);
  });

  for (const heading of ['Personal Information', 'Declaration', 'Career Objective']) {
    it(`allows "${heading}" to be flagged for a multinational`, () => {
      assert.equal(isProtected(heading, intl), false);
    });
  }
});

describe('Bdjobs platform fields', () => {
  const bdjobs = { marketMode: 'bangladesh', applicationChannel: 'bdjobs_profile' };

  it('shields Specialisation, which the candidate cannot rename', () => {
    assert.equal(isProtected('Specialisation', bdjobs), true);
    assert.equal(isProtected('Specialization', bdjobs), true);
  });

  it('shields the platform Photograph field', () => {
    assert.equal(isProtected('Photograph', bdjobs), true);
  });

  it('does not shield those fields outside Bdjobs', () => {
    assert.equal(isProtected('Specialisation'), false);
  });
});

describe('government prescribed form', () => {
  const govt = { marketMode: 'bangladesh', applicationChannel: 'government_form' };

  for (const heading of ["Father's Name", 'Signature', 'Permanent Address', 'National ID']) {
    it(`shields "${heading}", which the form mandates`, () => {
      assert.equal(isProtected(heading, govt), true);
    });
  }

  it('shields the same fields when the employer is government', () => {
    assert.equal(isProtected('Signature', { marketMode: 'bangladesh', employerType: 'government' }), true);
  });

  it('does not shield a signature block on an ordinary corporate CV', () => {
    assert.equal(isProtected('Signature'), false);
  });
});

/**
 * The second deterministic backstop: advice telling a candidate to strip fields
 * their application actually requires.
 *
 * Live testing on 2026-08-20 produced "Remove non-essential personal details" on
 * a government-form review, which would get a BCS application rejected. The
 * channel module forbids it and the model said it anyway, so it is enforced here.
 */
describe('mandated field removal advice', () => {
  const DROP = [
    'Personal Information | Inclusion of Fathers Name, Mothers Name, Date of Birth | Remove all these fields.',
    'Personal Information | Excessive personal data (religion, blood group) | Remove non-essential personal details.',
    'Consider omitting the photograph for this application.',
    'Removing the declaration would modernise the document.',
    'The signature block is unnecessary here.',
    'Your NID number should be excluded from a professional CV.',
  ];

  const KEEP = [
    'Your Declaration section is undated; add the date and place.',
    'The Personal Information section should list your present address clearly.',
    'Ensure the photograph meets the prescribed 300x300 pixel size.',
    'Quantify the achievements in your most recent role.',
    'Remove the outdated objective statement and replace it with a summary.',
    'Add your Education Board to each secondary qualification.',
  ];

  for (const text of DROP) {
    it(`drops: "${text.slice(0, 56)}..."`, () => {
      assert.equal(isMandatedFieldRemovalAdvice(text), true);
    });
  }

  for (const text of KEEP) {
    it(`keeps: "${text.slice(0, 56)}..."`, () => {
      assert.equal(isMandatedFieldRemovalAdvice(text), false);
    });
  }

  it('only engages where the application actually mandates those fields', () => {
    assert.equal(mandatesPersonalFields({ applicationChannel: 'government_form' }), true);
    assert.equal(mandatesPersonalFields({ employerType: 'government' }), true);
    assert.equal(mandatesPersonalFields({ employerType: 'multinational' }), false);
    assert.equal(mandatesPersonalFields({}), false);
  });
});

/**
 * Third backstop: list entries that arrive as objects where the schema demands
 * strings.
 *
 * Observed live on 2026-08-20, content_quality.weaknesses[8] came back as an
 * object and Zod rejected the ENTIRE review, so the user lost a complete analysis
 * because the model got stylistically creative on item nine. Flattening is always
 * preferable to discarding the whole response.
 */
describe('string list coercion', () => {
  it('flattens an object entry into readable prose', () => {
    const out = coerceStringList([
      'plain string',
      { issue: 'Vague bullet', suggestion: 'Add scope and outcome' },
    ]);
    assert.deepEqual(out, ['plain string', 'Vague bullet - Add scope and outcome']);
  });

  it('drops null and empty entries rather than emitting blanks', () => {
    assert.deepEqual(coerceStringList(['keep', null, undefined, {}]), ['keep', '{}']);
  });

  it('leaves a well-formed list untouched', () => {
    const good = ['one', 'two', 'three'];
    assert.deepEqual(coerceStringList(good), good);
  });

  it('passes non-arrays through unchanged', () => {
    assert.equal(coerceStringList(undefined), undefined);
    assert.equal(coerceStringList(null), null);
  });

  it('stringifies a primitive that is not a string', () => {
    assert.deepEqual(coerceStringList([42, true]), ['42', 'true']);
  });
});
