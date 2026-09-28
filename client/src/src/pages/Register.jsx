import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Compass, ShieldCheck, Check, CheckCircle2, Circle, Smartphone, ChevronDown, Info,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import './Auth.css'

const PASSWORD_MIN_LENGTH = 12
const PAYMENT_METHODS = ['bkash', 'nagad', 'card']
const FALLBACK_DISCIPLINES = ['IT', 'Finance', 'Science', 'Engineering', 'Business', 'Arts', 'Education']

const FREE_PERKS = ['auth.freePerk1', 'auth.freePerk2', 'auth.freePerk3']
const PREMIUM_PERKS = ['auth.premiumPerk1', 'auth.premiumPerk2', 'auth.premiumPerk3']

/* ── Password strength ─────────────────────────────────────────────────────
   Returns 0–5 based on fulfilled criteria. Each criterion is separately
   exposed so the checklist can show exactly what is and is not met.        */
function analysePassword(password, fullName, email) {
  const namePart = (fullName || '').split(' ')[0].toLowerCase()
  const emailPart = (email || '').split('@')[0].toLowerCase()

  const checks = {
    length:    password.length >= PASSWORD_MIN_LENGTH,
    upper:     /[A-Z]/.test(password),
    lower:     /[a-z]/.test(password),
    digit:     /[0-9]/.test(password),
    special:   /[^A-Za-z0-9]/.test(password),
    noName:    !(namePart.length > 2 && password.toLowerCase().includes(namePart)),
    noEmail:   !(emailPart.length > 2 && password.toLowerCase().includes(emailPart)),
  }

  const score = [checks.length, checks.upper, checks.lower, checks.digit, checks.special].filter(Boolean).length

  return { checks, score }
}

const STRENGTH_LABELS = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong']
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']

