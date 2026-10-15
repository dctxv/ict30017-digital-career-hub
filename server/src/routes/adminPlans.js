/**
 * Module: adminPlans
 * Responsibility: Let an admin set each plan's daily allowances and mark
 * whether an account has paid.
 *
 * Both changes are recorded in the audit log, as every other admin edit is:
 * a limit decides what every user on a plan can do, and a paid flag is the
 * nearest thing this project has to a billing record.
 */

import express from 'express';

import pool from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { recordAudit } from '../services/auditLog.js';

const router = express.Router();
const TIERS = new Set(['free', 'basic', 'premium']);
const MAX_DAILY_LIMIT = 10000;

router.use(requireAuth, requireRole('admin'));

function parseLimit(value) {
  if (value === null) return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number <= MAX_DAILY_LIMIT
    ? number
    : undefined;
}

router.get('/tier-limits', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT tier, resume_reviews_daily, mock_interviews_daily, updated_at
         FROM tier_limits
        ORDER BY CASE tier WHEN 'free' THEN 1 WHEN 'basic' THEN 2 ELSE 3 END`
    );
    return res.json(rows);
  } catch (err) {
    console.error('[admin-plans] Limits read failed:', err.message);
    return res.status(500).json({ error: 'Could not load tier limits.' });
  }
});

router.put('/tier-limits/:tier', async (req, res) => {
  const tier = String(req.params.tier).toLowerCase();
  const reviewLimit = parseLimit(req.body?.resume_reviews_daily);
  const interviewLimit = parseLimit(req.body?.mock_interviews_daily);

  if (!TIERS.has(tier)) return res.status(400).json({ error: 'Unknown tier.' });
  if (reviewLimit === undefined || interviewLimit === undefined) {
    return res.status(400).json({ error: 'Limits must be whole numbers from 0 to 10,000, or unlimited.' });
  }

  try {
    const previous = await pool.query(
      'SELECT tier, resume_reviews_daily, mock_interviews_daily FROM tier_limits WHERE tier = $1',
      [tier]
    );
    const { rows } = await pool.query(
      `INSERT INTO tier_limits
         (tier, resume_reviews_daily, mock_interviews_daily, updated_at, updated_by)
       VALUES ($1, $2, $3, NOW(), $4)
       ON CONFLICT (tier) DO UPDATE SET
         resume_reviews_daily = EXCLUDED.resume_reviews_daily,
         mock_interviews_daily = EXCLUDED.mock_interviews_daily,
         updated_at = NOW(),
         updated_by = EXCLUDED.updated_by
       RETURNING tier, resume_reviews_daily, mock_interviews_daily, updated_at`,
      [tier, reviewLimit, interviewLimit, req.user.id]
    );
    // The tier is the key; entity_id is an integer column, so it rides in the
    // before and after snapshots instead.
    await recordAudit({
      req, action: 'update', entity: 'tier_limits', entityId: null,
      before: previous.rows[0] ?? null, after: rows[0],
    });
    return res.json(rows[0]);
  } catch (err) {
    console.error('[admin-plans] Limits update failed:', err.message);
    return res.status(500).json({ error: 'Could not save tier limits.' });
  }
});

router.get('/accounts', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  try {
    const { rows } = await pool.query(
      `SELECT user_id, full_name, email, role, tier, is_paid, is_active
         FROM users
        WHERE ($1 = '' OR full_name ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')
        ORDER BY full_name, user_id
        LIMIT 200`,
      [search]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[admin-plans] Accounts read failed:', err.message);
    return res.status(500).json({ error: 'Could not load accounts.' });
  }
});

router.patch('/accounts/:id/paid', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid account id.' });
  }
  if (typeof req.body?.is_paid !== 'boolean') {
    return res.status(400).json({ error: 'is_paid must be true or false.' });
  }
  try {
    const previous = await pool.query('SELECT is_paid FROM users WHERE user_id = $1', [id]);
    const { rows } = await pool.query(
      `UPDATE users SET is_paid = $1 WHERE user_id = $2
       RETURNING user_id, full_name, email, role, tier, is_paid, is_active`,
      [req.body.is_paid, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Account not found.' });
    await recordAudit({
      req, action: 'update', entity: 'user_paid_status', entityId: id,
      before: previous.rows[0] ?? null, after: { is_paid: rows[0].is_paid },
    });
    return res.json(rows[0]);
  } catch (err) {
    console.error('[admin-plans] Paid status update failed:', err.message);
    return res.status(500).json({ error: 'Could not update paid status.' });
  }
});

export default router;
