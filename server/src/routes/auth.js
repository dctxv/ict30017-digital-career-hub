import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { isPwned } from '../utils/hibp.js';
import { sendPasswordResetEmail, sendVerificationEmail, sendOtpEmail } from '../services/emailService.js';
import { logEvent } from '../utils/audit.js';
import { validatePasswordPolicy } from '../utils/password.js';
import passport from 'passport';

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

/*
 * How the user said they would pay, recorded against the subscription.
 *
 * Descriptive only. No gateway is connected, nothing is charged, and the
 * account number and card details the form collects are never sent to the
 * server — only the name of the instrument. It is kept because on this market
 * bKash-versus-card is the most useful signal the project can collect about
 * whether anyone would actually pay, and `source = 'signup'` throws it away.
 *
 * Anything unrecognised is dropped rather than stored, so a crafted request
 * cannot write arbitrary text into the billing record.
 */
const PAYMENT_METHODS = ['bkash', 'nagad', 'card'];

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

    // HIBP breach check — fail-open: a timeout or API error skips the check
    // rather than blocking registration. The count is informational here;
    // a count > 0 is a warning, not a hard block (NIST SP 800-63B recommendation).
    const breachCount = await isPwned(password);
    if (breachCount > 0) {
      return res.status(400).json({
        error: `This password has appeared in ${breachCount.toLocaleString()} data breach(es). Please choose a different password.`,
        code: 'PASSWORD_BREACHED',
        count: breachCount,
      });
    }

    // Password policy: complexity, common passwords, name/email inclusion.
    const policyResult = validatePasswordPolicy(password, { email: email.trim().toLowerCase(), fullName: full_name });
    if (!policyResult.valid) {
      return res.status(400).json({ error: policyResult.errors[0], code: 'PASSWORD_POLICY' });
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

    /*
     * Optional profile fields.
     *
     * discipline is the one that earns its place immediately: every content
     * table filters by it, so without it a Computer Science student and an
     * Accounting student see the same unfiltered 42 resources and 70 career
     * paths. The rest let an account be recognised as a person rather than a
     * login.
     *
     * All optional, all trimmed to NULL when blank — an empty string would
     * read as "answered, with nothing", which is not what a skipped field
     * means.
     */
    const optionalText = (value, max) => {
      if (typeof value !== 'string') return null;
      const trimmed = value.trim();
      if (trimmed === '') return null;
      return trimmed.slice(0, max);
    };

    const graduationYear = Number.parseInt(req.body.graduation_year, 10);
    const currentYear = new Date().getFullYear();
    const validYear =
      Number.isInteger(graduationYear) &&
      graduationYear >= 1950 &&
      graduationYear <= currentYear + 10
        ? graduationYear
        : null;

    // preferred_language has existed since the users table was created and has
    // never been written by anything, so a signed-in user on a new device always
    // got English regardless of what they had chosen. The client sends its
    // current selection; anything unrecognised falls back rather than storing a
    // language the site cannot render.
    const preferredLanguage = ['en', 'bn'].includes(req.body.preferred_language)
      ? req.body.preferred_language
      : 'en';

    const result = await pool.query(
      `INSERT INTO users
         (full_name, email, password_hash, role, tier, preferred_language,
          discipline, institution, graduation_year, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING user_id, full_name, email, role, tier, preferred_language,
                 discipline, institution, graduation_year, created_at`,
      [
        full_name.trim(), normalisedEmail, password_hash, 'student', tier,
        preferredLanguage,
        optionalText(req.body.discipline, 100),
        optionalText(req.body.institution, 150),
        validYear,
        optionalText(req.body.phone, 30),
      ]
    );

    // Records why this account holds its tier. users.tier stays the value the
    // application reads; this is the provenance behind it, so a premium account
    // is a fact with a date rather than a column somebody set.
    const paymentMethod = PAYMENT_METHODS.includes(req.body.payment_method)
      ? req.body.payment_method
      : null;

    await pool.query(
      `INSERT INTO subscriptions (user_id, tier, status, source, payment_method, note)
       VALUES ($1, $2, 'active', 'signup', $3, $4)`,
      [
        result.rows[0].user_id,
        tier,
        tier === 'premium' ? paymentMethod : null,
        tier === 'premium'
          ? 'Chosen at registration. No payment gateway is connected, so no payment was taken, no amount is recorded and no expiry is set.'
          : 'Default tier at registration.',
      ]
    ).catch((err) => {
      // Never fail a registration over its audit trail.
      console.error('[auth] Could not record signup subscription:', err.message);
    });

    // Generate and store an email verification token.
    const newUser = result.rows[0];
    const rawVerifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenHash = await bcrypt.hash(rawVerifyToken, 10);
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await pool.query(
      'UPDATE users SET verification_token_hash = $1, verification_token_expiry = $2 WHERE user_id = $3',
      [verifyTokenHash, verifyExpiry, newUser.user_id]
    ).catch((err) => {
      console.error('[auth] Could not store verification token:', err.message);
    });

    // Send the verification email (fail-open: a broken SMTP config does not abort registration).
    const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    const verifyUrl = `${clientOrigin}/verify-email?token=${rawVerifyToken}&email=${encodeURIComponent(normalisedEmail)}`;
    sendVerificationEmail(normalisedEmail, full_name.trim(), verifyUrl).catch((err) => {
      console.error('[auth] Could not send verification email:', err.message);
    });

    // Audit log for registration.
    logEvent(pool, { userId: newUser.user_id, eventType: 'register', email: normalisedEmail, req });

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
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
              failed_login_attempts, lockout_until, is_active, email_verified
       FROM users WHERE email = $1`,
      [normalisedEmail]
    );

    const genericError = { error: 'Invalid email or password.' };

    if (result.rows.length === 0) {
      return res.status(401).json(genericError);
    }

    const user = result.rows[0];

    // A deleted account keeps its row, deactivated and scrubbed, so that audit
    // records and foreign keys still resolve. It must not be a way back in.
    // Answered with the same generic error as a wrong password: whether an
    // address once had an account is not something a stranger gets to learn.
    if (user.is_active === false) {
      return res.status(401).json(genericError);
    }

    // Block login until email is verified. email_verified may be null for
    // accounts created before the column was added — those are grandfathered in
    // so existing users are not locked out.
    if (user.email_verified === false) {
      return res.status(403).json({
        error: 'Please verify your email address before logging in. Check your inbox for the verification link.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

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
      logEvent(pool, { eventType: 'login_failed_bad_password', email: normalisedEmail, req });
      return res.status(401).json(genericError);
    }

    // Clear the failure counter on correct password.
    await pool.query(
      'UPDATE users SET failed_login_attempts = 0, lockout_until = NULL WHERE user_id = $1',
      [user.user_id]
    ).catch(() => {});

    // --- Two-factor: send OTP, do not issue JWT yet ---
    const otpCode = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
    const otpHash = await bcrypt.hash(otpCode, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
      'UPDATE users SET otp_code_hash = $1, otp_expiry = $2, otp_attempts = 0 WHERE user_id = $3',
      [otpHash, otpExpiry, user.user_id]
    ).catch((err) => {
      console.error('[auth] Could not store OTP:', err.message);
    });

    sendOtpEmail(user.email, user.full_name, otpCode).catch((err) => {
      console.error('[auth] Could not send OTP email:', err.message);
      // In dev with no SMTP, log it so manual testing still works.
    });

    logEvent(pool, { userId: user.user_id, eventType: 'otp_sent', email: user.email, req });

    return res.json({ twoFactorRequired: true, email: user.email });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

// Helper shared by /verify-otp and the OAuth callback to issue the JWT cookie.
function issueJwt(res, user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured.');
  const token = jwt.sign(
    { id: user.user_id, role: user.role, email: user.email },
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
}

const otpLimiter = makeAuthLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: 'Too many OTP attempts. Please try again in 15 minutes.',
});

router.post('/verify-otp', otpLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP code are required.' });
    }

    const normalisedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      `SELECT user_id, full_name, email, role, tier,
              otp_code_hash, otp_expiry, otp_attempts
       FROM users WHERE email = $1`,
      [normalisedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired code.' });
    }

    const user = result.rows[0];
    const MAX_OTP_ATTEMPTS = 5;

    if (!user.otp_code_hash || !user.otp_expiry) {
      return res.status(401).json({ error: 'No pending verification. Please log in again.' });
    }

    if (new Date() > new Date(user.otp_expiry)) {
      return res.status(401).json({ error: 'Code has expired. Please log in again to get a new one.' });
    }

    if ((user.otp_attempts || 0) >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many incorrect attempts. Please log in again.' });
    }

    const valid = await bcrypt.compare(String(otp).trim(), user.otp_code_hash);
    if (!valid) {
      await pool.query(
        'UPDATE users SET otp_attempts = otp_attempts + 1 WHERE user_id = $1',
        [user.user_id]
      ).catch(() => {});
      logEvent(pool, { userId: user.user_id, eventType: 'otp_failed', email: user.email, req });
      return res.status(401).json({ error: 'Incorrect code. Please try again.' });
    }

    // Valid — clear OTP fields, record login, issue JWT.
    await pool.query(
      `UPDATE users
          SET otp_code_hash = NULL, otp_expiry = NULL, otp_attempts = 0,
              last_login_at = NOW(), last_login_ip = $2
        WHERE user_id = $1`,
      [user.user_id, req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? req.socket.remoteAddress]
    ).catch(() => {});

    pool.query(
      `INSERT INTO login_events (user_id, email, event_type, ip_address, user_agent)
       VALUES ($1, $2, 'login_success', $3, $4)`,
      [user.user_id, user.email,
       req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? req.socket.remoteAddress,
       req.headers['user-agent'] ?? null]
    ).catch(() => {});

    logEvent(pool, { userId: user.user_id, eventType: 'login_success', email: user.email, req });

    // Record session in user_sessions so Security & Sessions page shows active logins
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? req.socket.remoteAddress;
    const sessionHash = crypto.createHash('sha256')
      .update(crypto.randomBytes(32))
      .digest('hex');
    pool.query(
      `INSERT INTO user_sessions (session_id_hash, user_id, expires_at, ip_address, user_agent)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour', $3, $4)
       ON CONFLICT DO NOTHING`,
      [sessionHash, user.user_id, clientIp, req.headers['user-agent'] ?? null]
    ).catch(() => {});

    issueJwt(res, user);

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
    console.error('Verify-OTP error:', error);
    return res.status(500).json({ error: 'Verification failed.' });
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

    // Send the reset link by email.
    const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    const resetUrl = `${origin}/reset-password?token=${rawToken}&email=${encodeURIComponent(normalisedEmail)}`;
    await sendPasswordResetEmail(normalisedEmail, resetUrl);

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

    // Password policy check for reset-password.
    const resetPolicyResult = validatePasswordPolicy(newPassword, { email: normalisedEmail });
    if (!resetPolicyResult.valid) {
      return res.status(400).json({ error: resetPolicyResult.errors[0], code: 'PASSWORD_POLICY' });
    }
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
      `SELECT user_id, full_name, email, role, tier, preferred_language, is_active
         FROM users WHERE user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0 || result.rows[0].is_active === false) {
      // Either the row is gone or the account was deleted and deactivated. The
      // token can still be valid for the rest of its hour, and this is the call
      // every page load makes to find out whether it means anything.
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
  res.clearCookie('reauth_token', { httpOnly: true, secure: true, sameSite: 'strict' });
  res.json({ message: 'Logged out successfully.' });
});

