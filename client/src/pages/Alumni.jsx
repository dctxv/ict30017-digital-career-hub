import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './Auth.css'

export default function Register() {
  const [show, setShow] = useState(false)
  const [tier, setTier] = useState('free')
  const [agreed, setAgreed] = useState(false)

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
            <input className="form-input" type="text" placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-row">
              <input className="form-input" type={show ? 'text' : 'password'} placeholder="Create a password" />
              <button className="show-btn" onClick={() => setShow(s => !s)}>{show ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <input className="form-input" type="password" placeholder="Repeat your password" />
          </div>

          <div className="form-group">
            <label className="form-label">Choose your plan</label>
            <div className="tier-cards">
              <div className={`tier-card ${tier === 'free' ? 'tier-card--active' : ''}`} onClick={() => setTier('free')}>
                <div className="tier-name">Free</div>
                <div className="tier-desc">3 resume reviews per day</div>
              </div>
              <div className={`tier-card ${tier === 'premium' ? 'tier-card--active' : ''}`} onClick={() => setTier('premium')}>
                <span className="tier-recommended">Recommended</span>
                <div className="tier-name">Premium</div>
                <div className="tier-desc">Unlimited reviews + priority feedback</div>
              </div>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
            <label htmlFor="terms" className="checkbox-label">
              I agree to the <Link to="/terms" className="link-green">Terms of Service</Link> and <Link to="/privacy" className="link-green">Privacy Policy</Link>
            </label>
          </div>

          <button className="btn-auth">Create account</button>
          <p className="auth-switch">Already have an account? <Link to="/login" className="link-green">Log in</Link></p>
        </div>
      </div>
    </div>
  )
}