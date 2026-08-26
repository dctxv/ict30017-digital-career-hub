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
 * The same instruction, condensed, for the end of the USER message.
 *
 * The system-prompt block below is necessary but was not sufficient, and the
 * reason is positional rather than a matter of wording. It lands about 94% of
 * the way through a ~3,860 token system prompt — past the point this project
 * has already measured adherence falling off (see prompt/index.js: a bluntly
 * stated heading rule was ignored on five of six resumes at roughly 3,000
 * tokens) — and then the entire user message follows it: English framing,
 * English context block, an English resume. The last few thousand tokens before
 * generation all point at English, and one paragraph upstream loses that
 * argument. Observed in practice: a Bangla run came back with every model-
 * written field in English while the interface around it was fully translated.
 *
 * This restates the rule in the highest-recency position there is. It is
 * deliberately short — the detailed list of protected fields stays in the
 * system prompt, because repeating all of it here would spend instruction
 * budget the model needs for the review itself.
 *
 * It opens in Bangla on purpose. An instruction to write Bangla, written in
 * Bangla, is a stronger signal than the same sentence in English.
 */
const BANGLA_USER_REMINDER =
  'গুরুত্বপূর্ণ: নিচের রিভিউয়ের সব ব্যাখ্যা, পরামর্শ ও করণীয় বাংলায় লিখুন।\n' +
  'Write every feedback, issue, suggestion, strength, weakness, action_item and ' +
  'ats_tip value in Bangla. Keep JSON keys, all scores, the ' +
  'language_grammar.issues original/corrected quotes, ATS keyword lists and ' +
  'heading names in English exactly as specified above.';

/**
 * Line appended to the user message for a non-English review.
 *
 * @param {string} [language]
 * @returns {string|null} null when nothing should be appended
 */
export function languageReminder(language) {
  return language === 'bn' ? BANGLA_USER_REMINDER : null;
}

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
