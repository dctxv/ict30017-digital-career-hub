/**
 * Module: auth routes
 * Responsibility: Registration, email verification, login, logout, and password reset.
 *
 * Email verification flow:
 *   1. POST /register  → creates account (is_email_verified = false), sends verification email
 *   2. GET  /verify-email?token=...&email=... → marks account verified
 *   3. POST /login     → rejects unverified accounts with a clear error + resend offer
 *   4. POST /resend-verification → issues a fresh token if the old one expired
 *
 * Security highlights:
 *   - Verification tokens: 32-byte random, bcrypt-hashed, 24-hour TTL, single-use
 *   - Login blocked for unverified accounts (prevents account squatting)
 *   - Resend endpoint rate-limited to 5/hr (prevents spam via our domain)
 *   - Password reset only works on verified accounts (prevents reset-before-verify attacks)
 *   - All tokens cleared immediately after use
 */

import express   from 'express';
import bcrypt    from 'bcryptjs';
import jwt       from 'jsonwebtoken';
import crypto    from 'crypto';
import rateLimit from 'express-rate-limit';
import pool      from '../db.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/emailService.js';

const router = express.Router();

// ── Rate limits ───────────────────────────────────────────────────
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

const sensitiveRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in an hour.' },
});

router.use(authRateLimit);

// ── Constants ─────────────────────────────────────────────────────
const PASSWORD_MIN_LENGTH  = 12;
const PASSWORD_MAX_LENGTH  = 128;
const EMAIL_REGEX          = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FAILED_ATTEMPTS  = 10;
const LOCKOUT_DURATION_MS  = 15 * 60 * 1000;
const VERIFY_TOKEN_TTL_MS  = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_TTL_MS   = 30 * 60 * 1000;       // 30 minutes
const PASSWORD_COMPLEXITY_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]).+$/;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'replace_with_a_random_64plus_char_secret_DO_NOT_USE_THIS_VALUE') {
    throw new Error('JWT_SECRET is not configured. Set a strong secret in your .env file.');
  }
  if (secret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.');
  return secret;
}

function issueJwt(userId, role, res) {
  const token = jwt.sign(
    { id: userId, role },
    getJwtSecret(),
    { expiresIn: '1h', algorithm: 'HS256' }
  );
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000,
  });
  return token;
}

