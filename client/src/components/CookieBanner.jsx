import { useState, useEffect } from 'react'
import './CookieBanner.css'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookieConsent')
      if (!consent) setVisible(true)
    } catch {
      // localStorage blocked — skip banner
    }
  }, [])

  function accept() {
    try { localStorage.setItem('cookieConsent', 'accepted') } catch {}
    setVisible(false)
  }

  function decline() {
    try { localStorage.setItem('cookieConsent', 'declined') } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="region" aria-label="Cookie consent">
      <div className="cookie-banner__content">
        <p className="cookie-banner__text">
          We use cookies to improve your experience and keep you signed in.
          By continuing, you agree to our use of cookies.
        </p>
        <div className="cookie-banner__actions">
          <button className="cookie-banner__btn cookie-banner__btn--accept" onClick={accept}>
            Accept
          </button>
          <button className="cookie-banner__btn cookie-banner__btn--decline" onClick={decline}>
            Decline
          </button>
        </div>
      </div>
      <button className="cookie-banner__close" aria-label="Close" onClick={decline}>×</button>
    </div>
  )
}
