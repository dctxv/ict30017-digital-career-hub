# Resume Reviewer System Prompt Iteration Log


| Field   | Value                            |
| ------- | -------------------------------- |
| Project | P83 Digital Career Hub           |
| Author  | Darius Clay Tan Yi (AI Lead)     |
| Feature | AI Resume Reviewer (GPT-4o-mini) |
| Sprint  | 1                                |


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

## Iteration 4 - Scoring Calibration and Per-Entry Checks (Current)

This version targeted recurring test failures.

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

## Summary


| Iteration | Token Cost | Key Fix                                | Test Impact                                                  |
| --------- | ---------- | -------------------------------------- | ------------------------------------------------------------ |
| 0         | ~350       | Baseline prompt                        | No detection rules, arbitrary scores                         |
| 1         | ~850       | Research-driven rules                  | Comprehensive, but not fully validated by client             |
| 2         | ~650       | Client-grounded rewrite                | More specific feedback, but still missed legacy conventions  |
| 3         | ~780       | Legacy convention block                | Caught Declaration, headings, LinkedIn, and missing sections |
| 4         | ~850       | Per-entry checks and score calibration | All known issues caught, formatting scores became accurate   |