function validatePassword(password) {
  if (typeof password !== 'string')          return 'Password is required.';
  if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters and include uppercase, lowercase, a number, and a special character.`;
  if (password.length > PASSWORD_MAX_LENGTH) return 'Password is too long.';
  if (!PASSWORD_COMPLEXITY_RE.test(password)) return 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.';
  return null;
}

// ── POST /register ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }
    if (typeof full_name !== 'string' || full_name.trim().length < 2 || full_name.length > 100) {
      return res.status(400).json({ error: 'Full name must be between 2 and 100 characters.' });
    }
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || email.length > 254) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }
    const pwError = validatePassword(password);
    if (pwError) return res.status(400).json({ error: pwError });

    const normalisedEmail = email.trim().toLowerCase();
    const password_hash   = await bcrypt.hash(password, 12);

    // Generate verification token
    const rawToken   = crypto.randomBytes(32).toString('hex');
    const tokenHash  = await bcrypt.hash(rawToken, 10);
    const expiry     = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

    const result = await pool.query(
      `INSERT INTO users
         (full_name, email, password_hash, role,
          is_email_verified, email_verify_token_hash, email_verify_expiry)
       VALUES ($1, $2, $3, 'student', false, $4, $5)
       RETURNING user_id, full_name, email, role, created_at`,
      [full_name.trim(), normalisedEmail, password_hash, tokenHash, expiry]
    );

    // Send verification email (non-blocking — registration still succeeds if email fails)
    sendVerificationEmail(normalisedEmail, rawToken).catch(err =>
      console.error('[auth/register] Failed to send verification email:', err.message)
    );

    return res.status(201).json({
      message: 'Account created! Please check your email and click the verification link before logging in.',
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists. Try logging in instead.' });
    }
    console.error('[auth/register]', error.message);
    return res.status(500).json({ error: 'Registration failed.' });
  }
});

// ── GET /verify-email?token=...&email=... ─────────────────────────
// Designed to be visited directly from the link in the email.
// Returns JSON so the frontend SPA can handle the response.
router.get('/verify-email', async (req, res) => {
  const invalid = { error: 'Verification link is invalid or has expired.' };

  try {
    const { token, email } = req.query;

    if (!token || !email || typeof token !== 'string' || typeof email !== 'string') {
      return res.status(400).json(invalid);
    }

    const normalisedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      `SELECT user_id, is_email_verified, email_verify_token_hash, email_verify_expiry
       FROM users WHERE email = $1`,
      [normalisedEmail]
    );

    if (result.rows.length === 0) return res.status(400).json(invalid);

    const user = result.rows[0];

    // Already verified — idempotent success
    if (user.is_email_verified) {
      return res.json({ message: 'Email already verified. You can log in.' });
    }

    if (!user.email_verify_token_hash || !user.email_verify_expiry) {
      return res.status(400).json(invalid);
    }
    if (new Date() > new Date(user.email_verify_expiry)) {
      return res.status(400).json({
        error: 'Verification link has expired. Please request a new one.',
        expired: true,
      });
    }

    const tokenValid = await bcrypt.compare(token, user.email_verify_token_hash);
    if (!tokenValid) return res.status(400).json(invalid);

    // Mark verified and clear token
    await pool.query(
      `UPDATE users
       SET is_email_verified       = true,
           email_verified_at       = NOW(),
           email_verify_token_hash = NULL,
           email_verify_expiry     = NULL
       WHERE user_id = $1`,
      [user.user_id]
    );

    return res.json({ message: 'Email verified! You can now log in.' });
  } catch (error) {
    console.error('[auth/verify-email]', error.message);
    return res.status(500).json({ error: 'Verification failed.' });
  }
});

// ── POST /resend-verification ─────────────────────────────────────
router.post('/resend-verification', sensitiveRateLimit, async (req, res) => {
  // Always return the same message to prevent email enumeration
  const GENERIC = { message: 'If your account exists and is unverified, a new link has been sent.' };

  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') return res.json(GENERIC);

    const normalisedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      'SELECT user_id, is_email_verified FROM users WHERE email = $1',
      [normalisedEmail]
    );

    if (result.rows.length === 0)       return res.json(GENERIC);
    if (result.rows[0].is_email_verified) return res.json(GENERIC); // already verified

    const rawToken  = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiry    = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

    await pool.query(
      `UPDATE users
       SET email_verify_token_hash = $1, email_verify_expiry = $2
       WHERE user_id = $3`,
      [tokenHash, expiry, result.rows[0].user_id]
    );

    sendVerificationEmail(normalisedEmail, rawToken).catch(err =>
      console.error('[auth/resend-verification] Email send failed:', err.message)
    );

    return res.json(GENERIC);
  } catch (error) {
    console.error('[auth/resend-verification]', error.message);
    return res.json(GENERIC);
  }
});

// ── POST /login ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const genericError = { error: 'Invalid email or password.' };
  const DUMMY_HASH   = '$2b$12$invalidhashpaddingtomatch12char';

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    // bcrypt DoS guard
    if (typeof password !== 'string' || password.length > PASSWORD_MAX_LENGTH) {
      return res.status(401).json(genericError);
    }

    const normalisedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const result = await pool.query(
      `SELECT user_id, full_name, email, password_hash, role,
              failed_login_attempts, lockout_until, is_email_verified
       FROM users WHERE email = $1`,
      [normalisedEmail]
    );

    const user          = result.rows[0] ?? null;
    const hashToCompare = user ? user.password_hash : DUMMY_HASH;

    // Per-account lockout check
    if (user?.lockout_until && new Date() < new Date(user.lockout_until)) {
      return res.status(429).json({
        error: 'Account temporarily locked due to too many failed attempts. Try again later.',
      });
    }

    // Constant-time password comparison
    const valid = await bcrypt.compare(password, hashToCompare);

    if (!user || !valid) {
      if (user) {
        const attempts = (user.failed_login_attempts || 0) + 1;
        const lockout  = attempts >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_DURATION_MS)
          : null;
        await pool.query(
          'UPDATE users SET failed_login_attempts = $1, lockout_until = $2 WHERE user_id = $3',
          [attempts, lockout, user.user_id]
        ).catch(() => {});
      }
      return res.status(401).json(genericError);
    }

    // ── Email verification check ───────────────────────────────────
    // Checked AFTER password verification intentionally:
    // We don't reveal whether an account is unverified to someone who
    // doesn't know the correct password.
    if (!user.is_email_verified) {
      return res.status(403).json({
        error: 'Please verify your email address before logging in. Check your inbox for the verification link.',
        unverified: true,   // flag lets the frontend show a "Resend" button
        email: normalisedEmail,
      });
    }

    // Successful login — reset failure counter
    await pool.query(
      'UPDATE users SET failed_login_attempts = 0, lockout_until = NULL, last_login_at = NOW() WHERE user_id = $1',
      [user.user_id]
    ).catch(() => {});

    issueJwt(user.user_id, user.role, res);

    return res.json({
      user: {
        id:        user.user_id,
        full_name: user.full_name,
        email:     user.email,
        role:      user.role,
      },
    });
  } catch (error) {
    console.error('[auth/login]', error.message);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

// ── POST /forgot-password ─────────────────────────────────────────
router.post('/forgot-password', sensitiveRateLimit, async (req, res) => {
  const GENERIC = { message: 'If that email is registered you will receive a reset link shortly.' };
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') return res.json(GENERIC);

    const normalisedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      'SELECT user_id, is_email_verified FROM users WHERE email = $1',
      [normalisedEmail]
    );

    if (result.rows.length === 0) return res.json(GENERIC);

    // Only allow password reset for verified accounts.
    // Returning the same generic message prevents leaking verification status.
    if (!result.rows[0].is_email_verified) return res.json(GENERIC);

    const rawToken  = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiry    = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await pool.query(
      'UPDATE users SET reset_token_hash = $1, reset_token_expiry = $2 WHERE email = $3',
      [tokenHash, expiry, normalisedEmail]
    );

    sendPasswordResetEmail(normalisedEmail, rawToken).catch(err =>
      console.error('[auth/forgot-password] Email send failed:', err.message)
    );

    return res.json(GENERIC);
  } catch (error) {
    console.error('[auth/forgot-password]', error.message);
    return res.json(GENERIC);
  }
});

// ── POST /reset-password ──────────────────────────────────────────
router.post('/reset-password', sensitiveRateLimit, async (req, res) => {
  const invalid = { error: 'Reset link is invalid or has expired.' };
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token, and new password are required.' });
    }
    const pwError = validatePassword(newPassword);
    if (pwError) return res.status(400).json({ error: pwError });

    const normalisedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      'SELECT user_id, reset_token_hash, reset_token_expiry FROM users WHERE email = $1',
      [normalisedEmail]
    );

    if (result.rows.length === 0) return res.status(400).json(invalid);
    const user = result.rows[0];
    if (!user.reset_token_hash || !user.reset_token_expiry) return res.status(400).json(invalid);
    if (new Date() > new Date(user.reset_token_expiry))     return res.status(400).json(invalid);

    const tokenValid = await bcrypt.compare(token, user.reset_token_hash);
    if (!tokenValid) return res.status(400).json(invalid);

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      `UPDATE users
       SET password_hash       = $1,
           reset_token_hash    = NULL,
           reset_token_expiry  = NULL,
           failed_login_attempts = 0,
           lockout_until       = NULL
       WHERE user_id = $2`,
      [newHash, user.user_id]
    );

    return res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    console.error('[auth/reset-password]', error.message);
    return res.status(500).json({ error: 'Password reset failed.' });
  }
});

// ── POST /logout ──────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  const COOKIE_OPTS = { httpOnly: true, secure: true, sameSite: 'strict' };
  ['token', 'jwt', 'access_token', 'accessToken', 'auth_token', 'authToken'].forEach(
    name => res.clearCookie(name, COOKIE_OPTS)
  );
  res.json({ message: 'Logged out successfully.' });
});

export default router;
