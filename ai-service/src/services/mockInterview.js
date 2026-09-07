/**
 * Module: services/mockInterview
 * Responsibility: Generate a five-question practice interview, and mark the
 * answers to it.
 *
 * Two calls per complete interview, and that is the whole shape of the design.
 * A turn-by-turn implementation is twelve calls or more and would exhaust the
 * free-tier daily cap during a single client demonstration; one call for the
 * questions and one for the transcript produces the same thing the user sees for
 * roughly six times the headroom. Text in and text out — voice was ruled out on
 * the call, because bilingual delivery would need Bengali speech models, a
 * separate API and a budget that does not exist.
 *
 * THE INTERVIEW RUNS STANDALONE
 *
 * A candidate with no resume and no advertisement still gets an interview. What
 * they do not get is one grounded in their own history, and they are told that
 * AFTER their results rather than being stopped at the door — a feature that
 * refuses to start until three things are supplied is a feature nobody reaches.
 * The tiers are in resolveTier below.
 *
 * The failure mode that would make the whole thing untrustworthy is tier 1
 * inventing a candidate. The prompt forbids it (prompt/interview.js) and
 * stripUnevidencedClaims below enforces it, on the same doctrine as the
 * reviewer's protected-heading backstop: the prompt asks, the server guarantees.
 */

import { requestJson } from '../utils/completion.js';
import {
  InterviewQuestionsSchema,
  InterviewEvaluationSchema,
} from '../schemas/preparationSchema.js';
import {
  buildQuestionPrompt,
  buildEvaluationPrompt,
  withInterviewLanguage,
  interviewLanguageReminder,
} from '../prompt/interview.js';
import { normaliseGapList, renderGapBlock } from './gapEngine.js';
import {
  INTERVIEW_QUESTION_COUNT,
  INTERVIEW_COMPLETION_PARAMS,
  INTERVIEW_MIX,
  JOB_AD_MAX_CHARS,
  ANSWER_MAX_CHARS,
  ROLE_MAX_CHARS,
} from '../config/preparationConstants.js';

/**
 * Which tier this interview is running at.
 *
 * 1  role and stage only     generic questions for the role, no claims about them
 * 2  resume                  questions grounded in real history
 * 3  resume and advertisement fully targeted, and the gap analysis is a real
 *                            comparison rather than an inference
 *
 * A job advertisement without a resume is still tier 1: there is a role to
 * target but still nothing known about the candidate, and the tier-1 constraint
 * is about the candidate, not the role.
 *
 * @param {{hasResume: boolean, hasJobAd: boolean}} input
 * @returns {1|2|3}
 */
export function resolveTier({ hasResume, hasJobAd }) {
  if (!hasResume) return 1;
  return hasJobAd ? 3 : 2;
}

/**
 * Strips claims about a candidate the model was shown nothing about.
 *
 * At tier 1 there is no resume, so "Based on your experience in supply chain,
 * how would you..." is fabrication regardless of how natural it reads — and it
 * reads very natural, which is why the prompt alone is not enough. The pattern
 * is the single most common opening in interview text, so the model reaches for
 * it even under an explicit prohibition.
 *
 * Rewriting rather than dropping, because dropping leaves four questions and
 * five is the shape of the feature. Each substitution removes only the clause
 * making the claim; the question itself is untouched and still asks what it
 * asked. Anything not matched is left alone — a guess at what a sentence meant
 * would be worse than the sentence.
 *
 * @param {string} text
 * @returns {{text: string, changed: boolean}}
 */
