import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './Auth.css'

export default function Register() {
  const [show, setShow] = useState(false)
  const [tier, setTier] = useState('free')
  const [agreed, setAgreed] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setMessage('')

    if (!fullName || !email || !password || !confirmPassword) {
      setMessage('Please fill in all fields.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    if (!agreed) {
      setMessage('Please agree to the terms first.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          role: 'student',
          plan: tier,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Registration failed.')
        return
      }

      setMessage('Account created successfully. Check PostgreSQL users table.')
      setFullName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setAgreed(false)
      setTier('free')
    } catch (error) {
      console.error(error)
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
            <input
              className="form-input"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-row">
              <input
                className="form-input"
                type={show ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="show-btn"
                onClick={() => setShow(s => !s)}
              >
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Choose your plan</label>
            <div className="tier-cards">
              <div
                className={`tier-card ${tier === 'free' ? 'tier-card--active' : ''}`}
                onClick={() => setTier('free')}
              >
                <div className="tier-name">Free</div>
                <div className="tier-desc">3 resume reviews per day</div>
              </div>

              <div
                className={`tier-card ${tier === 'premium' ? 'tier-card--active' : ''}`}
                onClick={() => setTier('premium')}
              >
                <span className="tier-recommended">Recommended</span>
                <div className="tier-name">Premium</div>
                <div className="tier-desc">Unlimited reviews + priority feedback</div>
              </div>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
            <label htmlFor="terms" className="checkbox-label">
              I agree to the <Link to="/terms" className="link-green">Terms of Service</Link> and <Link to="/privacy" className="link-green">Privacy Policy</Link>
            </label>
          </div>

          {message && <p className="auth-sub">{message}</p>}

          <button
            type="button"
            className="btn-auth"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login" className="link-green">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}