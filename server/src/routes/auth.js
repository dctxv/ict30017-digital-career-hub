import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/*
 * One bucket per action rather than one bucket for the whole router.
 *
 * Previously a single 10-per-15-minutes limit was shared by register, login,
 * forgot-password and reset-password combined, so a burst of failed logins
 * locked a legitimate user out of registering or recovering their password.
 * On the target network profile (shared university and NAT broadband in
 * Bangladesh) that whole bucket is consumed by one lab. No limit is removed
 * here; each action keeps at least the allowance it had before.
 *
 * GET /me is deliberately unlimited: the frontend calls it on every page load
 * to confirm the session, and rate limiting it would break normal browsing.
 */
function makeAuthLimiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
  });
}

/*
 * Ceilings are set for a shared address, not a single person. A university lab
 * or a NAT broadband connection presents as one IP, so a per-IP allowance sized
 * for one user locks out everyone behind it. That is the same failure M12
 * describes for resume analyses.
 *
 * These remain coarse abuse guards. The real brute-force control for login is
 * the per-account lockout below (MAX_FAILED_ATTEMPTS then LOCKOUT_DURATION_MS),
 * which is keyed on the account and is unaffected by how many people share an
 * address. Password reset stays the tightest of the three because it sends
 * email to an address the caller does not have to own.
 */
const registerLimiter = makeAuthLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  message: 'Too many registration attempts. Please try again in an hour.',
});

const loginLimiter = makeAuthLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});

const passwordResetLimiter = makeAuthLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: 'Too many password reset requests. Please try again in an hour.',
});

/*
 * The registration form posts a `plan` chosen from the Free and Premium tier
 * cards. It is the only extra field the client is trusted for, and only after
 * Zod has confirmed it is one of the two supported values. `role` is ignored
 * outright: it is set server side so a crafted request cannot self-promote.
 */
const ALLOWED_TIERS = ['free', 'premium'];
const PlanSchema = z.enum(ALLOWED_TIERS);
const DEFAULT_TIER = 'free';

const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 128;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` });
    }

    if (password.length > PASSWORD_MAX_LENGTH) {
      return res.status(400).json({ error: 'Password is too long.' });
    }

    if (typeof full_name !== 'string' || full_name.trim().length < 2 || full_name.length > 100) {
      return res.status(400).json({ error: 'Full name must be between 2 and 100 characters.' });
    }

    // An omitted plan means free. Anything present but outside the allowed set
    // is rejected rather than silently coerced, so a typo in the client is
    // visible instead of quietly downgrading the account.
    const planResult = PlanSchema.safeParse(req.body.plan ?? DEFAULT_TIER);
    if (!planResult.success) {
      return res.status(400).json({
        error: `Plan must be one of: ${ALLOWED_TIERS.join(', ')}.`,
      });
    }
    const tier = planResult.data;

    const password_hash = await bcrypt.hash(password, 12);
    const normalisedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, tier)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, full_name, email, role, tier, preferred_language, created_at`,
      [full_name.trim(), normalisedEmail, password_hash, 'student', tier]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Register error:', error);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists. Try logging in instead.' });
    }

    res.status(500).json({ error: 'Registration failed.' });
  }
});