export function stripUnevidencedClaims(text) {
  const original = String(text ?? '');
  if (!original) return { text: original, changed: false };

  const CLAIMS = [
    // "Based on your experience in supply chain, ..." — the qualifier belongs to
    // the claim, so the clause goes as far as the comma that closes it. Bounded,
    // because with no comma at all this would swallow the question itself.
    /\b(?:based\s+on|given|from|considering|looking\s+at)\s+your\s+(?:resume|cv|background|experience|profile|history)\b[^,.?!]{0,80},\s*/gi,
    // The same opener with nothing closing it. Only the claim itself goes.
    /\b(?:based\s+on|given|from|considering|looking\s+at)\s+your\s+(?:resume|cv|background|experience|profile|history)\b\s*/gi,
    /\byour\s+(?:resume|cv|profile)\s+(?:shows|suggests|indicates|mentions|lists|says)\b[^.?!]*[.,;]\s*/gi,
    /\b(?:with|during)\s+your\s+(?:time|work|role|experience)\s+at\s+[^,.?!]+[,.]\s*/gi,
    /\byour\s+background\s+(?:in|as|with)\b[^.?!]*[.,;]\s*/gi,
    // The same three shapes in Bangla, which a Bangla interview reaches for
    // just as readily: "আপনার অভিজ্ঞতার ভিত্তিতে, ..." (based on your
    // experience), "আপনার রিজিউমে অনুযায়ী ..." (according to your resume) and
    // "আপনার সিভিতে দেখা যাচ্ছে যে ..." (your CV shows that). The danda (।)
    // bounds a clause the way a full stop does in English.
    /আপনার\s+(?:পূর্ববর্তী\s+|আগের\s+|পূর্ব\s+)?(?:অভিজ্ঞতা|রিজিউমে|রিজিউম|রেজুমে|সিভি|ব্যাকগ্রাউন্ড|প্রোফাইল|কর্মজীবন|পটভূমি)(?:র|য়|টি|টির)?\s+(?:ভিত্তিতে|অনুযায়ী|অনুসারে|বিবেচনায়|মতে|থেকে\s+দেখা\s+যায়|থেকে|দেখে)[^,।?!]{0,80},\s*/g,
    /আপনার\s+(?:পূর্ববর্তী\s+|আগের\s+|পূর্ব\s+)?(?:অভিজ্ঞতা|রিজিউমে|রিজিউম|রেজুমে|সিভি|ব্যাকগ্রাউন্ড|প্রোফাইল|কর্মজীবন|পটভূমি)(?:র|য়|টি|টির)?\s+(?:ভিত্তিতে|অনুযায়ী|অনুসারে|বিবেচনায়|মতে)\s*/g,
    /আপনার\s+(?:রিজিউমে|রিজিউম|রেজুমে|সিভি|প্রোফাইল)(?:তে|য়|র)?\s+(?:দেখা\s+যা(?:য়|চ্ছে)|উল্লেখ\s+(?:আছে|করা\s+হয়েছে|রয়েছে)|বলা\s+হয়েছে)\s*(?:যে\s*)?[^।?!]*[।,;]\s*/g,
  ];

  let next = original;
  for (const pattern of CLAIMS) next = next.replace(pattern, '');

  next = next.replace(/\s{2,}/g, ' ').trim();
  // The removed clause was usually the sentence opener, so the question now
  // starts lowercase.
  if (next) next = next[0].toUpperCase() + next.slice(1);

  const changed = next !== original;
  if (changed && !next) {
    // The claim WAS the whole question. Nothing honest is left to salvage, so
    // the original stands and the caller's warning is the record of it — an
    // empty question on screen is a worse outcome than an over-familiar one.
    return { text: original, changed: false };
  }

  return { text: next, changed };
}

/**
 * Renders the profile facts as a delimited block for either prompt.
 *
 * Three fields, all optional, because the profile page makes all three
 * optional. Returns null rather than an empty block when none is set, so the
 * prompt composer can leave the profile guidance out entirely — a block that
 * says "a profile was supplied" above nothing would be an instruction to use
 * facts that do not exist.
 *
 * @param {{discipline?: string|null, institution?: string|null, graduationYear?: number|string|null}} [profile]
 * @returns {string|null}
 */
export function renderProfileBlock(profile) {
  if (!profile || typeof profile !== 'object') return null;

  const lines = [];
  const text = (value, max) => (typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null);

  const discipline = text(profile.discipline, 100);
  const institution = text(profile.institution, 150);
  const year = Number.parseInt(profile.graduationYear, 10);

  if (discipline) lines.push(`Discipline: ${discipline}`);
  if (institution) lines.push(`Institution: ${institution}`);
  if (Number.isInteger(year) && year > 1950 && year < 2100) lines.push(`Graduation year: ${year}`);

  if (lines.length === 0) return null;
  return `<CANDIDATE_PROFILE>\n${lines.join('\n')}\n</CANDIDATE_PROFILE>`;
}

/** Applies the tier-1 guarantee across a generated question set. */
function enforceTierOneEvidence(questions) {
  let rewritten = 0;

  const cleaned = questions.map((item) => {
    const question = stripUnevidencedClaims(item.question);
    const why = stripUnevidencedClaims(item.why);
    if (question.changed || why.changed) rewritten++;
    return { ...item, question: question.text, why: why.text };
  });

  if (rewritten > 0) {
    console.warn(
      `[interview] Rewrote ${rewritten} tier-1 question(s) that claimed knowledge of the `
      + 'candidate. No resume was supplied; the prompt forbids this and the model did it anyway.'
    );
  }

  return cleaned;
}

/**
 * Repairs the question mix without spending a second call.
 *
 * The count is guaranteed by the schema; the mix is not, and the model
 * occasionally returns three behavioural questions or labels the gap-targeted
 * one "role_specific". Only the label is corrected, never the question — the
 * kind drives a chip on the screen and the ordering, and a mislabelled good
 * question is a cosmetic problem while a regenerated set costs the user a call
 * from their daily allowance.
 *
 * targets_gap_key is dropped where it names a gap that was not supplied. The
 * interface links that key back to the gap board, and a link to a gap the user
 * does not have is a dead end.
 */
