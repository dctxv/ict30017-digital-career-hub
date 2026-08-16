# Resume Reviewer System Prompt Iteration Log


| Field   | Value                                            |
| ------- | ------------------------------------------------ |
| Project | P83 Digital Career Hub                           |
| Author  | Darius Clay Tan Yi (AI Lead)                     |
| Feature | AI Resume Reviewer                               |
| Sprints | 1 to 3                                           |
| Model   | Resolved per tier from `server/.env` — see below |

Iterations 0 to 4 were developed against GPT-4o-mini. That family is now banned
as a production model by client decision (May 2026 feasibility report) and is
rejected at startup and on every model resolution, so the scores recorded
against those iterations are not reproducible on the current configuration.
From Iteration 5 onward the model is resolved per tier via `AI_MODEL_FREE` and
`AI_MODEL_PREMIUM` in `ai-service/src/utils/aiClient.js`.

Prompt snapshots for individual iterations are archived in
`prompt_iterations/`.


## Iteration 0 - Baseline Prompt

The initial system prompt defined the AI as a "Bangladesh job market expert" with a JSON output schema covering:

- `overall_score`
- `formatting_feedback`
- `content_quality`
- `language_and_grammar`
- `action_items`

### Problems Identified

- No scoring methodology. Scores were arbitrary with no weighting or calibration.
- No detection rules. Topics were mentioned, but GPT had no instructions on what to do when issues were found.
- No action item prioritisation.
- No sector inference or keyword validation.
- No score range definitions. It was unclear what a `3` versus `7` meant.

## Iteration 1 - Research-Driven Prompt

This version integrated findings from Bangladesh job market research into explicit detection rules.

### Key Additions

- Weighted scoring formula:
  - Content 45%
  - Language 35%
  - Formatting 20%
- Baseline-of-5 additive/deductive model.
- Score range definitions:
  - `1-3`: critical
  - `4-6`: average
  - `7-8`: competitive
  - `9-10`: exemplary
- Explicit penalties for:
  - personal details
  - photos
  - missing CGPA denominators
  - cliche objectives
  - weak verbs
  - dialect mixing
- 3-tier action item priority:
  - ATS failures
  - content gaps
  - language polish
- Sector keyword taxonomy:
  - IT
  - RMG
  - Banking
  - NGO
  - Civil Engineering

### Problem Identified

- The prompt became heavily research-driven, and not all rules were confirmed by the client.
- Personal details were treated as hard penalties rather than recommendations.
- Sector keyword lists added about 200 tokens for marginal benefit, since GPT already knows common sector skills.

## Iteration 2 - Client-Grounded Prompt

This version rebuilt the prompt using only client-confirmed requirements from:

- meeting notes (Week 2 and Week 4)
- the project proposal (`FR-06` through `FR-09`)
- the AI Architecture document (Section 6)

### Key Changes

- Personal details were reframed as an educational recommendation rather than a penalty, respecting the client's position that Bangladeshi conventions differ from Western norms.
- "Quote the actual section and provide a suggested rewrite" was added from Architecture doc Section 6.1.
- Sector keyword lists were removed because GPT's existing knowledge was considered sufficient, avoiding unvalidated hardcoding.
- Soft skills were explicitly validated as relevant to Bangladeshi corporate culture, based on the project proposal.
- Token count was reduced from about `850` to about `650`.

### Test Result

Sample Resume 1: `Md. Rahat Hossain` (`IT/CSE`)

- Scores:
  - Overall: `5`
  - Formatting: `6`
  - Content: `4`
  - Language: `7`
- CGPA detection worked correctly because denominators were present and flagged as a strength.
- Action items were specific and included CAR-style examples.

### Gaps Found

- Formatting score was inflated. A score of `6` was too high for a resume with:
  - Declaration
  - full References
  - no LinkedIn
  - legacy headings
- Declaration section was not flagged.
- "Computer Knowledge" heading was not flagged.
- Missing LinkedIn URL was not caught.
- GPT only evaluated sections that existed, not sections that were absent.

## Iteration 3 - Legacy Convention Detection

A dedicated "Legacy Sections and Outdated Conventions" block was added to address the gaps found in testing.

### Key Additions

- Declaration sections flagged for removal.
- Reference sections changed to "References available upon request".
- Outdated headings mapped as follows:
  - "Computer Knowledge" -> "Technical Skills"
  - "Educational Qualification" -> "Education"
  - "Curriculum Vitae" / "Resume Of" -> candidate's name
- LinkedIn URL added as a recommendation.
- Missing section detection added to flag absent Experience, Projects, or Internships as content gaps.

### Test Result

Sample Resume 1: re-run

- Scores:
  - Overall: `5`
  - Formatting: `4`
  - Content: `3`
  - Language: `8`
