/**
 * Tests for the deterministic PII redaction layer.
 *
 * Framework note: written against node:test + node:assert/strict because no
 * test framework had landed on main when this was added. The describe/it shape
 * is deliberate — converting to Vitest is a one-line import swap:
 *
 *   -import { describe, it } from 'node:test';
 *   -import assert from 'node:assert/strict';
 *   +import { describe, it, assert } from 'vitest';
 *
 * Flagged for that conversion once the QA lead's Vitest setup merges.
 *
 * Run: npm test --prefix server
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  redactPii,
  inspectPii,
  redactPiiDeep,
  redactPiiDeepWithFindings,
  createStreamRedactor,
  STREAM_HOLDBACK_CHARS,
} from './piiRedactor.js';

/* ── Fixtures ───────────────────────────────────────────────────────────────
 * Values below are invented but shaped like real Bangladeshi resume data:
 * grameenphone/robi mobile prefixes, 13-digit NID, Dhaka house/road addressing.
 */

const REDACTS = [
  {
    name: 'email address echoed from the contact block',
    input: 'The header lists rafiqul.islam@gmail.com as the contact.',
    expected: 'The header lists [redacted-email] as the contact.',
  },
  {
    name: 'email with digits and a subdomain',
    input: 'Reach fahmida.akter93@mail.bracu.ac.bd for verification.',
    expected: 'Reach [redacted-email] for verification.',
  },
  {
    name: 'BD mobile, bare 11-digit form',
    input: 'The phone number 01712345678 appears twice.',
    expected: 'The phone number [redacted-phone] appears twice.',
  },
  {
    name: 'BD mobile with hyphen grouping',
    input: 'Listed as 01812-345678 in the footer.',
    expected: 'Listed as [redacted-phone] in the footer.',
  },
  {
    name: 'BD mobile in +880 international form',
    input: 'Contact: +8801912345678',
    expected: 'Contact: [redacted-phone]',
  },
  {
    name: 'BD mobile, +880 with spacing and hyphen',
    input: 'Contact: +880 1712-345678 (mobile)',
    expected: 'Contact: [redacted-phone] (mobile)',
  },
  {
    name: 'non-BD international number',
    input: 'Secondary line +44 20 7946 0958 is listed.',
    expected: 'Secondary line [redacted-phone] is listed.',
  },
  {
    name: '13-digit national ID',
    input: 'NID 1990123456789 should not be on an international CV.',
    expected: 'NID [redacted-id] should not be on an international CV.',
  },
  {
    name: '17-digit national ID',
    input: 'The NID given is 19901234567890123 in the personal block.',
    expected: 'The NID given is [redacted-id] in the personal block.',
  },
  {
    name: '10-digit legacy national ID',
    input: 'An older NID 1234567890 is present.',
    expected: 'An older NID [redacted-id] is present.',
  },
  {
    name: 'LinkedIn profile handle, host preserved',
    input: 'The profile linkedin.com/in/rafiqul-islam is listed.',
    expected: 'The profile linkedin.com/in/[redacted-username] is listed.',
  },
  {
    name: 'full LinkedIn URL with scheme and www',
    input: 'See https://www.linkedin.com/in/fahmida-akter-93 for details.',
    expected: 'See https://www.linkedin.com/in/[redacted-username] for details.',
  },
  {
    name: 'GitHub handle',
    input: 'Portfolio at github.com/rafiqul-dev is referenced.',
    expected: 'Portfolio at github.com/[redacted-username] is referenced.',
  },
  {
    name: 'BD house/road address',
    input: 'Address given as House 12, Road 5, Dhanmondi.',
    expected: 'Address given as [redacted-address], Dhanmondi.',
  },
  {
    name: 'BD city-postcode pair',
    input: 'The footer reads Dhaka-1209 under the address.',
    expected: 'The footer reads [redacted-address] under the address.',
  },
  {
    name: 'western street address',
    input: 'Relocation address 45 Oak Street is included.',
    expected: 'Relocation address [redacted-address] is included.',
  },
  {
    name: 'multiple values in one sentence',
    input: 'Contact block: rafiqul.islam@gmail.com, 01712345678, NID 1990123456789.',
    expected: 'Contact block: [redacted-email], [redacted-phone], NID [redacted-id].',
  },
];

/**
 * The precision requirement. The reviewer must remain able to talk about the
 * resume's structure; only echoed values are removed. Every string here must
 * survive byte-for-byte.
 */
