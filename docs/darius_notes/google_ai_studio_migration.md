# Google AI Studio Migration + Schema Repair

**Date:** 2026-08-27
**Commit:** `367072d` — provider switched to Google AI Studio
**Scope:** AI provider swap, two defects it exposed, and five unapplied database migrations found while verifying the result.

---

## 1 — Provider migration: OpenRouter → Google AI Studio

| | Before | After |
|---|---|---|
| Key variable | `OPENROUTER_API_KEY` | `GOOGLE_AI_API_KEY` |
| Base URL | `https://openrouter.ai/api/v1` | `https://generativelanguage.googleapis.com/v1beta/openai/` |
| Model (both tiers) | `z-ai/glm-5.2` | `gemini-3.6-flash` |
| SDK | `openai` ^4.104.0 | unchanged |

Google AI Studio serves an OpenAI-compatible endpoint, so the `openai` package and all
three call sites (`chatbot.js` ×1, `resumeReviewer.js` ×2) were left untouched. Only the
client construction in `ai-service/src/utils/aiClient.js` changed.

**Model ids lost their vendor prefix.** OpenRouter uses `google/gemini-3.6-flash`;
AI Studio uses bare `gemini-3.6-flash`. The prefixed form is a 404 against this endpoint.

**Two documented model decisions became unimplementable.** The client's 2026-08-22 choice
of GLM-5.2 on both tiers, and the May 2026 feasibility report's split (Gemini 3.1 Flash
Lite free / Claude Haiku 4.5 premium). Neither Z-AI nor Anthropic is served by Google AI
Studio. The per-tier variables remain separate, so a split *within Google's catalogue*
stays a pure env-var change.

The old OpenRouter key is preserved in `server/.env.backup-pre-google` (gitignored).

---

## 2 — Defect: every chatbot request returned 404

**Symptom:**
```
[chat] Chatbot stream failed: 404 status code (no body)
```

**Root cause:** the first model tried was `gemini-2.5-flash`. Google rejects it:

> This model models/gemini-2.5-flash is no longer available to new users.
> Please update your code to use models/gemini-3.6-flash for the latest features.

Not the key, not the URL, not the trailing slash — the model was closed to newly-created
API keys.

**The trap worth remembering:** `GET /v1beta/openai/models` returns **200** and lists
`gemini-2.5-flash` and `gemini-2.5-pro`. Both **404 on use**. The models listing is not a
source of truth for what your key can actually call. The only reliable test is sending a
real completion.

Candidates tested with live requests:

| Model | Result |
|---|---|
| `gemini-3.6-flash` | 200 — **chosen**, Google's own stated migration target |
| `gemini-3.5-flash` | 200 |
| `gemini-3.1-flash-lite` | 200 — the feasibility report's original free-tier pick |
| `gemini-3.7-flash` | 503, "experiencing high demand" — too unreliable |
| `gemini-2.5-flash`, `gemini-2.5-pro` | 404, closed to new keys |

**Fix:** `AI_MODEL_FREE` and `AI_MODEL_PREMIUM` both set to `gemini-3.6-flash`.

---

## 3 — Defect: every resume review returned 400

**Symptom:** UI showed "The analysis could not be completed… Reference code: INTERNAL".
Server log:
```
[resume-stream] Sanitised text length: 1449 chars
[resume-stream] Error during analysis: BadRequestError: 400 status code (no body)
    at async analyzeResumeStream (ai-service/src/services/resumeReviewer.js:455:20)
```

**Root cause:** `AI_COMPLETION_PARAMS` sent four parameters. Gemini accepts two and
rejects the other two outright rather than ignoring them:

```
frequency_penalty -> 400 Invalid JSON payload received.
                         Unknown name "frequency_penalty": Cannot find field.
presence_penalty  -> 400 Penalty is not enabled for this model
```

The request is rejected **before any token is generated**, so this broke every review
regardless of file content. The UI's advice to "upload a different copy of your resume"
could never have worked.

**Fix:** both penalties removed from `ai-service/src/config/reviewConstants.js`.
`temperature: 0.1` and `max_tokens: 6144` are accepted and unchanged.