/*
 * POST /reauth — confirm the current password and issue a short-lived
 * re-authentication token.
 *
 * The re-auth token (5 minutes) is placed in an httpOnly cookie named
 * `reauth_token`. Routes protected by requireReAuth middleware read that
 * cookie and refuse the request if it is absent or expired.
 *
 * This follows the OWASP recommendation to re-authenticate before sensitive
 * account operations (email change, account deletion) so an unattended
 * still-signed-in browser cannot be exploited.
 */
const reauthLimiter = makeAuthLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Too many re-authentication attempts. Please try again in 15 minutes.',
});

router.post('/reauth', requireAuth, reauthLimiter, async (req, res) => {
  const { password } = req.body ?? {};

  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  try {
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Session is no longer valid.' });
    }

    const valid = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'That password is not correct.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured.');

    const reauthToken = jwt.sign(
      { sub: req.user.id, purpose: 'reauth' },
      secret,
      { expiresIn: '5m', algorithm: 'HS256' }
    );

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('reauth_token', reauthToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 5 * 60 * 1000,
    });

    return res.json({ message: 'Re-authentication successful.' });
  } catch (err) {
    console.error('[auth] Reauth failed:', err.message);
    return res.status(500).json({ error: 'Re-authentication failed.' });
  }
});

