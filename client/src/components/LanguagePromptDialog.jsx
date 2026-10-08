import { useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './LanguagePromptDialog.css'

/**
 * Forces an explicit language choice right before an action whose output is
 * generated once and never retranslated afterwards.
 *
 * Both the resume review and the chatbot read the current language exactly
 * once, at the moment the request goes out (ai-service/src/prompt/language.js
 * for the review, chatbot.js's BANGLA_DIRECTIVE for the chat) — see
 * ResumeReview.jsx's analyse() and ChatbotWidget.jsx's sendMessage(). Toggling
 * the navbar switch afterwards does nothing to content already generated, and
 * that mismatch — analysing in English after meaning to switch to বাংলা first
 * — was the exact confusion this dialog exists to remove: instead of relying
 * on the navbar being set correctly in advance, the choice is asked for at the
 * one moment it actually still matters.
 *
 * Selecting a language both confirms and submits — there is no separate
 * "Confirm" step, since the two buttons already are the only two valid
 * answers. They are drawn as two equal actions for that reason: an earlier
 * version showed radio-style ticks with the current language already ticked,
 * which read as a form waiting for a Done button that did not exist, and made
 * English look chosen before anyone had chosen. Neither button is highlighted
 * or focused on open; focus starts on the dialog so Tab reaches both evenly.
 */

const OPTIONS = [
  { code: 'en', name: 'English', other: 'ইংরেজি' },
  { code: 'bn', name: 'বাংলা', other: 'Bangla' },
]
export default function LanguagePromptDialog({ titleKey, subKey, onSelect, onCancel }) {
  const { t } = useLanguage()
  const cardRef = useRef(null)

  useEffect(() => { cardRef.current?.focus() }, [])

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      className="lang-prompt"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-prompt-title"
      onMouseDown={event => { if (event.target === event.currentTarget) onCancel() }}
    >
      <div className="lang-prompt__card" tabIndex={-1} ref={cardRef}>
        <h2 className="lang-prompt__title" id="lang-prompt-title">{t(titleKey)}</h2>
        <p className="lang-prompt__sub">{t(subKey)}</p>

        <div className="lang-prompt__options">
          {OPTIONS.map(option => (
            <button
              key={option.code}
              type="button"
              lang={option.code}
              className="lang-prompt__option"
              onClick={() => onSelect(option.code)}
            >
              <span className="lang-prompt__native">{option.name}</span>
              <span className="lang-prompt__other" aria-hidden="true">{option.other}</span>
            </button>
          ))}
        </div>

        <button type="button" className="lang-prompt__cancel" onClick={onCancel}>
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}
