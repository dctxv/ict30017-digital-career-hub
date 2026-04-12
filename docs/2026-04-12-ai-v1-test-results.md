# AI Service v1 — Test Results

**Date:** 12 April 2026
**Author:** Clay (AI Lead)

## Overview

Today I ran the first end-to-end test of the `ai-service` resume reviewer against the three mock Bangladeshi resumes. The goal was not to ship anything, but to see how the prompts behave with real model output before I build on top of them. This document is an honest record of what I observed, what I am happy with, and what I need to fix in the next iteration.

## How I tested

I configured my Groq API key in `.env` and ran the test script:

```bash
npm run test:resume
```

The model used was `llama-3.3-70b-versatile` via Groq. I read every response in full rather than just checking for schema validity, because I wanted to evaluate the *quality* of the output, not just the fact that the JSON parsed.

## What went well

### Schema validation never failed

Across all three test runs, Zod never rejected a response. The combination of `response_format: { type: 'json_object' }` and a strict schema description in the system prompt is reliably producing parseable, well-shaped JSON. This was the part I was most worried about going in, so it is a relief that it just works.

### Output structure is clean and readable

The test runner now prints each category score alongside strengths and improvements, followed by a numbered priority action list. It is easy to read at a glance and gives a clear picture of where a resume stands.

## What needs improvement

### 1. The resume reviewer is anchoring every resume to 7/10

This is my biggest concern. I tested three very different resumes — a fresh BUET CS graduate, an MBA marketing professional with mid-career experience, and a civil engineer with field experience — and every single one came back with an overall score of 7/10. The sub-scores barely moved either. That is not the AI being generous; that is the AI refusing to discriminate between candidates, which makes the whole score meaningless.

I think the fix is to add explicit scoring anchors in the system prompt. Something like:

- 1-3 = unreadable or missing major sections
- 4-6 = typical amateur resume, needs significant work
- 7-8 = polished, professional, would pass initial screening
- 9-10 = exceptional, reserved for outstanding candidates

And then a forced distribution note: *most resumes should score in the 4-6 range*. I want to see the fresh grad score a 5 and the marketing professional score a 7, not both of them get the same number.

### 2. The action items are generic and could apply to any resume

Reading back the feedback, I noticed that items like "add quantifiable results", "standardise date formatting", and "add a professional summary" appeared across all three resumes with only minor wording changes. None of the feedback actually quoted anything from the specific resume being reviewed. That tells me the AI is essentially producing boilerplate and is not being forced to engage with the actual content in front of it.

The fix is to add a rule to the system prompt: *For each improvement, you must quote the exact phrase from the resume you are criticising.* That should force the model to ground its feedback in the real text, and if it cannot quote something specific, the feedback probably was not worth giving.

### 3. The AI recommended "right-align dates" on a plain-text resume

This one made me laugh but it is actually a real issue. The model suggested visual formatting changes like right-aligning dates, which is impossible to evaluate from a plain-text input. The AI is hallucinating about a visual layout it cannot see. I need to add a line to the system prompt that says the input is plain text only and that feedback should not reference visual formatting that cannot be determined from text.

## The mock resumes themselves are not Bangladeshi enough

Separate from the AI prompt issues, I realised while testing that my three mock resumes are not accurate representations of real Bangladesh CVs. They are too "Western" in format. Specifically, they are missing things that would be standard on a real Bangladeshi resume:

- **Father's Name and Mother's Name** — still expected on most local CVs, especially for traditional firms and public sector
- **Permanent address and present address as separate fields** — Bangladeshi employers commonly ask for both
- **SSC results** — I included HSC but skipped the Secondary School Certificate, which is always listed
- **Passport photo placeholder** — real resumes have a photo in the top right corner, and while this does not translate to plain text, I should at least note it in the mock data
- **Expected salary field** — many BDjobs applications require this
- **Computer Skills section listing MS Office** — almost universally present on Bangladeshi resumes, even for senior roles where it is obviously redundant
- **Religion and marital status** — controversial, but still commonly included
- **Division/First Class notation alongside CGPA** — older academic results are often phrased this way

The IT resume in particular reads like a Silicon Valley junior developer, not a BUET graduate applying for their first job in Dhaka. I want to rewrite all three resumes to be more representative, and I want to add a fourth deliberately weak resume so the reviewer has a clear low-end example to grade against.

## Priority list for the next iteration

1. **Fix the prompts first, keep the same test data.** If I rewrite the resumes at the same time as the prompts, I will not be able to tell which change caused which improvement. I want to see the scoring anchors break the 7/10 ceiling on the *current* resumes before I touch the data.
2. **Rewrite the three mock resumes** with authentic Bangladesh conventions, and add a fourth weak resume as a low-end reference point.
3. **Write a simple regression snapshot** — once I am happy with the prompts, I want to save a "known good" output for each test case so I can tell when future prompt tweaks accidentally break something.

## Summary

The first version of the resume reviewer runs end-to-end without crashing, and the JSON validation is solid. The scoring is flat and the feedback is generic — both are prompt problems, not architecture problems, so they are fixable without touching the service code. I am going to fix the prompts first, then rewrite the mock resumes, then run the same tests again and compare.
