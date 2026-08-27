/**
 * Module: i18n/useTranslation
 * Responsibility: Initialise i18next once, and re-export react-i18next's
 * useTranslation() so every existing call site (`import { useTranslation }
 * from '../i18n/useTranslation'`) keeps working unchanged.
 *
 * keySeparator/nsSeparator are both disabled because translations.js uses
 * flat dotted keys ('nav.resources', 'home.features.chatbot.title') as
 * literal strings, not as nested paths — with the defaults on, i18next would
 * try to read 'nav.resources' as `{ nav: { resources: ... } }`, which is not
 * how the dictionary is shaped.
 *
 * Language switching itself is NOT driven from here. LanguageContext already
 * owns the single 'en' | 'bn' selection non-UI-copy code also depends on
 * (Resources' ?lang= query, the chatbot's language field, the resume
 * reviewer's language field once that's wired up) and persists it to
 * localStorage. LanguageContext calls i18next.changeLanguage() whenever that
 * selection changes, so this module only has to get i18next initialised
 * before the first render — importing it is enough, since the init below
 * runs once at module evaluation.
 */

import i18next from 'i18next'
import { initReactI18next, useTranslation as useI18nextTranslation } from 'react-i18next'
import { resources } from './translations'

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    keySeparator: false,
    nsSeparator: false,
    interpolation: { escapeValue: false }, // React already escapes output
    react: { useSuspense: false },
  })
}

export { i18next }
export const useTranslation = useI18nextTranslation