import { CircleHelp } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

/** Native details keeps the explanation keyboard and touch accessible. */
export default function AtsTooltip() {
  const { t } = useLanguage()
  return (
    <details className="ats-tooltip">
      <summary aria-label={t('review.atsWhat')}>
        <CircleHelp size={15} aria-hidden="true" />
        <span>{t('review.atsWhat')}</span>
      </summary>
      <div className="ats-tooltip__bubble" role="note">
        <strong>{t('review.atsTooltipTitle')}</strong>
        <p>{t('review.atsWhatBody')}</p>
      </div>
    </details>
  )
}
