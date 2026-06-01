import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './Auth.css'

export default function Login() {
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setMessage('')

    if (!form.email || !form.password) {
      setMessage('Please enter email and password.')
      return
    }

    try {
      setLoading(true)

      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Login failed.')
        return
      }

      localStorage.setItem('user', JSON.stringify(data.user))
      setMessage('Login successful!')

      setTimeout(() => {
        navigate('/')
      }, 800)

    } catch (err) {
      console.error(err)
      setMessage('Server connection error.')
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
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Log in to your account to continue</p>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-row">
              <input
                className="form-input"
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <button type="button" className="show-btn" onClick={() => setShow(s => !s)}>
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="forgot-row">
              <Link to="/forgot-password" className="link-green">Forgot password?</Link>
            </div>
          </div>

          {message && <p style={{ marginTop: '10px', color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}

          <button className="btn-auth" onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          <div className="auth-divider"><span>or</span></div>

          <button className="btn-google">
            Continue with Google
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/register" className="link-green">Sign up</Link>
          </p>

          <div className="auth-secure">
            Your data is protected with end-to-end encryption
          </div>
        </div>
      </div>
    </div>
  )
}