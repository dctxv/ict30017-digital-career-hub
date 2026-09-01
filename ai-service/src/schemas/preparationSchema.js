import { z } from 'zod';
import {
  GAP_CATEGORIES,
  GAP_SEVERITIES,
  GAP_CLOSEABLE,
  GAP_CAP,
  INTERVIEW_QUESTION_COUNT,
  INTERVIEW_QUESTION_KINDS,
} from '../config/preparationConstants.js';

/**
 * Validation for the two preparation responses and the gaps they carry.
 *
 * The permissiveness here is deliberate and matches the reviewer's schema. A
 * response that is 90% right should reach the user; a schema that rejects the
 * whole interview because the model wrote one enum in title case throws away
 * work the user has already spent five answers on and cannot get back without
 * spending another two calls from their daily allowance.
 *
 * So: enums are lowercased before they are matched, scores are coerced to
 * integers, and everything the interface can render an absence of is optional.
 * What is NOT permissive is gap_key — a gap with an unusable key is dropped by
 * normaliseGapKey rather than stored, because a gap that cannot be matched
 * against the next analysis is a row that can never close.
 */

const Score = z.number().min(0).max(100).transform(Math.round);

/** Enum matching that survives "Skill", "SKILL" and " skill ". */
const looseEnum = (values) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z.enum(values)
  );

const RemediationSchema = z.object({
  steps: z.array(z.string()).default([]),
  // Never a URL. The server resolves this against the resources table; see
  // prompt/gaps.js for why the model is not asked for links.
  resource_query: z.string().default(''),
  effort: z.string().default(''),
});

export const GapSchema = z.object({
  gap_key: z.string().min(1),
  category: looseEnum(GAP_CATEGORIES),
  description: z.string().min(1),
  severity: looseEnum(GAP_SEVERITIES),
  closeable: looseEnum(GAP_CLOSEABLE),
  // A gap with no remediation is an observation, not a plan, but it is still a
  // true observation — defaulted rather than rejected.
  remediation: RemediationSchema.default({ steps: [], resource_query: '', effort: '' }),
  alternative_role: z.string().nullable().optional(),
});

export const GapListSchema = z.array(GapSchema).max(GAP_CAP);

/* ── Questions ──────────────────────────────────────────────────────────── */

const QuestionSchema = z.object({
  index: z.number().int().min(1).max(INTERVIEW_QUESTION_COUNT),
  kind: looseEnum(INTERVIEW_QUESTION_KINDS),
  question: z.string().min(1),
  why: z.string().default(''),
  targets_gap_key: z.string().nullable().optional(),
});

export const InterviewQuestionsSchema = z.object({
  // Length is checked here rather than repaired: five questions is the whole
  // shape of the feature, and a set of three is not a shorter interview, it is a
  // broken one. The caller retries or reports rather than presenting it.
  questions: z.array(QuestionSchema).length(INTERVIEW_QUESTION_COUNT),
  inferred_role: z.string().default(''),
  focus: z.string().default(''),
});

/* ── Evaluation ─────────────────────────────────────────────────────────── */

const PerQuestionSchema = z.object({
  index: z.number().int().min(1),
  score: Score,
  verdict: z.string().default(''),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
  stronger_answer: z.string().default(''),
});

export const InterviewEvaluationSchema = z.object({
  overall_score: Score,
  summary: z.string().default(''),
  // Not length-checked, unlike the questions. A missing per-question entry costs
  // one card on the results screen; the overall score, the summary and the gaps
  // are all still usable, and the caller fills the hole rather than discarding
  // the rest.
  per_question: z.array(PerQuestionSchema).default([]),
  gaps: GapListSchema.default([]),
});
