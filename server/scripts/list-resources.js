/**
 * Read-only diagnostic: dumps every row in the `resources` table on whatever
 * database server/.env points at.
 *
 * Why this exists: the Admin panel can add/edit/delete resources directly,
 * so the migration files alone don't necessarily reflect what's actually in
 * the live table anymore. This prints the real, current list — id, title,
 * url, discipline, category, type — so sources can be verified against what
 * students actually see, not what we think we seeded.
 *
 * Safe to run any time — SELECT only, touches no data, no schema change.
 *
 * Usage:
 *   node scripts/list-resources.js
 */

import pool from '../src/db.js';

try {
  const { rows } = await pool.query(`
    SELECT id, title_en, type, discipline, category, url
    FROM resources
    ORDER BY discipline, category, id
  `);

  console.log('');
  console.log(`${rows.length} resources total\n`);
  let currentDiscipline = null;
  for (const r of rows) {
    if (r.discipline !== currentDiscipline) {
      currentDiscipline = r.discipline;
      console.log(`\n== ${currentDiscipline} ==`);
    }
    console.log(`[${r.id}] (${r.type} / ${r.category}) ${r.title_en}`);
    console.log(`     ${r.url}`);
  }
  console.log('');
} catch (err) {
  console.error('[list-resources] Failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
