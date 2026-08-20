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
 * Separate caps for the two ATS lists.
 *
 * They were one constant, capped at 3. Gaps are the actionable output and three
 * is thin against a real job advertisement, so gaps now allow 5. Tips stay at 3
 * because beyond that they stop being prioritised advice and become a list.
 *
 * ATS_LIST_CAP is retained as the tip cap so existing imports keep working.
 */
export const ATS_GAP_CAP = 5;
export const ATS_TIP_CAP = ATS_LIST_CAP;

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
  // Added after the 2026-08-20 Bangladesh market research pass. Each is an
  // established local convention that the candidate is right to use, and each
  // was previously being flagged as a non-standard heading.
  /^\s*career\s+summary\s*$/i,
  /^\s*professional\s+summary\s*$/i,
  /^\s*computer\s+skills?\s*$/i,
  /^\s*language\s+proficiency\s*$/i,
  /^\s*trainings?\s*$/i,
  /^\s*references?\s*$/i,
]);

/**
 * Headings that Bdjobs supplies as platform fields. Flagging these as invented
 * headings is a category error: the candidate did not choose them and cannot
 * change them.
 */
export const BDJOBS_PLATFORM_HEADINGS = Object.freeze([
  /^\s*specialisations?\s*$/i,
  /^\s*specializations?\s*$/i,
  /^\s*career\s+and\s+application\s+information\s*$/i,
  /^\s*employment\s+history\s*$/i,
  /^\s*academic\s+qualifications?\s*$/i,
  /^\s*photographs?\s*$/i,
]);

/**
 * Fields a government prescribed form mandates. A BCS or similar application
 * requires these, so recommending their removal would cause rejection.
 */
export const GOVERNMENT_FORM_HEADINGS = Object.freeze([
  /^\s*photographs?\s*$/i,
  /^\s*signatures?\s*$/i,
  /^\s*declarations?\s*$/i,
  /^\s*personal\s+(information|details|informations)\s*$/i,
  /^\s*father'?s?\s+name\s*$/i,
  /^\s*mother'?s?\s+name\s*$/i,
  /^\s*permanent\s+address\s*$/i,
  /^\s*present\s+address\s*$/i,
  /^\s*national\s+id(entity)?\s*(number)?\s*$/i,
]);

/**
 * Resolves the protected-heading matchers for a review context.
 *
 * This replaces a flat market-mode check. The old rule protected the same set for
 * every Bangladeshi review, which was wrong in both directions: it shielded
 * headings a multinational applicant genuinely should change, and it failed to
 * shield Bdjobs platform fields and government form fields the candidate does not
 * control.
 *
 * A multinational employer protects nothing. Flagging "Personal Information" is
 * exactly the advice that applicant needs.
 *
 * @param {{marketMode?: string, employerType?: string, applicationChannel?: string}} context
 * @returns {RegExp[]}
 */
export function resolveProtectedHeadings(context = {}) {
  const { marketMode = 'bangladesh', employerType, applicationChannel } = context;

  if (employerType === 'multinational' || marketMode === 'international') return [];

  const matchers = [...BANGLADESH_PROTECTED_HEADINGS];

  if (applicationChannel === 'bdjobs_profile') matchers.push(...BDJOBS_PLATFORM_HEADINGS);
  if (applicationChannel === 'government_form' || employerType === 'government') {
    matchers.push(...GOVERNMENT_FORM_HEADINGS);
  }

  return matchers;
}

/**
 * Fields a prescribed government application mandates.
 *
 * Live testing on 2026-08-20 showed the model recommending "Remove non-essential
 * personal details" on a government-form review, despite the channel module
 * stating those fields are required. Acting on that advice would get a BCS
 * application rejected outright, so this is not advice we can leave to prompt
 * compliance. Same reasoning as the protected headings: the prompt asks, the
 * server guarantees.
 */
const MANDATED_FIELD_TERMS =
  /father'?s?\s*name|mother'?s?\s*name|\bnid\b|national id|birth\s*certificate|blood group|religion|marital status|date of birth|\bdob\b|photograph|\bphoto\b|signature|declaration|permanent address|present address|nationality|\bquota\b/i;

// Verb stems rather than exact words: the model writes "omitting" and "removing"
// as often as "omit" and "remove", and an exact match silently lets those through.
const REMOVAL_ADVICE =
  /\bremov\w*\b|\bdelet\w*\b|\bomit\w*\b|\bexclud\w*\b|\bdrop\w*\b|take out|\bstrip\w*\b|should not (be )?(include|appear|listed)|avoid (including|listing)|unnecessary|not (relevant|needed|required|appropriate)|non-essential/i;

/**
 * True when this context mandates personal fields that a corporate CV would strip.
 *
 * @param {{applicationChannel?: string, employerType?: string}} context
 */
export function mandatesPersonalFields(context = {}) {
  return context.applicationChannel === 'government_form' || context.employerType === 'government';
}

/**
 * True when a piece of advice tells the candidate to remove a mandated field.
 * Both conditions must hold, so "your Declaration is undated" survives while
 * "remove the Declaration" does not.
 *
 * @param {string} text
 */
export function isMandatedFieldRemovalAdvice(text) {
  const s = String(text ?? '');
  return MANDATED_FIELD_TERMS.test(s) && REMOVAL_ADVICE.test(s);
}
