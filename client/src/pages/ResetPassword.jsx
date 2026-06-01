import { useState }           from 'react'
import { Link, useNavigate }  from 'react-router-dom'
import Navbar                 from '../components/Navbar'
import './Auth.css'

export default function ResetPassword() {
  // Token and email arrive as query params: /reset-password?token=...&email=...
  const params  = new URLSearchParams(window.location.search)
  const tokenFromUrl = params.get('token') || ''
  const emailFromUrl = params.get('email') || ''

  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [show,            setShow]            = useState(false)
  const [message,         setMessage]         = useState('')
  const [loading,         setLoading]         = useState(false)
  const navigate = useNavigate()

  const handleReset = async () => {
    setMessage('')

    if (!newPassword || !confirmPassword) {
      setMessage('Please fill in both password fields.')
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }
    if (newPassword.length < 12) {
      setMessage('Password must be at least 12 characters.')
      return
    }

    try {
      setLoading(true)
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:       emailFromUrl,
          token:       tokenFromUrl,
          newPassword,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Reset failed. The link may have expired.')
        return
      }

      setMessage(data.message)
      // Redirect to login after short delay
      setTimeout(() => navigate('/login'), 2500)
    } catch {
      setMessage('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!tokenFromUrl || !emailFromUrl) {
    return (
      <div className="page-enter auth-page">
        <Navbar />
        <div className="auth-bg">
          <div className="auth-card">
            <div className="auth-brand">Digital Career Hub</div>
            <p className="auth-sub" style={{ color: '#c0392b' }}>
              Invalid reset link. Please request a new one.
            </p>
            <Link to="/forgot-password" className="link-green">Request a new link</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter auth-page">
      <Navbar />
      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-brand">Digital Career Hub</div>
          <h1 className="auth-title">Set a new password</h1>
          <p className="auth-sub">
            Choose a strong password with at least 12 characters, including uppercase,
            lowercase, a number, and a special character.
          </p>

          <div className="form-group">
            <label className="form-label">New password</label>
            <div className="input-row">
              <input
                className="form-input"
                type={show ? 'text' : 'password'}
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <button className="show-btn" onClick={() => setShow(s => !s)}>
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm new password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
            />
          </div>

          {message && (
            <p className="auth-sub" style={{ color: message.includes('success') ? '#27ae60' : '#c0392b' }}>
              {message}
            </p>
          )}

          <button className="btn-auth" onClick={handleReset} disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>

          <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
            <Link to="/login" className="link-green">← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
