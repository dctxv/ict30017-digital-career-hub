/**
 * Tests for the parts of preparation that must hold regardless of what the model
 * returns.
 *
 * Three things are pinned here, and each one is a way the feature fails silently
 * rather than loudly:
 *
 *  - Gap key normalisation. Get this wrong and nothing throws: gaps simply
 *    accumulate as duplicates and no user ever sees one close, which looks like
 *    the progress view being broken rather than the keying being broken.
 *  - The tier-1 evidence guarantee. Get this wrong and the product confidently
 *    describes experience the user never gave it, which is the failure that
 *    makes every other claim it makes suspect.
 *  - Severity weighting. Get this wrong and closing three trivial gaps outranks
 *    closing the one that was blocking the application.
 *
 * Run: npm test --prefix ai-service
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  normaliseGapKey,
  categoryOfGapKey,
  summariseGapProgress,
  GAP_SEVERITY_WEIGHT,
} from '../src/config/preparationConstants.js';
import { normaliseGapList, renderGapBlock } from '../src/services/gapEngine.js';
import { stripUnevidencedClaims, resolveTier } from '../src/services/mockInterview.js';
import { buildQuestionPrompt, buildEvaluationPrompt, TIER_1_CONSTRAINT } from '../src/prompt/interview.js';

describe('normaliseGapKey', () => {
  it('leaves a well-formed key alone', () => {
    assert.equal(normaliseGapKey('skill:python', 'skill'), 'skill:python');
  });

  it('resolves the four shapes the model actually sends to one key', () => {
    const written = ['skill:SQL', 'Skill: SQL', 'skill : sql ', 'SKILL:  sql'];
    const keys = new Set(written.map((raw) => normaliseGapKey(raw, 'skill')));
    assert.deepEqual([...keys], ['skill:sql'], 'the same gap must produce one key');
  });

  it('adds the prefix when the model omits it', () => {
    assert.equal(normaliseGapKey('financial modelling', 'skill'), 'skill:financial-modelling');
  });

  it('trusts the validated category over a wrong prefix', () => {
    // The category is validated against the enum; the prefix is free text.
    assert.equal(normaliseGapKey('skills:power-bi', 'skill'), 'skill:power-bi');
  });

  it('keys an evidence gap to its section', () => {
    assert.equal(normaliseGapKey('evidence:Work Experience', 'evidence'), 'evidence:work-experience');
  });

  it('rejects a key with no subject in it', () => {
    // Storing this would create a row that re-detects as new every run and can
    // therefore never close.
    assert.equal(normaliseGapKey('skill', 'skill'), null);
    assert.equal(normaliseGapKey('skill:', 'skill'), null);
    assert.equal(normaliseGapKey('   ', 'skill'), null);
  });

  it('rejects a key whose category cannot be resolved at all', () => {
    assert.equal(normaliseGapKey('vibes:hustle', 'aptitude'), null);
  });

  it('keeps a Bangla key stable rather than emptying it', () => {
    // The prompt asks for English keys. An ASCII-only slugger would turn one
    // that ignored the instruction into '', and every such gap would then
    // collide into a single row.
    const key = normaliseGapKey('skill:যোগাযোগ', 'skill');
    assert.ok(key && key !== 'skill:', 'a non-Latin key must survive slugging');
    assert.equal(normaliseGapKey('skill:যোগাযোগ', 'skill'), key, 'and must be stable across runs');
  });

  it('reads the category back off a stored key', () => {
    assert.equal(categoryOfGapKey('credential:ielts'), 'credential');
    assert.equal(categoryOfGapKey('nonsense:ielts'), null);
  });
});

describe('normaliseGapList', () => {
  const gap = (overrides) => ({
    gap_key: 'skill:sql',
    category: 'skill',
    description: 'No evidence of SQL.',
    severity: 'minor',
    closeable: 'months',
    remediation: { steps: [], resource_query: '', effort: '' },
    ...overrides,
  });

  it('collapses a duplicate subject and keeps the more severe reading', () => {
    const out = normaliseGapList([
      gap({ gap_key: 'skill:sql', severity: 'minor' }),
      gap({ gap_key: 'Skill: SQL', severity: 'blocking' }),
    ]);
    assert.equal(out.length, 1);
    assert.equal(out[0].severity, 'blocking');
  });

  it('drops an untrackable gap instead of storing it under a made-up key', () => {
    const out = normaliseGapList([gap(), gap({ gap_key: '   ' })]);
    assert.equal(out.length, 1);
    assert.equal(out[0].gap_key, 'skill:sql');
  });

  it('survives an empty list', () => {
    assert.deepEqual(normaliseGapList(), []);
  });
});

describe('renderGapBlock', () => {
  it('returns null when there is nothing to send, rather than an empty block', () => {
    assert.equal(renderGapBlock([]), null);
    assert.equal(renderGapBlock([{ gap_key: 'skill:sql' }]), null);
  });

  it('sends the key so the question can be linked back to the gap', () => {
    const block = renderGapBlock([
      { gap_key: 'skill:sql', severity: 'blocking', description: 'No SQL evidence.' },
    ]);
    assert.match(block, /<KNOWN_GAPS>/);
    assert.match(block, /skill:sql/);
    assert.match(block, /No SQL evidence\./);
  });
});

describe('tier resolution', () => {
  it('is 1 with nothing but a role', () => {
    assert.equal(resolveTier({ hasResume: false, hasJobAd: false }), 1);
  });

  it('stays 1 with an advertisement but no resume', () => {
    // The tier-1 constraint is about the candidate, and an advertisement says
    // nothing about the candidate.
    assert.equal(resolveTier({ hasResume: false, hasJobAd: true }), 1);
  });

  it('is 2 with a resume and 3 with both', () => {
    assert.equal(resolveTier({ hasResume: true, hasJobAd: false }), 2);
    assert.equal(resolveTier({ hasResume: true, hasJobAd: true }), 3);
  });
});

describe('stripUnevidencedClaims', () => {
  it('removes the claim and keeps the question', () => {
    const { text, changed } = stripUnevidencedClaims(
      'Based on your experience in supply chain, how would you handle a delayed shipment?'
    );
    assert.equal(changed, true);
    assert.equal(text, 'How would you handle a delayed shipment?');
  });

  it('catches the other three phrasings the model reaches for', () => {
    const cases = [
      'Your resume shows several years in banking. What draws you to this role?',
      'During your time at that manufacturer, what did you change?',
      'Your background in civil engineering means you have seen delays. Describe one.',
    ];
    for (const input of cases) {
      const { text, changed } = stripUnevidencedClaims(input);
      assert.equal(changed, true, `not caught: ${input}`);
      assert.doesNotMatch(text, /your (resume|background|time)/i, `claim survived: ${text}`);
      assert.ok(text.length > 0, 'a question must remain');
    }
  });

  it('leaves a legitimate second-person question untouched', () => {
    // "your answer", "your approach" and "your notice period" are about the
    // interview, not about a history nobody supplied.
    const clean = 'Walk me through your approach to prioritising two urgent tasks.';
    assert.deepEqual(stripUnevidencedClaims(clean), { text: clean, changed: false });
  });

  it('keeps the original when the claim was the entire question', () => {
    // An empty question on screen is worse than an over-familiar one.
    const input = 'Your resume shows a gap in 2024.';
    assert.deepEqual(stripUnevidencedClaims(input), { text: input, changed: false });
  });

  it('tolerates a missing value', () => {
    assert.deepEqual(stripUnevidencedClaims(undefined), { text: '', changed: false });
  });
});

describe('interview prompts', () => {
  it('states the no-resume constraint at tier 1, in both calls', () => {
    assert.ok(buildQuestionPrompt({ tier: 1 }).includes(TIER_1_CONSTRAINT));
    assert.ok(buildEvaluationPrompt({ tier: 1 }).includes(TIER_1_CONSTRAINT));
  });

  it('drops it once a resume exists, so the questions can be grounded', () => {
    const prompt = buildQuestionPrompt({ tier: 2 });
    assert.ok(!prompt.includes(TIER_1_CONSTRAINT));
    assert.match(prompt, /A RESUME WAS SUPPLIED/);
  });

  it('only mentions the advertisement and the gaps when they were supplied', () => {
    const bare = buildQuestionPrompt({ tier: 1 });
    assert.doesNotMatch(bare, /JOB ADVERTISEMENT WAS SUPPLIED/);
    assert.doesNotMatch(bare, /KNOWN GAPS WERE SUPPLIED/);

    const full = buildQuestionPrompt({ tier: 3, hasJobAd: true, hasGaps: true });
    assert.match(full, /JOB ADVERTISEMENT WAS SUPPLIED/);
    assert.match(full, /KNOWN GAPS WERE SUPPLIED/);
  });

  it('never asks the model for a URL', () => {
    // It has no browsing tool, so it would invent one, and a remediation step
    // pointing at a page that does not exist is worse than no link at all.
    const prompt = buildEvaluationPrompt({ tier: 3 });
    assert.match(prompt, /Never a URL/);
  });
});

describe('summariseGapProgress', () => {
  const g = (severity, status) => ({ severity, status });

  it('weights by severity rather than counting', () => {
    const trivial = summariseGapProgress([
      g('minor', 'closed'), g('minor', 'closed'), g('minor', 'closed'),
      g('blocking', 'open'),
    ]);
    const real = summariseGapProgress([
      g('blocking', 'closed'),
      g('minor', 'open'), g('minor', 'open'), g('minor', 'open'),
    ]);
    assert.ok(
      real.percent > trivial.percent,
      'closing one blocking gap must outrank closing three minor ones'
    );
  });

  it('excludes dismissed gaps from progress entirely', () => {
    const summary = summariseGapProgress([
      g('blocking', 'dismissed'), g('blocking', 'dismissed'),
    ]);
    assert.equal(summary.percent, 0, 'disagreeing with the board is not progress');
    assert.equal(summary.dismissed, 2);
    assert.equal(summary.weightOpen, 0);
  });

  it('reports 0 rather than dividing by zero on an empty board', () => {
    assert.equal(summariseGapProgress([]).percent, 0);
  });

  it('treats an unrecognised severity as minor rather than as nothing', () => {
    const summary = summariseGapProgress([{ severity: 'catastrophic', status: 'open' }]);
    assert.equal(summary.weightOpen, GAP_SEVERITY_WEIGHT.minor);
  });
});
