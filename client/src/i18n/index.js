/**
 * Translation lookup for the static interface.
 *
 * Three kinds of text on this site are localised in three different places, and
 * keeping them apart is deliberate:
 *
 *  - Interface chrome (labels, buttons, headings, validation copy) lives here,
 *    hand written in both languages. It is short, repeated across pages and has
 *    to read the same way every time, so it is never machine translated.
 *  - Curated content (resources, and later career paths and alumni) lives in the
 *    database with per-language columns and falls back to English per row.
 *  - Generated text (chatbot replies, resume feedback) is produced in the
 *    requested language by the model itself.
 *
 * Lookup falls back to English for any key Bangla has not defined, and to the
 * key itself if neither has it, so a missing translation degrades to readable
 * English rather than a blank element.
 */

import en from './en.js'
import bn from './bn.js'

const DICTIONARIES = { en, bn }

/**
 * Substitutes {placeholder} tokens. Values are inserted verbatim; anything that
 * needs markup should be composed from several keys instead.
 */
function interpolate(template, vars) {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  )
}

/**
 * @param {'en'|'bn'} lang
 * @param {string} key dotted path, e.g. 'nav.resources'
 * @param {Record<string, string|number>} [vars]
 * @returns {string}
 */
export function translate(lang, key, vars) {
  const dictionary = DICTIONARIES[lang] ?? en
  const value = dictionary[key] ?? en[key]

  if (typeof value !== 'string') {
    // Loud enough to catch in development, harmless in production: the key is
    // rendered so the missing string is obvious rather than invisible.
    if (import.meta.env?.DEV) console.warn(`[i18n] Missing translation for "${key}"`)
    return key
  }

  return interpolate(value, vars)
}

/**
 * Whether a key is defined at all, in either language.
 *
 * Used for labels whose key is built from a value the interface does not own —
 * a resource category from the database, a priority enum from the model. Those
 * can hold something no dictionary anticipated, and `translate` would then
 * render the key itself, so a category the admin typed by hand would appear on
 * the page as "resources.category.Foo". Callers use this to fall back to the
 * raw value instead.
 */
export function hasTranslation(key) {
  return typeof en[key] === 'string'
}

/** Bangla renders its own digits; scores and counts read wrong in ASCII. */
const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']

/**
 * Converts the digits in a value to Bengali numerals when Bangla is selected.
 * Applied to counts and scores in the interface. Deliberately not applied to
 * anything the user typed, to any identifier, or to salary strings that come
 * from the database, since those are content rather than chrome.
 */
export function localiseDigits(value, lang) {
  if (lang !== 'bn' || value == null) return value
  return String(value).replace(/[0-9]/g, d => BENGALI_DIGITS[Number(d)])
}
