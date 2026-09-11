/**
 * OAuth routes — Google and GitHub social login.
 *
 * Flow:
 *   1. User clicks "Continue with Google/GitHub" on the login page.
 *   2. Browser follows /api/auth/oauth/google (GET) → redirect to provider.
 *   3. Provider authenticates and redirects back to /api/auth/oauth/google/callback.
 *   4. We exchange the code, find or create the user, issue a JWT session,
 *      and redirect to the frontend.
 *
 * Env vars required (add to .env):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 *
 * The redirect URIs you register with each provider must match:
 *   Google:  http://localhost:3000/api/auth/oauth/google/callback  (dev)
 *   GitHub:  http://localhost:3000/api/auth/oauth/github/callback  (dev)
 */

import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db.js';
import { logEvent, getClientIp } from '../utils/audit.js';

const router = express.Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function clientUrl() {
  return process.env.CLIENT_URL || 'http://localhost:5173';
}

function serverUrl() {
  return process.env.SERVER_URL || 'http://localhost:3000';
}

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s === 'replace_with_a_random_32plus_char_secret') throw new Error('JWT_SECRET not configured.');
  return s;
}

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

async function createSession(userId, req) {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO user_sessions (session_id_hash, user_id, expires_at, ip_address, user_agent)
     VALUES ($1,$2,$3,$4,$5)`,
    [hash, userId, expires, getClientIp(req), String(req.get('user-agent') || '').slice(0, 1000)]
  );
  return raw;
}

/**
 * Find an existing user by OAuth provider ID or email,
 * or create a new account if neither matches.
 *
 * Returns the user row.
 */
async function findOrCreateOAuthUser({ provider, providerId, email, fullName }) {
  const providerCol = provider === 'google' ? 'oauth_google_id' : 'oauth_github_id';
  const normEmail = email ? email.trim().toLowerCase() : null;

  // 1. Look up by provider ID (most specific — always correct after first OAuth login).
  const byId = await pool.query(
    `SELECT user_id, full_name, email, role FROM users WHERE ${providerCol} = $1`,
    [providerId]
  );
  if (byId.rows.length > 0) return byId.rows[0];

  // 2. Look up by email (user may have registered with a password first).
  if (normEmail) {
    const byEmail = await pool.query(
      `SELECT user_id, full_name, email, role FROM users WHERE email = $1`,
      [normEmail]
    );
    if (byEmail.rows.length > 0) {
      // Link the OAuth ID to the existing account.
      await pool.query(
        `UPDATE users SET ${providerCol} = $1, email_verified = TRUE WHERE user_id = $2`,
        [providerId, byEmail.rows[0].user_id]
      );
      return byEmail.rows[0];
    }
  }

  // 3. Create a new account. OAuth-sourced accounts are email-verified by default.
  const name = (fullName || 'User').slice(0, 100);
  const result = await pool.query(
    `INSERT INTO users (full_name, email, role, email_verified, ${providerCol})
     VALUES ($1, $2, 'student', TRUE, $3)
     RETURNING user_id, full_name, email, role`,
    [name, normEmail, providerId]
  );
  return result.rows[0];
}

// ---------------------------------------------------------------------------
// Strategy registration (only when credentials are present)
// ---------------------------------------------------------------------------
const GOOGLE_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GITHUB_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (GOOGLE_ID && GOOGLE_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: GOOGLE_ID,
      clientSecret: GOOGLE_SECRET,
      callbackURL: `${serverUrl()}/api/auth/oauth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || null;
        const user = await findOrCreateOAuthUser({
          provider: 'google',
          providerId: profile.id,
          email,
          fullName: profile.displayName,
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  ));
}

if (GITHUB_ID && GITHUB_SECRET) {
  // Dynamic import so the server starts even if passport-github2 is not installed
  // (GitHub OAuth is optional — Google OAuth and password login work without it).
  import('passport-github2').then(({ Strategy: GitHubStrategy }) => {
    passport.use(new GitHubStrategy(
      {
        clientID: GITHUB_ID,
        clientSecret: GITHUB_SECRET,
        callbackURL: `${serverUrl()}/api/auth/oauth/github/callback`,
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || null;
          const user = await findOrCreateOAuthUser({
            provider: 'github',
            providerId: String(profile.id),
            email,
            fullName: profile.displayName || profile.username,
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    ));
  }).catch(() => {
    console.warn('[oauth] passport-github2 not installed — GitHub login disabled.');
  });
}

// Passport needs these even when not using sessions (we use JWT instead).
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * Helper: finish an OAuth login — issue JWT cookie and redirect to frontend.
 * Called from both provider callbacks after Passport's done().
 */
async function finishOAuthLogin(req, res, user) {
  try {
    const sid = await createSession(user.user_id, req);
    const token = jwt.sign(
      { id: user.user_id, role: user.role, sid },
      getJwtSecret(),
      { expiresIn: '1h', algorithm: 'HS256' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction(),
      sameSite: 'strict', // Note: for OAuth redirect flows sameSite:'lax' is safer in production
      maxAge: 60 * 60 * 1000,
    });

    // Store user in a non-httpOnly cookie so the client JS can read it,
    // same pattern as the OTP verify-otp response (localStorage via JS).
    // We use a redirect with a short-lived query flag instead — the client
    // reads /api/auth/me after the redirect.
    await logEvent(pool, { userId: user.user_id, eventType: 'login_success_oauth', req });

    // Redirect to frontend — the client calls /api/auth/me to get the user object.
    res.redirect(`${clientUrl()}/auth/callback`);
  } catch (err) {
    console.error('[oauth] finishOAuthLogin error:', err.message);
    res.redirect(`${clientUrl()}/login?error=google_failed`);
  }
}

// GET /api/auth/me — returns the current user from the JWT cookie.
// Used by the frontend after an OAuth redirect.
router.get('/me', async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated.' });
  try {
    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    const result = await pool.query(
      'SELECT user_id, full_name, email, role FROM users WHERE user_id = $1',
      [payload.id]
    );
    if (!result.rows.length) return res.status(401).json({ error: 'User not found.' });
    const u = result.rows[0];
    res.json({ user: { id: u.user_id, full_name: u.full_name, email: u.email, role: u.role } });
  } catch {
    res.status(401).json({ error: 'Invalid session.' });
  }
});

// Google
if (GOOGLE_ID && GOOGLE_SECRET) {
  router.get('/google', passport.authenticate('google', { session: false }));

  router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${clientUrl()}/login?error=google_failed` }),
    (req, res) => finishOAuthLogin(req, res, req.user)
  );
} else {
  // Not configured — return a helpful error so the button doesn't silently fail.
  router.get('/google', (req, res) =>
    res.redirect(`${clientUrl()}/login?error=google_not_configured`)
  );
}

// GitHub
if (GITHUB_ID && GITHUB_SECRET) {
  router.get('/github', passport.authenticate('github', { session: false }));

  router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: `${clientUrl()}/login?error=github_failed` }),
    (req, res) => finishOAuthLogin(req, res, req.user)
  );
} else {
  router.get('/github', (req, res) =>
    res.redirect(`${clientUrl()}/login?error=github_not_configured`)
  );
}

export default router;
