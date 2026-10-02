/**
 * Writes a structured security event to the audit_log table.
 *
 * audit_log was created for administrative content writes (action, entity,
 * before, after) and extended by add_audit_log.sql with the security-event
 * columns used here; relax_audit_log_for_security_events.sql lets a row carry
 * one kind or the other. Fails silently — an audit write must never crash the
 * request that triggered it — but says so in the log, because a swallowed error
 * here once meant no security event was ever recorded.
 */
export async function logEvent(pool, { userId = null, eventType, email = null, req = null, meta = null }) {
  try {
    await pool.query(
      `INSERT INTO audit_log (user_id, event_type, email, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, eventType, email, getClientIp(req), req?.headers?.['user-agent'] ?? null,
       meta ? JSON.stringify(meta) : null]
    );
  } catch (err) {
    console.error(`[audit] Could not record ${eventType}: ${err.message}`);
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
