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
| `audit_log` | Administrative writes to content, with before/after snapshots |
| `schema_migrations` | Which migrations have been applied |

Two things about that list are worth knowing before you touch it.

**Chat transcripts are the most sensitive data here.** They are free text about
people's own job situations. Guests are never stored, deleting a user destroys
their conversations, and there is deliberately no retention policy yet — agree
one and add it, rather than letting history accumulate indefinitely by default.

**Review history stores the redacted feedback, never the resume text.** Uploads
are deleted from disk after analysis, and storing the extracted text would undo
that.

If you would rather run the SQL by hand, the files are in `server/migrations`
and the order is the `ORDER` array at the top of `server/scripts/migrate.js`.
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

### Troubleshooting

If the server fails to start with `Cannot find package 'dotenv' imported from
ai-service`, the workspace link has not been built. Delete `node_modules` at the
repository root, in `server` and in `ai-service`, then run `npm install` from
`server` again.