function reconcileQuestionMix(questions, knownGapKeys) {
  const allowed = new Set(knownGapKeys);

  const withKeys = questions.map((item) => {
    const key = item.targets_gap_key;
    const valid = typeof key === 'string' && allowed.has(key);
    if (key && !valid) {
      console.warn(`[interview] Question ${item.index} targeted an unknown gap key "${key}"; unlinking it.`);
    }
    return { ...item, targets_gap_key: valid ? key : null };
  });

  const gapTargeted = withKeys.filter((item) => item.targets_gap_key);
  const expected = allowed.size > 0 ? INTERVIEW_MIX.gap_targeted : 0;

  return withKeys.map((item) => {
    if (item.targets_gap_key) {
      return { ...item, kind: 'gap_targeted' };
    }
    // Labelled gap_targeted with nothing behind it. It is a real question about
    // the role, so it is relabelled rather than discarded.
    if (item.kind === 'gap_targeted') return { ...item, kind: 'role_specific' };
    return item;
  }).map((item, index, all) => {
    // More gap-targeted questions than the mix allows: keep the first, demote
    // the rest. Five questions all aimed at weaknesses is an interrogation.
    if (item.kind !== 'gap_targeted') return item;
    const position = gapTargeted.findIndex((q) => q.index === item.index);
    if (position < expected) return item;
    void all;
    return { ...item, kind: 'role_specific', targets_gap_key: null };
  });
}

/**
 * Generates the five questions.
 *
 * @param {object} input
 * @param {string} [input.targetRole]
 * @param {string} [input.candidateStage]
 * @param {string} [input.resumeText] sanitised resume text; never stored anywhere
 * @param {string} [input.jobAd]
 * @param {Array<object>} [input.knownGaps] open gaps already on file for this user
 * @param {object} [input.profile] discipline, institution and graduation year from the account
 * @param {'en'|'bn'} [input.language]
 * @param {'free'|'premium'} [input.tier]
 * @returns {Promise<{ok: true, tier: number, questions: Array<object>, inferredRole: string,
 *                    focus: string, model: string}
 *                  |{ok: false, code: string, error: string}>}
 */
export async function generateInterviewQuestions({
  targetRole,
  candidateStage,
  resumeText,
  jobAd,
  knownGaps = [],
  profile = null,
  language = 'en',
  tier = 'free',
} = {}) {
  const hasResume = typeof resumeText === 'string' && resumeText.trim().length > 0;
  const hasJobAd = typeof jobAd === 'string' && jobAd.trim().length > 0;
  const gapBlock = renderGapBlock(knownGaps);
  const profileBlock = renderProfileBlock(profile);
  const level = resolveTier({ hasResume, hasJobAd });

  const systemPrompt = withInterviewLanguage(
    buildQuestionPrompt({
      tier: level, hasJobAd, hasGaps: Boolean(gapBlock), hasProfile: Boolean(profileBlock),
    }),
    language,
  );

  const parts = [];
  const role = typeof targetRole === 'string' ? targetRole.slice(0, ROLE_MAX_CHARS).trim() : '';
  if (role) parts.push(`Target role: ${role}`);
  if (candidateStage && candidateStage !== 'unknown') parts.push(`Career stage: ${candidateStage}`);
  if (profileBlock) parts.push(profileBlock);
  if (hasResume) parts.push(`<RESUME>\n${resumeText}\n</RESUME>`);
  if (hasJobAd) parts.push(`<JOB_ADVERTISEMENT>\n${jobAd.slice(0, JOB_AD_MAX_CHARS)}\n</JOB_ADVERTISEMENT>`);
  if (gapBlock) parts.push(gapBlock);

  const reminder = interviewLanguageReminder(language);
  if (reminder) parts.push(reminder);

  const result = await requestJson({
    label: 'interview',
    systemPrompt,
    userMessage:
      `Write ${INTERVIEW_QUESTION_COUNT} practice interview questions for this candidate.\n\n${parts.join('\n\n')}`,
    schema: InterviewQuestionsSchema,
    tier,
    params: INTERVIEW_COMPLETION_PARAMS,
    language,
  });

  if (!result.ok) return result;

  const knownGapKeys = knownGaps.map((gap) => gap?.gap_key).filter(Boolean);
  let questions = reconcileQuestionMix(result.data.questions, knownGapKeys);
  if (level === 1) questions = enforceTierOneEvidence(questions);

  // Re-indexed rather than trusted. The schema pins the count and the range, not
  // that the model numbered them 1..5 without repeating one, and the index is
  // what the answers are matched back against on submission.
  questions = questions
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((item, i) => ({ ...item, index: i + 1 }));

  console.log(
    `[interview] tier=${level} questions=${questions.length}`
    + ` gapTargeted=${questions.filter((q) => q.kind === 'gap_targeted').length}`
    + ` language=${language}`
  );

  return {
    ok: true,
    tier: level,
    questions,
    inferredRole: result.data.inferred_role || role || '',
    focus: result.data.focus ?? '',
    model: result.model,
  };
}

