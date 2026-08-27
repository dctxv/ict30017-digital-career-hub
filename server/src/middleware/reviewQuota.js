/**
 * Module: reviewQuota
 * Responsibility: Enforce the free tier's daily resume review allowance against
 * the authenticated user, and report the remaining count to the frontend.
 *
 * Canonical limit: a free account may run FREE_DAILY_REVIEW_LIMIT resume
 * analyses per calendar day. Three numbers previously described this one limit
 * (static "3 reviews remaining this month" text on the review page, "3 resume
 * reviews per day" on the register page, and 5 per hour per IP in the server),
 * and none of them agreed. This module is the only authority now; the frontend
 * displays what it reports and never decides anything.
 *
 * Premium accounts are uncapped here. Guests never reach this middleware with a
 * countable identity and are bounded by the IP rate limiter instead.
 */

import fs from 'fs';

import pool from '../db.js';

/** Free tier allowance, per user, per calendar day. */
export const FREE_DAILY_REVIEW_LIMIT = 3;

/** Tiers that bypass the daily cap entirely. */
const UNLIMITED_TIERS = new Set(['premium']);

/** Roles that bypass the daily cap regardless of tier. */
const UNLIMITED_ROLES = new Set(['admin']);

function isGuest(req) {
  return !req.user || req.user.id === 'guest' || req.user.role === 'guest';
}

/**
 * Deletes the uploaded temp file when this middleware rejects the request.
 *
 * This runs after multer, so by the time a request is refused the resume is
 * already on disk. The route handler deletes it in a finally block, but that
 * handler never runs on a rejection, so without this the file is left behind.
 * Data minimisation requirement: SPR-10, FR-13.
 */
function discardUpload(req) {
  const path = req.file?.path;
  if (!path) return;
  try {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
      console.log(`[resume] Temp file deleted after quota rejection: ${path}`);
    }
  } catch (err) {
    console.error('[resume] Could not delete rejected upload:', err.message);
  }
}

/**
 * Reads the caller's tier and today's usage without incrementing anything.
 *
 * @param {string|number} userId
 * @returns {Promise<{tier: string, role: string, limit: number|null, used: number, remaining: number|null, unlimited: boolean}|null>}
 *   null when the user row does not exist.
 */
export async function readReviewQuota(userId) {
  const result = await pool.query(
    `SELECT role,
            tier,
            is_active,
            CASE
              WHEN resume_review_reset_date IS NULL OR resume_review_reset_date < CURRENT_DATE
                THEN 0
              ELSE COALESCE(resume_review_count, 0)
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
    limit: unlimited ? null : FREE_DAILY_REVIEW_LIMIT,
    used: Number(used),
    remaining: unlimited ? null : Math.max(0, FREE_DAILY_REVIEW_LIMIT - Number(used)),
    unlimited,
  };
}

/**
 * Claims one review from today's allowance.
 *
 * The counter reset and the increment happen in a single statement so two
 * concurrent uploads cannot both read a stale count and each claim the last
 * slot. The WHERE clause refuses the update once the allowance is spent, so a
 * zero row count means "over quota" rather than "user missing"; the caller
 * distinguishes the two.
 *
 * @param {string|number} userId
 * @returns {Promise<{allowed: boolean, used?: number, missingUser?: boolean}>}
 */
async function claimReview(userId) {
  const result = await pool.query(
    `UPDATE users
     SET
       resume_review_count = CASE
         WHEN resume_review_reset_date IS NULL OR resume_review_reset_date < CURRENT_DATE THEN 1
         ELSE COALESCE(resume_review_count, 0) + 1
       END,
       resume_review_reset_date = CURRENT_DATE
     WHERE user_id = $1
       AND (
         resume_review_reset_date IS NULL
         OR resume_review_reset_date < CURRENT_DATE
         OR COALESCE(resume_review_count, 0) < $2
       )
     RETURNING resume_review_count`,
    [userId, FREE_DAILY_REVIEW_LIMIT]
  );

  if (result.rows.length > 0) {
    return { allowed: true, used: result.rows[0].resume_review_count };
  }

  const exists = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [userId]);
  if (exists.rows.length === 0) return { allowed: false, missingUser: true };

  return { allowed: false, used: FREE_DAILY_REVIEW_LIMIT };
}

/**
 * One log line per decision, in a fixed shape.
 *
 * A resume review can be refused by three different things — this middleware,
 * the per-IP limiter ahead of it, or the model provider downstream — and from
 * the server console they used to look alike. Every outcome here now names
 * itself, so grepping `[quota]` tells you which gate fired, for whom, and
 * against what allowance, without reading the code to work it out.
 */
function logQuota(decision, req, detail = {}) {
  const parts = Object.entries({
    decision,
    user: req.user?.id ?? 'guest',
    ...detail,
  }).map(([k, v]) => `${k}=${v}`);
  console.log(`[quota] ${parts.join(' ')}`);
}

/**
 * Express middleware. Must run after optionalAuth so req.user is populated.
 *
 * Guests pass through untouched: there is no row to count against, and the IP
 * rate limiter earlier in the chain is what bounds them.
 */
export async function enforceDailyReviewLimit(req, res, next) {
  if (isGuest(req)) {
    logQuota('pass', req, { reason: 'guest', bounded_by: 'ip_rate_limit' });
    return next();
  }

  try {
    const quota = await readReviewQuota(req.user.id);

    if (quota === null) {
      logQuota('reject', req, { reason: 'user_row_missing', status: 401 });
      discardUpload(req);
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (quota.unlimited) {
      // The line that would have answered the premium-account question at a
      // glance: this account is uncapped and no counter was touched.
      logQuota('pass', req, {
        reason: 'unlimited_tier',
        tier: quota.tier,
        role: quota.role,
      });
      res.locals.reviewQuota = quota;
      return next();
    }

    const claim = await claimReview(req.user.id);

    if (claim.missingUser) {
      logQuota('reject', req, { reason: 'user_row_missing_on_claim', status: 401 });
      discardUpload(req);
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!claim.allowed) {
      logQuota('reject', req, {
        reason: 'daily_limit_reached',
        tier: quota.tier,
        used: claim.used,
        limit: FREE_DAILY_REVIEW_LIMIT,
        status: 429,
      });
      discardUpload(req);
      return res.status(429).json({
        error: `You have used all ${FREE_DAILY_REVIEW_LIMIT} of your free resume reviews for today. Your allowance resets tomorrow.`,
        limit: FREE_DAILY_REVIEW_LIMIT,
        used: claim.used,
        remaining: 0,
      });
    }

    logQuota('pass', req, {
      reason: 'within_daily_limit',
      tier: quota.tier,
      used: claim.used,
      limit: FREE_DAILY_REVIEW_LIMIT,
    });

    res.locals.reviewQuota = {
      ...quota,
      used: claim.used,
      remaining: Math.max(0, FREE_DAILY_REVIEW_LIMIT - claim.used),
    };

    return next();
  } catch (err) {
    logQuota('error', req, { reason: 'quota_check_failed', status: 500 });
    console.error('[resume] Review quota check failed:', err.message);
    discardUpload(req);
    return res.status(500).json({ error: 'Could not verify your review allowance.' });
  }
}
