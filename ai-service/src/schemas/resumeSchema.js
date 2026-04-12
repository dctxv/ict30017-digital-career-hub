import { z } from 'zod';

const FeedbackSection = z.object({
  score: z.number().int().min(1).max(10).describe('Quality score out of 10'),
  strengths: z.array(z.string()).describe('What the candidate did well in this area'),
  improvements: z.array(z.string()).describe('Specific, actionable improvements needed'),
});

export const ResumeReviewSchema = z.object({
  overall_score: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe('Overall resume quality score out of 10'),

  formatting_feedback: FeedbackSection.describe(
    'Feedback on layout, visual structure, section ordering, and consistency'
  ),

  content_quality: FeedbackSection.describe(
    'Feedback on the substance of experience, achievements, and projects'
  ),

  language_and_grammar: FeedbackSection.describe(
    'Feedback on grammar, spelling, word choice, and professional tone'
  ),

  action_items: z
    .array(z.string())
    .min(1)
    .max(10)
    .describe(
      'Prioritised list of the most impactful changes the candidate should make immediately'
    ),
});
