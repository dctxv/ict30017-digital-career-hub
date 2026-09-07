/**
 * Script: check-setup
 * Responsibility: Answer "is this machine ready to run the Digital Career Hub"
 * in one command, and when it is not, say exactly which step to go back to.
 *
 *   cd server
 *   npm run check            everything, including one real AI request per model
 *   npm run check -- --no-ai skip the AI request (costs nothing, proves less)
 *
 * Why this exists: the server prints "Server running" before it has touched
 * the database or the model provider, so a machine with a wrong password, an
 * unapplied migration or a rejected API key looks healthy at startup and fails
 * on the first click. Every one of those has been reported by a teammate as
 * "the backend does not work". This runs the same checks in the same order the
 * README's setup steps are written in, so the first failure names the step.
 *
 * It uses the app's own code wherever there is any: the same pool as the
 * server (so it tests the database the server will use, never a different
 * one), the same model resolution, the same client and the same error
 * classifier — so a failure here reads the same way it would in the log.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = path.resolve(__dirname, '..');
const ENV_PATH = path.join(SERVER_DIR, '.env');

const { values: flags } = parseArgs({
  options: {
    'no-ai': { type: 'boolean', default: false },
  },
});

/* ── Reporting ────────────────────────────────────────────────────────── */

const results = [];

function pass(step, detail) {
  results.push({ ok: true, step, detail });
  console.log(`  PASS  ${step}${detail ? ` — ${detail}` : ''}`);
}

function fail(step, detail, fix) {
  results.push({ ok: false, step, detail, fix });
  console.log(`  FAIL  ${step}${detail ? ` — ${detail}` : ''}`);
  if (fix) for (const line of [].concat(fix)) console.log(`        ${line}`);
}

function warn(step, detail, fix) {
  results.push({ ok: true, warn: true, step, detail });
  console.log(`  WARN  ${step}${detail ? ` — ${detail}` : ''}`);
  if (fix) for (const line of [].concat(fix)) console.log(`        ${line}`);
}

function heading(text) {
  console.log('');
  console.log(text);
}

/* ── 1. Node ──────────────────────────────────────────────────────────── */

heading('Node.js');
{
  const major = Number(process.versions.node.split('.')[0]);
  if (major >= 20) pass('Node.js version', `v${process.versions.node}`);
  else fail('Node.js version', `v${process.versions.node}`, 'Install Node.js 20 or newer from https://nodejs.org and reopen the terminal.');
}

/* ── 2. server/.env ───────────────────────────────────────────────────── */

heading('Configuration (server/.env)');

const PLACEHOLDERS = new Set([
  'your_google_ai_studio_key_here',
  'your_model_here',
  'replace_with_a_random_32plus_char_secret',
  'your_db_password_here',
]);

function isSet(name) {
  const value = process.env[name]?.trim();
  return Boolean(value) && !PLACEHOLDERS.has(value);
}

