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
server will not start if `OPENROUTER_API_KEY`, `AI_MODEL_FREE`, `AI_MODEL_PREMIUM`
or `JWT_SECRET` are missing, and there is no fallback by design.

```
cp server/.env.example server/.env
```

### 2. Create the database

Create the database named in `DB_NAME` (the default is `career_hub_db`), then
apply the migrations in `server/migrations` in this order:

```
psql -U postgres -c "CREATE DATABASE career_hub_db"
psql -U postgres -d career_hub_db -f server/migrations/create_users_table.sql
psql -U postgres -d career_hub_db -f server/migrations/add_login_attempt_tracking.sql
psql -U postgres -d career_hub_db -f server/migrations/add_password_reset_tokens.sql
psql -U postgres -d career_hub_db -f server/migrations/add_chat_turn_tracking.sql
psql -U postgres -d career_hub_db -f server/migrations/add_user_tier.sql
psql -U postgres -d career_hub_db -f server/migrations/create_content_tables.sql
psql -U postgres -d career_hub_db -f server/migrations/seed_content_data.sql
```

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
