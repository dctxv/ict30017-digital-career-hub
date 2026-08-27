# Preparation layer — build session

**Date:** 2026-08-27
**Scope:** Mock Interview and Preparation, against feature spec v0.1
**Companion doc:** `preparation_layer_as_built.md` — that one records *why* the
design decisions went the way they did. This one records what was actually built,
what was tested against a live model, and what is left open.

---

## What shipped

17 new files, 17 modified, roughly 5,400 lines of new source.

### ai-service

| File | Holds |
|---|---|
| `src/config/preparationConstants.js` | The Gap vocabulary, severity weights, interview constants, and `normaliseGapKey` |
| `src/prompt/gaps.js` | The Gap output contract, written once and used by both producers |
| `src/prompt/interview.js` | Question and evaluation prompts, and the tier-1 no-evidence constraint |
| `src/schemas/preparationSchema.js` | Zod validation for gaps, questions and evaluations |
| `src/services/gapEngine.js` | Converts a finished review into Gaps; normalises and dedupes any gap list |
| `src/services/mockInterview.js` | Generates the five questions, assesses the transcript |
| `src/utils/completion.js` | One non-streaming JSON request, with the shared 429 handling |
| `src/utils/aiJson.js` | The JSON repair chain, lifted out of `resumeReviewer.js` unchanged |
| `tests/preparation.test.js` | 30 tests over key normalisation, the tier-1 guard and severity weighting |

### server

| File | Holds |
|---|---|
| `migrations/create_preparation_tables.sql` | `user_gaps`, `mock_interviews`, two quota columns on `users` |
| `src/services/gapStore.js` | The gap lifecycle: reconcile, close, dismiss, resolve resource links |
| `src/routes/preparation.js` | Seven endpoints under `/api/preparation` |
| `src/middleware/interviewQuota.js` | Daily allowance, claim, refund |

### client

| File | Holds |
|---|---|
| `src/pages/Preparation.jsx` | Three tabs: plan, mock interview, past interviews |
| `src/pages/Preparation.css` | Page styles, every colour through a token |
| `src/api/preparation.js` | The API surface, through `apiFetch` like the account API |

### Modified

`resumeReviewer.js` (JSON parser extracted), `routes/resume.js` (fires gap
extraction after the response), `routes/users.js` (export and deletion cover the
new tables), `schemaCheck.js`, `migrate.js`, `app.js`, `i18n/messages.js`,
`App.jsx`, `Navbar.jsx`, `Profile.jsx/.css`, `Resources.jsx`, `ResultsView.jsx`,
`en.js`, `bn.js`, `README.md`.

---

## The flow, end to end

1. A signed-in user runs a resume review. Nothing about that changes for them.
2. After the response is written, the server converts the review into Gaps in one
   extra model call and reconciles them onto the user's board. Guests are skipped
   — there is nowhere to store a gap.
3. `/preparation` shows the board: severity-weighted progress, what to start with,
   each gap with its remediation steps, effort, and links resolved against the
   curated resources table.
4. A mock interview writes five questions in one call. One of them targets a gap
   the review already found, and says so on the card.
5. The user answers. One more call assesses the whole transcript and emits the
   gaps the answers revealed, which reconcile onto the same board.
6. A later review that no longer finds a gap closes it, and the progress figure
   moves.

---

## Verified against the live model

Not just compiled. Every row below was run against `gemini-3.6-flash` through the
running server on port 3100, with a real account and the seeded content database.

| Check | Result |
|---|---|
| Tier 1 interview, role and stage only | 5 questions, 2 behavioural / 3 role-specific, no invented claims about the candidate |
| Tier 3 interview, resume + mixed English/Bangla job ad | Bangla prose, English gap keys, question 3 targeted `skill:sql` from the resume review |
| Blank answer | Scored 0, verdict said it was unanswered, no gap invented from the silence |
| Full review → gaps | 7 gaps extracted, correctly split across skill and evidence, keys stable |
| Gap lifecycle | Close on non-detection, reopen on re-detection, dismissal survives re-detection |
| Scoped closing | An interview does not close review findings, and vice versa |
| Severity weighting | One blocking gap closed outranks three minor ones |
| Dismissal | Leaves the progress figure entirely rather than counting as progress |
| Re-submitting a finished interview | 409 |
| Manual `status: closed` | 400 — closing is an analysis conclusion, never a user assertion |
| Another account's gap | 404, not 403 |
| Third interview in a day on the free tier | 429 with the localised message |
| Unauthenticated read | 401 |
| Rendering | Light and dark, English and Bangla, no console errors, no untranslated keys |

Suites: 122 ai-service, 79 server, 18 client. All pass. Lint and build are at
their pre-existing baseline (8 errors and 1 warning, all of them older than this
work — `Buffer` and `process` in e2e specs and `vite.config.js`).

---

## Two defects found in testing, not in review

Both looked correct on the page and failed only when run.

### 1. Every gap dismissal failed with a 500

**Symptom:** `PATCH /api/preparation/gaps/:id` returned "Could not update that
gap." for every request. The 404 path for another account's gap returned 500 too.

