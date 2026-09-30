import { useEffect, useState } from 'react'
import { Check, CheckCircle2, Circle, CreditCard, Info, LockKeyhole, Smartphone } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import {
  digitsOnly, formatBangladeshMobile, formatCardNumber, formatExpiry, paymentErrorKey,
} from '../utils/paymentForm'
import './PlanDialog.css'

const PAYMENT_METHODS = ['bkash', 'nagad', 'card']
const PERKS = ['auth.premiumPerk1', 'auth.premiumPerk2', 'auth.premiumPerk3']

/**
 * Upgrading from the account page.
 *
 * The design sends this button back through the registration flow's plan step,
 * which would mean re-rendering a signup screen for somebody who signed up
 * months ago. The decision is one question — which instrument — so it is asked
 * where it was raised.
 *
 * The disclosure is not a footnote. A dialog that shows a price, asks for a
 * payment method and then charges nothing has to say so on the dialog, not in
 * a commit message or a policy page the user has already skipped past.
 */
export default function PlanDialog({ busy, onCancel, onConfirm }) {
  const { t } = useLanguage()
  const [method, setMethod] = useState('bkash')
  const [step, setStep] = useState('method')
  const [error, setError] = useState('')
  const [details, setDetails] = useState({
    mobile: '', cardNumber: '', expiry: '', cvc: '', cardName: '',
  })

  const setDetail = (key, formatter = value => value) => event => {
    const value = formatter(event.target.value)
    setDetails(current => ({ ...current, [key]: value }))
    setError('')
  }

  const continueToDetails = () => {
    setError('')
    setStep('details')
  }

  const submitCheckout = event => {
    event.preventDefault()
    if (step === 'method') { continueToDetails(); return }
    const problem = paymentErrorKey(method, details)
    if (problem) { setError(t(problem)); return }
    onConfirm(method)
  }

  useEffect(() => {
    const onKey = event => { if (event.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      className="plan-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-dialog-title"
      onMouseDown={event => { if (event.target === event.currentTarget) onCancel() }}
    >
      <form
        className="plan-dialog__card"
        onSubmit={submitCheckout}
      >
        <div className="plan-dialog__heading">
          <span className="plan-dialog__heading-icon"><CreditCard size={20} /></span>
          <span>
            <h2 className="plan-dialog__title" id="plan-dialog-title">{t('profile.upgradeTitle')}</h2>
            <p className="plan-dialog__sub">{t('profile.upgradeSub')}</p>
          </span>
        </div>

        <div className="plan-dialog__steps" aria-label={t('auth.checkoutProgress')}>
          <span className="plan-dialog__step plan-dialog__step--on">1. {t('auth.payMethod')}</span>
          <span className={`plan-dialog__step${step === 'details' ? ' plan-dialog__step--on' : ''}`}>
            2. {t('auth.checkoutDetails')}
          </span>
        </div>

        <div className="plan-dialog__summary">
          <span>
            <span className="plan-dialog__tier">{t('auth.tierPremium')}</span>
            <span className="plan-dialog__billing">{t('auth.billedMonthly')}</span>
          </span>
          <span className="plan-dialog__price">{t('auth.pricePremium')}</span>
        </div>

        <ul className="plan-dialog__perks">
          {PERKS.map(key => (
            <li key={key}><Check size={14} />{t(key)}</li>
          ))}
        </ul>

        {step === 'method' ? (
          <>
            <p className="field__label">{t('auth.payMethod')}</p>
            <div className="plan-dialog__methods">
              {PAYMENT_METHODS.map(option => (
                <button
                  key={option}
                  type="button"
                  className={`plan-dialog__method${method === option ? ' plan-dialog__method--on' : ''}`}
                  onClick={() => { setMethod(option); setError('') }}
                  aria-pressed={method === option}
                >
                  {method === option ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  {t(`auth.pay.${option}`)}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="plan-dialog__details">
            <p className="plan-dialog__chosen">
              {method === 'card' ? <CreditCard size={17} /> : <Smartphone size={17} />}
              <span>{t('auth.checkoutPayingWith')}</span>
              <strong>{t(`auth.pay.${method}`)}</strong>
              <button type="button" onClick={() => { setStep('method'); setError('') }}>
                {t('auth.checkoutChange')}
              </button>
            </p>

            {method !== 'card' ? (
              <div className="field">
                <label className="field__label" htmlFor="upgrade-mobile">
                  {t(`auth.pay.${method}Number`)}
                </label>
                <input
                  id="upgrade-mobile"
                  className="input"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="01XXXXXXXXX"
                  value={details.mobile}
                  onChange={setDetail('mobile', formatBangladeshMobile)}
                  autoFocus
                />
                <span className="field__hint">{t(`auth.pay.${method}Note`)}</span>
              </div>
            ) : (
              <>
                <div className="field">
                  <label className="field__label" htmlFor="upgrade-card">{t('auth.cardNumber')}</label>
                  <input
                    id="upgrade-card"
                    className="input"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4242 4242 4242 4242"
                    value={details.cardNumber}
                    onChange={setDetail('cardNumber', formatCardNumber)}
                    autoFocus
                  />
                </div>
                <div className="plan-dialog__field-grid">
                  <div className="field">
                    <label className="field__label" htmlFor="upgrade-expiry">{t('auth.cardExpiry')}</label>
                    <input
                      id="upgrade-expiry"
                      className="input"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM / YY"
                      value={details.expiry}
                      onChange={setDetail('expiry', formatExpiry)}
                    />
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="upgrade-cvc">{t('auth.cardCvc')}</label>
                    <input
                      id="upgrade-cvc"
                      className="input"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      value={details.cvc}
                      onChange={setDetail('cvc', value => digitsOnly(value).slice(0, 4))}
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="upgrade-name">{t('auth.cardName')}</label>
                  <input
                    id="upgrade-name"
                    className="input"
                    autoComplete="cc-name"
                    placeholder={t('auth.cardNamePlaceholder')}
                    value={details.cardName}
                    onChange={setDetail('cardName')}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {error && <p className="notice notice--error plan-dialog__error" role="alert">{error}</p>}

        <p className="notice notice--warn plan-dialog__disclosure">
          <Info size={16} />
          {t('auth.paymentSimulated')}
        </p>

        <p className="plan-dialog__privacy"><LockKeyhole size={14} />{t('auth.checkoutPrivacy')}</p>

        <div className="plan-dialog__actions">
          <button
            type="button"
            className="btn btn--outline"
            onClick={step === 'details' ? () => { setStep('method'); setError('') } : onCancel}
            disabled={busy}
          >
            {step === 'details' ? t('auth.backStep') : t('common.cancel')}
          </button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy
              ? t('profile.upgrading')
              : step === 'method' ? t('auth.checkoutContinue') : t('auth.payNow')}
          </button>
        </div>
      </form>
    </div>
  )
}
