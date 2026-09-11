import { useEffect, useState } from 'react'
import { Check, CheckCircle2, Circle, Info } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
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
        onSubmit={event => { event.preventDefault(); onConfirm(method) }}
      >
        <h2 className="plan-dialog__title" id="plan-dialog-title">{t('profile.upgradeTitle')}</h2>
        <p className="plan-dialog__sub">{t('profile.upgradeSub')}</p>

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

        <p className="field__label">{t('auth.payMethod')}</p>
        <div className="plan-dialog__methods">
          {PAYMENT_METHODS.map(option => (
            <button
              key={option}
              type="button"
              className={`plan-dialog__method${method === option ? ' plan-dialog__method--on' : ''}`}
              onClick={() => setMethod(option)}
              aria-pressed={method === option}
            >
              {method === option
                ? <CheckCircle2 size={16} />
                : <Circle size={16} />}
              {t(`auth.pay.${option}`)}
            </button>
          ))}
        </div>

        <p className="notice notice--warn plan-dialog__disclosure">
          <Info size={16} />
          {t('auth.paymentSimulated')}
        </p>

        <div className="plan-dialog__actions">
          <button type="button" className="btn btn--outline" onClick={onCancel} disabled={busy}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? t('profile.upgrading') : t('auth.payNow')}
          </button>
        </div>
      </form>
    </div>
  )
}
