# Iteration 7 Plan — Prompt Debt Paydown

| Field    | Value                                        |
| -------- | -------------------------------------------- |
| Project  | P83 Digital Career Hub                       |
| Author   | Darius Clay Tan Yi (AI Lead)                 |
| Feature  | AI Resume Reviewer                           |
| Baseline | Iteration 6, commit `41d30b0`                |
| Status   | Planned                                      |

Iteration 7 is a consolidation release. The intent is **no behaviour change** to
review output: no new detection rules, no output shape change, no reweighting.
The goal is to remove the structural debt that makes every prompt change since
Iteration 5 risky — duplicated constants, a near-exhausted output token budget,
mode text leaking into shared sections, and no way to prove a refactor left the
prompt untouched. Everything Iteration 8 might want to do (new capability,
calibration work) gets cheaper and safer after this lands.

## Measured baseline

Estimates use the same chars/4 method the service logs (`resumeReviewer.js:620`).

| Segment                                   | Chars | ~Tokens |
| ----------------------------------------- | ----- | ------- |
| `BANGLADESH_MODE_BLOCK` (lines 4–105)     | 6,284 | 1,571   |
| `INTERNATIONAL_MODE_BLOCK` (lines 107–176)| 3,378 | 844     |
| Shared SECTIONS 1–7 (lines 185–347)       | 6,613 | 1,653   |
| **Bangladesh-mode prompt total**          |       | **~3,224** |
| **International-mode prompt total**       |       | **~2,497** |

`max_tokens` is 4096 on both call paths (lines 596 and 661). Note that
`max_tokens` caps *completion* tokens only — the prompt does not consume it —
so the observed truncation (the reason `repairJSON`, `extractBalancedJSON`, and
`repairUnescapedQuotes` exist) means the JSON responses themselves are
exceeding 4096 output tokens on dense resumes.

## The debt items

**D1 — Model parameters duplicated across call paths.** `model`, `temperature
0.1`, both penalties, and `max_tokens 4096` are written out twice, once in
`analyzeResumeStream` and once in `analyzeResume`. Iteration 6 already shipped a
temperature change (0.3 → 0.1) that the Iteration 4 notes contradicted; two call
sites doubles the chance of the next drift.

**D2 — Scoring weights stated in three places.** Content 45 / language 35 /
formatting 20 lives in SECTION 7 prompt text, in `recalculateScores()`, and in
the iteration log. They can drift independently and the server value silently
wins, so a drift is invisible in output.

**D3 — The 3-item ATS caps stated in three places.** Prompt text (SECTION 5,
steps 3 and 5), `resumeSchema.js` `.max(3)`, and `normalizeResponse()`
`.slice(0, 3)`. Changing one without the others produces either a hard
validation failure or silent truncation.

**D4 — Mode-specific text leaks into the shared sections.** SECTION 1 (lines
208–211) hardcodes the Bangladesh 75-point formatting ceiling into *both*
modes. In Bangladesh mode this duplicates lines 101–104 of the mode block; in
international mode it directly contradicts the 55-point rule, and only the
override clause papers over it. The model is being asked to resolve a
contradiction on every international request.

**D5 — Dangling "CRITICAL block" references.** SECTION 1 (line 210) and
SECTION 5 (line 288) both say "see the CRITICAL block above", but neither mode
block carries that heading — the Bangladesh block has no heading at all.
SECTION 5's wording ("headings that must never be flagged") also only makes
sense in Bangladesh mode.

**D6 — Encoding corruption in the live prompt.** Line 5 of the Bangladesh
block contains a double-encoded em dash (`â€"`) that is sent to the model
verbatim on every Bangladesh-mode request.

**D7 — Output budget waste.** The prompt asks the model to emit the constant
string `"standard": "international/multinational ATS"` on every response, and
truncation pressure comes entirely from the output side (see baseline note).

**D8 — No refactor safety net.** There is no test asserting what
`buildSystemPrompt()` actually produces, so a "no-op" refactor cannot be proven
to be one. `testResumeReviewer.js` calls `analyzeResume` with no market mode
(line 159), so the international path has zero automated coverage.

