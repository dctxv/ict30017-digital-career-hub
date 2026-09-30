/**
 * Module: securityRouter
 * Responsibility: Admin-only endpoints that expose security telemetry —
 * audit logs, active sessions, locked accounts, and a headline stats summary.
 *
 * Every route requires a valid JWT with role = 'admin'.
 */

import express from 'express';
import pool from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth, requireRole('admin'));

// ─── GET /api/security/stats ─────────────────────────────────────────────────
// Headline numbers for the dashboard cards.
router.get('/stats', async (req, res) => {
  try {
    const [users, locked, sessions, events] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total,
                         SUM(CASE WHEN email_verified THEN 1 ELSE 0 END) AS verified
                    FROM users`).catch(() => ({ rows: [{ total: '?', verified: '?' }] })),

      pool.query(`SELECT COUNT(*) AS cnt FROM users
                   WHERE lockout_until IS NOT NULL AND lockout_until > NOW()`)
                  .catch(() => ({ rows: [{ cnt: '0' }] })),

      pool.query(`SELECT COUNT(*) AS cnt FROM user_sessions
                   WHERE revoked_at IS NULL AND expires_at > NOW()`)
                  .catch(() => ({ rows: [{ cnt: '0' }] })),

      pool.query(`SELECT COUNT(*) AS cnt FROM audit_log
                   WHERE created_at > NOW() - INTERVAL '24 hours'`)
                  .catch(() => ({ rows: [{ cnt: '0' }] })),
    ]);

    return res.json({
      totalUsers:      parseInt(users.rows[0].total,    10) || 0,
      verifiedUsers:   parseInt(users.rows[0].verified, 10) || 0,
      lockedAccounts:  parseInt(locked.rows[0].cnt,     10) || 0,
      activeSessions:  parseInt(sessions.rows[0].cnt,   10) || 0,
      auditEvents24h:  parseInt(events.rows[0].cnt,     10) || 0,
    });
  } catch (err) {
    console.error('[security] stats error:', err.message);
    return res.status(500).json({ error: 'Could not load stats.' });
  }
});

// ─── GET /api/security/audit-logs ────────────────────────────────────────────
// Recent security events from the audit_log table.
router.get('/audit-logs', async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit  || '50', 10), 200);
    const offset = parseInt(req.query.offset || '0', 10);
    const filter = req.query.event_type || null;

    const result = await pool.query(
      `SELECT
         a.log_id,
         a.created_at,
         COALESCE(a.event_type, a.action) AS event_type,
         COALESCE(a.email, u.email)       AS email,
         a.ip_address,
         a.metadata,
         a.user_id
       FROM audit_log a
       LEFT JOIN users u ON u.user_id = COALESCE(a.user_id, a.actor_id)
       WHERE ($1::TEXT IS NULL OR a.event_type = $1)
       ORDER BY a.created_at DESC
       LIMIT $2 OFFSET $3`,
      [filter, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM audit_log
        WHERE ($1::TEXT IS NULL OR event_type = $1)`,
      [filter]
    );

    return res.json({
      logs:  result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    });
  } catch (err) {
    console.error('[security] audit-logs error:', err.message);
    return res.status(500).json({ error: 'Could not load audit logs.' });
  }
});

// ─── GET /api/security/locked-accounts ───────────────────────────────────────
// Accounts currently locked out due to failed login attempts.
router.get('/locked-accounts', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, email, full_name,
              failed_login_attempts,
              lockout_until,
              created_at
         FROM users
        WHERE lockout_until IS NOT NULL AND lockout_until > NOW()
        ORDER BY lockout_until DESC`
    );
    return res.json({ accounts: result.rows });
  } catch (err) {
    console.error('[security] locked-accounts error:', err.message);
    return res.status(500).json({ error: 'Could not load locked accounts.' });
  }
});

// ─── POST /api/security/unlock/:userId ───────────────────────────────────────
// Manually unlock a locked account.
router.post('/unlock/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await pool.query(
      `UPDATE users SET lockout_until = NULL, failed_login_attempts = 0 WHERE user_id = $1`,
      [userId]
    );
    return res.json({ message: 'Account unlocked.' });
  } catch (err) {
    console.error('[security] unlock error:', err.message);
    return res.status(500).json({ error: 'Could not unlock account.' });
  }
});

// ─── GET /api/security/active-sessions ───────────────────────────────────────
// All non-expired, non-revoked sessions across all users.
router.get('/active-sessions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.session_id_hash AS id,
              u.email,
              u.full_name,
              s.created_at,
              s.last_seen_at,
              s.expires_at,
              s.ip_address,
              s.user_agent
         FROM user_sessions s
         JOIN users u ON u.user_id = s.user_id
        WHERE s.revoked_at IS NULL
          AND s.expires_at > NOW()
        ORDER BY s.last_seen_at DESC
        LIMIT 100`
    ).catch(() => ({ rows: [] }));

    return res.json({ sessions: result.rows });
  } catch (err) {
    console.error('[security] active-sessions error:', err.message);
    return res.status(500).json({ error: 'Could not load sessions.' });
  }
});

// ─── POST /api/security/revoke-session/:id ───────────────────────────────────
// Revoke any session by its hash id.
router.post('/revoke-session/:id', async (req, res) => {
  try {
    await pool.query(
      `UPDATE user_sessions SET revoked_at = NOW() WHERE session_id_hash = $1`,
      [req.params.id]
    ).catch(() => {});
    return res.json({ message: 'Session revoked.' });
  } catch (err) {
    console.error('[security] revoke-session error:', err.message);
    return res.status(500).json({ error: 'Could not revoke session.' });
  }
});

export default router;
