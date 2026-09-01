/**
 * Module: usersRouter
 * Responsibility: Everything an account holder can do to their own account —
 * read and edit the profile, change the password, export the data, and delete
 * it all.
 *
 * Every route here is scoped to req.user.id and takes no user id from the
 * caller. There is deliberately no /api/users/:id: an endpoint that accepts an
 * id is an endpoint that has to be checked at every call site, and this router
 * would have exactly one correct value to check against anyway.
 *
 * Re-authentication is required for the two actions that are not undoable from
 * the account itself: changing the email, which moves where a password reset
 * would be sent, and deleting the account. Both are things an unattended,
 * still-signed-in browser could otherwise be used to do. The password is
 * verified here rather than trusted from the client's own prompt.
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import pool from '../db.js';
import { requireAuth, requireActiveAccount } from '../middleware/auth.js';

const router = express.Router();

/*
 * Applied to the router rather than listed on each route, so a route added
 * later cannot be added without it. Every path below acts on the caller's own
 * account, and none of them should work for an account that has been deleted —
 * its token stays valid for the rest of its hour otherwise.
 */
router.use(requireAuth, requireActiveAccount);

const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 128;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPPORTED_LANGUAGES = ['en', 'bn'];

/*
 * Recorded against a subscription, and nothing more. No gateway is connected,
 * nothing is charged, and no account or card number reaches the server — the
 * client sends the name of the instrument only. Anything unrecognised is
 * dropped rather than stored, so a crafted request cannot write arbitrary text
 * into the billing record.
 */
const PAYMENT_METHODS = ['bkash', 'nagad', 'card'];

/*
 * The fields the profile page returns and edits. Named once so the SELECT, the
 * UPDATE and the export cannot drift apart — the failure mode otherwise is a
 * field that saves and then does not come back, which reads to the user as the
 * save having silently failed.
 *
 * role and tier are readable but not editable. Nothing here lets an account
 * change what it is allowed to do.
 */
const PROFILE_COLUMNS = `
  user_id, full_name, email, role, tier, preferred_language,
  discipline, institution, graduation_year, created_at, last_login_at
`;

/*
 * Password checks are the one place here worth rate limiting.
 *
 * The confirm-password dialog will happily be submitted repeatedly, and each
 * attempt is an oracle for the account's real password. The per-account login
 * lockout in routes/auth.js does not cover these routes, so this is the guard.
 * Sized for a person who has genuinely forgotten which password they used, not
 * for a script.
 */
const reauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

/** Optional text: blank becomes NULL, because "answered, with nothing" is not what a skipped field means. */
function optionalText(value, max) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed === '') return null;
  return trimmed.slice(0, max);
}

function parseGraduationYear(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const year = Number.parseInt(raw, 10);
  const currentYear = new Date().getFullYear();
  const valid = Number.isInteger(year) && year >= 1950 && year <= currentYear + 10;
  return valid ? year : null;
}

/**
 * Confirms the caller's password.
 *
 * Returns false for a missing user row as well as a wrong password — the caller
 * cannot act on the difference, and neither can an attacker.
 */
