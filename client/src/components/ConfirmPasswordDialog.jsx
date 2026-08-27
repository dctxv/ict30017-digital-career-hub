import { useEffect, useRef, useState } from 'react'
import { Lock } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import './ConfirmPasswordDialog.css'

/**
 * Re-authentication before an irreversible or identity-changing action.
 *
 * Two actions need it — changing the email on the account and deleting the
 * account — and both are things an unattended, still-signed-in browser could
 * otherwise be used to do. The password is never held in the parent: it is
 * passed to onConfirm and the dialog is unmounted, so it exists for exactly as
 * long as the request that needs it.
 *
 * The server checks the password regardless. This is the prompt, not the gate.
 */
export default function ConfirmPasswordDialog({
  message, actionLabel, destructive, busy, onCancel, onConfirm,
}) {
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const onKey = event => { if (event.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      className="confirm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onMouseDown={event => { if (event.target === event.currentTarget) onCancel() }}
    >
      <form
        className="confirm__card"
        onSubmit={event => { event.preventDefault(); onConfirm(password) }}
      >
        <span className="confirm__icon"><Lock size={19} /></span>
        <h2 className="confirm__title" id="confirm-title">{t('profile.confirmTitle')}</h2>
        <p className="confirm__message">{message}</p>

        <div className="field">
          <label className="field__label" htmlFor="confirm-password">{t('profile.currentPassword')}</label>
          <input
            id="confirm-password"
            ref={inputRef}
            className="input"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={event => setPassword(event.target.value)}
          />
        </div>

        <div className="confirm__actions">
          <button type="button" className="btn btn--outline" onClick={onCancel} disabled={busy}>
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className={`btn ${destructive ? 'btn--danger' : 'btn--primary'}`}
            disabled={busy || password.length === 0}
          >
            {actionLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
