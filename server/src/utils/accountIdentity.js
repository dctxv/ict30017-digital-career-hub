/**
 * Module: utils/accountIdentity
 * Responsibility: Read the contact fields the outbound PII mask needs as known
 * strings, for one account.
 *
 * Why this is a read and not something on req.user: requireAuth puts only
 * { id, role } on the request, because that is all a JWT should carry and
 * widening it would mean a stale name travelling in a token for its whole
 * lifetime. The mask needs the name as it stands now, so it is read per
 * request.
 *
 * Why the name matters more than the rest: no regex separates a person's name
 * from an employer's or a university's — "Rahim Chowdhury" and "Rahim Textiles
 * Ltd" are the same shape — so the account's stored name is the only reliable
 * way to mask it without eating the employers the interview questions need.
 * See ai-service/src/utils/piiMask.js.
 *
 * Guests have no row and get null, which is a valid identity: the mask still
 * applies every pattern rule, it simply has no known strings to add. A guest
 * review is masked, just not name-masked beyond what the CV header gives.
 *
 * It never throws. A failed lookup must not fail a resume review — the mask
 * degrades to pattern-only rather than the feature returning a 500, and the
 * failure is logged so a database problem is still visible.
 */

import pool from '../db.js';

/**
 * @typedef {{fullName: string|null, email: string|null, phone: string|null}} AccountIdentity
 */

/**
 * Reads the account holder's name, email and phone.
 *
 * @param {string|number|null|undefined} userId  'guest' and null are accepted
 * @returns {Promise<AccountIdentity|null>} null for a guest or an unknown id
 */
export async function readAccountIdentity(userId) {
  if (!userId || userId === 'guest') return null;

  try {
    const result = await pool.query(
      'SELECT full_name, email, phone FROM users WHERE user_id = $1',
      [userId]
    );
    const row = result.rows[0];
    if (!row) return null;

    return {
      fullName: row.full_name ?? null,
      email: row.email ?? null,
      phone: row.phone ?? null,
    };
  } catch (err) {
    // Pattern masking still runs; only the known-string pass is weakened. Said
    // out loud because a silent downgrade of a privacy control is exactly the
    // thing that should not be silent.
    console.warn(
      `[pii-mask] Could not read account identity for user ${userId}; `
      + `masking falls back to patterns only: ${err.message}`
    );
    return null;
  }
}