async function passwordMatches(userId, candidate) {
  if (typeof candidate !== 'string' || candidate.length === 0) return false;
  const result = await pool.query('SELECT password_hash FROM users WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) return false;
  return bcrypt.compare(candidate, result.rows[0].password_hash);
}

async function readProfile(userId) {
  const result = await pool.query(
    `SELECT ${PROFILE_COLUMNS} FROM users WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] ?? null;
}

/* ── GET /api/users/me ─────────────────────────────────────────────── */

/*
 * The full profile. /api/auth/me deliberately stays smaller — it runs on every
 * page load to confirm the session, and the discipline and institution are of
 * no use to it. This one is read by the account page only.
 */
router.get('/me', async (req, res) => {
  try {
    const profile = await readProfile(req.user.id);
    if (!profile) {
      return res.status(401).json({ error: 'Session is no longer valid.' });
    }
    return res.json(profile);
  } catch (err) {
    console.error('[users] Profile read failed:', err.message);
    return res.status(500).json({ error: 'Could not load your profile.' });
  }
});

/* ── PATCH /api/users/me ───────────────────────────────────────────── */

/*
 * Edits the profile.
 *
 * Partial by design: the account page sends the whole form, but the language
 * toggle sends preferred_language alone. A field that is absent from the body
 * is left as it is, which is what makes the second call safe — a PUT would
 * have blanked the discipline every time somebody switched to Bangla.
 */
router.patch('/me', reauthLimiter, async (req, res) => {
  const body = req.body ?? {};
  const updates = [];
  const params = [];

  const push = (column, value) => {
    params.push(value);
    updates.push(`${column} = $${params.length}`);
  };

  try {
    const current = await readProfile(req.user.id);
    if (!current) {
      return res.status(401).json({ error: 'Session is no longer valid.' });
    }

    if (body.full_name !== undefined) {
      const name = typeof body.full_name === 'string' ? body.full_name.trim() : '';
      if (name.length < 2 || name.length > 100) {
        return res.status(400).json({ error: 'Full name must be between 2 and 100 characters.' });
      }
      push('full_name', name);
    }

    if (body.email !== undefined) {
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'Invalid email address.' });
      }

      // Only a real change costs a password. Submitting the form with the email
      // untouched must not demand one.
      if (email !== current.email) {
        const confirmed = await passwordMatches(req.user.id, body.currentPassword);
        if (!confirmed) {
          return res.status(401).json({ error: 'That password is not correct.' });
        }
        push('email', email);
      }
    }

    if (body.discipline !== undefined) push('discipline', optionalText(body.discipline, 100));
    if (body.institution !== undefined) push('institution', optionalText(body.institution, 150));
    if (body.graduation_year !== undefined) push('graduation_year', parseGraduationYear(body.graduation_year));

    if (body.preferred_language !== undefined) {
      if (!SUPPORTED_LANGUAGES.includes(body.preferred_language)) {
        return res.status(400).json({ error: 'Unsupported language.' });
      }
      push('preferred_language', body.preferred_language);
    }

    if (updates.length === 0) {
      // Nothing to do is a success, not an error: the account page sends the
      // whole form and an unchanged form is a perfectly ordinary submission.
      return res.json(current);
    }

    params.push(req.user.id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${params.length}
       RETURNING ${PROFILE_COLUMNS}`,
      params
    );

    return res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    console.error('[users] Profile update failed:', err.message);
    return res.status(500).json({ error: 'Could not save your changes.' });
  }
});

/* ── POST /api/users/me/password ───────────────────────────────────── */