// ── Google OAuth ──────────────────────────────────────────────────────────────

/*
 * GET /google — redirect the browser to Google's consent screen.
 * The client links directly to this URL; no AJAX involved.
 */
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/*
 * GET /google/callback — Google redirects here after the user consents.
 *
 * On success: issue the same JWT cookie the password login issues, then
 * redirect back to the client. On failure: redirect to /login with an error
 * flag the client can display.
 */
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_failed' }),
  (req, res) => {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET is not configured.');

      const user = req.user;
      const token = jwt.sign(
        { id: user.user_id, email: user.email, role: user.role },
        secret,
        { expiresIn: '1h', algorithm: 'HS256' }
      );

      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
      res.redirect(`${clientOrigin}/auth/callback`);
    } catch (err) {
      console.error('[auth] Google callback error:', err.message);
      const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
      res.redirect(`${clientOrigin}/login?error=google_failed`);
    }
  }
);

// POST /verify-email — confirm the email verification token sent at registration.
router.post('/verify-email', async (req, res) => {
  try {
    const { token, email } = req.body ?? {};
    if (!token || !email) {
      return res.status(400).json({ error: 'Token and email are required.' });
    }
    const normalisedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const result = await pool.query(
      'SELECT user_id, verification_token_hash, verification_token_expiry FROM users WHERE email = $1',
      [normalisedEmail]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Verification link is invalid or has expired.' });
    }
    const user = result.rows[0];
    if (!user.verification_token_hash || !user.verification_token_expiry) {
      return res.status(400).json({ error: 'Verification link is invalid or has expired.' });
    }
    if (new Date() > new Date(user.verification_token_expiry)) {
      return res.status(400).json({ error: 'Verification link has expired. Please register again.' });
    }
    const tokenValid = await bcrypt.compare(token, user.verification_token_hash);
    if (!tokenValid) {
      return res.status(400).json({ error: 'Verification link is invalid or has expired.' });
    }
    await pool.query(
      'UPDATE users SET email_verified = TRUE, verification_token_hash = NULL, verification_token_expiry = NULL WHERE user_id = $1',
      [user.user_id]
    );
    return res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error('[auth] Email verification error:', err.message);
    return res.status(500).json({ error: 'Email verification failed.' });
  }
});

