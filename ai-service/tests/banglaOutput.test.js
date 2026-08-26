import test from 'node:test';
import assert from 'node:assert/strict';

import { hasBengali, checkBanglaOutput, summariseBanglaOutput } from '../src/quality/banglaOutput.js';

/** A review that honours the contract: Bangla prose, English protected fields. */
function goodReview() {
  return {
    formatting: {
      feedback: 'রিজিউমের গঠন স্পষ্ট।',
      issues: [{ issue: 'LinkedIn ঠিকানা নেই', suggestion: 'আপনার LinkedIn যোগ করুন' }],
    },
    content_quality: {
      feedback: 'শিক্ষাগত যোগ্যতা মজবুত।',
      strengths: ['প্রাসঙ্গিক ডিগ্রি রয়েছে'],
      weaknesses: ['পরিমাপযোগ্য অর্জন নেই'],
    },
    language_grammar: {
      feedback: 'সাধারণভাবে পড়ার উপযোগী।',
      issues: [{
        original: 'Responsible for handling maintenance',
        corrected: 'Spearheaded maintenance operations for a 12-unit complex',
        type: 'দুর্বল অ্যাকশন ভার্ব',
      }],
    },
    action_items: ['অভিজ্ঞতার অংশে দুটি পদ যোগ করুন'],
    ats_analysis: {
      inferred_role: 'Electrical Engineer',
      inferred_industry: 'Power & Energy',
      keyword_hits: ['AutoCAD', 'Power Systems'],
      keyword_gaps: ['SCADA', 'PLC Programming'],
      heading_risks: [{ original: 'Computer Knowledge', recommended: 'Technical Skills' }],
      ats_tips: ['Technical Skills অংশে SCADA যোগ করুন'],
    },
  };
}

test('hasBengali', async (t) => {
  await t.test('detects Bengali script', () => assert.equal(hasBengali('বাংলা'), true));
  await t.test('does not fire on English', () => assert.equal(hasBengali('Financial Analyst'), false));
  await t.test('fires on mixed text, since that is still Bangla output', () =>
    assert.equal(hasBengali('Technical Skills অংশে যোগ করুন'), true));
  await t.test('tolerates a non-string', () => assert.equal(hasBengali(undefined), false));
});

test('checkBanglaOutput', async (t) => {
  await t.test('passes a review that honours the contract', () => {
    const r = checkBanglaOutput(goodReview());
    assert.equal(r.ok, true, `missing: ${r.missing}, violations: ${JSON.stringify(r.violations)}`);
    assert.deepEqual(r.violations, []);
    assert.equal(r.coverage, 1);
  });

  await t.test('catches under-translation — model ignored the directive', () => {
    const review = goodReview();
    review.action_items = ['Add two real job roles with dates.'];
    const r = checkBanglaOutput(review);
    assert.equal(r.ok, false);
    assert.ok(r.missing.includes('action_items'));
    assert.ok(r.coverage < 1);
  });

  await t.test('catches over-translation of the CV correction — the dangerous one', () => {
    const review = goodReview();
    // Telling a candidate to paste Bangla into an English CV.
    review.language_grammar.issues[0].corrected = 'একটি ১২-ইউনিট কমপ্লেক্সের রক্ষণাবেক্ষণ পরিচালনা করেছি';
    const r = checkBanglaOutput(review);
    assert.equal(r.ok, false);
    assert.equal(r.violations.length, 1);
    assert.equal(r.violations[0].field, 'language_grammar.issues[].corrected');
  });

  await t.test('catches translated ATS keywords, which stop matching job adverts', () => {
    const review = goodReview();
    review.ats_analysis.keyword_gaps = ['স্কাডা', 'পিএলসি প্রোগ্রামিং'];
    const r = checkBanglaOutput(review);
    assert.equal(r.violations.length, 2);
    assert.equal(r.ok, false);
  });

  await t.test('a single violation fails the run even at full coverage', () => {
    const review = goodReview();
    review.ats_analysis.inferred_role = 'বৈদ্যুতিক প্রকৌশলী';
    const r = checkBanglaOutput(review);
    assert.equal(r.coverage, 1);
    assert.equal(r.ok, false);
  });

  await t.test('an all-English review reports zero coverage rather than throwing', () => {
    const r = checkBanglaOutput({
      formatting: { feedback: 'The resume has a clear structure.' },
      action_items: ['Add two real job roles.'],
    });
    assert.equal(r.coverage, 0);
    assert.equal(r.ok, false);
  });

  await t.test('survives a partial or malformed review', () => {
    assert.doesNotThrow(() => checkBanglaOutput({}));
    assert.doesNotThrow(() => checkBanglaOutput(null));
  });
});

test('summariseBanglaOutput leads with the violation, not the percentage', () => {
  const review = goodReview();
  review.ats_analysis.keyword_hits = ['অটোক্যাড'];
  assert.match(summariseBanglaOutput(checkBanglaOutput(review)), /^FAIL/);
  assert.match(summariseBanglaOutput(checkBanglaOutput(goodReview())), /^pass/);
});
