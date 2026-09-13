import { useEffect } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
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
 * answers.
 */
export default function LanguagePromptDialog({ titleKey, subKey, onSelect, onCancel }) {
  const { t, lang } = useLanguage()

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
      <div className="lang-prompt__card">
        <h2 className="lang-prompt__title" id="lang-prompt-title">{t(titleKey)}</h2>
        <p className="lang-prompt__sub">{t(subKey)}</p>

        <div className="lang-prompt__options">
          <button
            type="button"
            className={`lang-prompt__option${lang === 'en' ? ' lang-prompt__option--on' : ''}`}
            onClick={() => onSelect('en')}
            autoFocus
          >
            {lang === 'en' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            <span className="lang-prompt__native">English</span>
          </button>
          <button
            type="button"
            className={`lang-prompt__option${lang === 'bn' ? ' lang-prompt__option--on' : ''}`}
            onClick={() => onSelect('bn')}
          >
            {lang === 'bn' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            <span className="lang-prompt__native">বাংলা</span>
          </button>
        </div>

        <button type="button" className="lang-prompt__cancel" onClick={onCancel}>
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}
