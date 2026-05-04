# Resume Review V2 — Integration Reflection

**Date:** 2026-05-04  
**Session:** Integrating new prompt, Zod schema, scoring logic, and UI into existing resume review feature

---

## What changed and why

### 1. Scoring scale: 1–10 → 0–100

**Old:** All section scores and overall_score were integers from 1 to 10.  
**New:** 0–100 across the board.

**Why I made this choice:** The 0–100 scale is what the prompt explicitly specifies. More importantly, it gives the AI more granular room to differentiate resumes that are "okay-ish" — a resume scoring 5/10 could mean anywhere from barely acceptable to almost good. 52/100 is more precise.

**Trade-off I considered:** The old UI was tuned for 1–10 (color thresholds, band labels, score ring math). I had to update all of those. It was tempting to just scale the 0–100 value to 1–10 on the frontend to avoid the UI work — but that would be dishonest to the user and would also lose precision in the badge and ring animations. I updated the UI instead.

**Where this touched:** `scoreColorClass`, `sectionHeaderClass`, `bandLabel`, `ScoreRing` (offset calculation now divides by 100, not 10), `ScoreBadge` (now shows `{score}` not `{score}/10`).

---

### 2. Section structure: flat improvements → typed per-section

**Old schema (all sections shared the same shape):**
```
{ score, strengths[], improvements[{ level, head, detail }] }
```

**New schema (each section has its own shape):**
- `formatting`: `{ score, feedback, issues[{ section, issue, suggestion }] }`
- `content_quality`: `{ score, feedback, strengths[], weaknesses[] }`
- `language_grammar`: `{ score, feedback, issues[{ original, corrected, type }] }`

**Why I made this choice:** The old "improvements" model tried to be universal — every section used the same `{level, head, detail}` structure. That worked for generic feedback but was a bad fit for language errors (which naturally have an "original → corrected" structure) and for formatting issues (which have a "section header" identity). The new schema forces the AI to express feedback in the structure that matches what it's actually saying. Language issues are genuinely different from content weaknesses — treating them identically was information loss.

**Alternative I considered:** Keeping the old improvements array and adding optional fields (`original`, `corrected`, `section`) to a shared schema. I rejected this because it would produce a messy, always-partially-populated structure that's harder to render cleanly and harder for the AI to follow consistently.

**Component impact:** I completely replaced `SectionCard` + `ImprovementItem` with a shell `SectionCard` (title + score badge only) and three separate body components: `ContentBody`, `FormattingBody`, `LanguageBody`. Each knows its own data shape.

---

### 3. New sections: action_items, ats_analysis, job_match

**Old:** 4 sections (content, language, formatting, skills/keywords — bundled together).  
**New:** 7 distinct outputs, two of which are entirely new concepts.

**action_items** — I chose to render this as a numbered list in its own card rather than folding it into the overall summary. The old `overall_summary` was a single 1–2 sentence string that showed under the score ring. The new `action_items` is an array of specific, section-referenced tasks. Surfacing them in a dedicated card gives the user a clear "to-do list" they can actually act on without scrolling through every section first.

**ats_analysis** — This is the biggest new addition. It has its own `ats_score` (calculated server-side, not by the AI), inferred role/industry, keyword hits, keyword gaps, heading risks, and 3 tips. I rendered keyword hits as green chips and gaps as red chips because the visual contrast immediately tells the user what they have vs. what they're missing. The `ats_score` is added by `recalculateScores()` before Zod validation, so the schema has it as optional — the AI never provides it, but the server always will.

**job_match** — This is the premium-tier output. The prompt says return `null` if no job ad is provided. I made this nullable in the Zod schema (`JobMatchSchema.nullable()`). On the frontend, the Job Match nav pill only appears when `feedback.job_match != null`. This way the UI is identical for free and premium users except premium users see an extra section.

**Why I removed skills_keywords as a separate section:** The old schema had a `skills_keywords` section alongside `ats_analysis`. This was redundant — ATS keyword analysis IS skills/keywords analysis, just structured properly. Having both would have split the same feedback across two cards. I collapsed it into `ats_analysis`.

---

### 4. Score recalculation on the server

