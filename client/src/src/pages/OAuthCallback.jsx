/**
 * OAuthCallback — landing page after a Google/GitHub OAuth redirect.
 *
 * The server sets the JWT cookie and redirects here. We call /api/auth/me
 * to get the user object, store it in localStorage (same as OTP flow),
 * then navigate to the destination.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiGet } from '../api/apiClient'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const err = params.get('error')
    if (err) {
      const messages = {
        google_failed: 'Google sign-in failed. Please try again.',
        github_failed: 'GitHub sign-in failed. Please try again.',
        google_not_configured: 'Google sign-in is not enabled on this server.',
        github_not_configured: 'GitHub sign-in is not enabled on this server.',
        oauth_failed: 'Sign-in failed. Please try again.',
      }
      setError(messages[err] || 'Sign-in failed.')
      return
    }

    apiGet('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user) throw new Error('No user returned.')
        localStorage.setItem('user', JSON.stringify(data.user))
        window.dispatchEvent(new Event('auth-changed'))
        navigate('/', { replace: true })
      })
      .catch(() => {
        setError('Could not complete sign-in. Please try again.')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', padding: '24px' }}>
        <p style={{ color: '#c0392b', fontSize: '15px' }}>{error}</p>
        <a href="/login" style={{ color: '#15803d', fontWeight: 600 }}>Back to log in</a>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: '#555', fontSize: '15px' }}>Completing sign-in…</p>
    </div>
  )
}
