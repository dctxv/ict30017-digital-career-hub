import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Component: RequireAuth
 * Responsibility: Guard routes that require authentication, and optionally a
 * specific role, against a session the server has confirmed.
 *
 * This previously trusted localStorage.user.role on its own, so setting
 * role:"admin" by hand with no cookie loaded the full admin dashboard chrome.
 * Nothing private leaked, because every API read and write still returned 401,
 * but it presented as a successful breach.
 *
 * The gate now waits for GET /api/auth/me. Until that call settles the guard
 * renders nothing, and a 401 counts as unauthenticated no matter what
 * localStorage claims. Role is compared against the value the server returned
 * from the database, not the value in the cache.
 *
 * This is a frontend gate and does not replace anything: requireAuth and
 * requireRole still run on every protected endpoint server side.
 */
export default function RequireAuth({ children, requiredRole = null }) {
  const { user, isAuthenticated, isPending } = useAuth()
  const location = useLocation()

  // Session not yet confirmed. Rendering children here is exactly the hole
  // that made the localStorage edit look like it worked.
  if (isPending) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}