// GET /sessions — list active sessions for the current user.
router.get('/sessions', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT session_id_hash AS id, created_at, last_seen_at, expires_at, ip_address, user_agent
         FROM user_sessions
        WHERE user_id = $1
          AND revoked_at IS NULL
          AND expires_at > NOW()
        ORDER BY last_seen_at DESC`,
      [req.user.id]
    );
    return res.json({ sessions: result.rows });
  } catch (err) {
    if (err.code === '42P01') {
      return res.json({ sessions: [] });
    }
    console.error('[auth] Sessions list error:', err.message);
    return res.status(500).json({ error: 'Could not load sessions.' });
  }
});

// DELETE /sessions/:id — revoke a specific session by session_id_hash.
router.delete('/sessions/:id', requireAuth, async (req, res) => {
  try {
    await pool.query(
      `UPDATE user_sessions SET revoked_at = NOW()
        WHERE session_id_hash = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    return res.json({ message: 'Session revoked.' });
  } catch (err) {
    console.error('[auth] Session revoke error:', err.message);
    return res.status(500).json({ error: 'Could not revoke session.' });
  }
});

// POST /sessions/revoke/:id — revoke a specific session (matches client apiPost calls).
router.post('/sessions/revoke/:id', requireAuth, async (req, res) => {
  try {
    await pool.query(
      `UPDATE user_sessions SET revoked_at = NOW()
        WHERE session_id_hash = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    return res.json({ message: 'Session revoked.' });
  } catch (err) {
    console.error('[auth] Session revoke error:', err.message);
    return res.status(500).json({ error: 'Could not revoke session.' });
  }
});

// DELETE /sessions — revoke all sessions except the current one.
router.delete('/sessions', requireAuth, async (req, res) => {
  try {
    await pool.query(
      `UPDATE user_sessions SET revoked_at = NOW()
        WHERE user_id = $1 AND revoked_at IS NULL`,
      [req.user.id]
    );
    return res.json({ message: 'All sessions revoked.' });
  } catch (err) {
    console.error('[auth] Revoke all sessions error:', err.message);
    return res.status(500).json({ error: 'Could not revoke sessions.' });
  }
});

// POST /sessions/revoke-all — revoke all sessions (matches client apiPost calls).
router.post('/sessions/revoke-all', requireAuth, async (req, res) => {
  try {
    await pool.query(
      `UPDATE user_sessions SET revoked_at = NOW()
        WHERE user_id = $1 AND revoked_at IS NULL`,
      [req.user.id]
    );
    return res.json({ message: 'All sessions revoked.' });
  } catch (err) {
    console.error('[auth] Revoke all sessions error:', err.message);
    return res.status(500).json({ error: 'Could not revoke sessions.' });
  }
});

export default router;