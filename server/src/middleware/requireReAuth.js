/**
 * requireReAuth — middleware that checks the user has recently re-authenticated.
 *
 * Sensitive actions (changing password, revoking sessions, managing trusted
 * devices) call this before proceeding. If the user's last full authentication
 * was more than REAUTH_WINDOW_MS ago, the request is rejected with 403 so the
 * client can prompt for the current password before retrying.
 */

const REAUTH_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export default function requireReAuth(req, res, next) {
  const lastAuth = req.session?.lastReAuth ?? req.session?.createdAt;

  if (!lastAuth) {
    return res.status(403).json({
      error: 'Re-authentication required.',
      code: 'REAUTH_REQUIRED',
    });
  }

  const age = Date.now() - new Date(lastAuth).getTime();

  if (age > REAUTH_WINDOW_MS) {
    return res.status(403).json({
      error: 'Re-authentication required. Please confirm your password to continue.',
      code: 'REAUTH_REQUIRED',
    });
  }

  next();
}
