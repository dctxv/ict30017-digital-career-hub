import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AUTH_UNAUTHORISED_EVENT, SESSION_EXPIRED_MESSAGE } from '../utils/apiClient'

/**
 * Turns any 401 raised through apiFetch into a single, consistent recovery:
 * clear the stale session and send the user to the login page with a reason.
 *
 * Renders nothing. Must sit inside the router so it can navigate, and inside
 * the AuthProvider so it can clear the session.
 */
export default function SessionWatcher() {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearSession } = useAuth()

  useEffect(() => {
    function handleUnauthorised() {
      clearSession()
      // Already on the login page, so there is nothing to redirect to.
      if (location.pathname === '/login') return
      navigate('/login', {
        replace: true,
        state: { message: SESSION_EXPIRED_MESSAGE, from: location.pathname },
      })
    }

    window.addEventListener(AUTH_UNAUTHORISED_EVENT, handleUnauthorised)
    return () => window.removeEventListener(AUTH_UNAUTHORISED_EVENT, handleUnauthorised)
  }, [clearSession, navigate, location.pathname])

  return null
}
