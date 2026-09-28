import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Compass, ShieldCheck } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import './Auth.css'

export default function Login() {
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // OTP step state
  const [otpRequired, setOtpRequired] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')
  const [otp, setOtp] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { t } = useLanguage()

  const notice = location.state?.messageKey ? t(location.state.messageKey) : ''

  const submitCredentials = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!form.email || !form.password) {
      setMessage(t('auth.credentialsRequired'))
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || t('auth.loginFailed'))
        return
      }

      if (data.twoFactorRequired) {
        setOtpEmail(data.email)
        setOtpRequired(true)
        setMessage('')
        return
      }

      login(data.user)
      navigate(location.state?.from ?? (data.user?.role === 'admin' ? '/admin' : '/'))
    } catch {
      setMessage(t('common.serverUnreachable'))
    } finally {
      setLoading(false)
    }
  }

  const submitOtp = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!otp.trim()) {
      setMessage('Please enter the 6-digit code sent to your email.')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: otpEmail, otp: otp.trim() }),
      })
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Invalid code. Please try again.')
        return
      }

      login(data.user)
      navigate(location.state?.from ?? (data.user?.role === 'admin' ? '/admin' : '/'))
    } catch {
      setMessage(t('common.serverUnreachable'))
    } finally {
      setLoading(false)
    }
  }

  if (otpRequired) {
    return (
      <div className="page-enter">
        <Navbar />
        <div className="auth">
          <form className="auth__card" onSubmit={submitOtp}>
            <div className="auth__brand">
              <span className="auth__mark"><ShieldCheck size={16} /></span>
              <span className="auth__wordmark">{t('common.brand')}</span>
            </div>

            <h1 className="auth__title">Two-Factor Verification</h1>
            <p className="auth__sub">
              A 6-digit code was sent to <strong>{otpEmail}</strong>. Enter it below to continue.
            </p>

            {message && <p className="notice notice--error auth__message" role="alert">{message}</p>}

            <div className="field">
              <label className="field__label" htmlFor="otp-code">Verification Code</label>
              <input
                id="otp-code"
                className="input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>

            <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Sign In'}
            </button>

            <p className="auth__switch">
              Wrong account?{' '}
              <button
                type="button"
                className="auth__link-btn"
                onClick={() => { setOtpRequired(false); setOtp(''); setMessage('') }}
              >
                Go back
              </button>
            </p>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <Navbar />

      <div className="auth">
        <form className="auth__card" onSubmit={submitCredentials}>
          <div className="auth__brand">
            <span className="auth__mark"><Compass size={16} /></span>
            <span className="auth__wordmark">{t('common.brand')}</span>
          </div>

          <h1 className="auth__title">{t('auth.welcomeBack')}</h1>
          <p className="auth__sub">{t('auth.loginSub')}</p>

          {notice && <p className="notice notice--warn auth__message" role="status">{notice}</p>}
          {message && <p className="notice notice--error auth__message" role="alert">{message}</p>}

          <div className="field">
            <label className="field__label" htmlFor="login-email">{t('auth.emailLabel')}</label>
            <input
              id="login-email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder={t('auth.emailPlaceholder')}
              value={form.email}
              onChange={event => setForm(f => ({ ...f, email: event.target.value }))}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="login-password">{t('auth.passwordLabel')}</label>
            <span className="auth__password">
              <input
                id="login-password"
                className="input"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={t('auth.passwordPlaceholder')}
                value={form.password}
                onChange={event => setForm(f => ({ ...f, password: event.target.value }))}
              />
              <button type="button" className="auth__reveal" onClick={() => setShow(value => !value)}>
                {show ? t('common.hide') : t('common.show')}
              </button>
            </span>
          </div>

          <p className="auth__forgot">
            <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
          </p>

          <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={loading}>
            {loading ? t('auth.loggingIn') : t('auth.logIn')}
          </button>

          <div className="auth__divider"><span>or</span></div>

          <a
            href="/api/auth/google"
            className="btn btn--google btn--lg btn--full"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Continue with Google
          </a>

          <p className="auth__switch">
            {t('auth.noAccount')} <Link to="/register">{t('auth.signUp')}</Link>
          </p>

          <p className="auth__secure">
            <ShieldCheck size={13} />
            {t('auth.encryptionNote')}
          </p>
        </form>
      </div>
    </div>
  )
}
