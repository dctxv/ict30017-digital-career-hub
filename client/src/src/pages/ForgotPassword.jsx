import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Compass, Info } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import './Auth.css'

/**
 * Requests a password reset.
 *
 * The login page has linked here since it was written and the route did not
 * exist, so the one thing a locked-out user needs was a 404.
 *
 * The server answers the same way whether or not the address is registered —
 * deliberately, because a different answer would turn this form into a way to
 * discover who has an account. Its message is already localised from the lang
 * cookie, so it is shown as it arrives rather than being replaced here.
 *
 * The note below the message is not decoration. No mail provider is configured,
 * so nothing is actually sent: the token is written to the server log. Letting
 * someone wait for an email that will never arrive is worse than telling them
 * where it went.
 */
export default function ForgotPassword() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSent('')

    if (!email.trim()) {
      setError(t('auth.emailRequired'))
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      setSent(data.message || t('auth.resetRequested'))
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

          <h1 className="auth__title">{t('auth.forgotTitle')}</h1>
          <p className="auth__sub">{t('auth.forgotSub')}</p>

          {error && <p className="notice notice--error auth__message" role="alert">{error}</p>}

          {sent ? (
            <>
              <p className="notice notice--ok auth__message" role="status">{sent}</p>
              <p className="notice notice--warn auth__message">
                <Info size={16} />
                {t('auth.resetNoMailer')}
              </p>
              <Link to="/reset-password" className="btn btn--primary btn--lg btn--full">
                {t('auth.haveTokenAlready')}
              </Link>
            </>
          ) : (
            <>
              <div className="field">
                <label className="field__label" htmlFor="forgot-email">{t('auth.emailLabel')}</label>
                <input
                  id="forgot-email"
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                />
              </div>

              <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={loading}>
                {loading ? t('auth.sending') : t('auth.sendResetLink')}
              </button>
            </>
          )}

          <p className="auth__switch">
            {t('auth.rememberedIt')} <Link to="/login">{t('auth.logIn')}</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
