/**
 * Terminal failure screen for a resume analysis.
 *
 * Analysis errors used to route to the results shell with feedback === null.
 * The Overall score card then animated its loading dots forever, and the
 * "What next?" strip was gated on overallScore !== null so the Upload new
 * resume button never appeared. The user was stranded with no way out but a
 * page reload.
 *
 * This view is the opposite by construction: it always states what went wrong,
 * what to do next, and renders both recovery actions unconditionally.
 */
import { useTranslation } from '../i18n/useTranslation'

/**
 * Maps a failure to copy that names the cause and the next step. Distinct from
 * the partial-failure banner in ResultsView, which only ever appears alongside
 * feedback that actually arrived.
 *
 * `message`, when present, comes from the server's error response and stays in
 * English until the backend AI-language wiring work resumes — only the
 * surrounding template text is translated here.
 */
function describeFailure(code, message, t) {
  switch (code) {
    case 'FILE_TOO_LARGE':
      return {
        title: t('resumeAnalysisError.fileTooLarge.title'),
        body: t('resumeAnalysisError.fileTooLarge.body'),
      }
    case 'INVALID_TYPE':
      return {
        title: t('resumeAnalysisError.invalidType.title'),
        body: t('resumeAnalysisError.invalidType.body'),
      }
    case 'RATE_LIMIT':
      return {
        title: t('resumeAnalysisError.rateLimit.title'),
        body: message || t('resumeAnalysisError.rateLimit.bodyDefault'),
      }
    case 'UNREADABLE':
      return {
        title: t('resumeAnalysisError.unreadable.title'),
        body: t('resumeAnalysisError.unreadable.body'),
      }
    default:
      return {
        title: t('resumeAnalysisError.fallback.title'),
        body: message ? `${t('resumeAnalysisError.fallback.body')} (${message})` : t('resumeAnalysisError.fallback.body'),
      }
  }
}

export default function ResumeAnalysisError({ code, message, filename, onRetry, onUploadNew }) {
  const { t } = useTranslation()
  const { title, body } = describeFailure(code, message, t)

  return (
    <div className="rr-content">
        <div className="rr-error" role="alert">
          <div className="rr-error__icon" aria-hidden="true">⚠</div>
          <h1 className="rr-error__title">{title}</h1>
          {filename && <p className="rr-error__file">{filename}</p>}
          <p className="rr-error__body">{body}</p>

          <div className="rr-error__actions">
            {/* Both actions always render. That is the whole point of this view. */}
            <button type="button" className="btn btn-filled" onClick={onRetry}>
              {t('resumeAnalysisError.tryAgain')}
            </button>
            <button type="button" className="btn btn-outline" onClick={onUploadNew}>
              {t('resumeAnalysisError.uploadNew')}
            </button>
          </div>
      </div>
    </div>
  )
}
