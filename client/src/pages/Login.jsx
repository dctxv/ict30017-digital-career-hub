import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './Auth.css'

export default function Login() {
  const [show,        setShow]        = useState(false)
  const [form,        setForm]        = useState({ email: '', password: '' })
  const [message,     setMessage]     = useState('')
  const [loading,     setLoading]     = useState(false)
  const [unverified,  setUnverified]  = useState(false)  // show resend UI
  const [resendSent,  setResendSent]  = useState(false)
  const [resendBusy,  setResendBusy]  = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setMessage('')
    setUnverified(false)
    setResendSent(false)

    if (!form.email || !form.password) {
      setMessage('Email and password are required.')
      return
    }
    try {
      setLoading(true)
      const res  = await fetch('/api/auth/login', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Login failed.')
        // Backend sets unverified: true when the account exists but isn't verified
        if (data.unverified) setUnverified(true)
        return
      }

      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch {
      setMessage('Could not connect to server.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendBusy(true)
    try {
      const res  = await fetch('/api/auth/resend-verification', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: form.email }),
      })
      const data = await res.json()
      setMessage(data.message || 'Verification email sent.')
      setResendSent(true)
    } catch {
      setMessage('Could not send email. Please try again.')
    } finally {
      setResendBusy(false)
    }
  }

  return (
    <div className="page-enter auth-page">
      <Navbar />
      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-brand">Digital Career Hub</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Log in to your account to continue</p>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-row">
              <input className="form-input" type={show ? 'text' : 'password'} placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              <button className="show-btn" onClick={() => setShow(s => !s)}>
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="forgot-row">
              <Link to="/forgot-password" className="link-green">Forgot password?</Link>
            </div>
          </div>

          {message && (
            <p className="auth-sub" style={{ color: unverified ? '#e67e22' : '#c0392b' }}>
              {message}
            </p>
          )}

          {/* Resend verification CTA — only shown for unverified accounts */}
          {unverified && !resendSent && (
            <button
              className="btn-auth"
              style={{ background: '#e67e22', marginBottom: '0.5rem' }}
              onClick={handleResend}
              disabled={resendBusy}
            >
              {resendBusy ? 'Sending…' : 'Resend verification email'}
            </button>
          )}

          <button className="btn-auth" onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="link-green">Sign up</Link>
          </p>

          <div className="auth-secure">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L2 3v3c0 2.21 1.71 4.28 4 4.77C8.29 10.28 10 8.21 10 6V3L6 1z"
                    stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
            </svg>
            Your data is protected with end-to-end encryption
          </div>
        </div>
      </div>
    </div>
  )
}
