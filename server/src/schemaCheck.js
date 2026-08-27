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
 * Tables every feature that writes to the database depends on.
 *
 * These all have migrations now, so a missing one means the migrations have not
 * been run rather than that something was created by hand. The distinction
 * matters for the message: the fix is `npm run migrate`, not a conversation
 * with whoever built the table.
 *
 * They are checked separately from the columns below because the failures look
 * different. A missing column breaks a content endpoint loudly, per request. A
 * missing table here fails silently: review history, chat transcripts and the
 * audit trail are all written inside try/catch blocks that log and continue, so
 * the user sees nothing wrong and the data simply never arrives.
 */
const REQUIRED_TABLES = [
  'resumes',
  'ai_reviews',
  'chat_conversations',
  'chat_messages',
  'subscriptions',
  'audit_log',
  'user_gaps',
  'mock_interviews',
];

/** Columns added by add_bilingual_content.sql and add_user_profile_fields.sql. */
const REQUIRED_COLUMNS = [
  ['disciplines', 'name_bn'],
  ['disciplines', 'description_bn'],
  ['career_paths', 'description_bn'],
  ['career_paths', 'industry_bn'],
  ['alumni', 'bio_bn'],
  ['alumni', 'industry_bn'],
  ['users', 'discipline'],
  ['users', 'last_login_at'],
  ['users', 'updated_at'],
  // create_preparation_tables.sql. Listed with the columns rather than with the
  // tables above because the failure looks like theirs: the interview quota
  // check reads these on every attempt, so a database behind the code refuses
  // every interview with a column error instead of quietly not recording one.
  ['users', 'mock_interview_count'],
  ['users', 'mock_interview_reset_date'],
];

// Named rather than listed one by one: the runner knows the full order, and a
// second list here would be another thing to keep in step.
const MIGRATE_COMMAND = 'cd server && npm run migrate';

async function warnMissingTables(pool) {
  try {
    const { rows } = await pool.query(
      `SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = ANY($1)`,
      [REQUIRED_TABLES]
    );
    const present = new Set(rows.map((r) => r.table_name));
    const absent = REQUIRED_TABLES.filter((t) => !present.has(t));
    if (absent.length === 0) return;

    console.warn('');
    console.warn(`[schema] Missing tables: ${absent.join(', ')}.`);
    console.warn('[schema] Everything that writes to these fails quietly by design, so');
    console.warn('[schema] nothing will look broken — review history, chat transcripts and');
    console.warn('[schema] the admin audit trail will simply not be recorded.');
    console.warn(`[schema] Fix: ${MIGRATE_COMMAND}`);
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

  await warnMissingTables(pool);

  if (missing.length === 0) return { ok: true, missing: [] };

  console.error('');
  console.error('[schema] The database is behind the code. Missing columns:');
  for (const column of missing) console.error(`[schema]   - ${column}`);
  console.error('[schema]');
  console.error('[schema] Every content endpoint will fail until these exist.');
  console.error(`[schema] Fix: ${MIGRATE_COMMAND}`);
  console.error('[schema]');
  console.error('[schema] Against the shared database these run ONCE, by one person.');
  console.error('');

  return { ok: false, missing };
}
