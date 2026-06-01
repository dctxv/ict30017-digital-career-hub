import { useState } from 'react'
import { Link }     from 'react-router-dom'
import Navbar       from '../components/Navbar'
import './Auth.css'

export default function Register() {
  const [show,            setShow]            = useState(false)
  const [fullName,        setFullName]        = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message,         setMessage]         = useState('')
  const [success,         setSuccess]         = useState(false)
  const [loading,         setLoading]         = useState(false)

  const getPasswordStrength = (pw) => {
    if (pw.length === 0) return null
    let score = 0
    if (pw.length >= 12) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[a-z]/.test(pw)) score++
    if (/\d/.test(pw)) score++
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pw)) score++
    if (score <= 2) return { label: 'Weak', color: '#c0392b' }
    if (score === 3 || score === 4) return { label: 'Fair', color: '#e67e22' }
    return { label: 'Strong', color: '#27ae60' }
  }

  const strength = getPasswordStrength(password)

  const handleRegister = async () => {
    setMessage('')
    setSuccess(false)

    if (!fullName || !email || !password || !confirmPassword) {
      setMessage('Please fill in all fields.')
      return
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }
    if (password.length < 12) {
      setMessage('Password must be at least 12 characters.')
      return
    }

    try {
      setLoading(true)
      // NOTE: role is NOT sent — server always assigns 'student' for new accounts
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ full_name: fullName, email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Registration failed.')
        return
      }

      setSuccess(true)
      setMessage(data.message || 'Account created! You can now log in.')
      setFullName(''); setEmail(''); setPassword(''); setConfirmPassword('')
    } catch {
      setMessage('Could not connect to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter auth-page">
      <Navbar />
      <div className="auth-bg">
        <div className="auth-card auth-card--wide">
          <div className="auth-brand">Digital Career Hub</div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-sub">Join to access career tools and AI resume review</p>

          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" type="text" placeholder="Your full name"
              value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-row">
              <input className="form-input" type={show ? 'text' : 'password'}
                placeholder="Create a password (min 12 characters)"
                value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" className="show-btn" onClick={() => setShow(s => !s)}>
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
            {strength && (
              <p style={{ fontSize: '0.8rem', color: strength.color, marginTop: '0.3rem' }}>
                Password strength: {strength.label}
              </p>
            )}
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
              Must include uppercase, lowercase, number, and special character.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <input className="form-input" type="password" placeholder="Repeat your password"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()} />
          </div>

          {message && (
            <p className="auth-sub" style={{ color: success ? '#27ae60' : '#c0392b' }}>
              {message}
            </p>
          )}

          {success
            ? <Link to="/login" className="btn-auth" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                Go to login →
              </Link>
            : <button type="button" className="btn-auth" onClick={handleRegister} disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
          }

          <p className="auth-switch">
            Already have an account? <Link to="/login" className="link-green">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