- All previously missed issues were caught.
- Formatting score dropped from `6` to `4`, which was more accurate.
- Content score dropped from `4` to `3`, correctly penalising missing Experience and Projects.

### Test Result

Sample Resume 2: `Nusrat Jahan` (`Marketing/MBA`)

- Scores:
  - Overall: `5`
  - Formatting: `6`
  - Content: `4`
  - Language: `7`
- CAR rewrites were provided for both:
  - Unilever internship
  - Sales Executive roles
- Formatting was still inflated at `6` despite `5+` legacy conventions.
- HSC and SSC missing denominators were not flagged because GPT assumed all entries were correct after seeing the university entries.
- "Internet & Email Communication" as a skill was not flagged.
- "Good command" was only flagged for grammar, not as a weak descriptor.
- Experience durations such as "3 months" were not flagged for missing date ranges.

## Iteration 4 - Scoring Calibration and Per-Entry Checks

This version targeted recurring test failures.

Archived prompt: `prompt_iterations/iteration_04_resumeReviewer.js`
(commit `1f110fd`, 2026-04-14).

### Key Additions

- CGPA rule updated to check every academic entry individually, preventing GPT from assuming all entries were correct if only some were.
- British English check updated with the same per-entry enforcement.
- Experience date range rule added to distinguish:
  - "3 months" as a duration
  - "Jan 2023 - Mar 2023" as a proper date range
- Obsolete skills such as "Internet", "Email Communication", and basic "MS Office" are flagged with role-relevant replacements.
- Vague language proficiency descriptors such as "Good command" are replaced with clearer options like:
  - "Fluent"
  - "Professional working proficiency"
  - test scores
- Formatting score ceiling added so that `3+` legacy conventions cap formatting at a maximum of `4`.

### Test Result

Sample Resume 2: re-run

- Scores:
  - Overall: `5`
  - Formatting: `3`
  - Content: `5`
  - Language: `5`
- Every previously missed issue was caught.
- HSC and SSC denominators flagged.
- "Internet & Email Communication" flagged.
- "Good command" upgraded to "Proficient".
- Date ranges flagged.
- "Utilize" -> "utilise" caught.
- Formatting calibration rule worked, reducing the formatting score from `6` to `3`.

### Remaining Observation

- Category-level scores still show some variance across runs, such as language moving from `7` to `5` on the same resume.
- This appears to happen because GPT categorises feedback into different JSON nodes inconsistently.
- The overall score remains stable because the weighted average absorbs that variance.
- Temperature is set to `0.3`, which is an appropriate balance between consistency and natural variation.
- This is not a prompt-fix issue. It is inherent to LLM non-determinism.

## Iteration 5 - Resume Review V2

Commit `f7968c4` (2026-05-04), with a follow-up schema correction in `0e88ed5`.

Iterations 0 to 4 shared one output contract: five keys, scored 1 to 10, with
every section shaped as `strengths` plus `improvements`. That contract could
not carry ATS or job-advertisement feedback, both of which the client had asked
for, so the prompt and the schema were rewritten together.

### Key Changes

- Scoring scale moved from 1 to 10 to 0 to 100. The 1-to-10 band definitions
  were dropped; the weighting stayed at content 45%, language 35%,
  formatting 20%.
- Sections became individually typed rather than a shared strengths and
  improvements pair:
  - `formatting`: `issues[{ section, issue, suggestion }]`
  - `content_quality`: `strengths[]` and `weaknesses[]`
  - `language_grammar`: `issues[{ original, corrected, type }]`
- Two new sections were added:
  - `ats_analysis` — inferred role and industry, keyword hits, keyword gaps,
    heading risks, and improvement tips.
  - `job_match` — only populated when a job advertisement is supplied,
    otherwise null. Classifies each requirement as matched, partial, or
    missing, and assigns a priority to each missing keyword.
- Two keys were renamed: `formatting_feedback` to `formatting`, and
  `language_and_grammar` to `language_grammar`. The old names are still
  accepted as aliases in `normalizeResponse`, because the model occasionally
  reverts to them.
- Scores are now recalculated server-side. The prompt still asks for a score
  per section, but `recalculateScores` overwrites `overall_score`, `ats_score`,
  and `match_score` from the section values. The model's own arithmetic is
  advisory only, which removed a recurring source of run-to-run variance.
- `ats_score` is derived as 70% keyword hit ratio plus 30% heading score, with
  a 10-point penalty per heading risk capped at 30.
- `match_score` counts a partial keyword as half a match.

### Problem Identified

- The prompt now assumed Western ATS conventions throughout, while the
  Bangladesh-specific rules from Iterations 2 to 4 were still present. A resume
  following standard Bangladeshi conventions was told both to keep and to
  remove the same sections.

