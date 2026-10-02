/**
 * Writes a structured audit event to the audit_log table.
 * Fails silently — an audit write must never crash the request that triggered it.
 */
export async function logEvent(pool, { userId = null, eventType, email = null, req = null, meta = null }) {
  try {
    const ip = req
      ? (req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? req.socket?.remoteAddress ?? null)
      : null;
    const ua = req?.headers?.['user-agent'] ?? null;

    await pool.query(
      `INSERT INTO audit_log (user_id, event_type, email, ip_address, user_agent, meta)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, eventType, email, ip, ua, meta ? JSON.stringify(meta) : null]
    );
  } catch {
    // Never let audit failures surface to the caller.
  }
}

/**
 * Extracts the real client IP from a request, handling proxies.
 */
export function getClientIp(req) {
  return req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
    ?? req?.socket?.remoteAddress
    ?? null;
}
