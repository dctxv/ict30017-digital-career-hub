/**
 * Applies the SQL migrations, in order, using the connection the app already
 * uses.
 *
 * Two problems this exists to solve.
 *
 * The documented setup is a list of `psql` commands, and psql is not on PATH
 * after a default Windows PostgreSQL install — so following the README exactly
 * fails on most of the team's machines with a command-not-found that says
 * nothing about databases. This needs only node, which everyone already has,
 * because they are running the server.
 *
 * More importantly, those commands hardcode `-U postgres -d career_hub_db`,
 * which is the LOCAL database. Now that a shared hosted instance exists, the
 * documented command silently migrates the wrong database. This imports the
 * same pool as the app, so it reads server/.env and always targets whatever
 * the app targets. There is no way for the two to disagree.
 *
 * Applied migrations are recorded in schema_migrations and skipped on a second
 * run. That also fixes a hazard called out in seed_bangla_content.sql: it
 * overwrites the _bn columns by design, so re-running it after someone edits a
 * translation in the admin dashboard would discard that edit. Recorded once,
 * it never runs again unless someone deliberately removes its row.
 *
 * Usage:
 *   npm run migrate          apply everything outstanding
 *   npm run migrate -- --status   show what is applied without changing anything
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/db.js';
import { MIGRATION_ORDER as ORDER } from './migrationOrder.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

async function ensureLedger() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    TEXT PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function appliedSet() {
  const { rows } = await pool.query('SELECT filename FROM schema_migrations');
  return new Set(rows.map((r) => r.filename));
}

/** Any .sql file on disk that the ORDER list does not mention. */
function unlisted() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && !ORDER.includes(f));
}

async function status() {
  const applied = await appliedSet();
  console.log('');
  for (const file of ORDER) {
    const mark = applied.has(file) ? 'applied' : 'PENDING';
    console.log(`  ${mark.padEnd(8)} ${file}`);
  }
  const extra = unlisted();
  if (extra.length) {
    console.log('');
    console.log('  Not in the migration order, so never applied automatically:');
    for (const file of extra) console.log(`    ${file}`);
  }
  console.log('');
}

async function migrate() {
  const applied = await appliedSet();
  const pending = ORDER.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log('[migrate] Nothing to do — every migration is already applied.');
    return;
  }

  console.log(`[migrate] ${pending.length} migration(s) to apply.`);

  for (const file of pending) {
    const full = path.join(MIGRATIONS_DIR, file);
    if (!fs.existsSync(full)) {
      throw new Error(`${file} is in the migration order but not on disk.`);
    }

    process.stdout.write(`[migrate] ${file} ... `);
    // Files manage their own transactions where they need one, so the SQL is
    // sent as written rather than wrapped in another BEGIN.
    await pool.query(fs.readFileSync(full, 'utf8'));
    await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
    console.log('done');
  }

  console.log('[migrate] Finished.');
}

const wantsStatus = process.argv.includes('--status');

try {
  await ensureLedger();
  await (wantsStatus ? status() : migrate());
} catch (err) {
  console.error('');
  console.error(`[migrate] Failed: ${err.message}`);
  console.error('[migrate] Nothing further was applied. Fix the cause and run again —');
  console.error('[migrate] migrations already recorded will be skipped.');
  process.exitCode = 1;
} finally {
  await pool.end();
}
