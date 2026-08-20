/**
 * Golden-file snapshot of the built system prompt.
 *
 * Purpose: make prompt changes provable. Before this existed there was no
 * assertion on what buildSystemPrompt() actually produces, so a refactor that
 * claimed to leave the text untouched could not be shown to have done so.
 * From here on, an intentional prompt change shows up as a reviewable diff in
 * tests/golden/, and an unintentional one fails the suite.
 *
 * When a prompt change IS intended, regenerate the goldens and review the diff
 * as part of the change:
 *
 *   UPDATE_GOLDEN=1 npm test --prefix ai-service
 *
 * Line endings are normalised to LF on both sides before comparing. The repo
 * checks out with native line endings (.gitattributes `* text=auto`), so the
 * template literals in resumeReviewer.js carry CRLF on a Windows checkout and
 * LF on CI. Normalising keeps the comparison byte-exact on the thing that
 * actually matters — the prompt text — without failing on the platform.
 *
 * Framework note: node:test + node:assert/strict, matching
 * server/src/utils/piiRedactor.test.js. Converting to Vitest is an import swap.
 *
 * Run: npm test --prefix ai-service
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildSystemPrompt } from '../src/services/resumeReviewer.js';

const GOLDEN_DIR = join(dirname(fileURLToPath(import.meta.url)), 'golden');
const UPDATE = process.env.UPDATE_GOLDEN === '1';

const MODES = ['bangladesh', 'international'];

const goldenPath = (mode) => join(GOLDEN_DIR, `systemPrompt.${mode}.txt`);
const lf = (text) => text.replace(/\r\n/g, '\n');

describe('buildSystemPrompt golden snapshot', () => {
  for (const mode of MODES) {
    it(`${mode} mode matches its golden file`, () => {
      const built = lf(buildSystemPrompt(mode));
      const path = goldenPath(mode);

      if (UPDATE) {
        writeFileSync(path, built, 'utf8');
        return;
      }

      assert.ok(
        existsSync(path),
        `Missing golden file ${path}. Generate it with: UPDATE_GOLDEN=1 npm test --prefix ai-service`
      );

      const golden = lf(readFileSync(path, 'utf8'));
      assert.equal(
        built,
        golden,
        `The ${mode} system prompt no longer matches its golden file. If the change was ` +
        'intended, regenerate with UPDATE_GOLDEN=1 and review the golden diff in the same change.'
      );
    });
  }

  it('defaults to the bangladesh prompt when no mode is given', () => {
    assert.equal(lf(buildSystemPrompt()), lf(buildSystemPrompt('bangladesh')));
  });
});
