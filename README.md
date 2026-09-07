# Digital Career Hub with AI-Powered Resume Review

A web platform that helps Bangladeshi students and job seekers get career-ready:
curated career paths and resources, an AI resume review tuned to how hiring
actually works in Bangladesh, a bilingual (English / Bangla) career chatbot, and
a mock interview that feeds a personal preparation plan.

Swinburne ICT30017 capstone, project P83.

## Team

- Isar Ujoodah
- Ian Rashmika
- Darius Tan (AI lead)
- Sineth Munasinghe
- Shalitha Senadeerage
- Pubuditha Hettiarachchi

---

## Contents

1. [What is in the box](#1-what-is-in-the-box)
2. [Quick start](#2-quick-start) — a fresh machine to a running site
3. [Check that everything works](#3-check-that-everything-works)
4. [Using the site for the first time](#4-using-the-site-for-the-first-time)
5. [How the AI is wired](#5-how-the-ai-is-wired)
6. [Every command, in one place](#6-every-command-in-one-place)
7. [Troubleshooting](#7-troubleshooting)
8. [Reference](#8-reference) — database, account area, preparation, appearance

---

## 1. What is in the box

```
ict30017-digital-career-hub/
├── client/       React + Vite front end            (http://localhost:5173)
├── server/       Express API + PostgreSQL access    (http://localhost:3000)
├── ai-service/   Prompts, model client, JSON repair — used by server, not run on its own
├── docs/         Feasibility study, session notes, QA report, test resumes
└── ai_testing/   Generated model-comparison output
```

Three moving parts at run time, and you start two of them:

| Part | What it is | How it starts |
|---|---|---|
| PostgreSQL | The database. Holds accounts, content, review history, chat transcripts, gaps and interviews. | Installed once, runs as a service |
| API server | `server/` — Node.js. Talks to PostgreSQL and to Google AI Studio. | `npm run dev` in `server/` |
| Front end | `client/` — Vite dev server. Serves the React app and proxies `/api` to the API server. | `npm run dev` in `client/` |

The AI itself is not something you install. Every AI feature calls Google AI
Studio over the internet using one API key, so the machine needs internet
access while the site is in use.

---

## 2. Quick start

Written for Windows, because that is what the client runs. The macOS / Linux
differences are one-liners and are noted where they occur.

### Step 1 — Install the prerequisites

| Software | Version | Where |
|---|---|---|
| Node.js | 20 or newer (22 is what the project is tested on) | https://nodejs.org — pick the LTS installer, accept the defaults |
| PostgreSQL | 16 or newer | https://www.postgresql.org/download/windows/ — the EDB installer |
| Git | any | https://git-scm.com/download/win |

During the PostgreSQL install you will be asked to choose a password for the
`postgres` user. **Write it down.** It goes into the configuration file in
Step 4 and it is the single most common thing to get wrong. Leave the port at
5432. You do not need Stack Builder.

After installing, close and reopen your terminal so `node` and `npm` are on
the path. Check:

```
node --version      # v20.x or v22.x
npm --version
```

### Step 2 — Get the code

```
git clone https://github.com/dctxv/ict30017-digital-career-hub.git
cd ict30017-digital-career-hub
```

### Step 3 — Get a Google AI Studio key

1. Go to https://aistudio.google.com/apikey and sign in with a Google account.
2. Click **Create API key**. Copy it somewhere safe.

The key is free and takes under a minute. One key serves every AI feature.
Keep it private: anyone holding it can spend the project's daily allowance.

### Step 4 — Create the configuration file

Copy the example and open the copy in any text editor:

```
Copy-Item server\.env.example server\.env      # PowerShell
notepad server\.env
```

(macOS / Linux: `cp server/.env.example server/.env`.)

Only **two** lines need a real value:

```
GOOGLE_AI_API_KEY=paste_your_key_here
DB_PASSWORD=the_postgres_password_from_step_1
```

And one line should be changed from its placeholder to any random text of 32
or more characters:

```
JWT_SECRET=some_long_random_string_nobody_can_guess_at_least_32_chars
```

Everything else in the file already holds a working value, including the model
ids. Write values bare, with no quotes: `DB_PASSWORD=secret`, not
`DB_PASSWORD="secret"`. The server refuses to start while any placeholder
value is still in place, and says which one.

### Step 5 — Create the database and apply the schema

Create an empty database called `career_hub_db`. Either use pgAdmin (installed
with PostgreSQL: right-click **Databases → Create → Database**), or from a
terminal:

```
psql -U postgres -c "CREATE DATABASE career_hub_db;"
```

On Windows `psql` is not on the path by default. Either use pgAdmin, or use the
full path: `"C:\Program Files\PostgreSQL\16\bin\psql.exe"` (adjust the version
number to match your install).

Then install the server dependencies and apply the migrations. This creates
every table and loads the disciplines, career paths, resources and alumni,
in both languages:

```
cd server
npm install
npm run migrate
```

`npm install` here installs `ai-service` too; the repository root is an npm
workspace. You do not run a separate install inside `ai-service/`.

`npm run migrate` records what it applied, so running it again is harmless
and does nothing. `npm run migrate -- --status` lists what is applied.

### Step 6 — Check the setup

Still in `server/`:

```
npm run check
```

This tests every step above in order — Node version, the configuration file,
the model ids, the database connection, the migrations, the seeded content,
and finally sends one tiny real request to the AI model — and prints PASS or
FAIL for each with the fix for any FAIL. A clean run ends with:

```
Everything checks out. Start the app:
```

If something fails, fix the first FAIL and run it again. Section 7 has the
common ones.

### Step 7 — Start the API server

```
cd server
npm run dev
```

Leave this terminal open. It prints `Server running on http://localhost:3000`
and then any warnings about the database schema. The dev server restarts
itself when a file changes.

### Step 8 — Start the front end

Open a **second** terminal:

```
cd client
npm install
npm run dev
```

Open the address it prints, which is http://localhost:5173 by default. Vite
also prints a http://127.0.0.1:5173 address, and both work.

Both `npm install` commands only need running the first time, and again
after pulling changes that touch dependencies.

---

## 3. Check that everything works

Three quick things after both servers are up.

**The API is healthy.** Open http://localhost:3000/api/health in a browser.
It reports the database and which models are configured:

```json
{"ok":true,"database":"connected","ai":{"keyConfigured":true,"models":{"free":"gemini-3.6-flash","premium":"gemini-3.6-flash"}}}
```

`ok: false` means the database is unreachable. This endpoint never calls the
AI, so a green health check does not prove the key works — `npm run check`
does that.

**The site loads with content.** http://localhost:5173/careers should list
career paths and http://localhost:5173/resources should list resources. Empty
lists with a "could not load" message mean the API cannot reach the database.

**The AI answers.** Open the chat bubble in the bottom-right corner and ask
"How do I write a CV for a bank job?". A streamed answer within a few seconds
means the key, the model and the internet connection are all fine. If it
fails, the message names the cause (configuration, daily allowance, or
connection) and the server terminal has a line starting `[ai-upstream]` that
says what to fix.

The automated suites, if you want them:

```
cd ai-service && npm test      # prompts, JSON repair, error classification, gap engine
cd server     && npm test      # PII redaction, localisation, alumni contacts
cd client     && npm test      # translation parity between English and Bangla
cd client     && npm run lint
cd client     && npm run build
```

`client/npm run test:e2e` runs the Playwright browser tests and needs both
servers running. `live-happy-path.spec.js` makes a real model call.

---

## 4. Using the site for the first time

**Register an account** at http://localhost:5173/register. Passwords must be
at least 12 characters. Pick Free or Premium — no payment is taken either way;
Premium only lifts the daily limits. Registration signs you in and opens your
profile.

**Free-tier daily limits**, per account, reset each calendar day:

| Feature | Free | Premium / admin |
|---|---|---|
| Resume reviews | 3 | unlimited |
| Chatbot messages | 10 | unlimited |
| Mock interviews | 2 | unlimited |

A review or interview that fails on the server side is refunded, so a
configuration problem cannot use up someone's allowance.

**Guests** (not signed in) can use the resume review and the chatbot, bounded
per address rather than per account. Their reviews and conversations are not
stored. The preparation plan and mock interview need an account, because a gap
belongs to a person across analyses.

**Make yourself an admin.** There is deliberately no button for this. Register
normally, then promote the account in the database:

```
psql -U postgres -d career_hub_db -c "UPDATE users SET role = 'admin' WHERE email = 'you@example.com';"
```

Log out and in again. An **Admin** entry appears in the navigation and
http://localhost:5173/admin lets you edit disciplines, career paths, resources
and alumni in both languages. Every admin write is recorded in `audit_log`.

**Password reset does not send email.** No mail service is connected. When
someone uses "Forgot password", the reset token is printed in the API server
terminal:

```
[auth] Password reset token for user@example.com: <token>
```

Open http://localhost:5173/reset-password, enter the email, that token and the
new password. Connecting a real mail provider is a future step.

**Language and theme** are the two toggles in the navigation bar. Everything —
the interface, the content, the AI feedback, the chatbot and every error
message — follows the language toggle.

---

## 5. How the AI is wired

One key, one provider, four features. Everything below lives in `ai-service/`
and is called by the routes in `server/src/routes/`.

```
                         server/.env
                GOOGLE_AI_API_KEY, AI_MODEL_FREE, AI_MODEL_PREMIUM
                                  │
                                  ▼
             ai-service/src/utils/aiClient.js   one OpenAI-compatible client
             pointed at Google AI Studio; the model is chosen per account tier
                                  │
      ┌──────────────┬────────────┼──────────────┬──────────────────┐
      ▼              ▼            ▼              ▼                  ▼
 resumeReviewer   chatbot     mockInterview    gapEngine       (any future call)
 streams JSON,    streams     2 calls: write   1 call after a   goes through
 repairs it,      text        5 questions,     review, turns    utils/completion.js
 validates it                 mark answers     it into gaps
      │              │            │              │
      ▼              ▼            ▼              ▼
 routes/resume.js  routes/chatbot.js   routes/preparation.js
```

**Provider and model.** Google AI Studio's OpenAI-compatible endpoint, so the
`openai` npm package is the client. Both tiers currently resolve to
`gemini-3.6-flash`. The two variables stay separate so a premium/free split
within Google's catalogue is a one-line change in `server/.env` with no code
edit. Model ids are the bare Google form — `gemini-3.6-flash`, never
`google/gemini-3.6-flash`. The server exits at startup if either variable is
missing; there is no hidden fallback, and the GPT-4o family is rejected
outright by client decision.

**Resume review.** `POST /api/resume/analyze-stream`. The upload is read in
memory (PDF or DOCX, 3 MB cap, checked by magic bytes), sanitised, and sent
with a system prompt assembled from the application context the user
selected — channel (Bdjobs, government form, referral…), employer type,
career stage and sector. Four context dimensions compose about 3,000 distinct
rulebooks, which is what lets the reviewer say "keep the photograph" for a BCS
form and "remove the photograph" for a multinational. The model streams JSON;
the client renders it as it arrives; the server repairs truncated or malformed
JSON, recalculates every score deterministically, strips any candidate PII the
model echoed, validates against a schema, and only then stores it. The
uploaded file is deleted in the same request, always, and the extracted text
is never stored.

**Chatbot.** `POST /api/chat`. Bangladesh-scoped career guidance only; it
declines other topics. Conversation history is windowed to a token budget,
prompt-injection phrases and phone/NID numbers are stripped from input, and
signed-in users' transcripts are kept per conversation.

**Mock interview and preparation plan.** `POST /api/preparation/interviews`
writes five questions in one call (generic for the role, or grounded in an
uploaded resume and a pasted job advertisement); submitting the answers is one
more call that marks the transcript. Both the interview and the resume review
emit *gaps* — keyed items such as `skill:sql` or `credential:ielts` — into one
board per user, with severity-weighted progress. The model never produces a
URL: it returns a search term, which the server matches against the curated
`resources` table, so every link points at something an admin approved.

**Bangla.** The language toggle adds an output-language directive to the
system prompt and a reminder at the very end of the user message. Scores, enum
values, keyword lists and grammar corrections stay in English by design,
because a Bangladeshi CV is written in English. Every user-facing error from
the API is translated on the way out (`server/src/i18n/`).

**When the provider fails.** Every call site returns a code instead of
throwing, classified in `ai-service/src/utils/aiErrors.js`:

| Code | Meaning | HTTP | Fix |
|---|---|---|---|
| `AI_AUTH` | Key rejected | 502 | `GOOGLE_AI_API_KEY` in `server/.env` |
| `AI_MODEL` | Model not available to this key | 502 | `AI_MODEL_FREE` / `AI_MODEL_PREMIUM`; run `npm run check` |
| `AI_QUOTA` | Day's free allowance spent | 503 | Wait for the reset (midnight Pacific), or enable billing |
| `AI_BUSY` | Per-minute throttle | 503 | Retry in a minute |
| `AI_UNAVAILABLE` | Provider 5xx | 503 | Retry later |
| `AI_UNREACHABLE` | No route to Google | 503 | Internet, proxy, firewall |
| `AI_BAD_REQUEST` | Request body refused | 502 | See the `[ai-upstream]` line in the log |

The user sees a sentence that names the cause and whether retrying helps. The
server terminal gets two lines starting `[ai-upstream]`: the code, status and
provider message, then the fix. A review or interview that fails this way is
refunded to the user's daily allowance.

**Costs and limits.** A resume review is roughly 5,000–6,600 tokens; an
interview is two calls; a review also fires one gap-extraction call after the
response is sent. The free Google tier is comfortably enough for a
demonstration and small pilot. The application-side daily limits in Section 4
are what actually bind.

**Where the prompts are.** `ai-service/src/prompt/` — `core.js` (always on),
`bangladeshMarket.js`, `channels.js`, `employers.js`, `stages.js`,
`sectors.js`, `outputContract.js`, `language.js`, `gaps.js`, `interview.js`.
`ai-service/tests/golden/` holds snapshots of seven assembled prompts; the
snapshot test fails if a prompt changes, which is the intended reminder to
re-run the comparison harness. `docs/darius_notes/` records every prompt
iteration and why.

**Comparing models.** `cd server && npm run compare-models -- --verify` checks
that candidate model ids answer; without `--verify` it runs the production
prompt through each candidate and scores the output mechanically. See
`docs/model_comparison.md`.

---

## 6. Every command, in one place

Run from the directory named.

| Where | Command | Does |
|---|---|---|
| `server` | `npm install` | Install server and ai-service dependencies (once) |
| `server` | `npm run check` | Verify the whole setup, including one live model request. `-- --no-ai` skips the request |
| `server` | `npm run migrate` | Apply outstanding database migrations. `-- --status` lists them |
| `server` | `npm run dev` | Start the API with auto-restart on file change |
| `server` | `npm start` | Start the API without auto-restart |
| `server` | `npm test` | Server unit tests |
| `server` | `npm run compare-models` | Score candidate models on the production prompt |
| `client` | `npm install` | Install front-end dependencies (once) |
| `client` | `npm run dev` | Start the front end at http://localhost:5173 |
| `client` | `npm run build` | Production build into `client/dist/` |
| `client` | `npm run preview` | Serve that build locally |
| `client` | `npm run lint` | ESLint |
| `client` | `npm test` | Translation parity tests |
| `client` | `npm run test:e2e` | Playwright browser tests (both servers must be running) |
| `ai-service` | `npm test` | Prompt, JSON repair, error classification and gap engine tests |

Running a second checkout beside the first (a worktree, a branch under review)
will fight over port 3000. Point the front end's proxy at a different API port
instead of moving the API:

```
$env:API_PROXY_TARGET = "http://localhost:3100"   # PowerShell
npm run dev
```

---

## 7. Troubleshooting

Run `cd server && npm run check` first. It names the failing step and the
fix. The entries below are the same problems with more context.

### The server exits immediately with `[startup] ... is not set`

`server/.env` is missing, or one of `GOOGLE_AI_API_KEY`, `AI_MODEL_FREE`,
`AI_MODEL_PREMIUM` or `JWT_SECRET` is missing or still the placeholder. The
message names the variable. Step 4 above.

### `Server running` prints, then every page says it could not load

```
Server running on http://localhost:3000
[schema] Could not verify content schema: password authentication failed for user "postgres"
```

The server started (so the AI variables are set) but cannot reach the
database. In order of likelihood:

1. `DB_PASSWORD` does not match the password chosen for the `postgres` user
   during the PostgreSQL install. It is not your Windows password. Reset it:
   `psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'newpassword';"`
2. PostgreSQL is not running. Windows: open **Services**, start
   `postgresql-x64-16`. macOS: `brew services start postgresql@16`.
   Linux: `sudo service postgresql start`.
3. `DB_NAME` names a database that does not exist. Create it (Step 5), then
   `npm run migrate`.
4. A stray quote or trailing space in `.env`: `DB_PASSWORD=pass`, not
   `DB_PASSWORD="pass"`.

Prove the credentials outside the app: `psql -U postgres -d career_hub_db -c
"select 1"`. If that works, the same values belong in `server/.env`.

### `[schema] The database is behind the code` or `Missing tables`

The code was updated and the migrations were not run. `cd server && npm run
migrate`. Against a shared hosted database, one person runs this, once.

### The AI features fail

Look for `[ai-upstream]` in the server terminal. The second line is the fix.
The reference code on the error screen (`AI_AUTH`, `AI_MODEL`, `AI_QUOTA`…)
maps to the table in Section 5.

- **`AI_AUTH`** — the key in `server/.env` is wrong or was pasted with quotes
  or spaces. Get a fresh one from https://aistudio.google.com/apikey, replace
  the line, restart the server.
- **`AI_MODEL`** — the model id is wrong or closed to your key. Use the bare
  id (`gemini-3.6-flash`). Do not trust Google's model listing; some listed
  models return 404 on use. `npm run check` sends a real request.
- **`AI_QUOTA`** — the project's free daily allowance is spent. It resets at
  midnight Pacific time. Wait, switch model id, or enable billing on the
  Google project.
- **`AI_UNREACHABLE`** — the machine cannot reach Google. Check the internet
  connection, and any proxy or firewall.

### `Cannot find package 'dotenv' imported from ai-service`

The workspace link was not built. Delete `node_modules` at the repository
root, in `server` and in `ai-service`, then run `npm install` from `server`
again.

### Port 3000 or 5173 already in use

Another copy is running, possibly in a terminal you closed. Windows:
`netstat -ano | findstr :3000` then `taskkill /PID <pid> /F`. Or set `PORT` in
`server/.env` and `API_PROXY_TARGET` for the client as in Section 6.

### The front end shows English after choosing Bangla, or the wrong theme flashes

Both are attributes on `<html>` set before React mounts, from `localStorage`.
Clearing site data resets them. See *Appearance and language* below.

---

## 8. Reference

### Database

`server/.env` supports two connection styles. For a local PostgreSQL fill in
the `DB_*` variables and leave `DATABASE_URL` unset. For a hosted database set
`DATABASE_URL` to the provider's connection string and the `DB_*` values are
ignored. Hosted databases almost always need `DB_SSL=true` (or `no-verify`);
the failure without it reads as a generic connection error.

`npm run migrate` applies `server/migrations/*.sql` in the order listed in
`server/scripts/migrationOrder.js` and records each in `schema_migrations`,
so a second run is a no-op. That ledger is also what protects
`seed_bangla_content.sql`, which overwrites the `_bn` columns by design: once
recorded it never runs again, so it cannot discard a translation edited
through the admin dashboard. **Against a shared database, migrations run
once, by one person.**

| Table | Holds |
|---|---|
| `users` | Accounts, tier, daily counters, profile and lifecycle |
| `disciplines`, `career_paths`, `resources`, `alumni` | Content, bilingual (`_bn` columns) |
| `resumes`, `ai_reviews` | Review history, including the full redacted feedback |
| `chat_conversations`, `chat_messages` | Chatbot transcripts for signed-in users |
| `subscriptions` | Why an account holds its tier, and since when |
| `user_gaps` | What each user is missing for the roles they target, and whether it is still open |
| `mock_interviews` | Practice interviews: questions, answers and assessment |
| `audit_log` | Administrative writes to content, with before/after snapshots |
| `schema_migrations` | Which migrations have been applied |

**Chat transcripts and interview answers are the most sensitive data here.**
Both are free text about people's own job situations. Guests are never
stored, deleting a user destroys their transcripts outright, and there is
deliberately no retention policy yet — agree one and add it rather than
letting history accumulate by default.

**Review history stores the redacted feedback, never the resume text.**
Uploads are deleted from disk after analysis. A mock interview reads a resume
the same way — in memory, deleted in the same request — and keeps only the
questions it produced and the file's name.

### The account area

`/profile` is five tabs over `/api/users`, scoped to the session throughout;
no route takes a user id from the caller.

| Route | Does |
|---|---|
| `GET /api/users/me` | The full profile, including fields `/api/auth/me` omits |
| `PATCH /api/users/me` | Partial edit. Changing the email needs the current password |
| `POST /api/users/me/password` | Change password, current one required |
| `GET /api/users/me/export` | Everything held about the account, as JSON |
| `DELETE /api/users/me` | Delete, current password required |
| `GET/POST/DELETE /api/users/me/subscription` | Read or change the tier |
| `GET /api/resume/history`, `/history/:id` | Past reviews, and one in full |

Deleting an account removes every review, resume row and subscription record,
and keeps the `users` row deactivated and scrubbed of anything identifying, so
audit records still resolve. A deleted account is refused at login, at the
session probe, and by `requireActiveAccount` on every account route.

**No payment gateway is connected.** Choosing or upgrading to Premium records
the tier and the name of the instrument, takes no money, and stores no card or
mobile number. The registration and upgrade screens both say so.

### Preparation and the mock interview

`/preparation` is three tabs over `/api/preparation`, signed-in only.

| Route | Does |
|---|---|
| `GET /api/preparation/gaps` | Every gap held for the account, with resource links resolved |
| `GET /api/preparation/summary` | The severity-weighted progress figure and what to do next |
| `PATCH /api/preparation/gaps/:id` | Dismiss a gap, or bring a dismissed one back |
| `POST /api/preparation/interviews` | Write five questions. Optional resume upload and job advertisement |
| `POST /api/preparation/interviews/:id/answers` | Assess the transcript and update the board |
| `GET /api/preparation/interviews`, `/interviews/:id` | Past interviews, and one in full |
| `GET /api/preparation/quota` | Remaining mock interviews today |

**Preparation is not a third feature.** It is the shared output layer of the
other two. The resume review produces action items and the mock interview
produces identified weaknesses; both convert into the same Gap record, so
there is one board fed by two sources.

**A Gap is keyed, not described.** The model returns `gap_key` from a
constrained vocabulary — `skill:sql`, `evidence:work-experience`,
`credential:ielts` — and ai-service normalises it before it is stored. That
key is what lets the profile show progress: free-text descriptions never match
across two runs.

**Three statuses.** A gap opens on first detection, closes when a later
analysis from the same source no longer finds it, and can be dismissed by the
user. Dismissed leaves the progress figure entirely rather than counting
towards it, so nobody improves their score by disagreeing with the analysis.

**Not in this version, and deliberately:** voice or video, live coding,
real-time follow-up questioning, and anything needing a maintained skills
taxonomy or a curated role dataset.

**Open questions for the client:** whether gap history should be visible to
admins or to the user only; whether a dismissal should be permanent (it is
reversible here, because the reversible version can be made permanent later
without anyone losing anything); and whether a pasted job advertisement is
retained indefinitely or purged after analysis. The last is a privacy
question and should be answered before launch.

### Appearance and language

Both are attributes on `<html>`, set before React mounts by the inline script
in `client/index.html` — otherwise the first painted frame is always light and
Latin, and a Bangla or dark-theme user sees the page reflow on every load.

`data-theme` follows the operating system until the user picks one explicitly,
and then stops following it. Every colour resolves through a token declared
for both themes in `client/src/styles/theme.css`; nothing downstream hardcodes
a hex value. If you add a colour, add it there in both themes.

Translations live in `client/src/i18n/en.js` and `bn.js`. A test fails if a
key exists in one and not the other, so an untranslated string cannot ship
silently. API error messages are translated server-side in
`server/src/i18n/messages.js`, keyed by the exact English sentence.

### Contributing

See `docs/GIT_WORKFLOW.md` for the branch and pull-request process, and
`.github/PULL_REQUEST_TEMPLATE.md` for what a PR must state.
