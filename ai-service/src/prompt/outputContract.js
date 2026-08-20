/**
 * Module: prompt/outputContract
 * Responsibility: The JSON output specification.
 *
 * Response shape is byte-identical to the previous prompt's, so no schema, route
 * or client work depends on this file. Three deliberate changes, all Phase 0
 * decisions:
 *
 *  - keyword_gaps and ats_tips have separate caps. Gaps are the actionable output
 *    and three was thin against a real advertisement; tips stay at three because
 *    beyond that they stop being prioritised advice.
 *  - The heading exclusion points at MARKET RULES generally, since headings are
 *    now protected per channel and employer rather than per market mode.
 *  - "Computer Skills" is no longer offered as an example worth flagging. It is a
 *    genuine Bangladeshi convention and is protected. "Computer Knowledge" stays
 *    flaggable because it is genuinely ambiguous.
 *
 * Compressed from the inherited version: repeated boilerplate and restated
 * rationale removed, since both cost instruction budget that adherence needs.
 */

import { ATS_GAP_CAP, ATS_TIP_CAP, SCORE_WEIGHTS, asPercent } from '../config/reviewConstants.js';

export const OUTPUT_CONTRACT_BLOCK = `OUTPUT
Return ONE valid JSON object and nothing else. Keys, in order: formatting,
content_quality, language_grammar, action_items, ats_analysis, job_match,
overall_score. No markdown fences, no commentary, no trailing commas, no NaN, no
extra keys. Be specific: quote the section needing work and supply a rewrite where
useful, subject to the privacy and evidence rules above.

1. formatting  {"score":0-100,"feedback":"","issues":[{"section":"","issue":"","suggestion":""}]}
Score visual and structural presentation.
Assess only what your evidence supports. If rendered pages are NOT available you
are reading extracted text: judge heading consistency, section order, chronology,
bullet construction and density, and NEVER claim to have seen fonts, margins,
colours, alignment, page balance or images. If rendered pages ARE available you may
also judge visible hierarchy, spacing, alignment and page balance.
A CGPA written X.XX/4.00 or X.XX/5.00 is correct; flag only a missing or wrong
denominator. Division and Class results are valid and are not missing GPAs.

2. content_quality  {"score":0-100,"feedback":"","strengths":[],"weaknesses":[]}
Score substance, relevance, specificity and targeting. Apply the stage, channel,
employer and sector rules. Never treat an optional local convention as required.
State any context you inferred here so the candidate can correct it.
Flag vague bullets only where they fail to convey action, scope, artefact, audience
or outcome. Never supply a number yourself.

3. language_grammar  {"score":0-100,"feedback":"","issues":[{"original":"","corrected":"","type":""}]}
Score grammar, clarity, spelling, tense, capitalisation and verb strength. Quote the
minimum phrase needed and redact personal information inside it.
Commonwealth spellings are CORRECT and must never be flagged. Flag inconsistent
mixing of varieties, never the valid variant.

4. action_items  string[]
Exactly 3-5 prioritised actions. Each references a specific section or identifiable
problem and states the immediate next step. No generic advice.

5. ats_analysis
{"inferred_role":"","inferred_industry":"","keyword_hits":[],"keyword_gaps":[],
 "heading_risks":[{"original":"","issue":"","recommended":""}],"ats_tips":[]}
- inferred_role: use the supplied target role, else most recent title, degree or
  objective. If genuinely ambiguous use a broad role family or "Unclear from
  supplied resume". Never invent specificity.
- keyword_hits: relevant terms actually present. Real keywords, not categories.
- keyword_gaps: up to ${ATS_GAP_CAP} material absent terms. With a job advertisement, derive
  them from it. Without one, only high-confidence role-family terms. Never imply the
  candidate should claim a skill they lack. Fewer is fine.
- heading_risks: only headings with a real parsing or meaning problem. Worth
  flagging: invented or misspelled headings, a heading whose contents contradict its
  name, duplicates, and "Curriculum Vitae" or "Resume Of" as a document title.
  EXCLUSION, which overrides this step: if the MARKET RULES above protect a heading
  for this channel and employer, omit it entirely. Not with an alternative, not as a
  low-risk note, not in any form. The exclusion covers only headings those rules
  name. Keep flagging every other problem heading, and never return an empty list
  merely because one was excluded.
- ats_tips: up to ${ATS_TIP_CAP} improvement ACTIONS, never observations about what the resume
  already does well, each referencing something specific in this resume.

6. job_match
Return null if no genuine job advertisement was supplied. Otherwise extract required
and preferred skills, qualifications, tools and keywords, compare each against
resume evidence, and classify: "matched" clearly supported; "partial" related
evidence but the term or depth is not explicit; "missing" no evidence.
Priority for missing: "high" mandatory, repeated or central; "medium" listed once as
a requirement; "low" preferred.
Never recommend adding a missing term as an existing skill. Recommend truthful
clarification, evidence gathering or skill development.
{"match_score":0-100,"matched_keywords":[],
 "partial_keywords":[{"resume_term":"","required_term":""}],
 "missing_keywords":[{"keyword":"","priority":"high"}],"recommendations":[]}
Exactly 3-5 recommendations, each tied to an observed gap.

7. overall_score  integer 0-100
Recalculated server-side as content_quality ${asPercent(SCORE_WEIGHTS.content)}% + language_grammar ${asPercent(SCORE_WEIGHTS.language)}% +
formatting ${asPercent(SCORE_WEIGHTS.formatting)}%. Give your best estimate consistent with the section scores.
job_match is NOT part of it.`;