const PRESERVES = [
  // ── Field mentions, not values ──
  'Your contact section is missing a professional email address.',
  'Remove your NID number from an international CV.',
  'Add your LinkedIn profile URL to the contact block.',
  'The phone number formatting is inconsistent between sections.',
  'Your Personal Information section lists a national ID.',
  'Consider removing the address line for international applications.',
  'The email address in the header uses an informal handle.',

  // ── Legitimate numbers: anchoring must protect all of these ──
  'Your CGPA 3.75/4.00 is correctly formatted with a denominator.',
  'SSC GPA 5.00 (Dhaka Board, 2017) is present in the Education section.',
  'The role ran from 2019-2023 with no gap.',
  'Apply a formatting score ceiling of 75 for this resume.',
  'A resume with four or more of these elements scores no higher than 55.',
  'Weighting is content 45% + language 35% + formatting 20%.',
  'Do not flag this for candidates with 3 or more years of experience.',
  'The candidate graduated in 2021 from BUET.',
  'Bullet points increased throughput by 40% year on year.',
  'Scores were 45, 35 and 20 across the three dimensions.',
  'The thesis was submitted in 2022 and defended in 2023.',

  // ── Placeholders must pass through untouched ──
  'Rewrite as: "Increased revenue by [percentage] over [number] months."',
  'Use "Managed a team of [number] engineers" rather than "managed a team".',
  'Quantify with [number] and [percentage] rather than inventing figures.',
];

describe('redactPii — removes echoed candidate values', () => {
  for (const { name, input, expected } of REDACTS) {
    it(name, () => {
      assert.equal(redactPii(input), expected);
    });
  }
});

describe('redactPii — preserves field mentions and legitimate numbers', () => {
  for (const input of PRESERVES) {
    it(input.slice(0, 62), () => {
      assert.equal(redactPii(input), input);
    });
  }
});

describe('redactPii — properties', () => {
  it('is idempotent: redacting twice equals redacting once', () => {
    for (const { input } of REDACTS) {
      const once = redactPii(input);
      assert.equal(redactPii(once), once);
    }
  });

  it('handles empty and nullish input without throwing', () => {
    assert.equal(redactPii(''), '');
    assert.equal(redactPii(null), '');
    assert.equal(redactPii(undefined), '');
  });

  it('leaves text with no PII completely unchanged', () => {
    const text = 'Add a quantified outcome to each bullet in the Experience section.';
    assert.equal(redactPii(text), text);
  });
});

describe('inspectPii — reports which rules fired, never the values', () => {
  it('reports rule name, confidence and count', () => {
    const { findings } = inspectPii('Mail rafiq@x.com or fahmida@y.com today.');
    assert.deepEqual(findings, [{ rule: 'email', confidence: 'high', count: 2 }]);
  });

  it('marks the 10-digit ID rule as medium confidence for logging', () => {
    const { findings } = inspectPii('Reference 1234567890 appears in the header.');
    assert.equal(findings.length, 1);
    assert.equal(findings[0].rule, 'national-id-10');
    assert.equal(findings[0].confidence, 'medium');
  });

  it('never includes the matched value in a finding', () => {
    const { findings } = inspectPii('Contact rafiqul.islam@gmail.com now.');
    const serialised = JSON.stringify(findings);
    assert.ok(!serialised.includes('rafiqul'), 'finding leaked the matched value');
    assert.ok(!serialised.includes('gmail'), 'finding leaked the matched value');
  });

  it('reports nothing for clean text', () => {
    assert.deepEqual(inspectPii('Quantify the internship bullets.').findings, []);
  });
});

describe('redactPiiDeep — operates on parsed values, not serialised text', () => {
  // Shaped like the real reviewer response so the test breaks if the payload
  // shape drifts away from what the redactor is wired into.
  const feedback = {
    formatting: {
      score: 72,
      feedback: 'Contact line reads rafiqul.islam@gmail.com and 01712345678.',
      issues: [
        {
          section: 'Personal Information',
          issue: 'NID 1990123456789 is printed in full.',
          suggestion: 'Remove your NID number for international applications.',
        },
      ],
    },
    content_quality: {
      score: 68,
      strengths: ['Clear progression from 2019-2023.'],
      weaknesses: ['Rewrite as "grew revenue by [percentage] in [number] quarters".'],
    },
    ats_analysis: {
      keyword_hits: ['React', 'Node.js'],
      heading_risks: [],
    },
    overall_score: 70,
    job_match: null,
  };

  const redacted = redactPiiDeep(feedback);

  it('redacts string values wherever they are nested', () => {
    assert.equal(
      redacted.formatting.feedback,
      'Contact line reads [redacted-email] and [redacted-phone].'
    );
    assert.equal(
      redacted.formatting.issues[0].issue,
      'NID [redacted-id] is printed in full.'
    );
  });

  it('leaves numeric scores untouched — scoring stays server-side', () => {
    assert.equal(redacted.formatting.score, 72);
    assert.equal(redacted.content_quality.score, 68);
    assert.equal(redacted.overall_score, 70);
    assert.equal(typeof redacted.overall_score, 'number');
  });

  it('never rewrites object keys', () => {
    assert.deepEqual(Object.keys(redacted), Object.keys(feedback));
    assert.deepEqual(
      Object.keys(redacted.formatting.issues[0]),
      ['section', 'issue', 'suggestion']
    );
  });

  it('preserves field mentions, placeholders and year ranges', () => {
    assert.equal(
      redacted.formatting.issues[0].suggestion,
      'Remove your NID number for international applications.'
    );
    assert.equal(redacted.content_quality.strengths[0], 'Clear progression from 2019-2023.');
    assert.equal(
      redacted.content_quality.weaknesses[0],
      'Rewrite as "grew revenue by [percentage] in [number] quarters".'
    );
  });

  it('preserves null, arrays and structure', () => {
    assert.equal(redacted.job_match, null);
    assert.deepEqual(redacted.ats_analysis.keyword_hits, ['React', 'Node.js']);
    assert.deepEqual(redacted.ats_analysis.heading_risks, []);
  });

  it('does not mutate the input object', () => {
    assert.equal(
      feedback.formatting.feedback,
      'Contact line reads rafiqul.islam@gmail.com and 01712345678.'
    );
  });

  it('aggregates findings across every string value', () => {
    const { findings } = redactPiiDeepWithFindings(feedback);
    const byRule = Object.fromEntries(findings.map((f) => [f.rule, f.count]));
    assert.equal(byRule.email, 1);
    assert.equal(byRule['phone-bd'], 1);
    assert.equal(byRule['national-id'], 1);
  });
});

