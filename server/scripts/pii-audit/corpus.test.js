/**
 * Regression test: the PII audit corpus, end to end.
 *
 * Every resume in corpus.js and in both holdout sets in corpus-holdout.js is
 * run through the real upload path (see audit-core.js) and must come out with:
 *   - every piece of personal information masked, as a guest, logged in, as a
 *     DOCX, and in the inbound redactor if the model echoed the CV back;
 *   - every `keep` phrase still there;
 *   - nothing removed that is not personal (the word-by-word diff).
 *
 * The findings behind each rule are in docs/qa/PII_MASK_AUDIT.md. When this
 * fails, run `npm run pii-audit` for the full per-resume report.
 *
 * Run: npm test --prefix server
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { CORPUS } from './corpus.js';
import { HOLDOUT, HOLDOUT_BD } from './corpus-holdout.js';
import { auditEntry } from './audit-core.js';

/**
 * Items that cannot be judged because the PDF's text layer does not hold them
 * in any readable form — this file's font has no Unicode mapping for the
 * conjunct in আক্তার (see F8 in the audit). The item is still checked in the
 * DOCX scenario, and the first name that does survive extraction is checked
 * everywhere.
 */
const UNJUDGEABLE = new Set([
  'bd-tailor-bangla:রিনা আক্তার:guest',
  'bd-tailor-bangla:রিনা আক্তার:account',
  'bd-tailor-bangla:রিনা আক্তার:redactorOnEcho',
  // The PDF spelling of Tangail; the DOCX spells it correctly and is checked
  // under its own item.
  'bd-tailor-bangla:টাাইল:docxGuest',
  'bd-tailor-bangla:টাঙ্গাইল:guest',
  'bd-tailor-bangla:টাঙ্গাইল:account',
  'bd-tailor-bangla:টাঙ্গাইল:redactorOnEcho',
  // The same for the village দক্ষিণপাড়া (its ক্ষ is unmapped), checked under
  // its PDF spelling দিণপাড়া instead.
  'bd-govt-application-bangla:দক্ষিণপাড়া:guest',
  'bd-govt-application-bangla:দক্ষিণপাড়া:account',
  'bd-govt-application-bangla:দক্ষিণপাড়া:redactorOnEcho',
  'bd-govt-application-bangla:দিণপাড়া:docxGuest',
]);

const SCENARIOS = ['guest', 'account', 'docxGuest', 'redactorOnEcho'];

let docxDir;
before(async () => {
  docxDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pii-corpus-test-'));
});
after(async () => {
  await fs.rm(docxDir, { recursive: true, force: true });
});

for (const [setName, set] of [['corpus', CORPUS], ['holdout', HOLDOUT], ['Bangladesh holdout', HOLDOUT_BD]]) {
  describe(`PII audit ${setName}`, () => {
    for (const entry of set) {
      it(`${entry.id} (${entry.career}, ${entry.country})`, async () => {
        const result = await auditEntry(entry, docxDir);

        for (const item of result.items) {
          for (const scenario of SCENARIOS) {
            const { status, left } = item[scenario];
            if (status === 'masked') continue;
            if (status === 'absent' && UNJUDGEABLE.has(`${entry.id}:${item.value}:${scenario}`)) continue;
            assert.fail(`${scenario}: ${item.cat} ${JSON.stringify(item.value)} was ${status}${left?.length ? ` (left: ${left.join(', ')})` : ''}`);
          }
        }

        for (const phrase of result.keep) {
          for (const scenario of ['guest', 'account']) {
            assert.equal(phrase[scenario], 'kept', `${scenario}: ${JSON.stringify(phrase.value)} was ${phrase[scenario]} (became ${JSON.stringify(phrase[`${scenario}Rewrite`] ?? '')})`);
          }
        }

        for (const scenario of ['guest', 'account']) {
          assert.deepEqual(result.unexplained[scenario], [], `${scenario}: masked text that is not personal`);
        }
      });
    }
  });
}
