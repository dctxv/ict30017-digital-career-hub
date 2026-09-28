/**
 * Applies SQL migrations in order using the same DB connection as the app.
 *
 * Usage:
 *   npm run migrate            — apply everything outstanding
 *   npm run migrate -- --status — show what is applied without changing anything
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/db.js';
import { MIGRATION_ORDER as ORDER } from './migrationOrder.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

// ---------------------------------------------------------------------------
// SQL splitter — splits a file into individual statements, correctly handling
// dollar-quoted blocks (DO $$ ... $$) and single-quoted strings so semicolons
// inside them are never treated as statement terminators.
// ---------------------------------------------------------------------------
function splitStatements(sql) {
  const stmts = [];
  let cur = '';
  let i = 0;

  while (i < sql.length) {
    // Dollar-quote: $tag$ ... $tag$
    if (sql[i] === '$') {
      let j = i + 1;
      while (j < sql.length && sql[j] !== '$' && sql[j] !== '\n') j++;
      if (j < sql.length && sql[j] === '$') {
        const tag = sql.slice(i, j + 1); // e.g. "$$" or "$body$"
        cur += tag;
        i = j + 1;
        // Scan for closing tag
        while (i < sql.length) {
          const close = sql.indexOf(tag, i);
          if (close === -1) { cur += sql.slice(i); i = sql.length; break; }
          cur += sql.slice(i, close + tag.length);
          i = close + tag.length;
          break;
        }
        continue;
      }
    }

    // Single-quoted string
    if (sql[i] === "'") {
      cur += sql[i++];
      while (i < sql.length) {
        if (sql[i] === "'" && sql[i + 1] === "'") { cur += "''"; i += 2; }
        else if (sql[i] === "'") { cur += sql[i++]; break; }
        else { cur += sql[i++]; }
      }
      continue;
    }

    // Line comment
    if (sql[i] === '-' && sql[i + 1] === '-') {
      while (i < sql.length && sql[i] !== '\n') cur += sql[i++];
      continue;
    }

    // Block comment
    if (sql[i] === '/' && sql[i + 1] === '*') {
      cur += sql[i++]; cur += sql[i++];
      while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) cur += sql[i++];
      if (i < sql.length) { cur += sql[i++]; cur += sql[i++]; }
      continue;
    }

    // Statement terminator
    if (sql[i] === ';') {
      cur += ';';
      const trimmed = cur.trim();
      // Skip bare BEGIN/COMMIT — we manage the transaction ourselves
      if (trimmed && trimmed !== ';' &&
          trimmed.toUpperCase() !== 'BEGIN;' &&
          trimmed.toUpperCase() !== 'COMMIT;') {
        stmts.push(trimmed);
      }
      cur = '';
      i++;
      continue;
    }

    cur += sql[i++];
  }

  const tail = cur.trim();
  if (tail) stmts.push(tail);
  return stmts;
}

async function ensureLedger(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    TEXT PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function appliedSet(client) {
  const { rows } = await client.query('SELECT filename FROM schema_migrations');
  return new Set(rows.map((r) => r.filename));
}

function unlisted(applied) {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && !ORDER.includes(f));
}

async function status() {
  const client = await pool.connect();
  try {
    await ensureLedger(client);
    const applied = await appliedSet(client);
    console.log('');
    for (const file of ORDER) {
      const mark = applied.has(file) ? 'applied' : 'PENDING';
      console.log(`  ${mark.padEnd(8)} ${file}`);
    }
    const extra = unlisted(applied);
    if (extra.length) {
      console.log('');
      console.log('  Not in the migration order, so never applied automatically:');
      for (const file of extra) console.log(`    ${file}`);
    }
    console.log('');
  } finally {
    client.release();
  }
}

async function migrate() {
  const client = await pool.connect();
  try {
    await ensureLedger(client);
    const applied = await appliedSet(client);
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
      const sql = fs.readFileSync(full, 'utf8');
      const statements = splitStatements(sql);

      await client.query('BEGIN');
      try {
        for (const stmt of statements) {
          await client.query(stmt);
        }
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)', [file]
        );
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
      console.log('done');
    }

    console.log('[migrate] Finished.');
  } finally {
    client.release();
  }
}

const wantsStatus = process.argv.includes('--status');

try {
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
