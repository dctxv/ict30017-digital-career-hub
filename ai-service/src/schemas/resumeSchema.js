import { z } from 'zod';

// Coerce scores to integers — the AI sometimes returns floats like 72.5
const Score = z.number().min(0).max(100).transform(Math.round);

const FormattingIssueSchema = z.object({
  section:    z.string(),
  issue:      z.string(),
  suggestion: z.string(),
});

const FormattingSchema = z.object({
  score:    Score,
  feedback: z.string(),
  issues:   z.array(FormattingIssueSchema),
});

const ContentQualitySchema = z.object({
  score:      Score,
  feedback:   z.string(),
  strengths:  z.array(z.string()),
  weaknesses: z.array(z.string()),
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
  keyword_gaps:      z.array(z.string()).max(3).optional(),
  heading_risks:     z.array(ATSHeadingRiskSchema).optional(),
  ats_tips:          z.array(z.string()).max(3).optional(),
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
