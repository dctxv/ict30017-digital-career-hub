/**
 * Single source of truth for the review tuning values that were previously
 * written out in more than one place at a time.
 *
 * Before this file existed the scoring weights lived in the SECTION 7 prompt
 * text, in recalculateScores(), and in the iteration log; the ATS list cap
 * lived in the prompt text, in resumeSchema.js, and in normalizeResponse();
 * and the completion parameters were spelled out separately in analyzeResume
 * and analyzeResumeStream. Each copy could drift independently, and because
 * the server-side value silently wins over the prompt, a drift produced no
 * visible symptom. Every consumer now imports from here instead.
 */

/**
 * Weighting applied to the section scores when overall_score is recalculated
 * server-side. Must sum to 1. Stated in the SECTION 7 prompt text by
 * interpolation, so the prompt and the maths cannot disagree.
 */
export const SCORE_WEIGHTS = Object.freeze({
  content:    0.45,
  language:   0.35,
  formatting: 0.20,
});

/**
 * Maximum entries kept for ats_analysis.keyword_gaps and ats_analysis.ats_tips.
 * Asked for in the prompt, validated in resumeSchema.js, and trimmed as a
 * backstop in normalizeResponse — changing one without the others used to
 * produce either a hard validation failure or a silent truncation.
 */
export const ATS_LIST_CAP = 3;

/**
 * Completion parameters shared by both call paths.
 *
 * max_tokens caps completion tokens only — the system prompt does not consume
 * it. The JSON repair layer (extractBalancedJSON, repairUnescapedQuotes,
 * repairJSON) exists because dense resumes push the JSON response past the old
 * 4096 ceiling, so the ceiling is 6144 from Iteration 7 onward. Unused budget
 * costs nothing; it is only billed when it is actually generated.
 */
export const AI_COMPLETION_PARAMS = Object.freeze({
  temperature:       0.1,
  frequency_penalty: 0.1,
  presence_penalty:  0.1,
  max_tokens:        6144,
});

/**
 * Injected into ats_analysis.standard by normalizeResponse. The model used to
 * be asked to echo this constant string on every response, which spent output
 * budget on a value the server already knows.
 */
export const ATS_STANDARD_LABEL = 'international/multinational ATS';

/**
 * 0.45 -> 45, for interpolating a weight into prompt text as a percentage.
 * Rounded rather than multiplied bare: the current weights survive `* 100`
 * intact, but many nearby values do not (0.29 * 100 === 28.999999999999996),
 * and a stray float artefact in the prompt would be shipped to the model.
 */
export const asPercent = (weight) => Math.round(weight * 100);

/**
 * Headings the Bangladesh market block protects, as matchers for the
 * server-side backstop in normalizeResponse.
 *
 * The prompt already forbids putting these in heading_risks, and live testing
 * showed it is not enough on its own: the model has a strong prior that
 * "Educational Qualification" is a non-standard heading and re-flags it on
 * roughly two thirds of Bangladeshi resumes, at both Iteration 6 and 7. Wording
 * changes moved the rate around but never reached zero.
 *
 * So this is enforced the same way the ATS list caps and the PII redaction are:
 * the prompt asks, and the server guarantees. Applies to Bangladesh mode only.
 * International mode is supposed to flag these headings and must not be filtered.
 */
export const BANGLADESH_PROTECTED_HEADINGS = Object.freeze([
  /^\s*(academic|educational)\s+qualifications?\s*$/i,
  /^\s*career\s+objectives?\s*$/i,
  /^\s*technical\s+skills?\s*$/i,
  /^\s*personal\s+(information|details|informations)\s*$/i,
  /^\s*declarations?\s*$/i,
]);
