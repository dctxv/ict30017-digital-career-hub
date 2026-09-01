# Mock Interview and Preparation — as built

**Date:** 2026-08-27
**Session:** Implementing the preparation layer against the v0.1 feature spec

This records what the spec did not decide and what the build decided instead. The
spec is the intent; this is where the intent met the code that already exists,
and the places the two disagreed.

---

## 1. Where the gaps come from

The spec calls preparation "the shared output layer of the two features that
already exist or are planned". The implementation question the spec leaves open
is *how* the resume review emits a Gap, and there were three options.

**Rejected: add a `gap_analysis` key to the review's own output contract.** This
is the free option — no extra model call at all. It was the first thing tried on
paper and it is the wrong shape for two reasons. The review response already runs
near six thousand output tokens and has a documented history of truncating; the
whole JSON repair chain in `ai-service/src/utils/aiJson.js` exists because of it.
Appending the lowest-priority section to the end of the longest response is
choosing where the truncation lands. It would also have invalidated the seven
golden prompt snapshots for a change that has nothing to do with reviewing a
resume.

**Rejected: derive gaps deterministically from the review JSON.** `keyword_gaps`
and `job_match.missing_keywords` are already close to skill gaps, and a mapper
would cost nothing. But it cannot produce remediation, it cannot tell a skill from
a credential, and it cannot tell the difference between "no evidence of SQL" and
"SQL is present but buried" — which is exactly the skill/evidence distinction the
spec calls the highest-value part of the feature.

**Built: one extra model call, taking the finished review as its input.** It runs
in `extractGapsInBackground` in `routes/resume.js`, after the response has been
written, so nothing the user is waiting for gets slower, and it is skipped for
guests because there is nowhere to store the result. The input is the validated,
redacted feedback rather than the resume, which means the gap engine can never see
a phone number and a re-run against the same review is reproducible.

The interview needs no third call: its evaluation prompt already emits the same
Gap structure, from the same shared prompt block in `ai-service/src/prompt/gaps.js`.
That block is written once precisely because both features feed one table keyed on
`gap_key` — a drifted contract there means the interview keys a Python gap
`skills:python` while the review keys it `skill:python`, and the board shows two
open gaps forever and can never close either.

---

## 2. gap_key: the model proposes, the server normalises

The spec says the model returns a `gap_key` from a constrained vocabulary. It
does, and `normaliseGapKey` in `ai-service/src/config/preparationConstants.js`
then guarantees it, because the model sends `skill:SQL`, `Skill: SQL` and
`skill : sql ` on different days and all three have to become one row.

Two decisions inside that function are worth stating.

**A gap whose key normalises to nothing is dropped, not stored under a generated
one.** A generated key is unique by construction, so the gap re-detects as new on
every single analysis and sits open on the board permanently while looking like it
is being tracked. Losing the gap is the better failure.

**The slugger is Unicode-aware.** The prompt asks for English keys and mostly gets
them. An ASCII-only slugger turns a Bangla key into the empty string, and every
such gap then collides into one row — so a rule the model broke once would
silently merge unrelated gaps.

---

## 3. Closing is scoped to the source, and the source never moves

This is the only thing in the build that had to be changed after live testing
found it, and it is worth recording because it looked correct.

Closing has to be scoped to the source: a resume review cannot see what an
interview revealed about how someone talks, so a review that does not mention it
is not evidence that it is fixed. That was in from the start.

What was not obvious is that the upsert must NOT refresh the `source` column. The
first version did, on the reasoning that the newest analysis is the most current
description. Live test on 2026-08-27: the review found `skill:sql`, then the
interview re-detected it, which flipped the row to interview-scoped — and no
future review of a resume that finally evidences SQL could ever close it. The gap
had moved out of reach of the only analysis that could clear it.

`source` is now where the gap was FIRST found, and everything else on the row is
refreshed. The cost is the mirror case: a gap both features find is closed only by
whichever found it first. That errs towards leaving a gap open, which is the safe
direction — claiming progress nobody made is the failure worth avoiding.

