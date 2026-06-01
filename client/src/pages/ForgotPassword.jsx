import { useState } from 'react'
import { Link }     from 'react-router-dom'
import Navbar       from '../components/Navbar'
import './Auth.css'

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const handleSubmit = async () => {
    setMessage('')
    if (!email.trim()) {
      setMessage('Please enter your email address.')
      return
    }

    try {
      setLoading(true)
      const res  = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      // Always show the generic server message regardless of status
      setMessage(data.message || 'Request submitted.')
      setSent(true)
    } catch {
      setMessage('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter auth-page">
      <Navbar />
      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-brand">Digital Career Hub</div>
          <h1 className="auth-title">Reset your password</h1>
          <p className="auth-sub">
            Enter your email address and we'll send you a reset link.
          </p>

          {!sent && (
            <>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              <button className="btn-auth" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </>
          )}

          {message && (
            <p className="auth-sub" style={{ marginTop: '1rem' }}>{message}</p>
          )}

          <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
            <Link to="/login" className="link-green">← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