/**
 * Marks a completed transcript and emits the gaps it revealed.
 *
 * The questions come back from the caller rather than being regenerated, because
 * regenerating them would produce a different five and mark answers against
 * questions nobody was asked.
 *
 * @param {object} input
 * @param {Array<{index: number, kind: string, question: string, targets_gap_key: string|null}>} input.questions
 * @param {Array<{index: number, answer: string}>} input.answers
 * @param {number} [input.tierLevel] the tier the questions were generated at
 * @param {string} [input.targetRole]
 * @param {string} [input.candidateStage]
 * @param {string} [input.jobAd]
 * @param {object} [input.profile] the same profile facts the questions were written against
 * @param {'en'|'bn'} [input.language]
 * @param {'free'|'premium'} [input.tier]
 * @returns {Promise<{ok: true, evaluation: object, gaps: Array<object>, model: string}
 *                  |{ok: false, code: string, error: string}>}
 */
export async function evaluateInterview({
  questions = [],
  answers = [],
  tierLevel = 1,
  targetRole,
  candidateStage,
  jobAd,
  profile = null,
  language = 'en',
  tier = 'free',
} = {}) {
  if (questions.length === 0) {
    throw new Error('An interview cannot be evaluated without its questions.');
  }

  const byIndex = new Map(answers.map((entry) => [Number(entry?.index), entry?.answer ?? '']));

  const transcript = questions
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((question) => {
      const answer = String(byIndex.get(Number(question.index)) ?? '').slice(0, ANSWER_MAX_CHARS).trim();
      return [
        `Q${question.index} [${question.kind}]: ${question.question}`,
        // Said explicitly rather than left as an empty line. A blank answer and a
        // missing one look identical in a transcript, and the prompt has a
        // different rule for each.
        `A${question.index}: ${answer || '(the candidate left this blank)'}`,
      ].join('\n');
    })
    .join('\n\n');

  const profileBlock = renderProfileBlock(profile);
  const systemPrompt = withInterviewLanguage(
    buildEvaluationPrompt({ tier: tierLevel, hasProfile: Boolean(profileBlock) }),
    language,
  );

  const parts = [];
  const role = typeof targetRole === 'string' ? targetRole.slice(0, ROLE_MAX_CHARS).trim() : '';
  if (role) parts.push(`Target role: ${role}`);
  if (candidateStage && candidateStage !== 'unknown') parts.push(`Career stage: ${candidateStage}`);
  if (profileBlock) parts.push(profileBlock);
  parts.push(`<TRANSCRIPT>\n${transcript}\n</TRANSCRIPT>`);
  if (typeof jobAd === 'string' && jobAd.trim()) {
    parts.push(`<JOB_ADVERTISEMENT>\n${jobAd.slice(0, JOB_AD_MAX_CHARS)}\n</JOB_ADVERTISEMENT>`);
  }

  const reminder = interviewLanguageReminder(language);
  if (reminder) parts.push(reminder);

  const result = await requestJson({
    label: 'interview-eval',
    systemPrompt,
    userMessage: `Assess this practice interview.\n\n${parts.join('\n\n')}`,
    schema: InterviewEvaluationSchema,
    tier,
    params: INTERVIEW_COMPLETION_PARAMS,
    language,
  });

  if (!result.ok) return result;

  const gaps = normaliseGapList(result.data.gaps);

  // One entry per question asked, in order, whatever the model returned. A hole
  // here renders as a missing card beside a question the user definitely
  // answered, which reads as their answer having been lost.
  const scored = new Map(result.data.per_question.map((entry) => [Number(entry.index), entry]));
  const perQuestion = questions
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((question) => scored.get(Number(question.index)) ?? {
      index: question.index,
      score: 0,
      verdict: '',
      strengths: [],
      improvements: [],
      stronger_answer: '',
    });

  const missing = perQuestion.filter((entry) => !entry.verdict && entry.score === 0).length;
  console.log(
    `[interview-eval] tier=${tierLevel} score=${result.data.overall_score}`
    + ` gaps=${gaps.length} unscored=${missing} language=${language}`
  );

  return {
    ok: true,
    evaluation: {
      overall_score: result.data.overall_score,
      summary: result.data.summary,
      per_question: perQuestion,
    },
    gaps,
    model: result.model,
  };
}
