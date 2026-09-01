/**
 * Module: interviewQuota
 * Responsibility: Enforce the free tier's daily mock interview allowance, and
 * report what is left.
 *
 * Deliberately the same shape as middleware/reviewQuota.js — same claim-in-one
 * -statement pattern, same [quota] log line, same premium bypass — because the
 * two answer the same question about different resources and a second design
 * would be a second thing to keep in step.
 *
 * The number is lower than the review allowance for a reason that is arithmetic
 * rather than product. A review is one model call and a mock interview is two,
 * plus the gap extraction the review fires afterwards. At two interviews and
 * three reviews a free account can spend ten calls a day, which is the ceiling
 * this project's free provider tier can actually sustain across a class of
 * students demonstrating at once.
 *
 * The claim is made when the interview is CREATED, not when it is submitted.
 * Charging on submission would let someone generate questions endlessly and
 * never answer them, which is the more expensive half in tokens and the easier
 * one to do by accident with a reload.
 */

import pool from '../db.js';

/** Free tier allowance, per user, per calendar day. */
export const FREE_DAILY_INTERVIEW_LIMIT = 2;

const UNLIMITED_TIERS = new Set(['premium']);
const UNLIMITED_ROLES = new Set(['admin']);

function isGuest(req) {
  return !req.user || req.user.id === 'guest' || req.user.role === 'guest';
}

function logQuota(decision, req, detail = {}) {
  const parts = Object.entries({
    decision,
    feature: 'interview',
    user: req.user?.id ?? 'guest',
    ...detail,
  }).map(([k, v]) => `${k}=${v}`);
  console.log(`[quota] ${parts.join(' ')}`);
}

/**
 * Reads tier and today's usage without incrementing anything.
 *
 * @param {string|number} userId
 * @returns {Promise<{tier: string, role: string, limit: number|null, used: number,
 *                    remaining: number|null, unlimited: boolean}|null>}
 */
export async function readInterviewQuota(userId) {
  const result = await pool.query(
    `SELECT role,
            tier,
            is_active,
            CASE
              WHEN mock_interview_reset_date IS NULL OR mock_interview_reset_date < CURRENT_DATE
                THEN 0
              ELSE COALESCE(mock_interview_count, 0)
            END AS used
       FROM users
      WHERE user_id = $1`,
    [userId]
  );

  // A deleted account keeps its row so audit records still resolve, and its
  // token stays valid for the rest of its hour. Treated as missing rather than
  // as a free account: it must not be able to spend an allowance either.
  if (result.rows.length === 0 || result.rows[0].is_active === false) return null;

  const { role, tier, used } = result.rows[0];
  const unlimited = UNLIMITED_TIERS.has(tier) || UNLIMITED_ROLES.has(role);

  return {
    tier,
    role,
    limit: unlimited ? null : FREE_DAILY_INTERVIEW_LIMIT,
    used: Number(used),
    remaining: unlimited ? null : Math.max(0, FREE_DAILY_INTERVIEW_LIMIT - Number(used)),
    unlimited,
  };
}

/**
 * Claims one interview from today's allowance.
 *
 * Reset and increment in one statement so two concurrent starts cannot both read
 * a stale count and each claim the last slot. A zero row count means "over
 * quota" rather than "user missing"; the caller distinguishes the two.
 */
async function claimInterview(userId) {
  const result = await pool.query(
    `UPDATE users
        SET mock_interview_count = CASE
              WHEN mock_interview_reset_date IS NULL OR mock_interview_reset_date < CURRENT_DATE THEN 1
              ELSE COALESCE(mock_interview_count, 0) + 1
            END,
            mock_interview_reset_date = CURRENT_DATE
      WHERE user_id = $1
        AND (
          mock_interview_reset_date IS NULL
          OR mock_interview_reset_date < CURRENT_DATE
          OR COALESCE(mock_interview_count, 0) < $2
        )
      RETURNING mock_interview_count`,
    [userId, FREE_DAILY_INTERVIEW_LIMIT]
  );

  if (result.rows.length > 0) {
    return { allowed: true, used: result.rows[0].mock_interview_count };
  }

  const exists = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [userId]);
  if (exists.rows.length === 0) return { allowed: false, missingUser: true };

  return { allowed: false, used: FREE_DAILY_INTERVIEW_LIMIT };
}

/**
 * Refunds a claimed interview.
 *
 * Called when the model call fails after the claim, which is the one case where
 * a user loses an allowance and receives nothing at all. The counter floors at
 * zero rather than going negative, so a refund racing a midnight reset cannot
 * hand out a free extra tomorrow.
 */
export async function refundInterview(userId) {
  try {
    await pool.query(
      `UPDATE users
          SET mock_interview_count = GREATEST(0, COALESCE(mock_interview_count, 0) - 1)
        WHERE user_id = $1 AND mock_interview_reset_date = CURRENT_DATE`,
      [userId]
    );
    console.log(`[quota] decision=refund feature=interview user=${userId} reason=generation_failed`);
  } catch (err) {
    // A failed refund costs the user one interview and is not worth failing the
    // request they are already being told went wrong.
    console.error('[interview] Could not refund the claimed interview:', err.message);
  }
}

/**
 * Express middleware. Must run after requireAuth.
 *
 * Unlike the review, there is no guest path. An interview's whole value is the
 * gap history it feeds, and a guest has no row to attach one to — so this
 * refuses rather than letting somebody spend two model calls on results that
 * cannot be kept.
 */
export async function enforceDailyInterviewLimit(req, res, next) {
  if (isGuest(req)) {
    logQuota('reject', req, { reason: 'guest', status: 401 });
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const quota = await readInterviewQuota(req.user.id);

    if (quota === null) {
      logQuota('reject', req, { reason: 'user_row_missing', status: 401 });
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (quota.unlimited) {
      logQuota('pass', req, { reason: 'unlimited_tier', tier: quota.tier, role: quota.role });
      res.locals.interviewQuota = quota;
      return next();
    }

    const claim = await claimInterview(req.user.id);

    if (claim.missingUser) {
      logQuota('reject', req, { reason: 'user_row_missing_on_claim', status: 401 });
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!claim.allowed) {
      logQuota('reject', req, {
        reason: 'daily_limit_reached',
        tier: quota.tier,
        used: claim.used,
        limit: FREE_DAILY_INTERVIEW_LIMIT,
        status: 429,
      });
      return res.status(429).json({
        // Worded to match the review's rejection exactly, so the Bangla pattern
        // in i18n/messages.js can be the same shape rather than a second rule.
        error: `You have used all ${FREE_DAILY_INTERVIEW_LIMIT} of your free mock interviews for today. Your allowance resets tomorrow.`,
        limit: FREE_DAILY_INTERVIEW_LIMIT,
        used: claim.used,
        remaining: 0,
      });
    }

    logQuota('pass', req, {
      reason: 'within_daily_limit',
      tier: quota.tier,
      used: claim.used,
      limit: FREE_DAILY_INTERVIEW_LIMIT,
    });

    res.locals.interviewQuota = {
      ...quota,
      used: claim.used,
      remaining: Math.max(0, FREE_DAILY_INTERVIEW_LIMIT - claim.used),
      claimed: true,
    };

    return next();
  } catch (err) {
    logQuota('error', req, { reason: 'quota_check_failed', status: 500 });
    console.error('[interview] Interview quota check failed:', err.message);
    return res.status(500).json({ error: 'Could not verify your interview allowance.' });
  }
}