/* ── Streaming ─────────────────────────────────────────────────────────────
 * The AI streams JSON a few characters at a time. PII split across a chunk
 * boundary is the failure mode this exists to prevent.
 */

function runStream(chunks, options) {
  const redactor = createStreamRedactor(options);
  let out = '';
  for (const chunk of chunks) out += redactor.push(chunk);
  out += redactor.flush();
  return out;
}

describe('createStreamRedactor — PII split across chunk boundaries', () => {
  // Long enough that the release point moves well past the phone number, so
  // the holdback logic is genuinely exercised rather than everything landing
  // in the final flush.
  const filler = 'The Experience section needs quantified outcomes on every bullet point. ';
  const prefix = `{"feedback":"${filler.repeat(3)}Contact the candidate on `;
  const phone = '01712345678';
  const suffix = ` for a screening call. ${filler.repeat(3)}"}`;
  const whole = prefix + phone + suffix;

  it('catches a phone number split across two chunks', () => {
    // Split mid-number: '...on 017' | '12345678 for...'
    const out = runStream([prefix + '017', '12345678' + suffix]);
    assert.ok(out.includes('[redacted-phone]'), 'phone was not redacted');
    assert.ok(!out.includes('01712345678'), 'raw phone number leaked');
    assert.ok(!out.includes('12345678'), 'phone fragment leaked');
  });

  it('catches a phone number split across three chunks', () => {
    const out = runStream([prefix + '0171', '2345', '678' + suffix]);
    assert.ok(out.includes('[redacted-phone]'));
    assert.ok(!out.includes('01712345678'));
  });

  it('catches a phone number streamed one character at a time', () => {
    const out = runStream([...whole]);
    assert.ok(out.includes('[redacted-phone]'));
    assert.ok(!out.includes('01712345678'));
  });

  it('catches an email split across a chunk boundary', () => {
    const emailWhole = `${prefix}rafiqul.islam@gmail.com${suffix}`;
    const cut = prefix.length + 8; // mid local-part
    const out = runStream([emailWhole.slice(0, cut), emailWhole.slice(cut)]);
    assert.ok(out.includes('[redacted-email]'));
    assert.ok(!out.includes('rafiqul.islam@gmail.com'));
    assert.ok(!out.includes('@gmail.com'));
  });

  it('produces the same result as redacting the whole text at once', () => {
    const expected = redactPii(whole);
    const splits = [1, 7, 40, prefix.length, prefix.length + 5, whole.length - 3];
    for (const at of splits) {
      const out = runStream([whole.slice(0, at), whole.slice(at)]);
      assert.equal(out, expected, `stream diverged when split at ${at}`);
    }
    assert.equal(runStream([...whole]), expected, 'stream diverged char-by-char');
  });

  it('emits nothing until the holdback window is exceeded', () => {
    const redactor = createStreamRedactor();
    assert.equal(redactor.push('x'.repeat(STREAM_HOLDBACK_CHARS - 1)), '');
  });

  it('flush drains the withheld tail', () => {
    const redactor = createStreamRedactor();
    const text = 'Reach the candidate on 01712345678 today.';
    redactor.push(text);
    const drained = redactor.flush();
    assert.ok(drained.includes('[redacted-phone]'));
  });

  it('flush is safe to call twice', () => {
    const redactor = createStreamRedactor();
    redactor.push('short');
    assert.equal(redactor.flush(), 'short');
    assert.equal(redactor.flush(), '');
  });

  it('holdback exceeds the longest single match so PII cannot straddle it', () => {
    const longestFixture = REDACTS
      .map((c) => c.input.length - c.expected.length)
      .reduce((a, b) => Math.max(a, b), 0);
    assert.ok(
      STREAM_HOLDBACK_CHARS > longestFixture,
      `holdback ${STREAM_HOLDBACK_CHARS} must exceed longest match ${longestFixture}`
    );
  });
});
