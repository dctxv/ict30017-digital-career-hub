# Model comparison

How to decide between candidate models on evidence rather than impressions.

Run it:

```bash
cd server
npm run compare-models -- --dry-run     # what it would send, no calls
npm run compare-models -- --verify      # do the model ids resolve?
npm run compare-models                  # the real run
```

Output lands in `ai_testing/comparison/<date>/` — `summary.md` to read, `results.json`
for the full reviews.

---

## Why not `ai-service/scripts/batch-review.js`

That script ran the original nine-model P83 study and is kept for that record, but
it cannot answer this question. Three reasons, and the first one matters most:

**It does not send what production sends.** Its user message is
`Please review the following resume:\n\n<text>`. Production calls
`buildUserMessage()`, which also carries the application context block and — on a
Bangla run — the language reminder at the very end. That reminder placement *was
the fix* for the 2026-08-26 Bangla failure. A Bangla comparison run through the
old harness would come back 0% on every candidate and the models would get the
blame for a harness bug.

It is also hardcoded to OpenRouter (the app moved to Google AI Studio), and it
records tokens and latency but decides nothing.

`compare-models.js` imports the production builders directly, so if the prompt
changes, the comparison changes with it.

---

## What the three candidates are

| Key | Model | Route |
|---|---|---|
| `gemini-3.6-flash` | Gemini 3.6 Flash — currently live on both tiers | Google AI Studio, or OpenRouter |
| `gemini-3.6-flash-lite` | Gemini 3.6 Flash Lite | Google AI Studio, or OpenRouter |
| `claude-haiku-4-5` | Claude Haiku 4.5 | **OpenRouter only** |

Haiku is not served by Google AI Studio, which is why the May 2026 feasibility
report's split (Gemini 3.1 Flash Lite free / Claude Haiku 4.5 premium) was never
wired up after the provider move.

`--provider auto` (the default) uses Google AI Studio for the Gemini models when
`GOOGLE_AI_API_KEY` is set — the exact path production uses — and OpenRouter for
Haiku. That is the most faithful configuration but mixes two providers, so
latency is not strictly comparable across rows.

For a clean like-for-like comparison, put everything on one provider:

```bash
npm run compare-models -- --provider openrouter
```

The summary table names the route each model took, so the two cases are never
silently confused.

---

## What the three contexts are for

Each one makes a different failure countable.

| Context | What it catches |
|---|---|
| `government_form` | Advice to remove a field a BCS form **requires**. The only context where this is measurable, and the failure with real consequences. |
| `bdjobs_fresher` | Over-flagging headings. This context protects the widest set, so it is where the noise shows. |
| `multinational_it` | Under-flagging. Protects nothing and *should* flag those same fields — so it catches a model that learned to stay quiet rather than learned the rule. |

That last one is the point of running all three. A model scoring well on the
first two alone has not understood the routing; it has just stopped talking.

---

## Reading the summary

| Column | Meaning | Good |
|---|---|---|
| **OK** | Parsed and passed the schema after normalisation | all runs |
| **Schema fail** | Unusable response — the user would see "please try again" | 0 |
| **Protected headings** | Headings the server had to strip | low |
| **Mandated removals** | Advice that would get a government application rejected | **0** |
| **Bangla coverage** | Narrative fields actually written in Bangla | 100% |
| **Bangla violations** | Fields that must stay English but were translated | **0** |

Two of those need care:

**Protected headings** never reach the user — `filterProtectedHeadings` strips
them on every request. A high count is not a broken review. It means the model is
leaning on the backstop rather than following the rule, which matters when
choosing between models precisely because the backstop only covers the headings
we thought to list.

**Mandated removals** is the one that decides things. Anything above zero is a
finding, not a nit: it is the model telling a BCS applicant to delete the
photograph the circular requires. The verbatim text of every hit is printed at
the bottom of the report so it can be judged rather than counted.

**Bangla violations** fail a run outright even at 100% coverage. A violation
means the model translated `language_grammar.issues[].corrected` or an ATS
keyword — so the tool is now telling a candidate to paste Bangla into an English
CV, or breaking keyword matching against English job adverts. More Bangla, worse
outcome. That is why it is a separate column from coverage and not folded into it.

Whether the Bangla *reads well* is still a human judgement. The script only
guarantees a human is asked to judge output that is in the right script and has
not corrupted the fields a candidate copies out.

---

## Before the first real run

**Verify the ids.** The provider's model listing is not authoritative:
`gemini-2.5-flash` is still advertised by `/v1beta/openai/models` and returns 404
on use, because Google closed it to keys created after a cutoff. `--verify` sends
a one-token completion per model, which is the only reliable check and costs
almost nothing next to discovering the problem 18 calls in.

```bash
npm run compare-models -- --verify
```

If `gemini-3.6-flash-lite` 404s, the id is wrong or the model does not exist under
that name — not a bad key. Check the provider's current catalogue and update
`CANDIDATES` in the script.

**Know the size.** The default matrix is 3 models × 3 contexts × 2 languages = 18
calls on one resume, at roughly 3,900 input tokens each. `--dry-run` prints the
plan first. To narrow:

```bash
npm run compare-models -- --languages en --contexts government_form
npm run compare-models -- --models gemini-3.6-flash,claude-haiku-4-5
```

---

## Adding a resume

```bash
npm run compare-models -- --resume docs/database/BD_Resume_Test_03.pdf
```

PDF, DOCX and TXT all work — PDFs go through the same `extractText()` the upload
route uses, so the model sees exactly what it would see in the app.

One resume is a spot check, not a result. The P83 study used ten per model for a
reason: a single resume cannot distinguish a model that understands the rules
from one that happened to stay quiet on this document. Treat a one-resume run as
a screen, and re-run the shortlist across several before changing
`AI_MODEL_FREE` / `AI_MODEL_PREMIUM`.

---

## Changing the model afterwards

Both tiers are plain environment variables in `server/.env`:

```
AI_MODEL_FREE=gemini-3.6-flash
AI_MODEL_PREMIUM=gemini-3.6-flash
```

The tier plumbing is live — registration writes the plan to `users.tier`, the
quota middleware reads it, and `resolveTier()` passes it to `getModel()` — so
splitting the tiers is an env edit with no code change, as long as both models
are reachable from the configured provider. Google AI Studio cannot serve Haiku,
so a Gemini-free / Haiku-premium split needs the provider layer changed too.
