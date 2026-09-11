/**
 * The account API, in one place.
 *
 * Every call here goes through apiFetch, so an expired session is handled the
 * same way wherever it surfaces: the cached user is cleared and SessionWatcher
 * redirects to the login page with an explanation. A profile page that returned
 * "could not save" for a lapsed token would be telling the user the wrong
 * thing about their own data.
 *
 * Each function returns the parsed body on success and throws an ApiError
 * carrying the server's own message on failure. The server localises its error
 * text from the lang cookie, so that message is already in the user's language
 * and is rendered as-is; callers fall back to their own translated copy only
 * when the response carried no message at all.
 */

import { apiFetch } from '../utils/apiClient'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(url, options = {}) {
  const response = await apiFetch(url, {
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  })

  if (response.status === 204) return null

  let data = null
  try {
    data = await response.json()
  } catch {
    // A body that is not JSON is only a problem if the call also failed.
  }

  if (!response.ok) {
    throw new ApiError(data?.error ?? null, response.status)
  }

  return data
}

/** The signed-in user's full profile, including the fields /auth/me omits. */
export function fetchProfile() {
  return request('/api/users/me')
}

/**
 * Updates the profile. `currentPassword` is required only when the email
 * changes — the server enforces that, this is not a client-side rule.
 */
export function updateProfile(payload) {
  return request('/api/users/me', { method: 'PATCH', body: JSON.stringify(payload) })
}

export function changePassword(payload) {
  return request('/api/users/me/password', { method: 'POST', body: JSON.stringify(payload) })
}

/** Everything held against the account, as one JSON object. */
export function exportAccountData() {
  return request('/api/users/me/export')
}

export function deleteAccount(password) {
  return request('/api/users/me', { method: 'DELETE', body: JSON.stringify({ password }) })
}

/** The subscription record behind the account's tier, or null on the free tier. */
export function fetchSubscription() {
  return request('/api/users/me/subscription')
}

/**
 * Moves the account to Premium, recording which instrument was chosen. No
 * payment is taken — see the server route and the migration behind it.
 */
export function upgradePlan(paymentMethod) {
  return request('/api/users/me/subscription', {
    method: 'POST',
    body: JSON.stringify({ payment_method: paymentMethod }),
  })
}

/** Returns the account to the free tier, closing the subscription record. */
export function cancelPlan() {
  return request('/api/users/me/subscription', { method: 'DELETE' })
}

/** Past resume reviews, newest first. */
export function fetchReviewHistory() {
  return request('/api/resume/history')
}

/** One past review in full, including the feedback the user read. */
export function fetchReview(id) {
  return request(`/api/resume/history/${id}`)
}

export function fetchReviewQuota() {
  return request('/api/resume/quota')
}

export function fetchChatQuota() {
  return request('/api/chat/quota')
}
