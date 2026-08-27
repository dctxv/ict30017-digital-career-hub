import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import './Auth.css'

const PASSWORD_MIN_LENGTH = 12

/**
 * Sets a new password from a reset token.
 *
 * Email and token are read from the query string, so a link of the shape
 * /reset-password?email=...&token=... works the moment a mailer exists. Both
 * stay editable because no mailer exists yet: the token is printed to the
 * server log, and somebody has to be able to paste it in.
 *
 * The token field is deliberately a plain text input rather than a password
 * one. It is a single-use value the person is copying from somewhere else, and
 * masking it only makes a paste error impossible to see.
 */
export default function ResetPassword() {
  const { t, n } = useLanguage()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [form, setForm] = useState({
    email: params.get('email') ?? '',
    token: params.get('token') ?? '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (key) => (event) => setForm(current => ({ ...current, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.email.trim() || !form.token.trim()) {
      setError(t('auth.resetNeedsToken'))
      return
    }
    if (form.password.length < PASSWORD_MIN_LENGTH) {
      setError(t('auth.passwordTooShort', { min: n(PASSWORD_MIN_LENGTH) }))
      return
    }
    if (form.password !== form.confirm) {
      setError(t('auth.passwordsMismatch'))
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          token: form.token,
          newPassword: form.password,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t('auth.resetFailed'))
        return
      }

      setDone(true)
      // Long enough to read the confirmation, short enough not to feel stuck.
      setTimeout(() => navigate('/login', { replace: true }), 1800)
    } catch {
      setError(t('common.serverUnreachable'))
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

          <h1 className="auth__title">{t('auth.resetTitle')}</h1>
          <p className="auth__sub">{t('auth.resetSub')}</p>

          {error && <p className="notice notice--error auth__message" role="alert">{error}</p>}

          {done ? (
            <p className="notice notice--ok auth__message" role="status">{t('auth.resetDone')}</p>
          ) : (
            <>
              <div className="field">
                <label className="field__label" htmlFor="reset-email">{t('auth.emailLabel')}</label>
                <input
                  id="reset-email"
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={form.email}
                  onChange={set('email')}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="reset-token">{t('auth.resetTokenLabel')}</label>
                <input
                  id="reset-token"
                  className="input"
                  aria-describedby="reset-token-hint"
                  placeholder={t('auth.resetTokenPlaceholder')}
                  value={form.token}
                  onChange={set('token')}
                />
                <span className="field__hint" id="reset-token-hint">{t('auth.resetTokenHint')}</span>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="reset-password">{t('auth.newPasswordLabel')}</label>
                <input
                  id="reset-password"
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  aria-describedby="reset-password-hint"
                  placeholder={t('auth.createPasswordPlaceholder')}
                  value={form.password}
                  onChange={set('password')}
                />
                <span className="field__hint" id="reset-password-hint">
                  {t('auth.passwordHint', { min: n(PASSWORD_MIN_LENGTH) })}
                </span>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="reset-confirm">{t('auth.confirmPasswordLabel')}</label>
                <input
                  id="reset-confirm"
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  value={form.confirm}
                  onChange={set('confirm')}
                />
              </div>

              <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={loading}>
                {loading ? t('auth.resetting') : t('auth.setNewPassword')}
              </button>
            </>
          )}

          <p className="auth__switch">
            {t('auth.needAnotherLink')} <Link to="/forgot-password">{t('auth.requestAgain')}</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
