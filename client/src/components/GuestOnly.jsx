import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * The mirror of RequireAuth: keeps a signed-in user off the login and register
 * pages, which were previously reachable while authenticated.
 *
 * Waits for the server probe to settle before deciding, so a signed-in user
 * reloading /login is not briefly shown the form before being redirected.
 */
export default function GuestOnly({ children }) {
  const { isAuthenticated, isPending } = useAuth()
  const location = useLocation()

  if (isPending) return null

  if (isAuthenticated) {
    const target = location.state?.from ?? '/'
    return <Navigate to={target} replace />
  }

  return children
}
