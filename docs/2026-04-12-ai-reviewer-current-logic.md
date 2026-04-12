# AI Reviewer Current Logic

**Date:** 12 April 2026

## Purpose

This document explains the current implementation of the AI resume reviewer in the repository, with a focus on how the resume score is produced.

## Files involved

- `ai-service/src/services/resumeReviewer.js`
- `ai-service/src/schemas/resumeSchema.js`
- `ai-service/src/utils/aiClient.js`
- `ai-service/tests/testResumeReviewer.js`

## High-level flow

The resume reviewer is implemented by `analyzeResume(resumeText)` in `ai-service/src/services/resumeReviewer.js`.

Current flow:

1. Validate that `resumeText` is not empty.
2. Create a Groq client with `getGroqClient()`.
3. Resolve the model name with `getModel()`.
4. Send the resume text to the model with a system prompt that describes the reviewer role and the required JSON structure.
5. Ask Groq to return a JSON object by using `response_format: { type: 'json_object' }`.
6. Read the model response from `response.choices[0]?.message?.content`.
7. Parse the returned JSON string with `JSON.parse(...)`.
8. Validate the parsed object with Zod using `ResumeReviewSchema`.
9. Return the validated object to the caller.

## How the score is currently calculated

The current code does **not** calculate the resume score with a formula, weighting system, or deterministic rules in JavaScript.

Instead:

- The **LLM chooses the scores**.
- The system prompt tells the model to return:
  - `overall_score` as an integer from 1 to 10
  - `formatting_feedback.score` as an integer from 1 to 10
  - `content_quality.score` as an integer from 1 to 10
  - `language_and_grammar.score` as an integer from 1 to 10
- The application code only checks that those values exist and are valid integers within range.

That means the current scoring logic is **prompt-driven, not code-driven**.

## What the prompt tells the model to consider

The system prompt in `resumeReviewer.js` frames the review around the Bangladesh job market and tells the model to consider things such as:

- presence of a clear objective or summary
- inclusion of CGPA-based academic results
- English-language resume expectations
- spelling consistency
- action-oriented bullet points with quantifiable achievements
- relevant technical and soft skills

The prompt also requires the output to be specific and actionable.

## Important detail: overall score is not derived in code

There is currently no code that:

- averages the three subsection scores
- applies weighted scoring
- checks section completeness and assigns points
- penalises missing fields with fixed deductions
- recalculates `overall_score` from other fields

So if the model returns:

```json
{
  "overall_score": 7,
  "formatting_feedback": { "score": 6 },
  "content_quality": { "score": 8 },
  "language_and_grammar": { "score": 7 }
}
```

the service accepts that as long as it matches the schema. It does not verify whether `7` is mathematically consistent with the subsection scores.

## Schema rules

The schema in `ai-service/src/schemas/resumeSchema.js` enforces:

- `overall_score`: integer from 1 to 10
- each section `score`: integer from 1 to 10
- `strengths`: array of strings
- `improvements`: array of strings
- `action_items`: array of 1 to 10 strings

This is structural validation only. It guarantees shape and score range, but it does not guarantee quality, consistency, or fairness of scoring.

## Model and API settings

The AI client currently uses:

- Groq SDK
- `process.env.GROQ_MODEL` if set
- otherwise `llama-3.3-70b-versatile`
- `temperature: 0.3` for more consistent output

These settings influence how stable the score feels, but they still do not turn the score into a deterministic calculation.

## Error handling

Current reviewer behavior:

- Empty resume text throws an error.
- Missing `GROQ_API_KEY` throws an error when creating the client.
- If Groq returns a `429` rate limit error, the function returns:
  - `error: "AI is currently busy, please try again in a minute."`
  - `code: "RATE_LIMIT"`
- Invalid JSON from the model throws an error.
- JSON that does not match the Zod schema throws an error.

## What the test file does

`ai-service/tests/testResumeReviewer.js` is a manual test script. It:

- loads three mock resumes from `ai-service/data/`
- runs `analyzeResume(...)` on each one
- prints:
  - overall score
  - formatting score
  - content quality score
  - language score
  - first three action items

The test script does not calculate scores either. It only displays what the model returned.

## Current limitation

The main limitation is that the score is only as reliable as the prompt and model behavior. Based on the existing test notes in `docs/2026-04-12-ai-v1-test-results.md`, the current reviewer tends to anchor different resumes to similar scores, which suggests the scoring is not yet discriminating enough.

## Bottom line

The current AI reviewer does **not** have a hard-coded scoring algorithm.

It works like this:

- the prompt defines the review criteria
- the model invents the scores within the requested range
- the app validates the JSON shape and numeric bounds
- the validated scores are returned as the final result

If you want a more explainable scoring system later, the next step would be to move some of this logic out of the prompt and into explicit code or a rubric-based post-processing layer.
