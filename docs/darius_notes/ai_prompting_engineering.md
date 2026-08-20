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

## Iteration 6 - Market Mode Split

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

## Iteration 7 - Prompt Debt Paydown (Current)

A consolidation release. No behaviour change to review output was intended: no
new detection rules, no output shape change, no reweighting. The goal was to
clear the structural debt that made every prompt change since Iteration 5 risky
- duplicated constants, a near-exhausted output budget, mode text leaking into
the shared sections, and no way to prove a refactor left the prompt untouched.

Baseline archived as `prompt_iterations/iteration_06_resumeReviewer.js`
(commit `9417938`, 2026-08-04): the Iteration 6 prompt as it stood before this
work, so the changes below can be diffed against the thing they describe.

### Key Changes

- **Golden prompt snapshots.** `ai-service/tests/promptSnapshot.test.js` asserts
  that `buildSystemPrompt('bangladesh')` and `buildSystemPrompt('international')`
  match checked-in golden files under `ai-service/tests/golden/`. An intentional
  prompt change is now a reviewable golden diff and an unintentional one fails the
  suite. Regenerate with `UPDATE_GOLDEN=1 npm test --prefix ai-service`.
- **Both market paths are exercised by the manual harness.**
  `testResumeReviewer.js` called `analyzeResume` with no market mode, so the
  international path had zero coverage. It now runs every resume through both
  modes, with `--mode bangladesh|international|both` to narrow. Its result
  printer was still on the Iteration 0-4 output contract
  (`formatting_feedback`, `strengths`/`improvements`, scores out of 10) and threw
  on every resume, so it was brought onto the current contract; it now also
  prints the ATS section, which is where the two market modes visibly differ.
- **One source for the weights, the caps, and the completion parameters.** New
  `ai-service/src/config/reviewConstants.js` exports `SCORE_WEIGHTS`,
  `ATS_LIST_CAP`, `AI_COMPLETION_PARAMS`, and `ATS_STANDARD_LABEL`. The SECTION 5
  and SECTION 7 prompt text interpolates them, `recalculateScores` and
  `normalizeResponse` read them, `resumeSchema.js` validates against
  `ATS_LIST_CAP`, and both call paths spread `AI_COMPLETION_PARAMS`. The weights
  previously lived in three places and the 3-item cap in three more; because the
  server-side value silently wins over the prompt, a drift between them produced
  no visible symptom.
- **`max_tokens` 4096 to 6144** on both call paths. This is the one deliberate
  value change in the iteration. `max_tokens` caps *completion* tokens only - the
  system prompt does not consume it - so the truncation the JSON repair layer
  exists to absorb was always an output-side problem, and trimming the prompt
  would never have fixed it. Unused budget is not billed. The repair layer stays
  as a backstop.
- **Both mode blocks carry a `MARKET RULES` heading.** SECTION 1 and SECTION 5
  each pointed at "the CRITICAL block above", which existed under that name in
  neither block - the Bangladesh block had no heading at all. SECTION 5 now reads
  "Respect the MARKET RULES block above when selecting heading risks", which is
  also mode-neutral; its previous wording ("headings that must never be flagged")
  only made sense in Bangladesh mode. SECTION 1's reference went away with the
  sentence that carried it, below.
- **The shared sections are market-neutral.** SECTION 1 hardcoded the Bangladesh
  75-point formatting ceiling into *both* modes. In Bangladesh mode that
  duplicated the mode block; in international mode it directly contradicted the
  55-point rule, with only the override clause papering over it, so the model was
  being asked to resolve a contradiction on every international request. The
  sentence is deleted. The ceiling still lives in the Bangladesh block, which is
  the only place it applies.
- **The `standard` key is injected, not requested.** The prompt asked the model to
  emit the constant string `"international/multinational ATS"` on every response.
  `normalizeResponse` now sets it from `ATS_STANDARD_LABEL`. The schema already
  marked it optional, so the output shape is unchanged and the frontend is
  untouched.
- **Encoding fix.** Line 5 of the Bangladesh block carried a double-encoded em
  dash (`â€”`) that was sent to the model verbatim on every
  Bangladesh-mode request.
