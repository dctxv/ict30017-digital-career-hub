import { z } from 'zod';

const ImprovementItem = z.object({
  level: z.enum(['critical', 'important', 'polish']),
  head: z.string(),
  detail: z.string(),
});

const FeedbackSection = z.object({
  score: z.number().int().min(1).max(10).describe('Quality score out of 10'),
  strengths: z.array(z.string()).describe('What the candidate did well in this area'),
  improvements: z.array(ImprovementItem).describe('Specific, actionable improvements needed'),
});

export const ResumeReviewSchema = z.object({
  overall_score: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe('Overall resume quality score out of 10'),

  overall_summary: z
    .string()
    .describe('1-2 sentence summary of the most critical area to address first'),

  formatting_feedback: FeedbackSection.describe(
    'Feedback on layout, visual structure, section ordering, and consistency'
  ),

  content_quality: FeedbackSection.describe(
    'Feedback on the substance of experience, achievements, and projects'
  ),

  language_and_grammar: FeedbackSection.describe(
    'Feedback on grammar, spelling, word choice, and professional tone'
  ),

  skills_keywords: FeedbackSection.describe(
    'Feedback on skills relevance, ATS keyword alignment, and target-role match for the BD job market'
  ),
});
