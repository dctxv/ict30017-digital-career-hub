import { z } from 'zod';
import { ATS_LIST_CAP, ATS_GAP_CAP } from '../config/reviewConstants.js';

// Coerce scores to integers — the AI sometimes returns floats like 72.5
const Score = z.number().min(0).max(100).transform(Math.round);

/*
 * Verbatim lines from the resume, used to place an issue on the preview.
 * Optional and forgiving: a quote the model got wrong costs one highlight, not
 * the review, so bad entries are dropped rather than failing validation.
 */
const Quote = z.string().transform((value) => value.trim()).pipe(z.string().max(300));
const QuoteList = z.array(z.unknown()).optional().transform((list) => (list ?? [])
  .filter((item) => typeof item === 'string' && item.trim().length >= 2)
  .map((item) => item.trim().slice(0, 300))
  .slice(0, 4));

const FormattingIssueSchema = z.object({
  section:    z.string(),
  issue:      z.string(),
  suggestion: z.string(),
  quotes:     QuoteList,
});

const FormattingSchema = z.object({
  score:    Score,
  feedback: z.string(),
  issues:   z.array(FormattingIssueSchema),
});

const WeakBulletSchema = z.object({
  quote:      Quote,
  issue:      z.string(),
  suggestion: z.string().optional().default(''),
});

const ContentQualitySchema = z.object({
  score:      Score,
  feedback:   z.string(),
  strengths:  z.array(z.string()),
  weaknesses: z.array(z.string()),
  // Each entry validated on its own, so one malformed bullet is dropped rather
  // than failing the whole section.
  weak_bullets: z.array(z.unknown()).optional().transform((list) => (list ?? [])
    .map((item) => WeakBulletSchema.safeParse(item))
    .filter((result) => result.success && result.data.quote.length >= 2)
    .map((result) => result.data)
    .slice(0, 5)),
});

const LanguageIssueSchema = z.object({
  original:  z.string(),
  corrected: z.string(),
  type:      z.string(),
});

const LanguageGrammarSchema = z.object({
  score:    Score,
  feedback: z.string(),
  issues:   z.array(LanguageIssueSchema),
});

const ATSHeadingRiskSchema = z.object({
  original:    z.string(),
  issue:       z.string(),
  recommended: z.string(),
});

const ATSAnalysisSchema = z.object({
  inferred_role:     z.string().optional(),
  inferred_industry: z.string().optional(),
  keyword_hits:      z.array(z.string()).optional(),
  keyword_gaps:      z.array(z.string()).max(ATS_GAP_CAP).optional(),
  heading_risks:     z.array(ATSHeadingRiskSchema).optional(),
  ats_tips:          z.array(z.string()).max(ATS_LIST_CAP).optional(),
  standard:          z.string().optional(),
  ats_score:         z.number().optional(),
});

const MissingKeywordSchema = z.object({
  keyword:  z.string(),
  priority: z.enum(['high', 'medium', 'low']),
});

const PartialKeywordSchema = z.object({
  resume_term:   z.string(),
  required_term: z.string(),
});

const JobMatchSchema = z.object({
  match_score:       Score,
  matched_keywords:  z.array(z.string()),
  partial_keywords:  z.array(PartialKeywordSchema),
  missing_keywords:  z.array(MissingKeywordSchema),
  // The AI sometimes returns 2 recommendations — don't hard-fail on count
  recommendations:   z.array(z.string()).min(1),
});

export const ReviewResponseSchema = z.object({
  formatting:       FormattingSchema.nullable().optional(),
  content_quality:  ContentQualitySchema.nullable().optional(),
  language_grammar: LanguageGrammarSchema.nullable().optional(),
  action_items:     z.array(z.string()).nullable().optional(),
  // ats_analysis and job_match may be absent if the response was truncated
  ats_analysis:     ATSAnalysisSchema.optional(),
  job_match:        JobMatchSchema.nullable().optional(),
  overall_score:    Score,
});