function PasswordStrengthMeter({ password, fullName, email }) {
  const { checks, score } = useMemo(
    () => analysePassword(password, fullName, email),
    [password, fullName, email]
  )

  if (!password) return null

  const requirements = [
    { key: 'length',  label: `At least ${PASSWORD_MIN_LENGTH} characters` },
    { key: 'upper',   label: 'Uppercase letter (A–Z)' },
    { key: 'lower',   label: 'Lowercase letter (a–z)' },
    { key: 'digit',   label: 'Number (0–9)' },
    { key: 'special', label: 'Special character (!@#$…)' },
    { key: 'noName',  label: 'Does not contain your name' },
    { key: 'noEmail', label: 'Does not contain your email' },
  ]

  return (
    <div className="pw-strength" role="status" aria-live="polite">
      <div className="pw-strength__bars">
        {[1, 2, 3, 4, 5].map(n => (
          <span
            key={n}
            className="pw-strength__bar"
            style={{ background: n <= score ? STRENGTH_COLORS[score] : undefined }}
          />
        ))}
      </div>
      <span className="pw-strength__label" style={{ color: STRENGTH_COLORS[score] }}>
        {STRENGTH_LABELS[score]}
      </span>

      <ul className="pw-requirements">
        {requirements.map(({ key, label }) => (
          <li key={key} className={`pw-req${checks[key] ? ' pw-req--met' : ''}`}>
            <Check size={12} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Email format check ────────────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function PlanCard({ on, name, price, perks, recommended, onSelect }) {
  const { t } = useLanguage()
  return (
    <button type="button" className={`plan${on ? ' plan--on' : ''}`} onClick={onSelect} aria-pressed={on}>
      <span className="plan__head">
        <span className="plan__name">
          {name}
          {recommended && <span className="tag tag--accent">{t('auth.recommended')}</span>}
        </span>
        <span className="plan__price">
          {price}
          {on
            ? <CheckCircle2 size={19} className="plan__tick" />
            : <Circle size={19} className="plan__untick" />}
        </span>
      </span>
      <span className="plan__perks">
        {perks.map(key => (
          <span className="plan__perk" key={key}>
            <Check size={14} />
            {t(key)}
          </span>
        ))}
      </span>
    </button>
  )
}

export default function Register() {
  const { lang, t, n } = useLanguage()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState('details')
  const [show, setShow] = useState(false)
  const [plan, setPlan] = useState('free')
  const [payMethod, setPayMethod] = useState('bkash')
  const [agreed, setAgreed] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [disciplines, setDisciplines] = useState([])
  const [emailTouched, setEmailTouched] = useState(false)
  const [pwTouched, setPwTouched] = useState(false)

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    discipline: '', institution: '', graduationYear: '',
  })
  const [payment, setPayment] = useState({ mobile: '', cardNumber: '', expiry: '', cvc: '', cardName: '' })

  const set = (key) => (event) => setForm(current => ({ ...current, [key]: event.target.value }))
  const setPay = (key) => (event) => setPayment(current => ({ ...current, [key]: event.target.value }))

  const emailValid = EMAIL_RE.test(form.email)
  const emailError = emailTouched && form.email && !emailValid

  const { score: pwScore } = useMemo(
    () => analysePassword(form.password, form.fullName, form.email),
    [form.password, form.fullName, form.email]
  )

  useEffect(() => {
    let cancelled = false
    fetch(`/api/disciplines?lang=${lang}`)
      .then(response => (response.ok ? response.json() : []))
      .then(data => { if (!cancelled) setDisciplines(Array.isArray(data) ? data : []) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [lang])

  const validateDetails = () => {
    if (!form.fullName.trim()) return 'Please enter your full name.'
    if (!form.email.trim()) return t('auth.emailRequired')
    if (!emailValid) return 'Please enter a valid email address (e.g. name@example.com).'
    if (!form.password) return t('auth.fillAllFields')
    if (form.password.length < PASSWORD_MIN_LENGTH) {
      return t('auth.passwordTooShort', { min: n(PASSWORD_MIN_LENGTH) })
    }
    if (pwScore < 3) return 'Your password is too weak. Meet at least 3 of the strength requirements.'
    if (form.password !== form.confirmPassword) return t('auth.passwordsMismatch')
    if (!agreed) return t('auth.agreeFirst')
    return null
  }

  const goToPlan = (event) => {
    event.preventDefault()
    setEmailTouched(true)
    setPwTouched(true)
    const problem = validateDetails()
    if (problem) { setMessage(problem); return }
    setMessage('')
    setStep('plan')
  }

  const createAccount = async () => {
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          password: form.password,
          plan,
          discipline: form.discipline,
          institution: form.institution,
          graduation_year: form.graduationYear,
          payment_method: plan === 'premium' ? payMethod : undefined,
          preferred_language: lang,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || t('auth.registrationFailed'))
        setStep('details')
        return
      }

      const session = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: form.email, password: form.password }),
      })

      if (!session.ok) {
        setMessage(t('auth.createdPleaseLogIn'))
        return
      }

      const sessionData = await session.json()
      login(sessionData.user)
      navigate('/profile')
    } catch {
      setMessage(t('common.serverUnreachable'))
      setStep('details')
    } finally {
      setLoading(false)
    }
  }

  const continueFromPlan = (event) => {
    event.preventDefault()
    if (plan === 'premium') { setStep('payment'); return }
    createAccount()
  }

  const stepIndex = step === 'payment' ? 2 : step === 'plan' ? 1 : 0

  const disciplineOptions = disciplines.length > 0
    ? disciplines.map(row => ({
        value: row.name,
        label: (lang === 'bn' && row.name_bn) || row.name,
      }))
    : FALLBACK_DISCIPLINES.map(name => ({ value: name, label: name }))

  const title = step === 'plan' ? t('auth.choosePlanTitle')
    : step === 'payment' ? t('auth.paymentTitle')
      : t('auth.createAccount')

  const sub = step === 'plan' ? t('auth.choosePlanSub')
    : step === 'payment' ? t('auth.paymentSub')
      : t('auth.registerSub')

  return (
    <div className="page-enter">
      <Navbar />

      <div className="auth">
        <div className="auth__card auth__card--wide">
          <div className="auth__brand">
            <span className="auth__mark"><Compass size={16} /></span>
            <span className="auth__wordmark">{t('common.brand')}</span>
          </div>

          <h1 className="auth__title">{title}</h1>
          <p className="auth__sub">{sub}</p>

          <div className="auth__steps">
            {[0, 1, 2].map(index => (
              <span
                key={index}
                className={`auth__step-bar${index <= stepIndex ? ' auth__step-bar--on' : ''}`}
              />
            ))}
            <span className="auth__step-count">
              {t('auth.stepOf', { step: n(stepIndex + 1), total: n(3) })}
            </span>
          </div>

          {message && <p className="notice notice--error auth__message" role="alert">{message}</p>}

          {step === 'details' && (
            <form onSubmit={goToPlan}>
              <div className="field">
                <label className="field__label" htmlFor="reg-full-name">{t('auth.fullNameLabel')}</label>
                <input
                  id="reg-full-name"
                  className="input"
                  autoComplete="name"
                  placeholder={t('auth.fullNamePlaceholder')}
                  value={form.fullName}
                  onChange={set('fullName')}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="reg-email">{t('auth.emailLabel')}</label>
                <input
                  id="reg-email"
                  className={`input${emailError ? ' input--error' : ''}`}
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={form.email}
                  onChange={set('email')}
                  onBlur={() => setEmailTouched(true)}
                  aria-invalid={emailError ? 'true' : undefined}
                />
                {emailError && (
                  <span className="field__error">
                    Enter a valid email — e.g. name@example.com
                  </span>
                )}
                {emailTouched && form.email && emailValid && (
                  <span className="field__ok">
                    <Check size={12} /> Valid email address
                  </span>
                )}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="reg-password">{t('auth.passwordLabel')}</label>
                <span className="auth__password">
                  <input
                    id="reg-password"
                    aria-describedby="reg-password-hint"
                    className="input"
                    type={show ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={t('auth.createPasswordPlaceholder')}
                    value={form.password}
                    onChange={e => { set('password')(e); setPwTouched(true) }}
                  />
                  <button type="button" className="auth__reveal" onClick={() => setShow(value => !value)}>
                    {show ? t('common.hide') : t('common.show')}
                  </button>
                </span>
                <span className="field__hint" id="reg-password-hint">
                  {t('auth.passwordHint', { min: n(PASSWORD_MIN_LENGTH) })}
                </span>
                {pwTouched && (
                  <PasswordStrengthMeter
                    password={form.password}
                    fullName={form.fullName}
                    email={form.email}
                  />
                )}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="reg-confirm">{t('auth.confirmPasswordLabel')}</label>
                <input
                  id="reg-confirm"
                  className={`input${
                    form.confirmPassword && form.confirmPassword !== form.password ? ' input--error' : ''
                  }`}
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                />
                {form.confirmPassword && form.confirmPassword !== form.password && (
                  <span className="field__error">Passwords do not match</span>
                )}
                {form.confirmPassword && form.confirmPassword === form.password && form.password && (
                  <span className="field__ok"><Check size={12} /> Passwords match</span>
                )}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="reg-discipline">
                  {t('auth.disciplineLabel')} <span className="optional">{t('common.optional')}</span>
                </label>
                <span className="select-wrap">
                  <select id="reg-discipline" className="select" value={form.discipline} onChange={set('discipline')}>
                    <option value="">{t('auth.disciplinePlaceholder')}</option>
                    {disciplineOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="select-wrap__chevron" />
                </span>
              </div>

              <div className="field-grid">
                <div className="field">
                  <label className="field__label" htmlFor="reg-year">
                    {t('auth.graduationYearLabel')} <span className="optional">{t('common.optional')}</span>
                  </label>
                  <input
                    id="reg-year"
                    className="input"
                    inputMode="numeric"
                    placeholder={t('auth.graduationYearPlaceholder')}
                    value={form.graduationYear}
                    onChange={set('graduationYear')}
                  />
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="reg-institution">
                    {t('auth.institutionLabel')} <span className="optional">{t('common.optional')}</span>
                  </label>
                  <input
                    id="reg-institution"
                    className="input"
                    placeholder={t('auth.institutionPlaceholder')}
                    value={form.institution}
                    onChange={set('institution')}
                  />
                </div>
              </div>

              <div className="auth__agree">
                <input
                  id="reg-agree"
                  type="checkbox"
                  className="auth__checkbox"
                  checked={agreed}
                  onChange={event => setAgreed(event.target.checked)}
                />
                <label htmlFor="reg-agree">
                  {t('auth.agreePrefix')}{' '}
                  <Link to="/terms">{t('auth.termsOfService')}</Link>{' '}
                  {t('auth.agreeJoin')}{' '}
                  <Link to="/privacy">{t('auth.privacyPolicy')}</Link>
                </label>
              </div>

              <button type="submit" className="btn btn--primary btn--lg btn--full">
                {t('auth.continue')}
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
                {t('auth.haveAccount')} <Link to="/login">{t('auth.logIn')}</Link>
              </p>
            </form>
          )}

          {step === 'plan' && (
            <form onSubmit={continueFromPlan}>
              <div className="auth__plans">
                <PlanCard
                  on={plan === 'free'}
                  name={t('auth.tierFree')}
                  price={t('auth.priceFree')}
                  perks={FREE_PERKS}
                  onSelect={() => setPlan('free')}
                />
                <PlanCard
                  on={plan === 'premium'}
                  name={t('auth.tierPremium')}
                  price={t('auth.pricePremium')}
                  perks={PREMIUM_PERKS}
                  recommended
                  onSelect={() => setPlan('premium')}
                />
              </div>

              <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={loading}>
                {loading
                  ? t('auth.creatingAccount')
                  : plan === 'premium' ? t('auth.continuePremium') : t('auth.continueFree')}
              </button>

              <button type="button" className="auth__back" onClick={() => setStep('details')}>
                {t('auth.backStep')}
              </button>
            </form>
          )}

          {step === 'payment' && (
            <form onSubmit={event => { event.preventDefault(); createAccount() }}>
              <div className="pay__summary">
                <span>
                  <span className="pay__summary-name">{t('auth.tierPremium')}</span>
                  <span className="pay__summary-note">{t('auth.billedMonthly')}</span>
                </span>
                <span className="pay__summary-price">{t('auth.pricePremium')}</span>
              </div>

              <p className="field__label">{t('auth.payMethod')}</p>
              <div className="pay__methods">
                {PAYMENT_METHODS.map(method => (
                  <button
                    key={method}
                    type="button"
                    className={`pay__method${payMethod === method ? ' pay__method--on' : ''}`}
                    onClick={() => setPayMethod(method)}
                    aria-pressed={payMethod === method}
                  >
                    {t(`auth.pay.${method}`)}
                  </button>
                ))}
              </div>

              {payMethod !== 'card' ? (
                <>
                  <div className="field">
                    <label className="field__label" htmlFor="pay-mobile">{t(`auth.pay.${payMethod}Number`)}</label>
                    <input
                      id="pay-mobile"
                      className="input"
                      inputMode="tel"
                      placeholder="01XXXXXXXXX"
                      value={payment.mobile}
                      onChange={setPay('mobile')}
                    />
                  </div>
                  <p className="pay__note">
                    <Smartphone size={16} />
                    {t(`auth.pay.${payMethod}Note`)}
                  </p>
                </>
              ) : (
                <>
                  <div className="field">
                    <label className="field__label" htmlFor="pay-card">{t('auth.cardNumber')}</label>
                    <input
                      id="pay-card"
                      className="input"
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      value={payment.cardNumber}
                      onChange={setPay('cardNumber')}
                    />
                  </div>

                  <div className="field-grid">
                    <div className="field">
                      <label className="field__label" htmlFor="pay-expiry">{t('auth.cardExpiry')}</label>
                      <input
                        id="pay-expiry"
                        className="input"
                        inputMode="numeric"
                        placeholder="MM / YY"
                        value={payment.expiry}
                        onChange={setPay('expiry')}
                      />
                    </div>
                    <div className="field">
                      <label className="field__label" htmlFor="pay-cvc">{t('auth.cardCvc')}</label>
                      <input
                        id="pay-cvc"
                        className="input"
                        inputMode="numeric"
                        placeholder="123"
                        value={payment.cvc}
                        onChange={setPay('cvc')}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor="pay-name">{t('auth.cardName')}</label>
                    <input
                      id="pay-name"
                      className="input"
                      placeholder={t('auth.cardNamePlaceholder')}
                      value={payment.cardName}
                      onChange={setPay('cardName')}
                    />
                  </div>
                </>
              )}

              <p className="notice notice--warn pay__simulated">
                <Info size={16} />
                {t('auth.paymentSimulated')}
              </p>

              <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={loading}>
                {loading ? t('auth.creatingAccount') : t('auth.payNow')}
              </button>

              <button type="button" className="auth__back" onClick={() => setStep('plan')}>
                {t('auth.backStep')}
              </button>
            </form>
          )}

          <p className="auth__secure">
            <ShieldCheck size={13} />
            {t('auth.encryptionNote')}
          </p>
        </div>
      </div>
    </div>
  )
}
