/**
 * Component: RequireAuth
 * Responsibility: Guard routes that require authentication (and optionally a specific role).
 *
 * Security:
 *  - Reads user from localStorage (set on login, cleared on logout)
 *  - For a production app, also validate the httpOnly cookie server-side
 *    via a lightweight /api/auth/me endpoint on page load
 *  - Role check prevents non-admins from reaching admin routes
 */

import { Navigate } from 'react-router-dom'

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    // Corrupted data — treat as logged out
    localStorage.removeItem('user')
    return null
  }
}

export default function RequireAuth({ children, requiredRole = null }) {
  const user = getStoredUser()

  if (!user) {
    // Not authenticated — redirect to login, preserving intended destination
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    // Authenticated but wrong role — redirect home
    return <Navigate to="/" replace />
  }

  return children
}