const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalisedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const result = await pool.query(
      `SELECT user_id, full_name, email, password_hash, role, tier,
              failed_login_attempts, lockout_until
       FROM users WHERE email = $1`,
      [normalisedEmail]
    );

    const genericError = { error: 'Invalid email or password.' };

    if (result.rows.length === 0) {
      return res.status(401).json(genericError);
    }

    const user = result.rows[0];

    // Check account lockout — degrade gracefully if columns don't exist yet
    if (user.lockout_until && new Date() < new Date(user.lockout_until)) {
      return res.status(429).json({ error: 'Account temporarily locked due to too many failed attempts. Try again later.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      // Increment failed attempts and lock if threshold reached
      const attempts = (user.failed_login_attempts || 0) + 1;
      const lockout = attempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_DURATION_MS)
        : null;
      await pool.query(
        'UPDATE users SET failed_login_attempts = $1, lockout_until = $2 WHERE user_id = $3',
        [attempts, lockout, user.user_id]
      ).catch(() => {}); // Degrade gracefully if columns missing
      return res.status(401).json(genericError);
    }

    // Successful login — clear the failure counter
    await pool.query(
      'UPDATE users SET failed_login_attempts = 0, lockout_until = NULL WHERE user_id = $1',
      [user.user_id]
    ).catch(() => {});

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured.');

    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      secret,
      { expiresIn: '1h', algorithm: 'HS256' }
    );

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

    return res.json({
      user: {
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        tier: user.tier,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  const GENERIC_RESPONSE = { message: 'If that email is registered you will receive a reset link shortly.' };
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') return res.json(GENERIC_RESPONSE);

    const normalisedEmail = email.trim().toLowerCase();
    const result = await pool.query('SELECT user_id FROM users WHERE email = $1', [normalisedEmail]);
    if (result.rows.length === 0) return res.json(GENERIC_RESPONSE);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await pool.query(
      'UPDATE users SET reset_token_hash = $1, reset_token_expiry = $2 WHERE email = $3',
      [tokenHash, expiry, normalisedEmail]
    );

    // TODO: send rawToken via email. For now log it only in development.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[auth] Password reset token for ${normalisedEmail}: ${rawToken}`);
    }

    return res.json(GENERIC_RESPONSE);
  } catch (error) {
    console.error('Forgot-password error:', error);
    return res.json(GENERIC_RESPONSE);
  }
});

router.post('/reset-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token, and new password are required.' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 12) {
      return res.status(400).json({ error: 'Password must be at least 12 characters.' });
    }

    if (newPassword.length > 128) {
      return res.status(400).json({ error: 'Password is too long.' });
    }

    const normalisedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      'SELECT user_id, reset_token_hash, reset_token_expiry FROM users WHERE email = $1',
      [normalisedEmail]
    );

    const invalid = { error: 'Reset link is invalid or has expired.' };
    if (result.rows.length === 0) return res.status(400).json(invalid);

    const user = result.rows[0];
    if (!user.reset_token_hash || !user.reset_token_expiry) return res.status(400).json(invalid);
    if (new Date() > new Date(user.reset_token_expiry)) return res.status(400).json(invalid);

    const tokenValid = await bcrypt.compare(token, user.reset_token_hash);
    if (!tokenValid) return res.status(400).json(invalid);

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token_hash = NULL, reset_token_expiry = NULL WHERE user_id = $2',
      [newHash, user.user_id]
    );

    return res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset-password error:', error);
    return res.status(500).json({ error: 'Password reset failed.' });
  }
});

/*
 * GET /me — the authoritative answer to "am I signed in, and as whom".
 *
 * Reads role and tier from the database rather than from the token payload, so
 * a role change or a deleted account takes effect on the next request instead
 * of surviving until the one hour token expires. RequireAuth on the frontend
 * gates on this, which is what stops a hand-edited localStorage entry from
 * rendering the admin shell.
 *
 * Not rate limited: it runs on every page load.
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, full_name, email, role, tier, preferred_language FROM users WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      // Valid signature, but the account is gone. Treat as unauthenticated.
      return res.status(401).json({ error: 'Session is no longer valid.' });
    }

    const user = result.rows[0];
    return res.json({
      user: {
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        preferred_language: user.preferred_language,
      },
    });
  } catch (error) {
    console.error('Session lookup error:', error);
    return res.status(500).json({ error: 'Could not confirm session.' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'strict' });
  res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'strict' });
  res.clearCookie('access_token', { httpOnly: true, secure: true, sameSite: 'strict' });
  res.json({ message: 'Logged out successfully.' });
});

export default router;