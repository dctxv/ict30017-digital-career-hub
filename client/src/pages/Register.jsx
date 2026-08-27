import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useTranslation } from '../i18n/useTranslation'
import './Auth.css'

export default function Register() {
  const { t } = useTranslation()
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
      setMessage(t('register.errors.missingFields'))
      return
    }

    if (password !== confirmPassword) {
      setMessage(t('register.errors.passwordMismatch'))
      return
    }

    if (!agreed) {
      setMessage(t('register.errors.agreeTerms'))
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/auth/register', {
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
        setMessage(data.error || t('register.errors.registrationFailed'))
        return
      }

      setMessage(t('register.success'))
      setFullName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setAgreed(false)
      setTier('free')
    } catch (error) {
      console.error(error)
      setMessage(t('register.errors.networkError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter auth-page">
      <Navbar />
      <div className="auth-bg">
        <div className="auth-card auth-card--wide">
          <div className="auth-brand">{t('auth.brand')}</div>
          <h1 className="auth-title">{t('register.title')}</h1>
          <p className="auth-sub">{t('register.subtitle')}</p>

          <div className="form-group">
            <label className="form-label">{t('register.fullNameLabel')}</label>
            <input
              className="form-input"
              type="text"
              placeholder={t('register.fullNamePlaceholder')}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('register.emailLabel')}</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('register.passwordLabel')}</label>
            <div className="input-row">
              <input
                className="form-input"
                type={show ? 'text' : 'password'}
                placeholder={t('register.passwordPlaceholder')}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="show-btn"
                onClick={() => setShow(s => !s)}
              >
                {show ? t('auth.hide') : t('auth.show')}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('register.confirmPasswordLabel')}</label>
            <input
              className="form-input"
              type="password"
              placeholder={t('register.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('register.choosePlan')}</label>
            <div className="tier-cards">
              <div
                className={`tier-card ${tier === 'free' ? 'tier-card--active' : ''}`}
                onClick={() => setTier('free')}
              >
                <div className="tier-name">{t('register.freeName')}</div>
                <div className="tier-desc">{t('register.freeDesc')}</div>
              </div>

              <div
                className={`tier-card ${tier === 'premium' ? 'tier-card--active' : ''}`}
                onClick={() => setTier('premium')}
              >
                <span className="tier-recommended">{t('register.premiumRecommended')}</span>
                <div className="tier-name">{t('register.premiumName')}</div>
                <div className="tier-desc">{t('register.premiumDesc')}</div>
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
              {t('register.termsPrefix')} <Link to="/terms" className="link-green">{t('register.termsOfService')}</Link> {t('register.and')} <Link to="/privacy" className="link-green">{t('register.privacyPolicy')}</Link>
            </label>
          </div>

          {message && <p className="auth-sub">{message}</p>}

          <button
            type="button"
            className="btn-auth"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? t('register.submitting') : t('register.submit')}
          </button>

          <p className="auth-switch">
            {t('register.haveAccount')} <Link to="/login" className="link-green">{t('register.logIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}