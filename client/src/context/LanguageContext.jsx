import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { i18next } from '../i18n/useTranslation'

/**
 * Shared language selection.
 *
 * The navbar toggle previously held its own useState, so the choice was local
 * to the navbar, reset on navigation, and read by nothing. This lifts it to a
 * provider so pages can request content in the selected language.
 *
 * Values are the lowercase codes the API expects ('en' | 'bn'), matching
 * users.preferred_language in the database. The navbar renders them uppercase.
 *
 * This is also the single source of truth i18next is kept in sync with. i18next
 * owns the static UI string lookup (via useTranslation() in i18n/useTranslation.js);
 * this context owns the raw 'en'/'bn' code that non-UI-copy code needs too — the
 * Resources page's ?lang= query, the chatbot's language field, and (once wired up)
 * the resume reviewer's language field. Keeping one selection and pushing it into
 * i18next, rather than reading the language back out of i18next in those places,
 * avoids two sources of truth drifting apart.
 *
 * The choice is persisted in localStorage. Syncing it to the logged-in user's
 * preferred_language column would need an endpoint that does not exist yet;
 * until then a signed-in user's stored preference is not applied at login.
 */

export const SUPPORTED_LANGUAGES = ['en', 'bn']
const STORAGE_KEY = 'preferredLanguage'

const LanguageContext = createContext(null)

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return SUPPORTED_LANGUAGES.includes(stored) ? stored : 'en'
  } catch {
    return 'en'
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLanguage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // Storage can be unavailable in private browsing; the in-memory
      // selection still works for the session.
    }
    document.documentElement.lang = lang
    i18next.changeLanguage(lang)
  }, [lang])

  const setLang = (next) => {
    if (SUPPORTED_LANGUAGES.includes(next)) setLangState(next)
  }

  const value = useMemo(() => ({ lang, setLang }), [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside a LanguageProvider.')
  }
  return context
}