router.post('/me/password', reauthLimiter, async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};

  if (typeof newPassword !== 'string' || newPassword.length < PASSWORD_MIN_LENGTH) {
    return res.status(400).json({ error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` });
  }
  if (newPassword.length > PASSWORD_MAX_LENGTH) {
    return res.status(400).json({ error: 'Password is too long.' });
  }

  try {
    const confirmed = await passwordMatches(req.user.id, currentPassword);
    if (!confirmed) {
      return res.status(401).json({ error: 'That password is not correct.' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'The new password must be different from the current one.' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      // The reset token is cleared alongside. Someone who changes their password
      // has answered the question a pending reset link was asking, and leaving
      // that link live would let an old email keep working against a password
      // its holder no longer knows.
      `UPDATE users
          SET password_hash = $1,
              reset_token_hash = NULL,
              reset_token_expiry = NULL,
              failed_login_attempts = 0,
              lockout_until = NULL
        WHERE user_id = $2`,
      [hash, req.user.id]
    );

    return res.json({ message: 'Password updated.' });
  } catch (err) {
    console.error('[users] Password change failed:', err.message);
    return res.status(500).json({ error: 'Could not change your password.' });
  }
});

/* ── GET /api/users/me/export ──────────────────────────────────────── */

/*
 * Everything held against the account, as one JSON object.
 *
 * The reviews carry their full feedback, because the scores alone cannot
 * rebuild what the user actually read — the same reasoning that put the
 * feedback column in ai_reviews. What is deliberately absent is the resume text
 * and the uploaded file: neither is stored, by design, and an export that
 * omitted them silently would misrepresent what is held. The note field says so
 * rather than leaving the reader to notice the gap.
 */
router.get('/me/export', async (req, res) => {
  try {
    const [profile, subscriptions, reviews, usage, gaps, interviews] = await Promise.all([
      readProfile(req.user.id),
      pool.query(
        `SELECT tier, status, source, payment_method, started_at, expires_at,
                cancelled_at, amount_bdt, note, created_at
           FROM subscriptions WHERE user_id = $1 ORDER BY started_at DESC`,
        [req.user.id]
      ),
      pool.query(
        `SELECT r.review_id, r.overall_score, r.ats_score, r.grammar_score,
                r.format_score, r.content_score, r.feedback, r.model, r.tier,
                r.language, r.market_mode, r.created_at,
                res.file_name, res.job_ad_text
           FROM ai_reviews r
           JOIN resumes res ON res.resume_id = r.resume_id
          WHERE r.user_id = $1
          ORDER BY r.created_at DESC`,
        [req.user.id]
      ),
      pool.query(
        `SELECT resume_review_count, resume_review_reset_date,
                chat_message_count, chat_count_reset_date,
                mock_interview_count, mock_interview_reset_date
           FROM users WHERE user_id = $1`,
        [req.user.id]
      ),
      pool.query(
        `SELECT gap_key, source, category, description, severity, closeable,
                remediation, status, target_role, language,
                first_seen, last_seen, closed_at, dismissed_at
           FROM user_gaps WHERE user_id = $1 ORDER BY first_seen DESC`,
        [req.user.id]
      ),
      // The transcript in full. The answers are the user's own words about their
      // own career, which makes them the most personal thing this export
      // carries and the clearest thing they are entitled to a copy of.
      pool.query(
        `SELECT interview_id, tier_level, target_role, candidate_stage,
                resume_file_name, job_ad_text, questions, answers, evaluation,
                overall_score, status, model, tier, language, created_at, completed_at
           FROM mock_interviews WHERE user_id = $1 ORDER BY created_at DESC`,
        [req.user.id]
      ),
    ]);

    if (!profile) {
      return res.status(401).json({ error: 'Session is no longer valid.' });
    }

    return res.json({
      exported_at: new Date().toISOString(),
      note: 'Uploaded resume files and their extracted text are not included, because they are deleted from the server immediately after each analysis and are never stored.',
      profile,
      subscriptions: subscriptions.rows,
      reviews: reviews.rows,
      gaps: gaps.rows,
      mock_interviews: interviews.rows,
      usage_today: usage.rows[0] ?? null,
    });
  } catch (err) {
    console.error('[users] Export failed:', err.message);
    return res.status(500).json({ error: 'Could not prepare your data.' });
  }
});

/* ── GET /api/users/me/subscription ────────────────────────────────── */

/*
 * The record behind the account's tier, or null on a free account with nothing
 * to show. Most recent first: an account that was granted premium twice has two
 * rows, and the current one is the one that explains today's entitlement.
 */
router.get('/me/subscription', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT subscription_id, tier, status, source, payment_method,
              started_at, expires_at, cancelled_at, amount_bdt, note
         FROM subscriptions
        WHERE user_id = $1 AND tier = 'premium'
        ORDER BY started_at DESC
        LIMIT 1`,
      [req.user.id]
    );
    return res.json(result.rows[0] ?? null);
  } catch (err) {
    console.error('[users] Subscription read failed:', err.message);
    return res.status(500).json({ error: 'Could not load your subscription.' });
  }
});

