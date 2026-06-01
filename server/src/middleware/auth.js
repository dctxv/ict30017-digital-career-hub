/**
 * Module: authMiddleware
 * Responsibility: Verify the JWT from the httpOnly cookie or Bearer header.
 *
 * Usage:
 *   import { requireAuth, requireRole } from '../middleware/auth.js';
 *
 *   router.get('/protected', requireAuth, handler);
 *   router.get('/admin-only', requireAuth, requireRole('admin'), handler);
 */

import jwt from 'jsonwebtoken';

const AUTH_COOKIE_NAMES = ['token', 'jwt', 'access_token', 'accessToken'];

function getToken(req) {
  // 1. Prefer httpOnly cookie
  for (const name of AUTH_COOKIE_NAMES) {
    if (req.cookies?.[name]) return req.cookies[name];
  }
  // 2. Fall back to Authorization: Bearer header (for API clients)
  const header = req.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'replace_with_a_random_32plus_char_secret') {
    throw new Error('JWT_SECRET is not configured.');
  }
  return secret;
}

/**
 * Middleware: requires a valid, non-expired JWT.
 * Attaches `req.user = { id, role }` on success.
 */
export function requireAuth(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });

    if (!payload.exp) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = {
      id: String(payload.id ?? payload.userId ?? payload.sub),
      role: payload.role ?? 'student',
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

/**
 * Middleware factory: requires a specific role.
 * Must be used AFTER requireAuth.
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    next();
  };
}

/**
 * Middleware: attaches user if authenticated, but does not block unauthenticated requests.
 * Sets req.user = { id: 'guest', role: 'guest' } when no valid token found.
 */
export function optionalAuth(req, res, next) {
  const token = getToken(req);
  if (!token) {
    req.user = { id: 'guest', role: 'guest' };
    return next();
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    if (!payload.exp) {
      req.user = { id: 'guest', role: 'guest' };
      return next();
    }
    req.user = {
      id: String(payload.id ?? payload.userId ?? payload.sub),
      role: payload.role ?? 'student',
    };
  } catch {
    req.user = { id: 'guest', role: 'guest' };
  }

  next();
}