**Old:** `calculateOverallScore()` ran inside `normalizeResponse()` with weights: content 40% + language 30% + formatting 15% + skills 15%.

**New:** `recalculateScores()` runs three calculations:
- `overall_score` = content 45% + language 35% + formatting 20% (skills removed from formula since it's absorbed into ATS)
- `ats_score` = keyword coverage 70% + heading safety 30% (calculated from keyword_hits, keyword_gaps, heading_risks arrays)
- `match_score` = (matched + partial×0.5) / total × 100 (only when job_match is not null)

**Why server-side:** The AI provides its own estimates for these scores, but we override them. This prevents the AI from being inconsistent — it might give a 70/100 ATS score even though it only found 2 keyword hits vs 8 gaps. The server math is deterministic and based on the actual data the AI returned.

**Choice I almost made:** I considered not recalculating at all and just trusting the AI's scores. I rejected this because the AI has shown (in testing with the old schema) that it tends to score generously and inconsistently. Server-side recalculation also makes the scoring explainable — users and other devs can look at the formula and understand where the number came from.

---

### 5. Message builders: free vs premium

**Old:** One `buildUserMessage()` that appended jobRole and jobAd to a single template.

**New:** One function that branches internally:
- If `jobAd` is provided → "premium" format (resume + `---JOB ADVERTISEMENT---` block)
- If only `jobRole` → append role note to the free message
- Neither → minimal free message

**Why this matters:** The system prompt tells the AI to return `null` for `job_match` if no job ad is provided. If we accidentally include a `---JOB ADVERTISEMENT---` header with no content, the AI might still try to run the job_match section. Keeping the message builder explicit prevents that.

**Alternative:** Using a separate `buildPremiumUserMessage()` and `buildFreeUserMessage()` as standalone exports. I kept them as internal branches of one function because the call site (both `analyzeResume` and `analyzeResumeStream`) only needs to call one function, and the distinction is determined by whether `jobAd` is truthy — not by a mode flag.

---

### 6. Normalization simplification

**Old:** `normalizeResponse()` had three helper functions (`normalizeImprovement`, `normalizeSection`, `normalizeResponse`) to handle the many ways the AI might return improvements — as strings, objects with `error/correction`, objects with `issue/fix`, nested arrays in `strengths`, etc.

**New:** `normalizeResponse()` just calls `recalculateScores()` and ensures `job_match` defaults to `null`. No shape-fixing needed.

**Why:** The new system prompt is more explicit and structured. Each section has its own clearly defined return shape and the AI has less room to deviate. If the AI does return a badly-shaped response, Zod will catch it and throw a descriptive error — which is better than silently normalizing garbage into something that looks valid.

**Risk I accepted:** If the AI occasionally returns a section with extra fields (e.g. includes both `improvements` and `issues`), Zod will strip unknown fields by default. This is fine.

---

### 7. Frontend: nav pills now include ATS and conditional Job Match

**Old nav:** Overall · Content · Language · Format · Skills  
**New nav:** Overall · Content · Language · Format · Actions · ATS · [Job Match — only when job_match is not null]

The conditional nav pill was a deliberate choice. Showing a "Job Match" nav pill that scrolls to an empty section would confuse users on the free tier. The check `feedback?.job_match != null` determines whether that pill and card appear at all.

---

## What I would do differently next time

1. **Add a `version` field to the schema** so the frontend and backend can gracefully handle schema mismatches during deployment. If the AI service is updated but the frontend isn't yet (or vice versa), the `version` field would let the frontend know which rendering path to use.

2. **Test streaming with the larger schema.** The new response is significantly bigger than the old one (7 sections vs 4, plus ATS and job_match arrays). `partial-json` on the frontend should handle progressive rendering, but large nested structures with many arrays can trip up partial JSON parsers if the AI returns keys in an unexpected order. This should be verified in testing.

3. **Consider caching ATS analysis separately.** The ATS analysis (inferred role, keyword hits/gaps) is relatively stable — if a user re-analyses the same resume with a different job ad, the ATS section won't change. A future optimization would be to cache the ATS result per resume hash and only re-run the job_match section on re-analysis with a new job ad.
