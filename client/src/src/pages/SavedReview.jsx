import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ResultsView from './ResultsView'
import { fetchReview } from '../api/account'
import { useLanguage } from '../context/LanguageContext'

/**
 * A review the user has already run, read back from history.
 *
 * The same ResultsView renders it, because it is the same analysis — a saved
 * review that looked different from a fresh one would make the history feel
 * like a summary of the real thing rather than the thing itself.
 *
 * Two differences are unavoidable and are handled by what is passed in. There
 * is no document to show beside it: uploads are deleted from disk after the
 * analysis by design (SPR-10, FR-13), so the preview panel falls back to its
 * "upload a PDF to compare" state. And there is nothing to re-run, since the
 * file is gone, so re-analysing routes back to the upload page rather than
 * silently doing nothing.
 */
export default function SavedReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [review, setReview] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchReview(id)
      .then(data => { if (!cancelled) setReview(data) })
      .catch(err => { if (!cancelled) setError(err.message || t('profile.reviewLoadFailed')) })
    return () => { cancelled = true }
  }, [id, t])

  if (error) {
    return (
      <div className="page-enter">
        <Navbar />
        <div className="page-body">
          <p className="notice notice--error" role="alert">{error}</p>
        </div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="page-enter">
        <Navbar />
        <div className="empty-state">{t('profile.loadingReview')}</div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <Navbar />
      <ResultsView
        filename={review.file_name}
        feedback={review.feedback}
        isSample={false}
        isLoading={false}
        streamError={null}
        marketMode={review.market_mode}
        uploadedFile={null}
        onReanalyse={() => navigate('/resume-review')}
        onUploadNew={() => navigate('/resume-review')}
        onNewFile={() => navigate('/resume-review')}
      />
    </div>
  )
}
