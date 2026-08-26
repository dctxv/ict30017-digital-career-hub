import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translate, localiseDigits, hasTranslation } from '../i18n'

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
 * The choice is persisted in localStorage, and mirrored into a plain cookie so
 * the server sees it too. The cookie is what makes API error messages come back
 * in the selected language: every request to /api carries it automatically, so
 * no call site has to remember to attach a language header. It holds nothing
 * private and is deliberately not httpOnly, since the client sets it.
 *
 * Syncing the choice to a signed-in user's preferred_language column would need
 * an endpoint that does not exist yet; until then a signed-in user's stored
 * preference is not applied at login.
 */

export const SUPPORTED_LANGUAGES = ['en', 'bn']
const STORAGE_KEY = 'preferredLanguage'
const COOKIE_KEY = 'lang'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

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
    document.cookie = `${COOKIE_KEY}=${lang}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (next) => {
    if (SUPPORTED_LANGUAGES.includes(next)) setLangState(next)
  }

  const value = useMemo(() => ({
    lang,
    setLang,
    /** Interface string by key, with {placeholder} substitution. */
    t: (key, vars) => translate(lang, key, vars),
    /**
     * Label for a value the interface does not own — a category or type from
     * the database, an enum from the model. Translated when a translation
     * exists, shown exactly as stored when it does not, so a value nobody
     * anticipated still reads as itself rather than as a dotted key.
     */
    tc: (key, value) => (hasTranslation(key) ? translate(lang, key) : value),
    /** Numerals in the selected script. Chrome only — never user content. */
    n: (value) => localiseDigits(value, lang),
  }), [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside a LanguageProvider.')
  }
  return context
}