/* ── DELETE /api/users/me ──────────────────────────────────────────── */

/*
 * Deletes the account.
 *
 * The content goes for good — every review, every uploaded resume row, every
 * subscription record — because that is what the privacy panel promises and
 * there is no reading of "delete my data" under which keeping the reviews is
 * honest.
 *
 * The users row is kept, deactivated and scrubbed of everything identifying.
 * That is what add_user_profile_fields.sql added is_active and deleted_at for,
 * and it buys two things a hard DELETE does not. Foreign keys elsewhere cannot
 * be left dangling by it. And the audit log, which records administrative
 * actions by user id, keeps referring to something rather than to a hole.
 *
 * The email is rewritten rather than nulled, because the column is NOT NULL and
 * UNIQUE: nulling it is impossible and leaving it would stop the person ever
 * registering again with their own address.
 *
 * Everything runs in one transaction. A half-deleted account — reviews gone,
 * profile intact — is the worst of both outcomes.
 */
router.delete('/me', reauthLimiter, async (req, res) => {
  const { password } = req.body ?? {};

  try {
    const confirmed = await passwordMatches(req.user.id, password);
    if (!confirmed) {
      return res.status(401).json({ error: 'That password is not correct.' });
    }
  } catch (err) {
    console.error('[users] Delete confirmation failed:', err.message);
    return res.status(500).json({ error: 'Could not delete the account.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ai_reviews cascades from resumes, but it is deleted explicitly first so
    // the intent survives a future schema change that drops the cascade.
    await client.query('DELETE FROM ai_reviews WHERE user_id = $1', [req.user.id]);
    await client.query('DELETE FROM resumes WHERE user_id = $1', [req.user.id]);
    await client.query('DELETE FROM subscriptions WHERE user_id = $1', [req.user.id]);

    // The chat transcript tables are optional in this schema — a database that
    // has not run create_chat_history_tables.sql must still be able to honour a
    // deletion request, so a missing table is not a reason to fail.
    try {
      await client.query('DELETE FROM chat_messages WHERE conversation_id IN (SELECT conversation_id FROM chat_conversations WHERE user_id = $1)', [req.user.id]);
      await client.query('DELETE FROM chat_conversations WHERE user_id = $1', [req.user.id]);
    } catch (err) {
      if (err.code !== '42P01') throw err;
      console.warn('[users] Chat history tables absent; nothing to delete there.');
    }

    // Preparation is the newest schema, so a database that has not run
    // create_preparation_tables.sql must still be able to honour a deletion —
    // same allowance, same reasoning, as the chat tables above.
    //
    // Interview answers are destroyed outright rather than anonymised, for the
    // reason the chat migration gives about transcripts: an anonymised account
    // of somebody's weakest interview answers is still an account of somebody's
    // weakest interview answers.
    try {
      await client.query('DELETE FROM mock_interviews WHERE user_id = $1', [req.user.id]);
      await client.query('DELETE FROM user_gaps WHERE user_id = $1', [req.user.id]);
    } catch (err) {
      if (err.code !== '42P01') throw err;
      console.warn('[users] Preparation tables absent; nothing to delete there.');
    }

    await client.query(
      `UPDATE users
          SET full_name = 'Deleted account',
              email = 'deleted-' || user_id || '@deleted.invalid',
              password_hash = '',
              discipline = NULL,
              institution = NULL,
              graduation_year = NULL,
              phone = NULL,
              preferred_language = 'en',
              reset_token_hash = NULL,
              reset_token_expiry = NULL,
              is_active = FALSE,
              deleted_at = NOW()
        WHERE user_id = $1`,
      [req.user.id]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[users] Account deletion failed:', err.message);
    return res.status(500).json({ error: 'Could not delete the account.' });
  } finally {
    client.release();
  }

  // The cookie is cleared because the token itself stays valid for up to an
  // hour. Login and GET /api/auth/me both refuse a deactivated account, so a
  // deleted account cannot sign in again or keep a confirmed session — but the
  // browser should not be left holding the cookie in the meantime.
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', { httpOnly: true, secure: isProduction, sameSite: 'strict' });

  return res.json({ message: 'Account deleted.' });
});

/* ── POST /api/users/me/subscription ───────────────────────────────── */

/*
 * Moves the account to Premium.
 *
 * The tier is written to users.tier, which is what every quota check reads, and
 * a subscriptions row records why it now holds that value. source is 'upgrade'
 * rather than 'payment': no gateway is connected, nothing is charged, and
 * saying otherwise would put a false fact in the one table that exists to make
 * the tier explicable. See add_subscription_upgrade_source.sql.
 *
 * Both writes are one transaction. A tier without its record is the thing this
 * table was added to stop, and a record without the tier would grant nothing
 * while claiming to.
 *
 * Already-Premium is answered with the existing record rather than an error.
 * Two clicks on Upgrade is a slow network, not a mistake to report.
 */
router.post('/me/subscription', async (req, res) => {
  const method = PAYMENT_METHODS.includes(req.body?.payment_method)
    ? req.body.payment_method
    : null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const current = await client.query(
      `SELECT tier FROM users WHERE user_id = $1 FOR UPDATE`,
      [req.user.id]
    );
    if (current.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(401).json({ error: 'Session is no longer valid.' });
    }

    if (current.rows[0].tier === 'premium') {
      await client.query('ROLLBACK');
      const existing = await pool.query(
        `SELECT subscription_id, tier, status, source, payment_method,
                started_at, expires_at, cancelled_at, amount_bdt, note
           FROM subscriptions
          WHERE user_id = $1 AND tier = 'premium' AND status = 'active'
          ORDER BY started_at DESC LIMIT 1`,
        [req.user.id]
      );
      return res.json(existing.rows[0] ?? null);
    }

    await client.query(`UPDATE users SET tier = 'premium' WHERE user_id = $1`, [req.user.id]);

    // Any earlier Premium record is closed rather than left active, so
    // "is this account entitled right now" stays answerable by one row.
    await client.query(
      `UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW()
        WHERE user_id = $1 AND status = 'active'`,
      [req.user.id]
    );

    const inserted = await client.query(
      `INSERT INTO subscriptions (user_id, tier, status, source, payment_method, note)
       VALUES ($1, 'premium', 'active', 'upgrade', $2, $3)
       RETURNING subscription_id, tier, status, source, payment_method,
                 started_at, expires_at, cancelled_at, amount_bdt, note`,
      [
        req.user.id,
        method,
        'Upgraded from the account page. No payment gateway is connected, so no payment was taken, no amount is recorded and no expiry is set.',
      ]
    );

    await client.query('COMMIT');
    return res.status(201).json(inserted.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[users] Upgrade failed:', err.message);
    return res.status(500).json({ error: 'Could not change your plan.' });
  } finally {
    client.release();
  }
});

/* ── DELETE /api/users/me/subscription ─────────────────────────────── */

/*
 * Returns the account to the free tier.
 *
 * The subscription row is closed, not deleted: what an account used to hold and
 * when it stopped is exactly the history this table exists to keep, and a
 * cancellation that erases its own evidence answers no question later.
 *
 * The daily counters are left alone. Someone who ran eight reviews today on
 * Premium and then downgrades has used eight reviews today, and resetting the
 * count would hand them a fresh free allowance for cancelling.
 */
router.delete('/me/subscription', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`UPDATE users SET tier = 'free' WHERE user_id = $1`, [req.user.id]);
    await client.query(
      `UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW()
        WHERE user_id = $1 AND status = 'active'`,
      [req.user.id]
    );
    await client.query('COMMIT');
    return res.json({ message: 'Plan changed to Free.' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[users] Downgrade failed:', err.message);
    return res.status(500).json({ error: 'Could not change your plan.' });
  } finally {
    client.release();
  }
});

export default router;
