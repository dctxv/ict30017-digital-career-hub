/**
 * Page: VerifyEmail
 * Handles GET /verify-email?token=...&email=... links from verification emails.
 * On mount it calls the backend; shows success, expired, or error state.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate }   from 'react-router-dom'
import Navbar                  from '../components/Navbar'
import './Auth.css'

export default function VerifyEmail() {
  const params   = new URLSearchParams(window.location.search)
  const token    = params.get('token')  || ''
  const email    = params.get('email')  || ''
  const navigate = useNavigate()

  const [status,  setStatus]  = useState('loading') // loading | success | expired | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token || !email) {
      setStatus('error')
      setMessage('Invalid verification link. Please request a new one.')
      return
    }

    const url = `/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
    fetch(url)
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setStatus('success')
          setMessage(data.message || 'Email verified! You can now log in.')
          setTimeout(() => navigate('/login'), 3000)
        } else if (data.expired) {
          setStatus('expired')
          setMessage(data.error || 'Verification link has expired.')
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Could not connect to server. Please try again.')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const icons = {
    loading: (
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
    ),
    success: (
      <div style={{ fontSize: '2.5rem', color: '#27ae60', marginBottom: '1rem' }}>✅</div>
    ),
    expired: (
      <div style={{ fontSize: '2.5rem', color: '#e67e22', marginBottom: '1rem' }}>⏰</div>
    ),
    error: (
      <div style={{ fontSize: '2.5rem', color: '#c0392b', marginBottom: '1rem' }}>❌</div>
    ),
  }

  return (
    <div className="page-enter auth-page">
      <Navbar />
      <div className="auth-bg">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-brand">Digital Career Hub</div>

          {icons[status]}

          <h1 className="auth-title" style={{ fontSize: '1.3rem' }}>
            {status === 'loading' && 'Verifying your email…'}
            {status === 'success' && 'Email verified!'}
            {status === 'expired' && 'Link expired'}
            {status === 'error'   && 'Verification failed'}
          </h1>

          <p className="auth-sub">{message}</p>

          {status === 'success' && (
            <p className="auth-sub" style={{ color: '#888', fontSize: '0.85rem' }}>
              Redirecting you to login…
            </p>
          )}

          {status === 'expired' && (
            <ResendVerification email={email} />
          )}

          {status === 'error' && (
            <div style={{ marginTop: '1rem' }}>
              <ResendVerification email={email} />
            </div>
          )}

          <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
            <Link to="/login" className="link-green">← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function ResendVerification({ email }) {
  const [sent,     setSent]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  const [emailInput, setEmailInput] = useState(email || '')

  const handleResend = async () => {
    if (!emailInput.trim()) {
      setResendMsg('Please enter your email address.')
      return
    }
    setLoading(true)
    setResendMsg('')
    try {
      const res  = await fetch('/api/auth/resend-verification', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: emailInput.trim() }),
      })
      const data = await res.json()
      setResendMsg(data.message || 'Request submitted.')
      setSent(true)
    } catch {
      setResendMsg('Could not connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return <p className="auth-sub" style={{ color: '#27ae60' }}>{resendMsg}</p>
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      {!email && (
        <div className="form-group" style={{ textAlign: 'left', marginBottom: '0.75rem' }}>
          <label className="form-label">Your email address</label>
          <input
            className="form-input"
            type="email"
            placeholder="you@example.com"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
          />
        </div>
      )}
      <button className="btn-auth" onClick={handleResend} disabled={loading}>
        {loading ? 'Sending…' : 'Resend verification email'}
      </button>
      {resendMsg && <p className="auth-sub" style={{ marginTop: '0.5rem' }}>{resendMsg}</p>}
    </div>
  )
}