let envOk = false;
if (!fs.existsSync(ENV_PATH)) {
  fail('server/.env exists', 'not found', [
    'Copy the example and fill it in:',
    '  Windows PowerShell:  Copy-Item server\\.env.example server\\.env',
    '  macOS / Linux:       cp server/.env.example server/.env',
  ]);
} else {
  dotenv.config({ path: ENV_PATH });
  pass('server/.env exists');
  envOk = true;

  const required = [
    ['GOOGLE_AI_API_KEY', 'Create a key at https://aistudio.google.com/apikey and paste it in with no quotes.'],
    ['AI_MODEL_FREE', 'Set it to gemini-3.6-flash (the bare Google AI Studio id, no google/ prefix).'],
    ['AI_MODEL_PREMIUM', 'Set it to gemini-3.6-flash, or another Google AI Studio model id.'],
    ['JWT_SECRET', 'Any random string of 32 or more characters. It signs login sessions.'],
  ];
  for (const [name, fix] of required) {
    if (isSet(name)) pass(`${name} is set`);
    else fail(`${name} is set`, process.env[name] ? 'still the placeholder value' : 'missing', fix);
  }

  if (process.env.DATABASE_URL?.trim()) {
    pass('Database connection', 'DATABASE_URL (hosted database; DB_* values are ignored)');
  } else {
    const missing = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PORT'].filter((n) => !process.env[n]?.trim());
    if (missing.length) fail('Database connection settings', `missing ${missing.join(', ')}`, 'Fill in the DB_* values, or set DATABASE_URL for a hosted database.');
    else if (!isSet('DB_PASSWORD')) fail('DB_PASSWORD is set', 'still the placeholder value', 'Use the password you chose for the postgres user when installing PostgreSQL. It is not your Windows password.');
    else pass('Database connection settings', `${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  }
}

/* ── 3. Model configuration ───────────────────────────────────────────── */

heading('AI model configuration');

// Imported after dotenv so ai-service resolves the same file. Its own loader
// also reads server/.env, so the order only matters for the messages above.
const {
  assertModelConfig, getModel, TIERS, getGroqClient,
  classifyAiError, formatAiErrorLog,
} = await import('ai-service');

let modelsOk = false;
try {
  assertModelConfig();
  modelsOk = true;
  for (const tier of TIERS) pass(`${tier} tier model`, getModel(tier));
} catch (err) {
  fail('Model configuration', err.message);
}

/* ── 4. Database ──────────────────────────────────────────────────────── */

heading('Database');

let pool = null;
let dbOk = false;
if (envOk) {
  ({ default: pool } = await import('../src/db.js'));
  try {
    const { rows } = await pool.query('SELECT version() AS v, current_database() AS db');
    dbOk = true;
    pass('PostgreSQL reachable', `${rows[0].db} on ${rows[0].v.split(',')[0]}`);
  } catch (err) {
    const message = err.message ?? String(err);
    let fix;
    if (/ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEDOUT/.test(message) || err.code === 'ECONNREFUSED') {
      fix = [
        'PostgreSQL is not running, or DB_HOST / DB_PORT point somewhere it is not.',
        'Windows: open Services and start "postgresql-x64-16" (or your version).',
        'macOS (Homebrew): brew services start postgresql@16',
        'Linux: sudo service postgresql start',
      ];
    } else if (/password authentication failed/i.test(message)) {
      fix = [
        'DB_PASSWORD does not match the postgres user\'s password.',
        'It is the password chosen during the PostgreSQL install, not the Windows login.',
        'To reset it: psql -U postgres -c "ALTER USER postgres WITH PASSWORD \'newpassword\';"',
        'No quotes around the value in .env: DB_PASSWORD=newpassword',
      ];
    } else if (/database ".*" does not exist/i.test(message)) {
      fix = [
        `The database ${process.env.DB_NAME} has not been created yet.`,
        `Create it: psql -U postgres -c "CREATE DATABASE ${process.env.DB_NAME};"`,
        'Then run: npm run migrate',
      ];
    } else if (/SSL|ssl|encryption/.test(message)) {
      fix = 'The server requires TLS. Set DB_SSL=true (or DB_SSL=no-verify) in server/.env.';
    }
    fail('PostgreSQL reachable', message, fix);
  }
}

if (dbOk) {
  const { MIGRATION_ORDER } = await import('./migrationOrder.js');
  try {
    const { rows } = await pool.query(
      `SELECT filename FROM schema_migrations`
    ).catch((err) => {
      if (err.code === '42P01') return { rows: [] }; // ledger table absent: nothing applied
      throw err;
    });
    const applied = new Set(rows.map((r) => r.filename));
    const pending = MIGRATION_ORDER.filter((f) => !applied.has(f));
    if (pending.length === 0) pass('Migrations', `all ${MIGRATION_ORDER.length} applied`);
    else fail('Migrations', `${pending.length} of ${MIGRATION_ORDER.length} pending (first: ${pending[0]})`, 'Run: npm run migrate');
  } catch (err) {
    fail('Migrations', err.message);
  }

  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS users,
              COUNT(*) FILTER (WHERE role = 'admin')::int AS admins
         FROM users`
    );
    const { users, admins } = rows[0];
    if (admins > 0) pass('Admin account', `${admins} admin, ${users} accounts in total`);
    else warn('Admin account', `none yet (${users} accounts)`, [
      'Register through the site, then promote that account:',
      `  psql -U postgres -d ${process.env.DB_NAME ?? 'career_hub_db'} -c "UPDATE users SET role = 'admin' WHERE email = 'you@example.com';"`,
    ]);
  } catch (err) {
    fail('Users table', err.message, 'Run: npm run migrate');
  }

  try {
    const { rows } = await pool.query(
      `SELECT (SELECT COUNT(*) FROM disciplines)::int AS disciplines,
              (SELECT COUNT(*) FROM career_paths)::int AS paths,
              (SELECT COUNT(*) FROM resources)::int AS resources,
              (SELECT COUNT(*) FROM alumni)::int AS alumni`
    );
    const c = rows[0];
    if (c.disciplines && c.paths && c.resources) pass('Seeded content', `${c.disciplines} disciplines, ${c.paths} career paths, ${c.resources} resources, ${c.alumni} alumni`);
    else warn('Seeded content', 'one or more content tables are empty', 'The seed migrations populate these. Run: npm run migrate');
  } catch (err) {
    fail('Content tables', err.message, 'Run: npm run migrate');
  }
}

/* ── 5. AI provider, live ─────────────────────────────────────────────── */

heading('AI provider (Google AI Studio)');

if (flags['no-ai']) {
  warn('Live model request', 'skipped (--no-ai)');
} else if (!modelsOk || !isSet('GOOGLE_AI_API_KEY')) {
  fail('Live model request', 'not attempted', 'Fix the configuration failures above first.');
} else {
  const models = [...new Set(TIERS.map((t) => getModel(t)))];
  const client = getGroqClient();
  for (const model of models) {
    const started = Date.now();
    try {
      const response = await client.chat.completions.create({
        model,
        max_tokens: 8,
        temperature: 0,
        messages: [{ role: 'user', content: 'Reply with the single word OK.' }],
      });
      const text = response.choices?.[0]?.message?.content?.trim() ?? '';
      pass(`Model ${model} answers`, `"${text.slice(0, 40)}" in ${Date.now() - started} ms`);
    } catch (err) {
      const classified = classifyAiError(err);
      fail(`Model ${model} answers`, `${classified.code}${classified.status ? ` (HTTP ${classified.status})` : ''}`, [
        classified.hint,
        `Detail: ${classified.detail.slice(0, 200)}`,
      ]);
      // The full line the server itself would print, for whoever is reading
      // this beside the server log.
      console.log(formatAiErrorLog('check-setup', classified).split('\n').map((l) => `        ${l}`).join('\n'));
    }
  }
}

/* ── Summary ──────────────────────────────────────────────────────────── */

const failures = results.filter((r) => !r.ok);
console.log('');
if (failures.length === 0) {
  console.log('Everything checks out. Start the app:');
  console.log('  Terminal 1:  cd server && npm run dev');
  console.log('  Terminal 2:  cd client && npm run dev');
  console.log('  Then open http://localhost:5173');
} else {
  console.log(`${failures.length} problem(s). Fix the first FAIL above and run this again.`);
}
console.log('');

if (pool) await pool.end();
process.exitCode = failures.length === 0 ? 0 : 1;
