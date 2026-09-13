/**
 * Module: reset-migration
 * Responsibility: Un-record one migration so `npm run migrate` applies it again.
 *
 * migrate.js records every applied file in schema_migrations and skips it on
 * later runs — necessary because seed_bangla_content.sql overwrites the _bn
 * columns by design, and re-running it blindly would discard a translation
 * someone since hand-edited in the admin dashboard. That safety only works if
 * "applied" reliably means "the data is actually on this database", and for
 * seed_bangla_content.sql specifically it stopped meaning that: the row is in
 * schema_migrations, but resources.title_bn / description_bn and
 * alumni.bio_bn / industry_bn read back NULL on the database server/.env
 * currently points at (checked directly via the live API on 2026-09-10) —
 * most likely because the row was recorded before DATABASE_URL was added and
 * the project moved from a local Postgres to the shared hosted one, and never
 * carried over.
 *
 * This only removes the ledger row; it does not touch the migration's own
 * table data. Follow it with `npm run migrate` to actually re-run the SQL.
 *
 * Only do this for a migration that is safe to redo — one that fully
 * replaces its target rows with UPDATE ... SET, not one that INSERTs, which
 * would duplicate rows. seed_bangla_content.sql qualifies by its own doc
 * comment; check before using this on anything else.
 *
 * Usage:
 *   npm run migrate:reset -- seed_bangla_content.sql
 *   npm run migrate
 */

import pool from '../src/db.js';

const filename = process.argv[2];

if (!filename) {
  console.error('Usage: npm run migrate:reset -- <filename.sql>');
  process.exitCode = 1;
} else {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM schema_migrations WHERE filename = $1',
      [filename]
    );
    if (rowCount > 0) {
      console.log(`[reset] Removed ${filename} from schema_migrations.`);
      console.log('[reset] Run "npm run migrate" now to re-apply it.');
    } else {
      console.log(`[reset] ${filename} was not recorded as applied — nothing to do.`);
    }
  } catch (err) {
    console.error(`[reset] Failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
