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
    case 'AI_BUSY':
      // The model provider is throttling us. Nothing to do with the caller's
      // allowance, and saying otherwise told a premium account — which has no
      // limit — that it had reached one.
      return { titleKey: 'reviewError.aiBusyTitle', bodyKey: 'reviewError.aiBusyBody', preferServerMessage: true }
    // The caller's own allowance really is spent. This arrives as HTTP_429
    // from the quota middleware or the per-IP limiter; RATE_LIMIT is kept as
    // an alias so a server yet to pick up the rename still lands here.
    case 'HTTP_429':
    case 'RATE_LIMIT':
      // The server's own wording is already localised from the lang cookie and
      // names the exact allowance, so it is preferred over the generic copy.
      return { titleKey: 'reviewError.rateLimitTitle', bodyKey: 'reviewError.rateLimitBody', preferServerMessage: true }
    case 'HTTP_503':
      return { titleKey: 'reviewError.aiBusyTitle', bodyKey: 'reviewError.aiBusyBody', preferServerMessage: true }
    case 'UNREADABLE':
      return { titleKey: 'reviewError.unreadableTitle', bodyKey: 'reviewError.unreadableBody' }
    default:
      return { titleKey: 'reviewError.fallbackTitle', bodyKey: 'reviewError.fallbackBody', appendDetail: true }
  }
}

export default function ResumeAnalysisError({ code, message, filename, onRetry, onUploadNew }) {
  const { t } = useLanguage()
  const { titleKey, bodyKey, preferServerMessage, appendDetail } = describeFailure(code)

  /*
   * The raw failure code, shown small and muted under the actions.
   *
   * This exists because of a real confusion: an upstream provider outage was
   * rendered with a review-limit title, and from the screen alone there was no
   * way to tell which of three different failures had occurred — the account's
   * daily allowance, the per-IP limiter, or the model provider being down. The
   * copy above is for the user; this line is for whoever they send the
   * screenshot to. It never replaces an explanation, it only labels one.
   */
  const diagnostic = code ?? 'UNKNOWN'

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

          <p className="rr-error__diagnostic">
            {t('reviewError.diagnosticLabel')} <code>{diagnostic}</code>
          </p>
      </div>
    </div>
  )
}