**Why the blast radius was total:** `AI_COMPLETION_PARAMS` is spread into *both*
`analyzeResume` and `analyzeResumeStream`. A single unsupported key in that shared object
fails every review path at once. If a future provider supports penalties again, reinstate
them behind a provider check rather than back into the shared constant.

Losing them costs little: at `temperature: 0.1` against a strict JSON schema there is
almost no sampling freedom for a repetition penalty to act on.

---

## 4 — Database: five migrations had never been applied

Found while verifying the AI fixes actually persisted.

**State on arrival:** 10 of 15 migrations applied. `schema_migrations` stopped after
`seed_bangla_content.sql`. Six tables the code actively queries did not exist:
`resumes`, `ai_reviews`, `chat_conversations`, `chat_messages`, `subscriptions`,
`audit_log`. `users` was missing `last_login_at`, `phone`, `discipline`, `updated_at`
and the rest of the profile columns.

### Consequence 1 — silent data loss

Every write to those tables sits in a try/catch that logs and continues, which
`server/src/schemaCheck.js` documents as deliberate. Review history, chat transcripts and
the admin audit trail were never recorded, and nothing in the UI looked wrong.

### Consequence 2 — a real login bug

`server/src/routes/auth.js:252-257` resets the failure counter in the same statement that
stamps the login time:

```sql
UPDATE users
   SET failed_login_attempts = 0, lockout_until = NULL, last_login_at = NOW()
 WHERE user_id = $1
```

…followed by `.catch(() => {})`. The missing `last_login_at` column made the whole
statement fail silently, so **a successful login never cleared the failure counter**.
Five bad attempts followed by the correct password left the account still locked. Login
itself succeeded — the token is issued after the catch.

### Fix and current state

`cd server && npm run migrate` applied all five. Now 15/15 applied, 12 tables.
`subscriptions` backfilled to 32 rows — the migration inserts one `premium`/`active` row
per existing premium user, guarded by a `NOT EXISTS` so a re-run adds nothing. The other
new tables are empty.

Residual: **2 accounts still carry `failed_login_attempts > 0`** from the period the reset
was failing. None are currently locked, so this is not urgent, but those counters are
stale rather than real.

---

## 5 — Verification performed

| Check | Result |
|---|---|
| Chatbot streaming | 186 chars returned, coherent |
| `BD_Resume_Test_04.pdf` → streaming path | 1449 chars sanitised (identical to the failure log), 4891 chars streamed, schema validated |
| One-shot `analyzeResume`, international mode | `overall_score=52` |
| Full persistence round-trip | inserted via the same two INSERTs as `saveReviewToDb`, read back `overall_score 62 / ats_score 66 / model gemini-3.6-flash / feedback valid JSON`, test rows then deleted |
| `npm test` (ai-service) | 73 pass, 0 fail |
| `checkContentSchema` at boot | silent |

---

## 6 — Follow-ups

**For every teammate, on their own machine:**

1. Replace `OPENROUTER_API_KEY` with `GOOGLE_AI_API_KEY` in `server/.env` and set both
   model variables to `gemini-3.6-flash`. See `server/.env.example`.
2. Run `cd server && npm run migrate`. **The migration fix above applied only to the local
   database.** Everyone else has the same five-migration gap until they run it.

**Known-broken, accepted:** `ai-service/scripts/batch-review.js` still reads
`OPENROUTER_API_KEY`, which no longer exists in `.env`, so the evaluation tooling exits at
startup. This was a deliberate call — `model-config.js` compares nine models across five
vendors and only the Gemini rows would survive a move to Google. Re-add an OpenRouter key
if that tooling is needed for the report.

**Cosmetic:** `getGroqClient()` has now outlived two providers — Groq, then OpenRouter,
now Google. Renaming it to `getAIClient()` touches four files.

**Tooling note:** `psql` is not on PATH after the default Windows PostgreSQL install; the
binary is at `C:\Program Files\PostgreSQL\18\bin\psql.exe`. This is the same trap
`server/scripts/migrate.js` was written to route around, and it is why the README's
original `psql -U postgres -d career_hub_db` setup commands fail for most of the team.
