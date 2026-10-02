import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Compass, CheckCircle, XCircle, Loader } from 'lucide-react'
import Navbar from '../components/Navbar'
import './Auth.css'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resendStatus, setResendStatus] = useState('') // '' | sending | sent | error

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      setStatus('error')
      setMessage('Invalid verification link. Please request a new one below.')
      return
    }

    // Pre-fill the resend form with the email from the URL
    setResendEmail(decodeURIComponent(email))

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email: decodeURIComponent(email) }),
    })
      .then(r => r.json().then(d => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => {
        if (ok) {
          setStatus('success')
          setMessage('Your email is verified! You can now log in.')
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed. The link may have expired.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Could not reach the server. Please try again.')
      })
  }, [])

  function handleResend(e) {
    e.preventDefault()
    if (!resendEmail.trim()) return
    setResendStatus('sending')
    fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resendEmail.trim() }),
    })
      .then(r => r.json().then(d => ({ ok: r.ok, data: d })))
      .then(({ ok }) => {
        setResendStatus(ok ? 'sent' : 'error')
      })
      .catch(() => setResendStatus('error'))
  }

  return (
    <div className="page-enter">
      <Navbar />
      <div className="auth">
        <div className="auth__card" style={{ textAlign: 'center' }}>
          <div className="auth__brand">
            <span className="auth__mark"><Compass size={16} /></span>
            <span className="auth__wordmark">Digital Career Hub</span>
          </div>

          {status === 'loading' && (
            <>
              <Loader size={40} style={{ margin: '1.5rem auto', display: 'block', opacity: 0.5 }} />
              <h1 className="auth__title">Verifying your email…</h1>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle size={40} color="#22c55e" style={{ margin: '1.5rem auto', display: 'block' }} />
              <h1 className="auth__title">Email verified!</h1>
              <p className="auth__sub">{message}</p>
              <Link to="/login" className="btn btn--primary btn--lg btn--full" style={{ marginTop: '1rem', display: 'block', textAlign: 'center' }}>
                Go to login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle size={40} color="#ef4444" style={{ margin: '1.5rem auto', display: 'block' }} />
              <h1 className="auth__title">Verification failed</h1>
              <p className="auth__sub">{message}</p>

              <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                <p className="auth__sub" style={{ marginBottom: '0.5rem' }}>
                  <strong>Send a new verification link:</strong>
                </p>
                {resendStatus === 'sent' ? (
                  <p className="auth__sub" style={{ color: '#22c55e' }}>
                    ✓ A new link has been sent — please check your inbox.
                  </p>
                ) : (
                  <form onSubmit={handleResend} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="email"
                      className="auth__input"
                      placeholder="Your email address"
                      value={resendEmail}
                      onChange={e => setResendEmail(e.target.value)}
                      required
                      style={{ flex: 1 }}
                    />
                    <button
                      type="submit"
                      className="btn btn--primary"
                      disabled={resendStatus === 'sending'}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {resendStatus === 'sending' ? 'Sending…' : 'Resend'}
                    </button>
                  </form>
                )}
                {resendStatus === 'error' && (
                  <p className="auth__sub" style={{ color: '#ef4444', marginTop: '0.5rem' }}>
                    Failed to send. Please try registering again.
                  </p>
                )}
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                <Link to="/login" className="btn btn--ghost btn--full" style={{ display: 'block', textAlign: 'center' }}>
                  Back to login
                </Link>
                <Link to="/register" className="btn btn--ghost btn--full" style={{ display: 'block', textAlign: 'center' }}>
                  Register again
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
