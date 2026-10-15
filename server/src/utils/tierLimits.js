import pool from '../db.js';

const FALLBACKS = Object.freeze({
  free: { resume: 10, interview: 10 },
  basic: { resume: 25, interview: 25 },
  premium: { resume: null, interview: null },
});

/** Read an admin-editable limit. Falls back safely while a migration is pending. */
export async function readTierLimit(tier, feature) {
  const column = feature === 'interview' ? 'mock_interviews_daily' : 'resume_reviews_daily';
  const fallback = FALLBACKS[tier]?.[feature] ?? FALLBACKS.free[feature];
  try {
    const { rows } = await pool.query(`SELECT ${column} AS value FROM tier_limits WHERE tier = $1`, [tier]);
    if (rows.length === 0) return fallback;
    return rows[0].value === null ? null : Number(rows[0].value);
  } catch (err) {
    if (err.code !== '42P01') console.error('[quota] Tier limit read failed:', err.message);
    return fallback;
  }
}
