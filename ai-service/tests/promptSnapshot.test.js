/**
 * Golden-file snapshot of the composed system prompt.
 *
 * Purpose: make prompt changes provable. Before this existed there was no
 * assertion on what buildSystemPrompt() produces, so a refactor that claimed to
 * leave the text untouched could not be shown to have done so. An intentional
 * change now shows up as a reviewable diff in tests/golden/, and an accidental
 * one fails the suite.
 *
 * The prompt is composed per context rather than selected per market mode, so
 * the snapshots cover representative context combinations as well as the two
 * legacy mode strings. Each fixture is chosen to exercise a different routing
 * path, so a module wired to the wrong branch fails here rather than in
 * production.
 *
 * When a prompt change IS intended, regenerate and review the diff as part of
 * the change:
 *
 *   UPDATE_GOLDEN=1 npm test --prefix ai-service
 *
 * Line endings are normalised to LF on both sides. The repo checks out with
 * native endings (.gitattributes `* text=auto`), so template literals carry CRLF
 * on Windows and LF on CI; normalising keeps the comparison exact on the thing
 * that matters without failing on the platform.
 *
 * Run: npm test --prefix ai-service
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildSystemPrompt } from '../src/services/resumeReviewer.js';
import { resolveModules } from '../src/prompt/index.js';

const GOLDEN_DIR = join(dirname(fileURLToPath(import.meta.url)), 'golden');
const UPDATE = process.env.UPDATE_GOLDEN === '1';
mkdirSync(GOLDEN_DIR, { recursive: true });

/**
 * name -> input. Legacy strings first so the two-mode call sites stay pinned,
 * then one fixture per routing path worth protecting.
 */
const FIXTURES = {
  bangladesh: 'bangladesh',
  international: 'international',

  // A fresher on the dominant local job portal, applying to a traditional
  // employer. Personal details and photographs are conventional here.
  bdjobs_fresher_rmg: {
    applicationChannel: 'bdjobs_profile',
    employerType: 'local_traditional',
    candidateStage: 'fresher',
    targetSector: 'rmg_manufacturing',
  },

  // A prescribed government form. Everything a corporate CV would strip is
  // mandatory, so this is the fixture most likely to catch a bad rule.
  government_form_experienced: {
    applicationChannel: 'government_form',
    employerType: 'government',
    candidateStage: 'experienced',
  },

  // The opposite pole: Western conventions apply and nothing is protected.
  multinational_ats_senior_it: {
    applicationChannel: 'corporate_ats',
    employerType: 'multinational',
    candidateStage: 'senior',
    targetSector: 'it_software',
    renderedPagesAvailable: true,
  },

  // Donor-funded work, where length limits and corporate brevity are wrong.
  ngo_consultancy_experienced: {
    applicationChannel: 'consultancy_tender',
    employerType: 'ngo_development',
    candidateStage: 'experienced',
    targetSector: 'ngo_development',
  },

  // An academic CV, where almost every corporate convention is inapplicable.
  academic_student: {
    applicationChannel: 'academic_cv',
    employerType: 'academic',
    candidateStage: 'student',
    targetSector: 'academic_research',
  },
};

const goldenPath = (name) => join(GOLDEN_DIR, `systemPrompt.${name}.txt`);
const lf = (text) => text.replace(/\r\n/g, '\n');

describe('buildSystemPrompt golden snapshots', () => {
  for (const [name, input] of Object.entries(FIXTURES)) {
    it(`${name} matches its golden file`, () => {
      const built = lf(buildSystemPrompt(input));
      const path = goldenPath(name);

      if (UPDATE) {
        writeFileSync(path, built, 'utf8');
        return;
      }

      assert.ok(
        existsSync(path),
        `Missing golden file ${path}. Generate it with: UPDATE_GOLDEN=1 npm test --prefix ai-service`
      );

      assert.equal(
        built,
        lf(readFileSync(path, 'utf8')),
        `The ${name} prompt no longer matches its golden file. If the change was intended, ` +
        'regenerate with UPDATE_GOLDEN=1 and review the golden diff in the same change.'
      );
    });
  }

  it('defaults to the bangladesh prompt when no input is given', () => {
    assert.equal(lf(buildSystemPrompt()), lf(buildSystemPrompt('bangladesh')));
  });
});

describe('context routing', () => {
  it('routes each fixture to the modules it names', () => {
    const m = resolveModules(FIXTURES.bdjobs_fresher_rmg);
    assert.equal(m.channel, 'bdjobs_profile');
    assert.equal(m.employer, 'local_traditional');
    assert.equal(m.stage, 'fresher');
    assert.equal(m.sector, 'rmg_manufacturing');
  });

  it('derives international market mode from a multinational employer', () => {
    assert.equal(resolveModules({ employerType: 'multinational' }).marketMode, 'international');
  });

  it('keeps a modern local company on Bangladesh conventions', () => {
    assert.equal(resolveModules({ employerType: 'local_modern' }).marketMode, 'bangladesh');
  });

  it('falls back to unknown modules rather than throwing on a bad value', () => {
    const m = resolveModules({ applicationChannel: 'carrier_pigeon', targetSector: 'astrology' });
    assert.equal(m.channel, 'unknown');
    assert.equal(m.sector, 'unknown');
  });

  it('produces a different prompt for each distinct context', () => {
    const built = Object.values(FIXTURES).map((f) => buildSystemPrompt(f));
    assert.equal(new Set(built).size, built.length, 'two fixtures produced an identical prompt');
  });
});
