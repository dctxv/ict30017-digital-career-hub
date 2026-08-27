/**
 * Module: authMiddleware
 * Responsibility: Verify the JWT issued by routes/auth.js and expose the
 * caller's identity and role to downstream handlers.
 *
 * Usage:
 *   import { requireAuth, requireRole } from '../middleware/auth.js';
 *
 *   router.get('/protected', requireAuth, handler);
 *   router.post('/admin-only', requireAuth, requireRole('admin'), handler);
 *
 * routes/auth.js signs { id, role } with HS256 and sets it as an httpOnly
 * cookie named `token`. The Authorization: Bearer fallback exists for API
 * clients and tests that cannot hold a cookie jar.
 *
 * Adapted from the implementation on the Sineth branch. Two deliberate
 * changes from that version:
 *   1. requireRole is variadic — requireRole('admin', 'staff') — so a role
 *      hierarchy can be introduced later without editing every call site.
 *   2. A missing JWT_SECRET returns 500, not 401. It is a server
 *      misconfiguration, and reporting it as an auth failure sends callers
 *      chasing their own credentials over a deployment problem.
 */

import jwt from 'jsonwebtoken';
import pool from '../db.js';

const AUTH_COOKIE_NAMES = ['token', 'jwt', 'access_token', 'accessToken'];

function getToken(req) {
  // 1. Prefer the httpOnly cookie set at login. Requires cookie-parser to be
  //    mounted in app.js; req.cookies is undefined without it.
  for (const name of AUTH_COOKIE_NAMES) {
    if (req.cookies?.[name]) return req.cookies[name];
  }
  // 2. Fall back to Authorization: Bearer for non-browser clients.
  const header = req.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}

function readJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'replace_with_a_random_32plus_char_secret') {
    return null;
  }
  return secret;
}

function verify(token) {
  const secret = readJwtSecret();
  if (!secret) {
    const err = new Error('JWT_SECRET is not configured.');
    err.code = 'NO_SECRET';
    throw err;
  }

  const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });

  // Reject non-expiring tokens outright: a token with no exp never goes stale.
  if (!payload.exp) {
    const err = new Error('Token has no expiry.');
    err.code = 'NO_EXP';
    throw err;
  }

  return {
    id: String(payload.id ?? payload.userId ?? payload.sub),
    role: payload.role ?? 'student',
  };
}

/**
 * Requires a valid, non-expired JWT. Attaches req.user = { id, role }.
 */
export function requireAuth(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    req.user = verify(token);
    return next();
  } catch (err) {
    if (err.code === 'NO_SECRET') {
      console.error('[auth] JWT_SECRET is not configured.');
      return res.status(500).json({ error: 'Internal server error.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

/**
 * Requires the caller to hold one of the given roles. Must run after requireAuth.
 *
 * Variadic by design: requireRole('admin') today, requireRole('admin', 'staff')
 * when more roles exist, with no change to the guard itself.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    return next();
  };
}

/**
 * Refuses a token belonging to a deactivated account. Must run after requireAuth.
 *
 * Deleting an account keeps its users row — deactivated and scrubbed — so that
 * audit records and foreign keys still resolve. The token it was holding stays
 * cryptographically valid for the rest of its hour, and signature validity is
 * the only thing requireAuth can check. Without this, a deleted account could
 * go on reading and editing itself until the token expired.
 *
 * This costs one query per request, which is why it is applied to the account
 * routes rather than globally: those are the ones where acting on a deleted
 * account would be a real problem, and the public content routes read nothing
 * that belongs to anyone.
 */
export async function requireActiveAccount(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const result = await pool.query('SELECT is_active FROM users WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0 || result.rows[0].is_active === false) {
      return res.status(401).json({ error: 'Session is no longer valid.' });
    }
    return next();
  } catch (err) {
    // A database failure is not an authorisation decision. Reporting it as one
    // would send the user to re-authenticate against a problem no password
    // fixes, which is the same mistake the JWT_SECRET branch above avoids.
    console.error('[auth] Active-account check failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Attaches req.user when a valid token is present but never blocks the request.
 * Unauthenticated callers get { id: 'guest', role: 'guest' }.
 */
export function optionalAuth(req, res, next) {
  const token = getToken(req);
  if (!token) {
    req.user = { id: 'guest', role: 'guest' };
    return next();
  }

  try {
    req.user = verify(token);
  } catch {
    req.user = { id: 'guest', role: 'guest' };
  }

  return next();
}
