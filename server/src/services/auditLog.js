/**
 * Records administrative writes to content.
 *
 * Six people share admin access to one database. Nothing currently records who
 * created, edited or deleted a resource, career path, alumni profile or
 * discipline — so the first time content goes missing there is no way to
 * establish what it was or who removed it.
 *
 * Two rules shape this module.
 *
 * It never throws. An audit trail that can fail a legitimate admin action is
 * worse than none: the admin retries, the write half-succeeds, and now the data
 * is wrong as well as unlogged. Every failure here is logged to the console and
 * swallowed.
 *
 * It stores the row itself, not a description of it. Knowing that resource 17
 * was deleted is of limited use; being able to put it back is the point. The
 * `before` snapshot on a delete is the whole row, so the audit table alone is
 * enough to restore it.
 *
 * Schema: server/migrations/create_audit_log_table.sql.
 */

import pool from '../db.js';

/**
 * @param {object} params
 * @param {import('express').Request} params.req  supplies the actor from requireAuth
 * @param {'create'|'update'|'delete'} params.action
 * @param {string} params.entity      e.g. 'resource', 'career_path'
 * @param {number|string|null} params.entityId
 * @param {object|null} [params.before] row state before the change
 * @param {object|null} [params.after]  row state after the change
 */
export async function recordAudit({ req, action, entity, entityId, before = null, after = null }) {
  try {
    await pool.query(
      `INSERT INTO audit_log
         (actor_id, actor_email, action, entity, entity_id, before, after)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        req?.user?.id ?? null,
        // Kept in plain text as well as by id: an audit trail that erases
        // itself when someone leaves the project is not an audit trail.
        req?.user?.email ?? null,
        action,
        entity,
        entityId ?? null,
        before ? JSON.stringify(before) : null,
        after ? JSON.stringify(after) : null,
      ]
    );
  } catch (err) {
    console.error(`[audit] Could not record ${action} on ${entity}:`, err.message);
  }
}
