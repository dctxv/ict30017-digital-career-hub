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

const FALLBACK = {
  title: 'The analysis could not be completed',
  body: 'Something went wrong while your resume was being reviewed. Your file was not saved. Try again, and if it keeps failing, upload a different copy of your resume.',
}

/**
 * Maps a failure to copy that names the cause and the next step. Distinct from
 * the partial-failure banner in ResultsView, which only ever appears alongside
 * feedback that actually arrived.
 */
function describeFailure(code, message) {
  switch (code) {
    case 'FILE_TOO_LARGE':
      return {
        title: 'That file is too large',
        body: 'Your resume must be 3 MB or smaller. Save it again at a lower quality, or export a fresh PDF from your word processor, then upload it again.',
      }
    case 'INVALID_TYPE':
      return {
        title: 'That file type is not supported',
        body: 'Upload your resume as a PDF or DOCX file. Other formats, including images and plain text files, cannot be read.',
      }
    case 'RATE_LIMIT':
      return {
        title: 'You have reached your review limit',
        body: message || 'You have used all of your resume reviews for now. Your allowance resets shortly, so try again later.',
      }
    case 'UNREADABLE':
      return {
        title: 'Your resume could not be read',
        body: 'The file opened but no text could be extracted from it. Scanned images and photographs of a printed resume will not work. Upload a version saved directly from a word processor.',
      }
    default:
      return {
        title: FALLBACK.title,
        body: message ? `${FALLBACK.body} (${message})` : FALLBACK.body,
      }
  }
}

export default function ResumeAnalysisError({ code, message, filename, onRetry, onUploadNew }) {
  const { title, body } = describeFailure(code, message)

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
              Try again
            </button>
            <button type="button" className="btn btn-outline" onClick={onUploadNew}>
              Upload new resume
            </button>
          </div>
      </div>
    </div>
  )
}
