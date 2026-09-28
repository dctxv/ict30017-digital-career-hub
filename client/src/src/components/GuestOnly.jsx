import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * The mirror of RequireAuth: keeps a signed-in user off the login and register
 * pages, which were previously reachable while authenticated.
 *
 * It redirects only for a user who ARRIVED signed in — never for one who signs
 * in while on the page. That distinction is the whole of this component, and
 * getting it wrong is not subtle.
 *
 * Registering used to land on the home page instead of the new account, and
 * logging in ignored wherever you were headed. The cause was the same in both:
 * the moment the session lands, this guard is still mounted, so it renders
 * <Navigate to="/"> in the same pass as the page's own navigate(). Both commit,
 * the guard's second, and it wins. The browser trace read /profile then /.
 *
 * So the answer is recorded once, from the first settled state, rather than
 * being recomputed as the session changes underneath. A user who arrives with a
 * valid cookie is sent away; a user who authenticates here is left alone,
 * because the page they authenticated on is the thing that knows where they
 * should go next.
 */
export default function GuestOnly({ children }) {
  const { isAuthenticated, isPending } = useAuth()
  const location = useLocation()

  // null until the server probe settles, then fixed for the life of the mount.
  // Adjusted during render rather than in an effect: the value is needed by
  // this same render, and an effect would let one frame of the wrong branch
  // paint first.
  const [arrivedSignedIn, setArrivedSignedIn] = useState(null)
  if (!isPending && arrivedSignedIn === null) {
    setArrivedSignedIn(isAuthenticated)
  }

  // Session not yet confirmed. Rendering the form here and pulling it away a
  // moment later is worse than a blank frame.
  if (arrivedSignedIn === null) return null

  if (arrivedSignedIn) {
    const target = location.state?.from ?? '/'
    return <Navigate to={target} replace />
  }

  return children
}
