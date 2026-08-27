import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Compass, ShieldCheck, Check, CheckCircle2, Circle, Smartphone, ChevronDown, Info,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import './Auth.css'

/*
 * Registration in three steps: details, plan, and — for premium only — payment.
 *
 * It was one long form with the tier as a pair of radio cards halfway down.
 * That put a pricing decision in the middle of typing a password, and it meant
 * the premium tier was granted by a radio button with nothing recorded about
 * why. Splitting it lets each step ask one thing, and gives the premium path
 * somewhere to record a payment method against the subscription.
 *
 * The free path never reaches step three. Someone signing up for the free tier
 * should not be walked past a card form.
 */

const PASSWORD_MIN_LENGTH = 12
const PAYMENT_METHODS = ['bkash', 'nagad', 'card']
const FALLBACK_DISCIPLINES = ['IT', 'Finance', 'Science', 'Engineering', 'Business', 'Arts', 'Education']

const FREE_PERKS = ['auth.freePerk1', 'auth.freePerk2', 'auth.freePerk3']
const PREMIUM_PERKS = ['auth.premiumPerk1', 'auth.premiumPerk2', 'auth.premiumPerk3']

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

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    discipline: '', institution: '', graduationYear: '',
  })
  const [payment, setPayment] = useState({ mobile: '', cardNumber: '', expiry: '', cvc: '', cardName: '' })

  const set = (key) => (event) => setForm(current => ({ ...current, [key]: event.target.value }))
  const setPay = (key) => (event) => setPayment(current => ({ ...current, [key]: event.target.value }))

  /*
   * discipline is the field that earns its place: every content table filters
   * by it, so without it a Computer Science student and an Accounting student
   * see the same unfiltered resources and career paths. It stays optional all
   * the same — a required field here costs completed registrations, and the
   * column is nullable for exactly that reason.
   */
  useEffect(() => {
    let cancelled = false
    fetch(`/api/disciplines?lang=${lang}`)
      .then(response => (response.ok ? response.json() : []))
      .then(data => { if (!cancelled) setDisciplines(Array.isArray(data) ? data : []) })
      // Optional field, so a failed load degrades to not offering it rather
      // than blocking the form.
      .catch(() => {})
    return () => { cancelled = true }
  }, [lang])

  const validateDetails = () => {
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      return t('auth.fillAllFields')
    }
    if (form.password.length < PASSWORD_MIN_LENGTH) {
      return t('auth.passwordTooShort', { min: n(PASSWORD_MIN_LENGTH) })
    }
    if (form.password !== form.confirmPassword) return t('auth.passwordsMismatch')
    if (!agreed) return t('auth.agreeFirst')
    return null
  }

  const goToPlan = (event) => {
    event.preventDefault()
    const problem = validateDetails()
    if (problem) { setMessage(problem); return }
    setMessage('')
    setStep('plan')
  }

  /*
   * Creates the account and signs it in.
   *
   * Registration previously ended by clearing the form and printing "account
   * created", leaving the user on a blank signup page to find the login link
   * themselves. The register endpoint issues no cookie, so the session is
   * established by logging in with the credentials just accepted.
   */
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
          // Recorded against the subscription so a premium account is a fact
          // with a method and a date rather than a column somebody set.
          payment_method: plan === 'premium' ? payMethod : undefined,
          // The language they are reading the form in. This is what finally
          // makes users.preferred_language a stored value rather than a column
          // nothing ever wrote.
          preferred_language: lang,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || t('auth.registrationFailed'))
        // A rejected registration is almost always a details problem — a
        // duplicate email, a password the server refused — so the user is
        // returned to the step that can fix it.
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
        // The account exists; only the automatic sign-in failed. Saying so is
        // better than an error that implies nothing was created.
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
              <label className="field">
                <span className="field__label">{t('auth.fullNameLabel')}</span>
                <input
                  className="input"
                  autoComplete="name"
                  placeholder={t('auth.fullNamePlaceholder')}
                  value={form.fullName}
                  onChange={set('fullName')}
                />
              </label>

              <label className="field">
                <span className="field__label">{t('auth.emailLabel')}</span>
                <input
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={form.email}
                  onChange={set('email')}
                />
              </label>

              <label className="field">
                <span className="field__label">{t('auth.passwordLabel')}</span>
                <span className="auth__password">
                  <input
                    className="input"
                    type={show ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={t('auth.createPasswordPlaceholder')}
                    value={form.password}
                    onChange={set('password')}
                  />
                  <button type="button" className="auth__reveal" onClick={() => setShow(value => !value)}>
                    {show ? t('common.hide') : t('common.show')}
                  </button>
                </span>
                {/* Stated before it can be got wrong. The server rejects a short
                    password with a message, but finding out after submitting is
                    a wasted round trip and a retyped form. */}
                <span className="field__hint">{t('auth.passwordHint', { min: n(PASSWORD_MIN_LENGTH) })}</span>
              </label>

              <label className="field">
                <span className="field__label">{t('auth.confirmPasswordLabel')}</span>
                <input
                  className="input"
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                />
              </label>

              <label className="field">
                <span className="field__label">
                  {t('auth.disciplineLabel')} <span className="optional">{t('common.optional')}</span>
                </span>
                <span className="select-wrap">
                  <select className="select" value={form.discipline} onChange={set('discipline')}>
                    <option value="">{t('auth.disciplinePlaceholder')}</option>
                    {/* value is the English name, which is the key every content
                        table stores; the label follows the language toggle. */}
                    {disciplineOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="select-wrap__chevron" />
                </span>
              </label>

              <div className="field-grid">
                <label className="field">
                  <span className="field__label">
                    {t('auth.graduationYearLabel')} <span className="optional">{t('common.optional')}</span>
                  </span>
                  <input
                    className="input"
                    inputMode="numeric"
                    placeholder={t('auth.graduationYearPlaceholder')}
                    value={form.graduationYear}
                    onChange={set('graduationYear')}
                  />
                </label>

                <label className="field">
                  <span className="field__label">
                    {t('auth.institutionLabel')} <span className="optional">{t('common.optional')}</span>
                  </span>
                  <input
                    className="input"
                    placeholder={t('auth.institutionPlaceholder')}
                    value={form.institution}
                    onChange={set('institution')}
                  />
                </label>
              </div>

              <button
                type="button"
                className="auth__agree"
                onClick={() => setAgreed(value => !value)}
                role="checkbox"
                aria-checked={agreed}
              >
                <span className={`auth__checkbox${agreed ? ' auth__checkbox--on' : ''}`}>
                  <Check size={13} />
                </span>
                <span>
                  {t('auth.agreePrefix')}{' '}
                  <Link to="/terms">{t('auth.termsOfService')}</Link>{' '}
                  {t('auth.agreeJoin')}{' '}
                  <Link to="/privacy">{t('auth.privacyPolicy')}</Link>
                </span>
              </button>

              <button type="submit" className="btn btn--primary btn--lg btn--full">
                {t('auth.continue')}
              </button>

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
                  <label className="field">
                    <span className="field__label">{t(`auth.pay.${payMethod}Number`)}</span>
                    <input
                      className="input"
                      inputMode="tel"
                      placeholder="01XXXXXXXXX"
                      value={payment.mobile}
                      onChange={setPay('mobile')}
                    />
                  </label>
                  <p className="pay__note">
                    <Smartphone size={16} />
                    {t(`auth.pay.${payMethod}Note`)}
                  </p>
                </>
              ) : (
                <>
                  <label className="field">
                    <span className="field__label">{t('auth.cardNumber')}</span>
                    <input
                      className="input"
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      value={payment.cardNumber}
                      onChange={setPay('cardNumber')}
                    />
                  </label>

                  <div className="field-grid">
                    <label className="field">
                      <span className="field__label">{t('auth.cardExpiry')}</span>
                      <input
                        className="input"
                        inputMode="numeric"
                        placeholder="MM / YY"
                        value={payment.expiry}
                        onChange={setPay('expiry')}
                      />
                    </label>
                    <label className="field">
                      <span className="field__label">{t('auth.cardCvc')}</span>
                      <input
                        className="input"
                        inputMode="numeric"
                        placeholder="123"
                        value={payment.cvc}
                        onChange={setPay('cvc')}
                      />
                    </label>
                  </div>

                  <label className="field">
                    <span className="field__label">{t('auth.cardName')}</span>
                    <input
                      className="input"
                      placeholder={t('auth.cardNamePlaceholder')}
                      value={payment.cardName}
                      onChange={setPay('cardName')}
                    />
                  </label>
                </>
              )}

              {/* No gateway is connected. Charging nothing while showing a card
                  form is the kind of thing a user has every right to be told
                  about, so it is said here rather than discovered later. */}
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
