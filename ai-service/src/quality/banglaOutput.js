/**
 * Module: quality/banglaOutput
 * Responsibility: Check whether a review actually honoured the Bangla output
 * contract, without needing a Bangla speaker.
 *
 * Asking for Bangla and getting it are different things, and the gap between
 * them fails in two directions that a human reader will not reliably catch by
 * eye across dozens of runs:
 *
 *   UNDER-TRANSLATION — the model ignores the directive and writes English
 *   prose anyway. Common with models that have thin Bengali training data; they
 *   comply for a sentence or two and drift back.
 *
 *   OVER-TRANSLATION — the model translates the fields that must stay English.
 *   This is the dangerous one. language_grammar.issues[].corrected is the text
 *   the candidate pastes into an English CV, and ATS keywords are matched
 *   literally against English job adverts. Bangla in either is worse than no
 *   feedback, and it looks like success: the page is more Bangla, not less.
 *
 * Both are decidable by script, because they are questions about which script a
 * field is written in, not about whether the writing is any good. Fluency still
 * needs a human — but a human should only be asked to judge output that has
 * already passed the contract.
 */

/** Bengali block. Matches any Bengali letter, digit or sign. */
const BENGALI = /[ঀ-৿]/;

export function hasBengali(value) {
  return typeof value === 'string' && BENGALI.test(value);
}

/**
 * Prose the user reads. These SHOULD be Bangla when bn was requested.
 * Each entry pulls the strings it is responsible for out of a review.
 */
const NARRATIVE = [
  ['formatting.feedback',        (r) => [r?.formatting?.feedback]],
  ['content_quality.feedback',   (r) => [r?.content_quality?.feedback]],
  ['language_grammar.feedback',  (r) => [r?.language_grammar?.feedback]],
  ['content_quality.strengths',  (r) => r?.content_quality?.strengths ?? []],
  ['content_quality.weaknesses', (r) => r?.content_quality?.weaknesses ?? []],
  ['formatting.issues[].issue',  (r) => (r?.formatting?.issues ?? []).map((i) => i?.issue)],
  ['formatting.issues[].suggestion', (r) => (r?.formatting?.issues ?? []).map((i) => i?.suggestion)],
  ['action_items',               (r) => r?.action_items ?? []],
  ['ats_analysis.ats_tips',      (r) => r?.ats_analysis?.ats_tips ?? []],
  ['job_match.recommendations',  (r) => r?.job_match?.recommendations ?? []],
];

/**
 * Fields that must stay English. Bengali appearing here is a contract
 * violation, and the reason each one is protected is in prompt/language.js.
 */
const PROTECTED = [
  ['language_grammar.issues[].original',  (r) => (r?.language_grammar?.issues ?? []).map((i) => i?.original)],
  ['language_grammar.issues[].corrected', (r) => (r?.language_grammar?.issues ?? []).map((i) => i?.corrected)],
  ['ats_analysis.keyword_hits',           (r) => r?.ats_analysis?.keyword_hits ?? []],
  ['ats_analysis.keyword_gaps',           (r) => r?.ats_analysis?.keyword_gaps ?? []],
  ['ats_analysis.heading_risks[].original',    (r) => (r?.ats_analysis?.heading_risks ?? []).map((h) => h?.original)],
  ['ats_analysis.heading_risks[].recommended', (r) => (r?.ats_analysis?.heading_risks ?? []).map((h) => h?.recommended)],
  ['ats_analysis.inferred_role',     (r) => [r?.ats_analysis?.inferred_role]],
  ['ats_analysis.inferred_industry', (r) => [r?.ats_analysis?.inferred_industry]],
  ['job_match.matched_keywords',     (r) => r?.job_match?.matched_keywords ?? []],
  ['job_match.missing_keywords',     (r) => (r?.job_match?.missing_keywords ?? []).map((m) => m?.keyword)],
];

function collect(review, spec) {
  return spec.flatMap(([label, pick]) =>
    (pick(review) ?? [])
      .filter((v) => typeof v === 'string' && v.trim())
      .map((value) => ({ label, value }))
  );
}

/**
 * @param {object} review a validated review object
 * @returns {{
 *   translated: number, translatable: number, coverage: number,
 *   missing: string[], violations: {field: string, value: string}[], ok: boolean
 * }}
 */
export function checkBanglaOutput(review) {
  const narrative = collect(review, NARRATIVE);
  const translated = narrative.filter((f) => hasBengali(f.value));

  // Reported by field rather than by string: "action_items is English" is
  // actionable, "17 strings are English" is not.
  const missing = [...new Set(
    narrative.filter((f) => !hasBengali(f.value)).map((f) => f.label)
  )];

  const violations = collect(review, PROTECTED)
    .filter((f) => hasBengali(f.value))
    .map((f) => ({ field: f.label, value: f.value.slice(0, 80) }));

  const translatable = narrative.length;

  return {
    translated: translated.length,
    translatable,
    coverage: translatable === 0 ? 0 : translated.length / translatable,
    missing,
    violations,
    // A single violation fails the run. Telling a candidate to paste Bangla
    // into an English CV is not a partial success.
    ok: violations.length === 0 && translatable > 0 && translated.length === translatable,
  };
}

/** One-line summary for a results table. */
export function summariseBanglaOutput(result) {
  const pct = Math.round(result.coverage * 100);
  if (result.translatable === 0) return 'no narrative fields to check';
  if (result.violations.length > 0) {
    return `FAIL — ${result.violations.length} protected field(s) translated, ${pct}% narrative Bangla`;
  }
  return result.ok ? `pass — 100% narrative Bangla` : `partial — ${pct}% narrative Bangla`;
}
