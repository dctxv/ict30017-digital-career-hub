import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import './Auth.css'

export default function Register() {
  const { lang, t } = useLanguage()
  const [show, setShow] = useState(false)
  const [tier, setTier] = useState('free')
  const [agreed, setAgreed] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  /*
   * Optional profile fields.
   *
   * discipline is the one that matters: every content table filters by it, so
   * without it a Computer Science student and an Accounting student get the
   * same unfiltered 42 resources and 70 career paths. Asking once at signup is
   * the cheapest moment to find out.
   *
   * All three are optional. A required field here costs completed registrations,
   * and the columns are nullable for exactly that reason.
   */
  const [discipline, setDiscipline] = useState('')
  const [institution, setInstitution] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [disciplines, setDisciplines] = useState([])

  useEffect(() => {
    let cancelled = false
    fetch(`/api/disciplines?lang=${lang}`)
      .then(r => (r.ok ? r.json() : []))
      .then(data => { if (!cancelled) setDisciplines(Array.isArray(data) ? data : []) })
      // The field is optional, so a failed load degrades to not offering it
      // rather than blocking the form.
      .catch(() => {})
    return () => { cancelled = true }
  }, [lang])

  const handleRegister = async () => {
    setMessage('')

    if (!fullName || !email || !password || !confirmPassword) {
      setMessage(t('auth.fillAllFields'))
      return
    }

    if (password !== confirmPassword) {
      setMessage(t('auth.passwordsMismatch'))
      return
    }

    if (!agreed) {
      setMessage(t('auth.agreeFirst'))
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
          discipline,
          institution,
          graduation_year: graduationYear,
          // The language they are reading the form in. This is what finally
          // makes users.preferred_language a stored value rather than a column
          // nothing ever wrote.
          preferred_language: lang,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || t('auth.registrationFailed'))
        return
      }

      setMessage(t('auth.accountCreated'))
      setFullName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setAgreed(false)
      setTier('free')
      setDiscipline('')
      setInstitution('')
      setGraduationYear('')
    } catch (error) {
      console.error(error)
      setMessage(t('common.serverUnreachable'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter auth-page">
      <Navbar />
      <div className="auth-bg">
        <div className="auth-card auth-card--wide">
          <div className="auth-brand">{t('common.brand')}</div>
          <h1 className="auth-title">{t('auth.createAccount')}</h1>
          <p className="auth-sub">{t('auth.registerSub')}</p>

          <div className="form-group">
            <label className="form-label">{t('auth.fullNameLabel')}</label>
            <input
              className="form-input"
              type="text"
              placeholder={t('auth.fullNamePlaceholder')}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.emailLabel')}</label>
            <input
              className="form-input"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.passwordLabel')}</label>
            <div className="input-row">
              <input
                className="form-input"
                type={show ? 'text' : 'password'}
                placeholder={t('auth.createPasswordPlaceholder')}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="show-btn"
                onClick={() => setShow(s => !s)}
              >
                {show ? t('common.hide') : t('common.show')}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.confirmPasswordLabel')}</label>
            <input
              className="form-input"
              type="password"
              placeholder={t('auth.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                {t('auth.disciplineLabel')} <span className="optional">{t('common.optional')}</span>
              </label>
              <select
                className="form-input"
                value={discipline}
                onChange={e => setDiscipline(e.target.value)}
              >
                <option value="">{t('auth.disciplinePlaceholder')}</option>
                {/* value is the English name, which is the key every content
                    table stores; the label follows the language toggle. */}
                {disciplines.map(d => (
                  <option key={d.id} value={d.name}>
                    {(lang === 'bn' && d.name_bn) || d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                {t('auth.graduationYearLabel')} <span className="optional">{t('common.optional')}</span>
              </label>
              <input
                className="form-input"
                type="number"
                inputMode="numeric"
                placeholder={t('auth.graduationYearPlaceholder')}
                value={graduationYear}
                onChange={e => setGraduationYear(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {t('auth.institutionLabel')} <span className="optional">{t('common.optional')}</span>
            </label>
            <input
              className="form-input"
              type="text"
              placeholder={t('auth.institutionPlaceholder')}
              value={institution}
              onChange={e => setInstitution(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.choosePlan')}</label>
            <div className="tier-cards">
              <div
                className={`tier-card ${tier === 'free' ? 'tier-card--active' : ''}`}
                onClick={() => setTier('free')}
              >
                <div className="tier-name">{t('auth.tierFree')}</div>
                <div className="tier-desc">{t('auth.tierFreeDesc')}</div>
              </div>

              <div
                className={`tier-card ${tier === 'premium' ? 'tier-card--active' : ''}`}
                onClick={() => setTier('premium')}
              >
                <span className="tier-recommended">{t('auth.recommended')}</span>
                <div className="tier-name">{t('auth.tierPremium')}</div>
                <div className="tier-desc">{t('auth.tierPremiumDesc')}</div>
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
              {t('auth.agreePrefix')} <Link to="/terms" className="link-green">{t('auth.termsOfService')}</Link> {t('auth.agreeJoin')} <Link to="/privacy" className="link-green">{t('auth.privacyPolicy')}</Link>{t('auth.agreeSuffix') && ` ${t('auth.agreeSuffix')}`}
            </label>
          </div>

          {message && <p className="auth-sub">{message}</p>}

          <button
            type="button"
            className="btn-auth"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? t('auth.creatingAccount') : t('auth.createAccountButton')}
          </button>

          <p className="auth-switch">
            {t('auth.haveAccount')} <Link to="/login" className="link-green">{t('auth.logIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}