/**
 * apiClient.js — centralised fetch wrapper
 *
 * Ensures every request to the backend:
 *   1. Sends cookies (credentials: 'include') so the httpOnly JWT is forwarded.
 *   2. Includes the X-CSRF-Token header for state-changing methods, reading the
 *      value from the csrf_token cookie the server issues at startup.
 *
 * Usage:
 *   import { apiGet, apiPost, apiPut, apiDelete } from '../api/apiClient'
 *   const data = await apiGet('/api/disciplines')
 *   const result = await apiPost('/api/disciplines', { name: 'Computing' })
 */

function getCsrfToken() {
  // The csrf_token cookie is intentionally NOT httpOnly — it is meant to be
  // read by JS and sent back as a header (double-submit pattern).
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

const STATE_CHANGING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

async function apiFetch(method, path, body = undefined, extraHeaders = {}) {
  const headers = {
    ...extraHeaders,
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  // Add CSRF token for state-changing requests as defense-in-depth.
  // The server already allows same-origin requests via the Origin header check,
  // but sending the token is belt-and-suspenders good practice.
  if (STATE_CHANGING.has(method.toUpperCase())) {
    const token = getCsrfToken()
    if (token) headers['X-CSRF-Token'] = token
  }

  const init = {
    method: method.toUpperCase(),
    headers,
    credentials: 'include', // Always send the httpOnly JWT cookie
  }

  if (body !== undefined) {
    init.body = JSON.stringify(body)
  }

  const res = await fetch(path, init)
  return res
}

export const apiGet    = (path, headers)         => apiFetch('GET',    path, undefined, headers)
export const apiPost   = (path, body, headers)   => apiFetch('POST',   path, body,      headers)
export const apiPut    = (path, body, headers)   => apiFetch('PUT',    path, body,      headers)
export const apiPatch  = (path, body, headers)   => apiFetch('PATCH',  path, body,      headers)
export const apiDelete = (path, headers)         => apiFetch('DELETE', path, undefined, headers)

export default apiFetch
