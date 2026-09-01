/**
 * Module: prompt/gaps
 * Responsibility: The Gap output contract, written once and used by both things
 * that produce gaps.
 *
 * The resume review and the mock interview find the same kinds of shortfall by
 * different routes, so they emit the same structure. Stating the contract twice
 * would let the two drift, and a drifted contract here is not a cosmetic
 * problem: gaps from the two sources are stored in one table keyed on gap_key,
 * so if the interview keys a Python gap `skills:python` while the review keys it
 * `skill:python`, the profile shows two open gaps forever and can never close
 * either.
 *
 * Two things are deliberately NOT asked of the model:
 *
 *  - A URL. It has no browsing tool and would invent plausible ones, and a
 *    remediation step pointing at a page that does not exist is worse than no
 *    link at all. It returns a search term instead, and the server resolves that
 *    against the resources table — real rows, real links, and the Career
 *    Resources page finally has a functional role in the product.
 *  - A timestamp or a status. Both belong to the store, which knows when it
 *    first saw a gap and whether the user has dismissed it. The model sees one
 *    analysis and has no way to know either.
 */

import { GAP_CAP, EVIDENCE_SECTIONS } from '../config/preparationConstants.js';

export const GAP_CONTRACT_BLOCK = `GAP OUTPUT

A gap is something the candidate is missing for the role in question, plus how
they close it. Return at most ${GAP_CAP}, ordered most important first. Fewer is
correct when fewer are real — never pad the list.

{"gap_key":"","category":"","description":"","severity":"","closeable":"",
 "remediation":{"steps":[],"resource_query":"","effort":""},"alternative_role":null}

category, exactly one of:
- "skill"      a learnable capability the evidence does not support
- "credential" a named qualification or certification they do not hold
- "evidence"   they have done it, and the resume or the answer does not show it
- "experience" depth or years they cannot acquire in the short term

Do not force a gap into "skill" because it is the easiest to advise on. Most
candidates have more evidence gaps than skill gaps, and telling someone to learn
something they already do is the fastest way to lose their trust.

gap_key: "category:subject", lowercase, hyphenated, English, no spaces.
- skill      the normalised skill name        skill:python, skill:sql, skill:financial-modelling
- credential the normalised credential name   credential:aws-saa, credential:ielts, credential:cma
- evidence   the section it belongs to        evidence:work-experience, evidence:projects
             sections: ${EVIDENCE_SECTIONS.join(', ')}
- experience the requirement type             experience:years-senior, experience:team-leadership
The key is an identifier, not a sentence. The SAME gap must produce the SAME key
on a later analysis, because that is how the candidate is shown closing it — so
key on the subject, never on the wording. Keep it English even when the prose is
Bangla.

description: one or two plain sentences naming what is missing. No key, no
jargon, no restating the category.

severity:
- "blocking"    they will not be shortlisted for this role without it
- "significant" it materially weakens the application
- "minor"       worth fixing, not decisive

closeable:
- "now"            days, and entirely within their control — rewrites, evidence
- "months"         a course, a certification, a project
- "not_short_term" experience or seniority

remediation.steps: 2-4 concrete actions, each one they could start this week.
For "evidence" this is rewrite guidance: say which section, what to add and what
a stronger line contains. Never write the finished bullet for them and never
supply a metric — ask for the truthful figure.
For "credential" name the body, the indicative time and the indicative cost in
BDT so they can judge whether it is worth pursuing for this role.
For "experience" be honest. Do not describe a way to appear more senior.

remediation.resource_query: 2-4 English words naming the subject to learn, for
looking up learning material — "financial modelling", "sql joins". Empty string
when nothing would be learned. Never a URL, a site name or a course title.

remediation.effort: a short realistic span, e.g. "an afternoon", "about 6 weeks
of evening study", "9-12 months". It MUST agree with "closeable": days or a
couple of weeks is "now", a few months is "months", a year or more is
"not_short_term". The two sit next to each other on screen and a card reading
"takes a few months" above "roughly 1-2 weeks" is visibly self-contradictory.

alternative_role: null except on an "experience" gap, where it names the adjacent
role they ARE competitive for now. A tool that tells everyone they can reach any
role is worthless; the adjacent role is the useful answer. Use a real, common
Bangladeshi job title.`;

/**
 * The Bangla rule for gap text, which is not the same rule the review uses.
 *
 * The prose is translated and the key is not, for the same reason the review
 * keeps ATS keywords in English: gap_key is matched literally against the row
 * stored from the previous analysis. Translate it and every gap a user has
 * closed reopens the moment they switch language, which reads as the progress
 * view being broken.
 *
 * resource_query stays English too. It is matched against the resources table,
 * whose titles are stored in both languages but whose subject terms are English.
 */
export const GAP_LANGUAGE_BLOCK = `GAP OUTPUT LANGUAGE
Write "description", every "steps" entry, "effort" and "alternative_role" in
Bangla (বাংলা), keeping technical terms, tool names, qualification names and job
titles in English where a Bangladeshi job seeker would normally write them.
Leave in English exactly as written: every JSON key, "gap_key",
"resource_query", and the "category", "severity" and "closeable" enum values.
gap_key is an identifier matched against the candidate's earlier analyses — a
translated key loses their recorded progress.`;
