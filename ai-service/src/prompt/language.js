/**
 * Module: prompt/language
 * Responsibility: Ask for the review's prose in Bangla without letting the
 * translation touch anything the interface or the user's CV depends on.
 *
 * The homepage has promised Bangla AI feedback since launch, and until now the
 * resume reviewer had no language parameter at all: the chatbot honoured the
 * toggle and the review silently did not.
 *
 * The reason this is a prompt directive rather than a translation step over the
 * finished JSON is the shape of that JSON. language_grammar.issues[] holds
 * {original, corrected} — a quote from the candidate's English CV and the
 * English text they should replace it with, rendered in the UI as
 * "original → corrected". Push the response through a bulk translator and the
 * tool starts telling people to paste Bangla into an English CV, which is worse
 * advice than none. The same applies to ATS keywords and heading names, which
 * are matched literally against English job adverts. Those are per-field
 * decisions the model can make while writing and a translator structurally
 * cannot.
 *
 * Kept deliberately short. Live testing on 2026-08-20 showed adherence falling
 * as the prompt grows, so this block states the rule, names the exceptions, and
 * stops. Scores are recalculated server side in normalizeResponse regardless of
 * what the model returns, so Bangla prose cannot corrupt the scoring.
 */

const BANGLA_OUTPUT_BLOCK = `OUTPUT LANGUAGE
Write all prose in Bangla (বাংলা): every "feedback", "issue", "suggestion",
"strengths", "weaknesses", "action_items", "ats_tips" and "recommendations"
value. Keep technical terms, platform names, company names, job titles and
qualification names in English where a Bangladeshi job seeker would normally
write them (CV, ATS, Bdjobs, HSC, IELTS, AutoCAD).

Leave these in English exactly as you would for an English review:
- every JSON key, and every numeric score
- language_grammar.issues[].original and .corrected — these quote the CV and
  give the replacement text the candidate will paste back into an English
  document, so Bangla there would be actively wrong
- ats_analysis.keyword_hits, keyword_gaps, and the original / recommended
  heading names, plus job_match keyword lists — these are matched literally
  against English job adverts and applicant tracking systems
- ats_analysis.inferred_role, inferred_industry and standard
- the "priority" and "type" enum values`;

/**
 * Appends the output-language directive when a non-English review is requested.
 *
 * Composed onto the finished system prompt rather than built into
 * buildSystemPrompt, so the golden snapshots of the module composition stay
 * exactly as they were.
 *
 * @param {string} systemPrompt
 * @param {string} [language] 'bn' for Bangla; anything else leaves the prompt alone
 * @returns {string}
 */
export function withOutputLanguage(systemPrompt, language) {
  if (language !== 'bn') return systemPrompt;
  return `${systemPrompt}\n\n---\n\n${BANGLA_OUTPUT_BLOCK}`;
}

export { BANGLA_OUTPUT_BLOCK };
