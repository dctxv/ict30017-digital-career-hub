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

### Troubleshooting

If the server fails to start with `Cannot find package 'dotenv' imported from
ai-service`, the workspace link has not been built. Delete `node_modules` at the
repository root, in `server` and in `ai-service`, then run `npm install` from
`server` again.