Full write-up of the integration work: `resume_review_v2_reflection.md`.

## Iteration 6 - Market Mode Split (Current)

Commit `41d30b0` (2026-05-09), hardened over Sprint 3.

This resolved the contradiction left by Iteration 5 by splitting the
market-specific rules into two mutually exclusive blocks, selected by the user
before analysis rather than inferred by the model.

### Key Changes

- The single `SYSTEM_PROMPT` constant became `buildSystemPrompt(marketMode)`,
  which injects one of two blocks ahead of the shared section definitions.
- `BANGLADESH_MODE_BLOCK` — protects local conventions. Personal details,
  Declaration sections, photographs, the Career Objective heading, Academic
  Qualification headings, and Technical Skills headings must never be flagged
  in any section of the response. Formatting is capped at 75 where three or
  more such conventions appear, framed as an educational note rather than a
  penalty.
- `INTERNATIONAL_MODE_BLOCK` — inverts that stance. The same eight elements
  become mandatory formatting issues, each with its own required issue and
  suggestion wording, and four or more of them caps formatting at 55 as a
  genuine penalty. Career Objective, Educational Qualification, Academic
  Qualification, and Personal Information are flagged as heading risks with
  recommended Western equivalents.
- Both blocks close with an explicit override clause, so the generic section
  definitions that follow cannot contradict the selected market.
- Content-quality checks were added to the Bangladesh block over Sprint 3:
  named referees rather than "references available on request", extracurricular
  sections for candidates with under two years of experience, SSC and HSC
  entries carrying GPA denominator and Education Board, and a thesis or final
  year project entry for recent technical graduates. Each is scoped by
  inferred experience level so it does not fire on senior candidates.
- The Career Objective heading is protected in Bangladesh mode, but its
  *content* is still assessed. Generic phrasing such as "seeking a challenging
  position" is flagged as a content weakness with a rewrite.
- `keyword_gaps` and `ats_tips` are capped at three entries. The cap is stated
  in the prompt, enforced in the Zod schema, and trimmed in `normalizeResponse`
  as a backstop; a warning is logged when the model exceeds it.
- `ats_tips` must be improvement actions. Positive observations about what the
  resume already does well are explicitly disallowed, since they consumed tip
  slots without giving the candidate anything to act on.
- A streaming entry point (`analyzeResumeStream`) was added, using the same
  prompt. JSON repair was added around both paths — fence stripping, balanced
  object extraction, control character escaping, inner quote repair, and
  truncation repair — because longer responses are cut off at the token limit.
- Temperature was lowered from 0.3 to 0.1. The Iteration 4 note recommending
  0.3 no longer reflects the code.

### Remaining Observations

- The prompt is close to its token ceiling. `max_tokens` is 4096 for both the
  streaming and one-shot paths, and Bangladesh mode alone costs roughly 3,200
  tokens of that budget before the resume is appended. The JSON truncation
  repair exists because responses are already being cut off; adding prompt
  text makes that more frequent, not less.
- The tier parameter is threaded through `getModel(tier)` but nothing selects
  a tier. Registration ignores the chosen plan, so every request resolves to
  the free model.
- The scoring weights are stated in three places — the prompt text in
  Section 7, `recalculateScores`, and the summary table in this document.
  They can drift independently, and the server value silently wins.

## Summary


| Iteration | Token Cost | Key Fix                                | Test Impact                                                  |
| --------- | ---------- | -------------------------------------- | ------------------------------------------------------------ |
| 0         | ~350       | Baseline prompt                        | No detection rules, arbitrary scores                         |
| 1         | ~850       | Research-driven rules                  | Comprehensive, but not fully validated by client             |
| 2         | ~650       | Client-grounded rewrite                | More specific feedback, but still missed legacy conventions  |
| 3         | ~780       | Legacy convention block                | Caught Declaration, headings, LinkedIn, and missing sections |
| 4         | ~850       | Per-entry checks and score calibration | All known issues caught, formatting scores became accurate   |
| 5         | ~2,600     | 0-100 scale, typed sections, ATS and job match | New feedback types available, but market rules contradicted each other |
| 6         | ~3,200 BD / ~2,500 INTL | Market mode split           | Contradiction resolved, market rules now mutually exclusive  |

Token costs for Iterations 0 to 4 are the original working estimates recorded
at the time. Iterations 5 and 6 are measured from the built prompt using the
same characters-divided-by-four estimate the service itself logs, so the two
sets are not directly comparable. Measured for reference: Iteration 4 is
~2,114 tokens on the same basis.

Iteration 6 is the version currently in `ai-service/src/services/resumeReviewer.js`.
The next revision is therefore Iteration 7.
