# ict30017-digital-career-hub

# Digital Career Hub with AI-Powered Resume Review

A web platform designed to help students and job seekers improve their career readiness through curated resources, AI-powered resume analysis, and an interactive career chatbot.

## Team Members
- Isar Ujoodah
- Ian Rashmika
- Darius Tan
- Sineth Munasinghe
- Shalitha Senadeerage
- Pubuditha Hettiarachchi

## How to run the web / backend

### Prerequisites

- Node.js 20 or newer
- PostgreSQL 16 or newer, running locally on port 5432

### 1. Configure the environment

Copy `server/.env.example` to `server/.env` and fill in the real values. The
server will not start if `GOOGLE_AI_API_KEY`, `AI_MODEL_FREE`, `AI_MODEL_PREMIUM`
or `JWT_SECRET` are missing, and there is no fallback by design.

`GOOGLE_AI_API_KEY` is a Google AI Studio key (https://aistudio.google.com/apikey).
The AI calls go to Google's OpenAI-compatible endpoint, so model ids carry no
vendor prefix: `gemini-3.6-flash`, not `google/gemini-3.6-flash`.

```
cp server/.env.example server/.env
```

### 2. Create the database

Create the database named in `DB_NAME` (the default is `career_hub_db`), then
apply the migrations.

```
cd server
npm install
npm run migrate
```

`npm run migrate` applies everything outstanding, in order, and records what it
applied in a `schema_migrations` table so a second run is a no-op. Use
`npm run migrate -- --status` to see what is applied without changing anything.

It connects using `server/.env`, the same settings the app itself uses, so it
always targets the database the app targets. That matters now that a shared
hosted instance exists: the old `psql -U postgres -d career_hub_db` commands
hardcoded the LOCAL database and would silently migrate the wrong one.

**Against the shared database, migrations run ONCE, by one person.** The ledger
makes a repeat run harmless, but only for whoever runs it — coordinate first.
This is also what protects `seed_bangla_content.sql`, which overwrites the `_bn`
columns by design: once recorded it never runs again, so it cannot discard a
translation someone has edited through the admin dashboard.

### What the migrations create

| Table | Holds |
|---|---|
| `users` | Accounts, tier, quota counters, profile and lifecycle |
| `disciplines`, `career_paths`, `resources`, `alumni` | Content, bilingual (`_bn` columns) |
| `resumes`, `ai_reviews` | Resume review history, including the full redacted feedback |
| `chat_conversations`, `chat_messages` | Chatbot transcripts for signed-in users |
| `subscriptions` | Why an account holds its tier, and until when |
| `user_gaps` | What each user is missing for the roles they target, and whether it is still open |
| `mock_interviews` | Practice interviews: the questions, the answers and the assessment |
| `audit_log` | Administrative writes to content, with before/after snapshots |
| `schema_migrations` | Which migrations have been applied |

Two things about that list are worth knowing before you touch it.

**Chat transcripts are the most sensitive data here.** They are free text about
people's own job situations. Guests are never stored, deleting a user destroys
their conversations, and there is deliberately no retention policy yet — agree
one and add it, rather than letting history accumulate indefinitely by default.

**Review history stores the redacted feedback, never the resume text.** Uploads
are deleted from disk after analysis, and storing the extracted text would undo
that. A mock interview reads a resume the same way — in memory, deleted in the
same request — and keeps only the questions it produced and the file's name.

**Interview answers are the second most sensitive column here**, for the same
reason chat transcripts are the first: they are free text about the user's own
career. They are destroyed outright when an account is deleted rather than
anonymised, and the retention question is as open for them as it is for chat.

If you would rather run the SQL by hand, the files are in `server/migrations`
and the order is the `ORDER` array at the top of `server/scripts/migrate.js`.
### If the server starts but every query fails

```
Server running on http://localhost:3000
[schema] Could not verify content schema: password authentication failed for user "postgres"
[resources] list failed: password authentication failed for user "postgres"
```

The server booted, so `server/.env` exists and the AI variables are set. The
database half of it is wrong. In order of likelihood:

1. `DB_PASSWORD` does not match the password set for the `postgres` role during
   the PostgreSQL install. It is not the Windows account password. Reset it if
   you cannot remember it:
   `psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'yourpassword';"`
2. `DB_NAME` names a database that does not exist yet. Create it, then run
   `npm run migrate`.
3. A stray quote or trailing space in the `.env` value — `DB_PASSWORD=pass`,
   not `DB_PASSWORD="pass"`.

Verify the credentials outside the app before changing anything else:

```
psql -U postgres -d career_hub_db -c "select 1"
```

If that prompts and succeeds, the same values belong in `server/.env`. If it
fails, the problem is PostgreSQL, not this repository.

On Windows, `psql` is not on PATH after a default PostgreSQL install — it lives
at `C:\Program Files\PostgreSQL\<version>\bin\psql.exe` — which is the main
reason this runner exists.


### 3. Start the backend

Open a PowerShell terminal in the project directory and run:

```
cd server
npm install
npm run dev
```

`npm install` only needs to be run the first time, and again whenever
dependencies change. It installs the dependencies for both `server` and
`ai-service`, because the repository root is an npm workspace and `ai-service`
is consumed by package name rather than by relative path. You do not need to
run a separate install inside `ai-service`.

The API listens on http://localhost:3000.

### 4. Start the frontend

Open a second PowerShell terminal and run:

```
cd client
npm install
npm run dev
```

Then open the client URL, which is http://localhost:5173 by default. Vite also
prints a http://127.0.0.1:5173 address, and both are accepted by the API CORS
allowlist.

The dev server proxies `/api` to `http://localhost:3000`. If you are running a
second checkout — a worktree, or a branch you are reviewing beside `main` — the
two will fight over that port, so point the proxy somewhere else instead of
moving the API:

```
$env:API_PROXY_TARGET = "http://localhost:3100"
npm run dev
```

### Appearance and language

Both are attributes on `<html>`, set before React mounts by the inline script in
`client/index.html` — otherwise the first painted frame is always light and
Latin, and a Bangla or dark-theme user sees the page reflow on every load.

`data-theme` follows the operating system until the user picks one explicitly,
and then stops following it. Every colour resolves through a token declared for
both themes in `client/src/styles/theme.css`; nothing downstream hardcodes a hex
value, which is what makes the switch a single attribute change. If you add a
colour, add it there in both themes rather than inline.

### The account area

`/profile` is five tabs over `/api/users`, which is scoped to the session
throughout and takes no user id from the caller:

| Route | Does |
|---|---|
| `GET /api/users/me` | The full profile, including the fields `/api/auth/me` omits |
| `PATCH /api/users/me` | Partial edit. Changing the email needs the current password |
| `POST /api/users/me/password` | Change password, current one required |
| `GET /api/users/me/export` | Everything held about the account, as JSON |
| `DELETE /api/users/me` | Delete, current password required |
| `GET/POST/DELETE /api/users/me/subscription` | Read or change the tier |
| `GET /api/resume/history`, `/history/:id` | Past reviews, and one in full |

Deleting an account removes every review, resume row and subscription record,
and keeps the `users` row deactivated and scrubbed of anything identifying, so
audit records still resolve. A deleted account is refused at login, at the
session probe, and by `requireActiveAccount` on every account route — its token
stays cryptographically valid for the rest of its hour, and signature validity
is the only thing `requireAuth` can check.

**No payment gateway is connected.** Choosing or upgrading to Premium records
the tier and the name of the instrument, takes no money, and stores no card or
mobile number. The registration and upgrade screens both say so on the form.

### Preparation and the mock interview

`/preparation` is three tabs over `/api/preparation`. Signed-in only throughout,
which is a different call from the resume review deliberately: a gap belongs to a
person across analyses, and an anonymous interview would spend two model calls to
produce something the tab closing throws away.

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
produces identified weaknesses; both convert into the same Gap record, so there
is one board fed by two sources rather than two lists that never meet.

**A Gap is keyed, not described.** The model returns `gap_key` from a constrained
vocabulary — `skill:sql`, `evidence:work-experience`, `credential:ielts` — and
ai-service normalises it before it is stored. That key is the whole reason the
profile can show progress: free-text descriptions never match across two runs, so
a store keyed on prose accumulates duplicates it can never close.

**Three statuses, and the difference matters.** A gap opens on first detection,
closes when a later analysis from the same source no longer finds it, and can be
dismissed by the user. Dismissed is not closed: it leaves the progress figure
entirely rather than counting towards it, so nobody improves their score by
disagreeing with the analysis. Progress is weighted by severity for the matching
reason — counted, three trivial fixes would outrank the qualification the job
actually required.

**Gap extraction from a review costs one extra model call**, fired after the
response has been written so nothing the user is waiting for gets slower, and
skipped entirely for guests. A mock interview is exactly two calls: one writes all
five questions, one assesses the whole transcript. A turn-by-turn design would be
twelve or more and would exhaust the free-tier daily cap inside a single client
demonstration.

**The model is never asked for a URL.** It has no browsing tool and would invent
plausible ones. It returns a search term instead, which the server matches against
the `resources` table — so every link on the board points at a row an admin
curated, and a gap with no match shows its steps and no links.

**Free accounts get two mock interviews a day** (`FREE_DAILY_INTERVIEW_LIMIT` in
`server/src/middleware/interviewQuota.js`), claimed when the questions are written
rather than when the answers are submitted, and refunded if generation fails. The
allowance is lower than the review's because an interview is two calls, not one.

**Not in this version, and deliberately:** voice or video, live coding, real-time
follow-up questioning, and anything needing a maintained skills taxonomy or a
curated role dataset.

**Open questions for the client**, all three unanswered as this ships: whether gap
history should be visible to admins or to the user only; whether a dismissal
should be permanent (it is reversible here, because the reversible version is the
one that can be made permanent later without anyone losing anything); and whether
a pasted job advertisement is retained indefinitely or purged after analysis. The
last is a privacy question and should be answered before launch rather than after.

### Troubleshooting

If the server fails to start with `Cannot find package 'dotenv' imported from
ai-service`, the workspace link has not been built. Delete `node_modules` at the
repository root, in `server` and in `ai-service`, then run `npm install` from
`server` again.
