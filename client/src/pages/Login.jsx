import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './Auth.css'

export default function Login() {
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

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
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-row">
              <input className="form-input" type={show ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              <button className="show-btn" onClick={() => setShow(s => !s)}>{show ? 'Hide' : 'Show'}</button>
            </div>
            <div className="forgot-row">
              <Link to="/forgot-password" className="link-green">Forgot password?</Link>
            </div>
          </div>

          <button className="btn-auth">Log in</button>

          <div className="auth-divider"><span>or</span></div>

          <button className="btn-google">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.68 3.68 0 01-1.6 2.42v2h2.58c1.51-1.39 2.4-3.44 2.4-5.88z" fill="#4285F4"/>
              <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.58-2c-.72.48-1.63.76-2.72.76-2.09 0-3.86-1.41-4.49-3.3H.85v2.07A8 8 0 008 16z" fill="#34A853"/>
              <path d="M3.51 9.52A4.8 4.8 0 013.26 8c0-.53.09-1.04.25-1.52V4.41H.85A8 8 0 000 8c0 1.29.31 2.51.85 3.59l2.66-2.07z" fill="#FBBC05"/>
              <path d="M8 3.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 00.85 4.41l2.66 2.07C4.14 4.59 5.91 3.18 8 3.18z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="auth-switch">Don't have an account? <Link to="/register" className="link-green">Sign up</Link></p>

          <div className="auth-secure">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L2 3v3c0 2.21 1.71 4.28 4 4.77C8.29 10.28 10 8.21 10 6V3L6 1z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
            </svg>
            Your data is protected with end-to-end encryption
          </div>
        </div>
      </div>
    </div>
  )
}