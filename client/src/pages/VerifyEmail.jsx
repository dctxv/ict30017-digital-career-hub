import { useEffect, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Compass, CheckCircle, XCircle, Loader, Mail } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import './Auth.css'

/*
 * Two ways in:
 *   /verify-email?token=…&email=…  the link from the verification email
 *   /verify-email?email=…          "send a new link", from the login page
 *                                  when an unverified account tries to sign in
 */
export default function VerifyEmail() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email') ?? ''

  // loading | success | error | resend
  const [status, setStatus] = useState(token && email ? 'loading' : (email ? 'resend' : 'error'))
  const [message, setMessage] = useState(token || email ? '' : t('verify.invalidLink'))
  const [resendEmail, setResendEmail] = useState(email)
  const [resendStatus, setResendStatus] = useState('') // '' | sending | sent | error

  // The token is single use. React's development double-invoke of effects
  // would otherwise send it twice, and the second answer ("invalid") could
  // land after the first ("verified") and overwrite it.
  const sentRef = useRef(false)

  useEffect(() => {
    if (!token || !email || sentRef.current) return
    sentRef.current = true

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email }),
    })
      .then(r => r.json().then(d => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => {
        if (ok) {
          setStatus('success')
        } else {
          setStatus('error')
          setMessage(data.error || t('verify.failedGeneric'))
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage(t('common.serverUnreachable'))
      })
  }, [token, email, t])

  function handleResend(e) {
    e.preventDefault()
    if (!resendEmail.trim()) return
    setResendStatus('sending')
    fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resendEmail.trim() }),
    })
      .then(r => setResendStatus(r.ok ? 'sent' : 'error'))
      .catch(() => setResendStatus('error'))
  }

  const resendForm = (
    <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
      <p className="auth__sub" style={{ marginBottom: '0.5rem' }}>
        <strong>{t('verify.resendTitle')}</strong>
      </p>
      {resendStatus === 'sent' ? (
        <p className="notice notice--ok" role="status">{t('verify.resendSent')}</p>
      ) : (
        <form onSubmit={handleResend} style={{ display: 'flex', gap: '0.5rem' }}>
          <label className="visually-hidden" htmlFor="verify-email-input">{t('auth.emailLabel')}</label>
          <input
            id="verify-email-input"
            type="email"
            className="input"
            autoComplete="email"
            placeholder={t('auth.emailPlaceholder')}
            value={resendEmail}
            onChange={e => setResendEmail(e.target.value)}
            required
            style={{ flex: 1, minWidth: 0 }}
          />
          <button
            type="submit"
            className="btn btn--primary"
            disabled={resendStatus === 'sending'}
            style={{ whiteSpace: 'nowrap' }}
          >
            {resendStatus === 'sending' ? t('verify.sending') : t('verify.resend')}
          </button>
        </form>
      )}
      {resendStatus === 'error' && (
        <p className="notice notice--error" role="alert" style={{ marginTop: '0.5rem' }}>
          {t('verify.resendFailed')}
        </p>
      )}
    </div>
  )

  return (
    <div className="page-enter">
      <Navbar />
      <div className="auth">
        <div className="auth__card" style={{ textAlign: 'center' }}>
          <div className="auth__brand">
            <span className="auth__mark"><Compass size={16} /></span>
            <span className="auth__wordmark">{t('common.brand')}</span>
          </div>

          {status === 'loading' && (
            <>
              <Loader size={40} style={{ margin: '1.5rem auto', display: 'block', opacity: 0.5 }} />
              <h1 className="auth__title">{t('verify.checking')}</h1>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle size={40} color="var(--accent-text)" style={{ margin: '1.5rem auto', display: 'block' }} />
              <h1 className="auth__title">{t('verify.successTitle')}</h1>
              <p className="auth__sub">{t('verify.successSub')}</p>
              <Link
                to="/login"
                state={{ email }}
                className="btn btn--primary btn--lg btn--full"
                style={{ marginTop: '1rem', display: 'block', textAlign: 'center' }}
              >
                {t('verify.goToLogin')}
              </Link>
            </>
          )}

          {status === 'resend' && (
            <>
              <Mail size={40} style={{ margin: '1.5rem auto', display: 'block', opacity: 0.7 }} />
              <h1 className="auth__title">{t('verify.resendPageTitle')}</h1>
              <p className="auth__sub">{t('verify.resendPageSub')}</p>
              {resendForm}
              <div style={{ marginTop: '1rem' }}>
                <Link to="/login" state={{ email }} className="btn btn--ghost btn--full" style={{ display: 'block', textAlign: 'center' }}>
                  {t('verify.backToLogin')}
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle size={40} color="var(--danger-text)" style={{ margin: '1.5rem auto', display: 'block' }} />
              <h1 className="auth__title">{t('verify.failedTitle')}</h1>
              <p className="auth__sub">{message}</p>
              {resendForm}
              <div style={{ marginTop: '1rem' }}>
                <Link to="/login" state={{ email }} className="btn btn--ghost btn--full" style={{ display: 'block', textAlign: 'center' }}>
                  {t('verify.backToLogin')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
