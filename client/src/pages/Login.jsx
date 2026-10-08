import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Compass, ShieldCheck } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import CaptchaWidget from '../components/CaptchaWidget'
import './Auth.css'

const OTP_LENGTH = 6

/*
 * Milliseconds since the captcha was ticked. CaptchaWidget stamps the token
 * with this browser's clock, so subtracting on the same clock gives a duration
 * no amount of skew against the server can distort.
 */
function captchaElapsed(token) {
  const issuedAt = Number.parseInt(token.split('-')[2], 10)
  return Number.isFinite(issuedAt) ? Math.max(0, Date.now() - issuedAt) : undefined
}

export default function Login() {
  const location = useLocation()
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ email: location.state?.email ?? '', password: '' })
  const [message, setMessage] = useState('')
  const [unverified, setUnverified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  // Set once the password is accepted and the server has emailed a code. The
  // address comes from the server's answer, not the form, so the second step
  // verifies the account the first step actually matched.
  const [otpEmail, setOtpEmail] = useState('')
  const [otp, setOtp] = useState('')
  // Remounts the captcha after the code step, so a token that went stale while
  // the user was reading their email is not reused.
  const [captchaKey, setCaptchaKey] = useState(0)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t, n } = useLanguage()

  // SessionWatcher (session expired) and Register (verification link sent)
  // redirect here with an explanation. They pass a translation key rather than
  // a sentence, so the notice follows the language toggle instead of being
  // pinned to the language it was raised in.
  const notice = location.state?.messageKey
    ? t(location.state.messageKey, location.state.messageVars)
    : ''

  const finish = (user) => {
    // Records the session in context so the navbar updates immediately,
    // rather than writing localStorage and hoping something reads it back.
    login(user)
    // Administrators land on the dashboard they signed in to use.
    navigate(location.state?.from ?? (user?.role === 'admin' ? '/admin' : '/'))
  }

  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    setUnverified(false)

    if (!form.email || !form.password) {
      setMessage(t('auth.credentialsRequired'))
      return
    }
    if (!captchaToken) {
      setMessage(t('auth.captchaRequired'))
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        // The elapsed time is measured here, on the same clock that stamped the
        // token, so a device whose clock disagrees with the server's is not
        // refused as "too fast".
        body: JSON.stringify({ ...form, captchaToken, captchaElapsedMs: captchaElapsed(captchaToken) }),
      })
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || t('auth.loginFailed'))
        setUnverified(data.code === 'EMAIL_NOT_VERIFIED')
        return
      }

      // Password accepted; the server has emailed a one-time code.
      if (data.twoFactorRequired) {
        setOtpEmail(data.email || form.email)
        setOtp('')
        return
      }

      finish(data.user)
    } catch {
      setMessage(t('common.serverUnreachable'))
    } finally {
      setLoading(false)
    }
  }

  const submitOtp = async (event) => {
    event.preventDefault()
    setMessage('')

    if (otp.length !== OTP_LENGTH) {
      setMessage(t('auth.otpRequired', { n: n(OTP_LENGTH) }))
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: otpEmail, otp }),
      })
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || t('auth.loginFailed'))
        return
      }

      finish(data.user)
    } catch {
      setMessage(t('common.serverUnreachable'))
    } finally {
      setLoading(false)
    }
  }

  // Back to the password step, for a mistyped address or a code that expired.
  const startOver = () => {
    setOtpEmail('')
    setOtp('')
    setMessage('')
    setCaptchaToken('')
    setCaptchaKey(key => key + 1)
  }

  if (otpEmail) {
    return (
      <div className="page-enter">
        <Navbar />

        <div className="auth">
          <form className="auth__card" onSubmit={submitOtp}>
            <div className="auth__brand">
              <span className="auth__mark"><Compass size={16} /></span>
              <span className="auth__wordmark">{t('common.brand')}</span>
            </div>

            <h1 className="auth__title">{t('auth.otpTitle')}</h1>
            <p className="auth__sub">{t('auth.otpSub', { email: otpEmail })}</p>

            {message && <p className="notice notice--error auth__message" role="alert">{message}</p>}

            <div className="field">
              <label className="field__label" htmlFor="login-otp">{t('auth.otpLabel')}</label>
              <input
                id="login-otp"
                className="input auth__otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={OTP_LENGTH}
                placeholder="123456"
                autoFocus
                value={otp}
                onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
              />
              <span className="field__hint">{t('auth.otpHint')}</span>
            </div>

            <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={loading}>
              {loading ? t('auth.otpVerifying') : t('auth.otpVerify')}
            </button>

            <p className="auth__switch">
              <button type="button" className="auth__link-button" onClick={startOver}>
                {t('auth.otpStartOver')}
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
        <form className="auth__card" onSubmit={submit}>
          <div className="auth__brand">
            <span className="auth__mark"><Compass size={16} /></span>
            <span className="auth__wordmark">{t('common.brand')}</span>
          </div>

          <h1 className="auth__title">{t('auth.welcomeBack')}</h1>
          <p className="auth__sub">{t('auth.loginSub')}</p>

          {notice && <p className="notice notice--warn auth__message" role="status">{notice}</p>}
          {message && (
            <p className="notice notice--error auth__message" role="alert">
              {message}
              {unverified && (
                <>
                  {' '}
                  <Link to={`/verify-email?email=${encodeURIComponent(form.email)}`}>
                    {t('auth.resendVerification')}
                  </Link>
                </>
              )}
            </p>
          )}

          {/* The label wraps the caption only, never the control and its
              neighbours. A <label> around the input, the reveal button and the
              hint makes all three the field's accessible name, so a screen
              reader announces "Password Show At least 12 characters". */}
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

          <CaptchaWidget
            key={captchaKey}
            onVerify={token => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken('')}
          />

          <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={loading}>
            {loading ? t('auth.loggingIn') : t('auth.logIn')}
          </button>

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
