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
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { t } = useLanguage()

  // SessionWatcher redirects here with an explanation when a session expires.
  // It passes a translation key rather than a sentence, so the notice follows
  // the language toggle instead of being pinned to the language it lapsed in.
  const notice = location.state?.messageKey ? t(location.state.messageKey) : ''

  const submit = async (event) => {
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

      // Records the session in context so the navbar updates immediately,
      // rather than writing localStorage and hoping something reads it back.
      login(data.user)
      // Administrators land on the dashboard they signed in to use.
      navigate(location.state?.from ?? (data.user?.role === 'admin' ? '/admin' : '/'))
    } catch {
      setMessage(t('common.serverUnreachable'))
    } finally {
      setLoading(false)
    }
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
          {message && <p className="notice notice--error auth__message" role="alert">{message}</p>}

          <label className="field">
            <span className="field__label">{t('auth.emailLabel')}</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              placeholder={t('auth.emailPlaceholder')}
              value={form.email}
              onChange={event => setForm(f => ({ ...f, email: event.target.value }))}
            />
          </label>

          <label className="field">
            <span className="field__label">{t('auth.passwordLabel')}</span>
            <span className="auth__password">
              <input
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
          </label>

          <p className="auth__forgot">
            <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
          </p>

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
