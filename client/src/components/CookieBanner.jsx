import { useState } from 'react'
import './CookieBanner.css'

// Shown until a choice is stored. If localStorage is blocked the banner is
// skipped, since the choice could not be remembered anyway.
function needsConsent() {
  try {
    return !localStorage.getItem('cookieConsent')
  } catch {
    return false
  }
}

function remember(choice) {
  try {
    localStorage.setItem('cookieConsent', choice)
  } catch {
    // Blocked storage: the banner closes for this visit only.
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(needsConsent)

  function accept() {
    remember('accepted')
    setVisible(false)
  }

  function decline() {
    remember('declined')
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
