/**
 * Read-only diagnostic: prints the REAL column types/lengths for
 * disciplines and career_paths on whatever database server/.env points at.
 *
 * Why this exists: "value too long for type character varying(50)" is a
 * data-type coercion error (Postgres error code 22001), not a constraint
 * violation — Postgres does NOT attach a table/column name to this error the
 * way it does for a NOT NULL or UNIQUE violation, so the error message alone
 * can't say which column is actually capped. This queries
 * information_schema directly instead of guessing from the data.
 *
 * Safe to run any time — SELECT only, touches no data, no schema change.
 *
 * Usage:
 *   node scripts/check-schema.js
 */

import pool from '../src/db.js';

try {
  const { rows } = await pool.query(`
    SELECT table_name, column_name, data_type, character_maximum_length
    FROM information_schema.columns
    WHERE table_name IN ('disciplines', 'career_paths', 'resources')
    ORDER BY table_name, ordinal_position
  `);

  console.log('');
  let currentTable = null;
  for (const r of rows) {
    if (r.table_name !== currentTable) {
      currentTable = r.table_name;
      console.log(`${currentTable}:`);
    }
    const type = r.character_maximum_length
      ? `${r.data_type}(${r.character_maximum_length})`
      : r.data_type;
    console.log(`  ${r.column_name.padEnd(20)} ${type}`);
  }
  console.log('');
} catch (err) {
  console.error('[check-schema] Failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