**Root cause:** `inconsistent types deduced for parameter $3`. Postgres infers a
parameter's type from where it appears, and `$3` appeared once assigned to a
varchar column and twice compared against untyped literals inside `CASE WHEN`.

**Fix:** `$3::text` at every use in `setGapStatus`.

### 2. A gap could drift out of reach of the analysis that could close it

**Symptom:** none visible. The board looked right.

**What happened:** the resume review found `skill:sql`. A later interview
re-detected it, and the upsert refreshed the `source` column to `interview`.
Because closing is scoped to source, no future review of a resume that finally
evidenced SQL could ever close that gap. It would have sat open permanently.

**Fix:** `source` is now where a gap was FIRST found and is never refreshed.
Everything else on the row still updates from the newest analysis. The cost is the
mirror case — a gap both features find is closed only by whichever found it first
— which errs towards leaving a gap open. Claiming progress nobody made is the
failure worth avoiding.

### Also corrected during the pass

- **A confidently wrong resource link.** "data cleaning techniques pandas sql"
  matched "Essential lab techniques every science graduate should know" on the
  single word "techniques". Generic vocabulary is now stripped before matching, a
  title hit is worth two points and a category hit one, and two points are
  required — so a category match alone can never qualify, which matters because
  "Skill Development" would otherwise match every skill gap in the product.
- **A counter that always read zero.** `reopened` was derived from the row
  returned by the upsert, which is the row *after* the update has already cleared
  `closed_at`. Prior state is now read once up front.
- **A reopened interview claiming its answers revealed nothing.** The gaps it
  produced were reconciled at submission and are not returned again, so the
  results view now distinguishes "not fetched" from "none found" rather than
  rendering the second for the first.

---

## Cost and quota accounting

The binding constraint is the free-tier daily request cap, and the whole design is
shaped around it.

| Action | Model calls |
|---|---|
| Resume review, guest | 1 |
| Resume review, signed in | 2 — the review, then gap extraction in the background |
| Complete mock interview | 2 — all five questions, then the whole transcript |

A turn-by-turn interview would be twelve or more. Same user-visible output,
roughly six times the demonstration headroom.

Free allowances: 3 reviews a day (unchanged) and 2 mock interviews a day, so a
free account tops out at ten calls. The interview allowance is claimed when the
questions are written rather than when the answers are submitted — that is the
half somebody can trigger repeatedly with a reload — and refunded if generation
fails, so an outage does not quietly spend the user's day.

---

## Database state

`create_preparation_tables.sql` is applied to the **local** database only. The
shared hosted instance has not been touched. Against that one the migration still
runs once, by one person, after coordinating — the usual rule.

A test account was left in the local database so the page is not empty on first
look: `prep.test.local@example.com` / `TestPassword123!`, user 176, six real gaps
from a review of `BD_Resume_Test_01.pdf` and three interviews including one
Bangla. Its interview allowance for the day is spent. Delete it whenever.

Nothing is committed.

---

## What is deliberately not built

Straight from the spec's out-list, and it stays in the document that goes to the
client, because undocumented exclusions are how a vague feature grows back.

Voice input or output. Live coding assessment. Real-time interruption or
follow-up questioning. Video. Anything requiring a maintained skills taxonomy or a
curated role dataset.

Voice was ruled out on the call and accepted: bilingual delivery would need Bengali
speech models, a separate API, and a budget that does not exist.

---

## Open questions for the client

All three are unanswered as this ships, and the first two are cheap to change
later while the third is not.

1. **Should gap history be visible to admins, or to the user only?** Built as user
   only. No admin route reads `user_gaps`.
2. **Should a dismissal be recoverable?** Built reversible, because the reversible
   version is the one that can be made permanent later without anyone losing
   anything.
3. **Is a pasted job advertisement retained indefinitely or purged after
   analysis?** Currently retained with the interview, matching `resumes.job_ad_text`.
   This is a privacy question and should be answered before launch rather than
   after. There is deliberately no cleanup job — an unadvertised one would quietly
   delete history someone is relying on.

Interview answers carry the same unresolved retention question as chat
transcripts. They are free text about the user's own career, they are destroyed
outright on account deletion rather than anonymised, and nobody has yet agreed how
long they live before that.

---

## For whoever reviews this

Four places carry the weight, and the rest is plumbing.

1. `normaliseGapKey` in `preparationConstants.js` — if this is wrong, nothing
   throws. Gaps quietly accumulate as duplicates and no user ever sees one close,
   which reads as the progress view being broken rather than the keying being
   broken.
2. `reconcileGaps` in `gapStore.js` — the entire lifecycle is in one function.
   Note the two things it must not do: refresh `source`, and touch a dismissed
   gap.
3. `TIER_1_CONSTRAINT` in `prompt/interview.js` and `stripUnevidencedClaims` in
   `mockInterview.js` — the prompt asks and the code guarantees, same doctrine as
   the protected-heading backstop. This is the failure that would make the whole
   product look untrustworthy the first time a user caught it.
4. `attachResources` in `gapStore.js` — biased towards showing nothing, on
   purpose. An unrelated link under a heading that says "where to learn it" is
   worse than no link.