- **Compression.** The international block spelled out full `issue`/`suggestion`
  wording for all eight demographic elements. None of that wording is
  schema-bound - the frontend renders whatever strings arrive - so it is now the
  element list plus one shared instruction to phrase each flag in terms of the
  bias, privacy, or discrimination risk and to instruct removal. The four
  Bangladesh content-quality checks each repeated the same scaffolding; they now
  share one rubric (if the section or entry is absent, flag it as a content
  weakness using the stated message, and apply the check only within its stated
  experience scope). The per-check specifics - GPA /5.00 denominators, Education
  Board names, the 3-year and 5-year scoping, the named-referee requirements -
  are the behaviour, not the verbosity, and are untouched.

### Measured Token Costs

Estimated with the same characters-divided-by-four method the service logs.

| Segment                    | Iteration 6 | Iteration 7 | Plan target |
| -------------------------- | ----------- | ----------- | ----------- |
| `BANGLADESH_MODE_BLOCK`    | ~1,561      | ~1,340      | ~1,250      |
| `INTERNATIONAL_MODE_BLOCK` | ~833        | ~462        | ~500        |
| Bangladesh prompt total    | ~3,206      | ~2,918      | ~2,650      |
| International prompt total | ~2,478      | ~2,040      | ~1,900      |

The international block came in under target. The Bangladesh block did not: most
of its bulk is per-check specifics, which the plan ruled out as compression
targets, so only the shared scaffolding and the justification prose around the
checks were available to cut.

### Test Result

**The A/B gate has not been run.** Commits 3 and 4 of the plan are gated on a
harness diff - `batch-review.js` across the 10-resume set in both modes against
an Iteration 6 baseline - and that requires live paid model calls. Until it runs,
the prompt changes above are unverified against real model output. What has been
verified:

- The golden snapshot test passes for both modes, and was confirmed to fail on a
  single injected character, so the safety net detects drift rather than merely
  existing.
- The weight extraction is arithmetically identical to the Iteration 6 formula
  across 153,015 score combinations.
- Every behaviour-bearing string the plan lists as protected is still present in
  the built prompt: the eight international elements, the mandatory-flag
  requirement, the no-educational-framing rule, the 55-point and 75-point
  ceilings, GPA /5.00 handling, the Education Board names, the 3-year and 5-year
  scoping, the named-referee requirements, and both override clauses.
- The server suite still passes (61 tests) and the ATS list cap still accepts 3
  entries and rejects 4.

### Outstanding

- Run the A/B harness in both modes over the 10-resume set and record the diff
  here as the real Test Result. Acceptance, per the plan: every convention caught
  at baseline is still caught (compare `issues`, `weaknesses`, and
  `heading_risks` by topic, not exact wording), and section scores land within
  plus or minus 5 of the baseline medians. If the Bangladesh compression fails the
  gate, the international compression can ship alone - they are independent.
- Record the truncation-repair rate before and after the `max_tokens` change.
  There is no baseline figure yet. The repair layer warns on each fallback, so
  the rate is countable from a harness run.
- The generated files under `ai_testing/` and `docs/ai_model_testing/` were
  produced against the Iteration 6 prompt and are stale; both READMEs now say so.
  Regenerate only the comparison subset the harness uses rather than re-running
  all nine models.
- Candidates unlocked by this work: structured outputs (`response_format`) to
  retire the repair layer, calibration and variance work, or a new capability
  from the handover doc's unbuilt-features list.

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
| 7         | ~2,918 BD / ~2,040 INTL | Prompt debt paydown         | No behaviour change intended; A/B gate not yet run           |

From Iteration 7 the scoring weights and the ATS list cap are defined once, in
`ai-service/src/config/reviewConstants.js`, and interpolated into the prompt from
there. This document restates them for readability but is no longer a source of
truth for either; if the two disagree, the constants file is right and this
document is out of date.

Token costs for Iterations 0 to 4 are the original working estimates recorded
at the time. Iterations 5 and 6 are measured from the built prompt using the
same characters-divided-by-four estimate the service itself logs, so the two
sets are not directly comparable. Measured for reference: Iteration 4 is
~2,114 tokens on the same basis.

Iteration 7 is the version currently in `ai-service/src/services/resumeReviewer.js`.
The next revision is therefore Iteration 8.
