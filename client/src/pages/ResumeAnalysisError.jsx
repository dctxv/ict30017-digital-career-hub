import { useLanguage } from '../context/LanguageContext'

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

/**
 * Maps a failure to the copy that names the cause and the next step. Returns
 * translation keys rather than sentences, so the screen follows the language
 * toggle. Distinct from the partial-failure banner in ResultsView, which only
 * ever appears alongside feedback that actually arrived.
 */
function describeFailure(code) {
  switch (code) {
    case 'FILE_TOO_LARGE':
      return { titleKey: 'reviewError.tooLargeTitle', bodyKey: 'reviewError.tooLargeBody' }
    case 'INVALID_TYPE':
      return { titleKey: 'reviewError.invalidTypeTitle', bodyKey: 'reviewError.invalidTypeBody' }
    case 'RATE_LIMIT':
      // The server's own rate-limit wording is already localised from the lang
      // cookie, so when it sends one it is preferred over the generic copy.
      return { titleKey: 'reviewError.rateLimitTitle', bodyKey: 'reviewError.rateLimitBody', preferServerMessage: true }
    case 'UNREADABLE':
      return { titleKey: 'reviewError.unreadableTitle', bodyKey: 'reviewError.unreadableBody' }
    default:
      return { titleKey: 'reviewError.fallbackTitle', bodyKey: 'reviewError.fallbackBody', appendDetail: true }
  }
}

export default function ResumeAnalysisError({ code, message, filename, onRetry, onUploadNew }) {
  const { t } = useLanguage()
  const { titleKey, bodyKey, preferServerMessage, appendDetail } = describeFailure(code)

  const title = t(titleKey)
  let body = t(bodyKey)
  if (preferServerMessage && message) {
    body = message
  } else if (appendDetail && message) {
    body = t('reviewError.fallbackBodyWithDetail', { message })
  }

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
              {t('reviewError.tryAgain')}
            </button>
            <button type="button" className="btn btn-outline" onClick={onUploadNew}>
              {t('reviewError.uploadNew')}
            </button>
          </div>
      </div>
    </div>
  )
}