---

## 4. Dismissed is not closed, and there is no manual close

`PATCH /api/preparation/gaps/:id` accepts `dismissed` and `open`, and explicitly
refuses `closed` with a 400.

Closing is something an analysis concludes. A self-serve close button would make
the progress figure a measure of clicking, and the figure is the only visibly new
thing this feature produces. Dismissal is kept separate for the same reason and
leaves the percentage entirely rather than counting towards it — otherwise a user
clears their board by disagreeing with it and is congratulated for improving.

Progress is severity-weighted (`GAP_SEVERITY_WEIGHT`, blocking 5 / significant 3 /
minor 1) exactly as the spec asks. The label on the page says so, because a bare
percentage invites the reading the weighting exists to prevent.

---

## 5. Resource links: the model is never asked for a URL

The spec asks for "remediation with resource links where available". The model has
no browsing tool, so asking it for links means inventing plausible ones, and a
remediation step pointing at a page that does not exist is worse than no link.

It returns `resource_query` — two to four words naming the subject — and
`attachResources` in `services/gapStore.js` matches that against the `resources`
table. Every link on the board therefore points at a row an admin actually
curated, which is what finally gives the Career Resources page a functional role
in the product.

Matching is biased towards showing nothing: generic words are stripped, a title
hit is worth two, a category hit one, and two points are required. The first live
run matched "data cleaning techniques pandas sql" to "Essential lab techniques
every science graduate should know" on the single word "techniques" — a
confidently wrong link under a heading that says where to learn the thing. A
category hit alone can no longer qualify either, since "Skill Development" would
otherwise match every skill gap in the product.

---

## 6. Deviations from the spec, and why

**The interview requires an account.** The spec does not say either way; it says
the interview runs standalone, which is about inputs rather than about auth. But
a gap is stored per user across analyses, and a guest has no row to attach one to.
An anonymous interview spends two model calls to produce something the tab closing
throws away, and signing in is the smaller ask.

**Tier 2 means a resume uploaded now, not a resume on file.** There is no "use my
last resume" option because there is nothing to use: uploads are deleted after
analysis and the extracted text is deliberately never stored (SPR-10, FR-13).
Asking for the file again is what keeps that true. The interview parses it in
memory and keeps only the questions it produced.

**A job advertisement without a resume is still tier 1.** The tier-1 constraint is
about the candidate, and an advertisement says nothing about the candidate.

**The gap-targeted question fires whenever open gaps exist**, not only from tier 2.
Gaps are stored, so even a tier-1 interview can aim at one the review already
found. This is the item worth putting in front of the client, because it visibly
proves the two features are connected rather than bolted together.

---

## 7. The tier-1 failure mode, and the guard

The spec calls this out and it is right to: with no resume the model has no
evidence about the user and must not invent any. It is stated as its own prompt
block (`TIER_1_CONSTRAINT`), and it is enforced afterwards in code, because
prompt compliance alone is not enough here for the same measured reason the
protected-heading backstop exists.

"Based on your experience in supply chain, how would you..." is the single most
common interview-question opening in existence, so the model reaches for it under
an explicit prohibition. `stripUnevidencedClaims` removes the clause making the
claim and leaves the question — rewriting rather than dropping, because dropping
leaves four questions and five is the shape of the feature. Where the claim IS the
whole question there is nothing honest to salvage, so the original stands and the
warning in the log is the record of it: an empty question on screen is a worse
outcome than an over-familiar one.

---

## 8. What the spec listed as BLOCKING

The spec flagged the schema change as the dependency most likely to fail, and
offered three mitigations in order of preference. The first one was taken: the
migration is written here, in `create_preparation_tables.sql`, registered in the
`ORDER` array and in `schemaCheck.js`, and it goes out with the code rather than
as a request to somebody else. It converts a dependency into a review.

The tables are also listed in `REQUIRED_TABLES`, so a database that is behind the
code says so once at boot with the command to fix it, rather than failing quietly
per request the way review history did for a fortnight.