**D9 — Verbosity in the mode blocks.** The international block spells out full
`issue`/`suggestion` wording for all eight demographic elements (~844 tokens);
none of that wording is schema-bound — the frontend renders whatever strings
arrive. The four Bangladesh content-quality checks (references,
extracurriculars, SSC/HSC, thesis) each repeat the same scaffolding
("check whether… if absent, flag as a content weakness… do not apply to
candidates with N+ years").

## Execution — four gated commits

Ordering matters: the safety net lands first, text changes land last, and each
text-changing commit is gated on the harness diff described below.

### Commit 1 — Safety net (zero text change, provably)

- Add `ai-service/tests/promptSnapshot.test.js`: assert
  `buildSystemPrompt('bangladesh')` and `buildSystemPrompt('international')`
  byte-match two checked-in golden files under `tests/golden/`. From now on,
  every intentional prompt change shows up as a reviewable golden-file diff,
  and every unintentional one fails CI.
- Add an international-mode case to `testResumeReviewer.js` so both paths are
  exercised.
- Archive the Iteration 6 prompt as
  `prompt_iterations/iteration_06_resumeReviewer.js` per convention (Iteration
  4 precedent), since this is the last commit where the text is unchanged.
- Run `batch-review.js` in both modes against the 10-resume set on the
  Iteration 6 prompt and keep the outputs as the A/B baseline for commits 3–4.

### Commit 2 — Single-source the constants (prompt text byte-identical)

- New `ai-service/src/config/reviewConstants.js` exporting:
  - `SCORE_WEIGHTS = { content: 0.45, language: 0.35, formatting: 0.20 }`
  - `ATS_LIST_CAP = 3`
  - `AI_COMPLETION_PARAMS = { temperature: 0.1, frequency_penalty: 0.1,
    presence_penalty: 0.1, max_tokens: 6144 }`
- Consumers: SECTION 5/7 prompt text interpolates the cap and weights;
  `recalculateScores()` reads `SCORE_WEIGHTS`; `resumeSchema.js` uses
  `.max(ATS_LIST_CAP)`; `normalizeResponse()` slices to `ATS_LIST_CAP`; both
  call sites spread `AI_COMPLETION_PARAMS`. Drift between prompt, schema,
  normaliser, and server maths becomes impossible.
- `max_tokens` 4096 → 6144 is the one deliberate value change. It only costs
  tokens when actually generated, and it directly attacks the truncation that
  the whole JSON-repair layer exists to absorb. The repair layer stays as a
  backstop. Log the truncation-repair rate before and after; if repairs still
  fire, revisit in Iteration 8.
- Golden files updated only where interpolated values render identically —
  interpolation must reproduce the current text exactly, and the snapshot test
  proves it.
- The iteration log's summary table gains a note that
  `reviewConstants.js` is the source of truth for weights and caps; the doc
  restates them for readability but no longer authoritatively.

### Commit 3 — Structural fixes (small semantic changes, A/B gated)

- Give both mode blocks a stable heading, `MARKET RULES`, and rewrite the two
  dangling references (SECTION 1 line 210, SECTION 5 line 288) to point at it.
  SECTION 5's wording becomes mode-neutral: "Respect the MARKET RULES block
  above when selecting heading risks."
- Delete the Bangladesh ceiling text from SECTION 1 entirely — it already
  lives in the Bangladesh block, and shared sections must be market-neutral
  from now on. This removes the standing contradiction in international mode.
- Fix the mojibake on line 5.
- Stop asking the model for the `standard` key; inject it in
  `normalizeResponse()` instead. The schema already marks it optional, so this
  is not an output-shape change and the frontend is untouched.
- Gate: harness diff against the Commit 1 baseline. Expected result is
  identical flag behaviour with scores inside the run-to-run variance band;
  the international runs may *improve* slightly since the contradiction is
  gone. Any lost detection is a blocker.

### Commit 4 — Compression pass (A/B gated, conservative)

- International block: collapse the eight per-item `issue`/`suggestion`
  scripts into a compact element list plus one shared instruction ("flag each
  as a separate formatting issue; explain the bias/privacy risk and instruct
  removal"). Target ~844 → ~500 tokens. The exact English of each flag is the
  model's to phrase; what is preserved verbatim is the element list, the
  mandatory-flag requirement, the no-educational-framing rule, and the
  4-or-more → ceiling-55 rule.
- Bangladesh block: extract the shared scaffolding of the four
  content-quality checks into one rubric ("for each check below: if the
  section/entry is absent, flag as a content weakness using the stated
  message; apply only within the stated experience scope"), leaving per-check
  specifics — GPA /5.00 denominators, Education Board names, the 3-year and
  5-year scoping, the named-referee requirements — untouched. Those specifics
  *are* the behaviour and are not compression targets. Target ~1,571 → ~1,250.
- Gate: full harness diff, both modes, all 10 resumes. Acceptance: every
  convention caught at baseline is still caught (compare `issues`,
  `weaknesses`, `heading_risks` entries by topic, not exact wording); section
  scores within ±5 of baseline medians. If the Bangladesh compression fails
  the gate, ship the international compression alone — they are independent.

## What deliberately does not change

Output shape is untouched, so the Tier 2–4 blast radius is nil: no
`ResultsView.jsx` or `ResumeReview.jsx` sample-object edits, no
`reviewResume.js` or `resume.js` route changes, no `piiRedactor` test updates.
`resumeSchema.js` changes only by importing `ATS_LIST_CAP` — same validation
behaviour. The key aliases in `normalizeResponse` stay; they are cheap
insurance against the model reverting to Iteration 0 names. Both override
clauses stay. The ~190 generated files under `ai_testing/` and
`docs/ai_model_testing/` are stale once Commit 3 lands — regenerate only the
comparison subset the harness uses, and note the staleness in a README rather
than re-running all 9 models.

## Expected end state

| Metric                        | Iteration 6 | Iteration 7 target |
| ----------------------------- | ----------- | ------------------ |
| Bangladesh prompt             | ~3,224 tok  | ~2,650 tok         |
| International prompt          | ~2,497 tok  | ~1,900 tok         |
| `max_tokens` (output budget)  | 4,096       | 6,144              |
| Weights / caps sources        | 3 each      | 1 each             |
| Prompt regression coverage    | none        | golden snapshot, both modes |
| Shared-section contradictions | 1 (INTL ceiling) | 0             |

## Closeout

Add the Iteration 7 entry to `ai_prompting_engineering.md` with measured (not
target) token costs, the harness diff summary as the Test Result, and update
the summary table. Record the truncation-repair rate observation so Iteration
8 has a baseline. Iteration 8 candidates unlocked by this work: structured
outputs (`response_format`) to retire the repair layer, calibration/variance
work, or a new capability from the handover doc's unbuilt-features list.
