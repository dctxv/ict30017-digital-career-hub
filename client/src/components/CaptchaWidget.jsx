import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './CaptchaWidget.css'

export default function CaptchaWidget({ onVerify, onExpire }) {
  const { t } = useLanguage()
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function handleClick() {
    if (checked || loading) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setChecked(true)
      const token = 'local-captcha-' + Date.now() + '-' + Math.random().toString(36).slice(2)
      onVerify?.(token)
      timerRef.current = setTimeout(() => {
        setChecked(false)
        onExpire?.()
      }, 2 * 60 * 1000)
    }, 800)
  }

  return (
    <div className="captcha-widget" role="group" aria-label="CAPTCHA verification">
      {/* A real button, so the check can be reached and ticked from the
          keyboard; the login form cannot be submitted without it. */}
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-busy={loading}
        aria-label={t('auth.captchaLabel')}
        className="captcha-widget__box"
        onClick={handleClick}
      >
        <span className="captcha-widget__checkbox" aria-hidden="true">
          {loading && <span className="captcha-widget__spinner" />}
          {!loading && checked && (
            <svg className="captcha-widget__tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
        <span className="captcha-widget__label">{t('auth.captchaLabel')}</span>
        <span className="captcha-widget__brand">
          <svg className="captcha-widget__logo" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#4A90D9" />
            <path d="M20 32 L28 40 L44 24" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="captcha-widget__brand-name">reCAPTCHA</span>
          <span className="captcha-widget__brand-sub">Privacy · Terms</span>
        </span>
      </button>
    </div>
  )
}
