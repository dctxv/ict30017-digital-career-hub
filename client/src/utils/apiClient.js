/**
 * Thin fetch wrapper that gives every request the same handling for an expired
 * or rejected session.
 *
 * Before this existed, a 401 surfaced differently in each caller. The admin
 * dashboard rendered "Your session has expired. Please log in again." with no
 * actionable element beside it, and other callers showed a generic failure, so
 * an expired one hour token was a dead end wherever it happened to be noticed.
 *
 * Now any 401 clears the cached session and raises AUTH_UNAUTHORISED_EVENT.
 * SessionWatcher listens for it inside the router and redirects to /login with
 * an explanation. Callers still receive the response and can render their own
 * message; they simply no longer have to handle the session themselves.
 */

export const AUTH_UNAUTHORISED_EVENT = 'auth:unauthorised'

const STORAGE_KEY = 'user'

function clearCachedUser() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage can be unavailable in private browsing.
  }
}

/**
 * fetch with credentials included and centralised 401 handling.
 *
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {{ suppressRedirect?: boolean }} [config] set suppressRedirect when the
 *   caller is itself probing the session (GET /api/auth/me on mount), so the
 *   probe does not trigger a redirect loop.
 * @returns {Promise<Response>}
 */
export async function apiFetch(url, options = {}, config = {}) {
  const response = await fetch(url, { credentials: 'include', ...options })

  if (response.status === 401 && !config.suppressRedirect) {
    clearCachedUser()
    window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORISED_EVENT))
  }

  return response
}

export const SESSION_EXPIRED_MESSAGE =
  'Your session has expired. Please log in again to continue.'
