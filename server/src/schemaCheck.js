/**
 * Startup check for schema the running code depends on.
 *
 * The bilingual content routes SELECT name_bn, description_bn and industry_bn
 * unconditionally. Pull the code without applying the migration that adds them
 * and every content endpoint fails per request with
 *
 *   [disciplines] list failed: column "name_bn" does not exist
 *
 * which is accurate, repeats forever, and never mentions the migration that
 * fixes it. On a team where people pull at different times — and more so now
 * that one shared database serves everyone — that is a diagnosis someone has to
 * make from first principles every time.
 *
 * So the mismatch is detected once, at boot, and reported with the exact
 * commands. It warns rather than exits: authentication and resume review work
 * fine without these columns, and refusing to start would block someone who is
 * not touching content at all.
 */

/**
 * Tables the code writes to that no migration in this repo creates.
 *
 * saveReviewToDb in routes/resume.js inserts into `resumes` and `ai_reviews`.
 * Neither appears in server/migrations, so they exist only wherever someone
 * created them by hand. The insert is wrapped in a try/catch that logs and
 * returns null, so review history fails silently — the user still gets their
 * feedback and nothing looks wrong, it just never saves.
 *
 * A fresh clone, or any database that was not hand-edited, therefore has this
 * feature quietly not working. Naming it at boot is the difference between
 * noticing that and not.
 */
const UNMIGRATED_TABLES = ['resumes', 'ai_reviews'];

/** Columns added by add_bilingual_content.sql, and nothing else. */
const REQUIRED_COLUMNS = [
  ['disciplines', 'name_bn'],
  ['disciplines', 'description_bn'],
  ['career_paths', 'description_bn'],
  ['career_paths', 'industry_bn'],
  ['alumni', 'bio_bn'],
  ['alumni', 'industry_bn'],
];

const MIGRATIONS = [
  'server/migrations/add_bilingual_content.sql',
  'server/migrations/seed_bangla_content.sql',
];

async function warnUnmigratedTables(pool) {
  try {
    const { rows } = await pool.query(
      `SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = ANY($1)`,
      [UNMIGRATED_TABLES]
    );
    const present = new Set(rows.map((r) => r.table_name));
    const absent = UNMIGRATED_TABLES.filter((t) => !present.has(t));
    if (absent.length === 0) return;

    console.warn('');
    console.warn(`[schema] Review history will not save: missing ${absent.join(', ')}.`);
    console.warn('[schema] No migration in server/migrations creates these tables, so a');
    console.warn('[schema] fresh database cannot have them. The insert fails quietly, so');
    console.warn('[schema] the reviews simply never persist. Whoever created them by hand');
    console.warn('[schema] should commit the CREATE TABLE as a migration.');
    console.warn('');
  } catch {
    // Reported by the caller's own error path.
  }
}

/**
 * @param {import('pg').Pool} pool
 * @returns {Promise<{ok: boolean, missing: string[]}>}
 */
export async function checkContentSchema(pool) {
  let rows;
  try {
    ({ rows } = await pool.query(
      `SELECT table_name, column_name
         FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = ANY($1)`,
      [[...new Set(REQUIRED_COLUMNS.map(([t]) => t))]]
    ));
  } catch (err) {
    // Unreachable database is a different problem with its own error path; this
    // check is not the place to report it.
    console.error(`[schema] Could not verify content schema: ${err.message}`);
    return { ok: false, missing: [] };
  }

  const present = new Set(rows.map((r) => `${r.table_name}.${r.column_name}`));
  const missing = REQUIRED_COLUMNS
    .map(([table, column]) => `${table}.${column}`)
    .filter((qualified) => !present.has(qualified));

  await warnUnmigratedTables(pool);

  if (missing.length === 0) return { ok: true, missing: [] };

  console.error('');
  console.error('[schema] The database is behind the code. Missing columns:');
  for (const column of missing) console.error(`[schema]   - ${column}`);
  console.error('[schema]');
  console.error('[schema] Every content endpoint will fail until these exist. Apply:');
  for (const file of MIGRATIONS) {
    console.error(`[schema]   psql -U postgres -d career_hub_db -f ${file}`);
  }
  console.error('[schema]');
  console.error('[schema] Against the shared database these run ONCE, by one person.');
  console.error('');

  return { ok: false, missing };
}
