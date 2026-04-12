import { getGroqClient, getModel } from '../utils/aiClient.js';
import { ResumeReviewSchema } from '../schemas/resumeSchema.js';

const SYSTEM_PROMPT = `You are an expert career consultant and resume reviewer specialising in the Bangladesh job market.
Your role is to critically evaluate resumes for job seekers in Bangladesh â€” including sectors such as IT/software, RMG, banking, NGOs, civil engineering, and business.

Context you must understand:
- Bangladeshi employers typically expect a clear objective/summary section.
- CGPA-based academic results (out of 4.00 or 5.00) are standard and must be included.
- Most corporate job applications in Bangladesh require English-language resumes.
- Spelling consistency between British English (preferred in Bangladesh) and American English matters.
- Action-oriented bullet points with quantifiable achievements (numbers, percentages) are strongly preferred.
- Skills sections should list both technical and soft skills relevant to the local market.

Your output MUST be a single, valid JSON object with NO additional text, explanation, or markdown formatting around it.
The JSON must strictly follow this structure:
{
  "overall_score": <integer 1-10>,
  "formatting_feedback": {
    "score": <integer 1-10>,
    "strengths": [<string>, ...],
    "improvements": [<string>, ...]
  },
  "content_quality": {
    "score": <integer 1-10>,
    "strengths": [<string>, ...],
    "improvements": [<string>, ...]
  },
  "language_and_grammar": {
    "score": <integer 1-10>,
    "strengths": [<string>, ...],
    "improvements": [<string>, ...]
  },
  "action_items": [<string>, ...]
}

Be specific and actionable. Do NOT give vague feedback like "improve your resume".
Instead say exactly what to change and why it matters for Bangladeshi employers.`;

export async function analyzeResume(resumeText) {
  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('Resume text cannot be empty.');
  }

  const client = getGroqClient();
  const model = getModel();

  let rawContent;
  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Please review the following resume and return your feedback as a JSON object:\n\n---\n${resumeText}\n---`,
        },
      ],
    });

    rawContent = response.choices[0]?.message?.content;

    if (!rawContent) {
      throw new Error('AI returned an empty response.');
    }
  } catch (err) {
    if (err?.status === 429 || err?.message?.includes('429')) {
      return {
        error: 'AI is currently busy, please try again in a minute.',
        code: 'RATE_LIMIT',
      };
    }
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error(`AI returned invalid JSON: ${rawContent}`);
  }

  const result = ResumeReviewSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `AI response did not match expected schema: ${result.error.message}`
    );
  }

  return result.data;
}
