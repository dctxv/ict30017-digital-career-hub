/*
 * ResumeReview.jsx
 *
 * CHANGES:
 * 1. uploadedFile / setUploadedFile — new useState hook that stores the raw File
 *    object selected by the user. Set inside analyse() at the same point the
 *    file is resolved (alongside setFilename), so it is always the file that
 *    was actually sent to the backend. Cleared to null in showSample() because
 *    sample mode has no real file. Passed to ResultsView so PDFPanel can derive
 *    a blob URL from it directly without requiring a backend file URL.
 */
import { useState, useRef, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ResumeAnalysisError from './ResumeAnalysisError'
import { validateResumeFile, ACCEPTED_EXTENSIONS } from '../utils/resumeFile'
import { apiFetch } from '../utils/apiClient'
import {
  EMPTY_REVIEW_CONTEXT,
  APPLICATION_CHANNEL_OPTIONS,
  EMPLOYER_TYPE_OPTIONS,
  CANDIDATE_STAGE_OPTIONS,
  TARGET_SECTOR_OPTIONS,
} from '../utils/reviewContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { sampleReview } from '../data/sampleReview'
import { streamResumeReview } from '../api/reviewResume'
import ResultsView from './ResultsView'
import './ResumeReview.css'

/* ── FileIcon ────────────────────────────────────────────────────── */
function FileIcon({ size = 36 }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 30 36">
      <rect x="1" y="1" width="21" height="33" rx="3" fill="none" stroke="var(--green-700)" strokeWidth="1.8" />
      <path d="M21 1 L28 8 L21 8 Z" fill="var(--green-700)" opacity=".2" />
      <path d="M21 1 L21 8 L28 8" fill="none" stroke="var(--green-700)" strokeWidth="1.8" />
      <line x1="6" y1="18" x2="17" y2="18" stroke="var(--green-700)" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="6" y1="24" x2="13" y2="24" stroke="var(--green-700)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/* ── UploadView ──────────────────────────────────────────────────── */
/*
 * Reads the caller's real remaining allowance.
 *
 * Three different numbers previously described one limit: static "3 reviews
 * remaining this month" text here, "3 resume reviews per day" on the register
 * page, and 5 per hour per IP in the server. The server is now the only
 * authority, and this hook renders whatever it reports. Enforcement stays in
 * backend middleware; nothing here decides anything.
 */
function useReviewQuota() {
  const [quota, setQuota] = useState(null)

  useEffect(() => {
    let cancelled = false
    apiFetch('/api/resume/quota')
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (!cancelled) setQuota(data) })
      .catch(() => { /* the label falls back to the generic plan text */ })
    return () => { cancelled = true }
  }, [])

  return quota
}

/*
 * Takes the language helpers rather than reaching for the context itself, so it
 * stays a pure function of its arguments and can be reasoned about in isolation.
 * English distinguishes one review from several; Bangla does not, and the two
 * keys resolve to the same sentence there.
 */
function describeQuota(quota, isAuthenticated, t, n) {
  if (!quota) return t('review.quotaFallback')
  if (quota.unlimited) return t('review.quotaUnlimited')
  if (!quota.authenticated || !isAuthenticated) {
    return t('review.quotaAnonymous', { limit: n(quota.limit) })
  }
  if (quota.remaining === 0) {
    return t('review.quotaExhausted')
  }
  const key = quota.remaining === 1 ? 'review.quotaRemainingOne' : 'review.quotaRemainingMany'
  return t(key, { remaining: n(quota.remaining), limit: n(quota.limit) })
}

function UploadView({ file, setFile, jobRole, setJobRole, jobAd, setJobAd, marketMode, setMarketMode, reviewContext, setReviewContext, onAnalyse, onSample }) {
  const [drag, setDrag] = useState(false)
  const [enhanceOpen, setEnhanceOpen] = useState(false)
  const inputRef = useRef()

  const [fileError, setFileError] = useState(null)
  const { isAuthenticated } = useAuth()
  const { t, n } = useLanguage()
  const quota = useReviewQuota()

  // The coarse market toggle and the precise employer selector answer the same
  // question at different resolutions, and the server lets the employer type
  // win. These keep the two visibly consistent so the toggle never lies about
  // what the review will actually do.
  const chooseMarket = (mode) => {
    setMarketMode(mode)
    if (mode === 'international') {
      setReviewContext(c => ({ ...c, employerType: 'multinational' }))
    } else if (reviewContext.employerType === 'multinational') {
      setReviewContext(c => ({ ...c, employerType: 'unknown' }))
    }
  }

  const chooseContext = (key, value) => {
    setReviewContext(c => ({ ...c, [key]: value }))
    if (key === 'employerType') {
      if (value === 'multinational') setMarketMode('international')
      else if (value !== 'unknown') setMarketMode('bangladesh')
    }
  }
  const quotaLabel = describeQuota(quota, isAuthenticated, t, n)

  // Runs for both the picker and the drop zone. accept=".pdf,.docx" only
  // filters the dialog, so a dropped .txt reached the server before this.
  const pick = f => {
    if (!f) return
    const check = validateResumeFile(f)
    if (!check.ok) {
      // Held as a key plus its substitutions, not as a rendered sentence, so an
      // error already on screen re-renders in the new language if the user
      // toggles rather than freezing in the language it was raised in.
      setFileError({ key: check.messageKey, vars: check.messageVars })
      setFile(null)
      return
    }
    setFileError(null)
    setFile(f)
  }
  const handleDrop = e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }

  return (
    <div className="rr-content">
      <div className="rr-upload-header">
        <h1 className="rr-title">{t('review.title')}</h1>
        <p className="rr-sub">{t('review.sub')}</p>
      </div>

      {!file ? (
        <div
          className={`drop-zone${drag ? ' drop-zone--active' : ''}`}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
        >
          <div className="drop-zone__icon"><FileIcon size={40} /></div>
          <div className="drop-zone__title">{t('review.dropTitle')}</div>
          <div className="drop-zone__hint">{t('review.dropHint')}</div>
          <button
            className="btn btn-outline"
            onClick={e => { e.stopPropagation(); inputRef.current.click() }}
          >
            {t('review.browse')}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            style={{ display: 'none' }}
            onChange={e => pick(e.target.files[0])}
          />
          {fileError && (
            <p className="drop-zone__error" role="alert">{t(fileError.key, fileError.vars)}</p>
          )}
        </div>
      ) : (
        <div className="file-card">
          <div className="file-card__top">
            <span className="file-pill">
              <svg width="12" height="15" viewBox="0 0 12 15">
                <rect x="1" y="1" width="8" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7.5 1v3.5h3" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              {file.name}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => setFile(null)}>{t('review.remove')}</button>
          </div>

          <div className="market-mode-card">
            <div className="market-mode-label">
              <span className="market-mode-icon">🎯</span>
              <span className="market-mode-title">{t('review.marketTitle')}</span>
            </div>
            <div className="market-mode-options">
              <button
                className={`market-mode-btn ${marketMode === 'bangladesh' ? 'market-mode-btn--active' : ''}`}
                onClick={() => chooseMarket('bangladesh')}
              >
                <span className="market-mode-btn-label">{t('review.marketLocal')}</span>
                <span className="market-mode-btn-desc">{t('review.marketLocalDesc')}</span>
              </button>
              <button
                className={`market-mode-btn ${marketMode === 'international' ? 'market-mode-btn--active' : ''}`}
                onClick={() => chooseMarket('international')}
              >
                <span className="market-mode-btn-label">{t('review.marketInternational')}</span>
                <span className="market-mode-btn-desc">{t('review.marketInternationalDesc')}</span>
              </button>
            </div>
          </div>

          {/* Routes the reviewer's rules. Every field is optional: left alone,
              the server infers it and reports what it inferred. */}
          <div className="context-card">
            <div className="context-card__label">
              <span className="context-card__icon">🧭</span>
              <span className="context-card__title">{t('review.contextTitle')}</span>
            </div>
            <p className="context-card__hint">{t('review.contextHint')}</p>
            <div className="context-card__grid">
              {[
                ['applicationChannel', 'review.contextChannel', APPLICATION_CHANNEL_OPTIONS],
                ['employerType', 'review.contextEmployer', EMPLOYER_TYPE_OPTIONS],
                ['candidateStage', 'review.contextStage', CANDIDATE_STAGE_OPTIONS],
                ['targetSector', 'review.contextSector', TARGET_SECTOR_OPTIONS],
              ].map(([key, labelKey, options]) => (
                <div className="form-group" key={key}>
                  <label className="form-label" htmlFor={`ctx-${key}`}>{t(labelKey)}</label>
                  <select
                    id={`ctx-${key}`}
                    className="form-input"
                    value={reviewContext[key]}
                    onChange={e => chooseContext(key, e.target.value)}
                  >
                    {options.map(o => (
                      <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="enhance-card">
            <div className="enhance-card__trigger" onClick={() => setEnhanceOpen(o => !o)}>
              <span className="enhance-card__star">✦</span>
              <span className="enhance-card__label">{t('review.enhanceLabel')}</span>
              <span className="enhance-card__hint">{t('review.enhanceHint')}</span>
              <span className="enhance-card__chevron">{enhanceOpen ? '▴' : '▾'}</span>
            </div>
            {enhanceOpen && (
              <div className="enhance-card__fields">
                <div className="form-group">
                  <label className="form-label">{t('review.jobRoleLabel')} <span className="optional">{t('common.optional')}</span></label>
                  <input
                    className="form-input"
                    placeholder={t('review.jobRolePlaceholder')}
                    value={jobRole}
                    onChange={e => setJobRole(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('review.jobAdLabel')} <span className="optional">{t('review.jobAdOptional')}</span></label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder={t('review.jobAdPlaceholder')}
                    value={jobAd}
                    onChange={e => setJobAd(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {file && (
        <div className="upload-actions">
          <div className="free-notice">
            <span>⚠</span>
            <span>{quotaLabel}</span>
          </div>
          <button className="btn btn-primary btn-full" onClick={onAnalyse}>
            {t('review.analyse')}
          </button>
        </div>
      )}

      <div className="val-section">
        <div className="val-section__label">{t('review.coversLabel')}</div>
        <div className="val-grid">
          {[
            ['📋', 'Content'],
            ['✏️', 'Language'],
            ['📐', 'Format'],
            ['🔍', 'Ats'],
          ].map(([icon, name]) => (
            <div key={name} className="val-card">
              <div className="val-card__icon">{icon}</div>
              <div className="val-card__title">{t(`review.covers${name}`)}</div>
              <div className="val-card__desc">{t(`review.covers${name}Desc`)}</div>
            </div>
          ))}
        </div>
        <div className="sample-card">
          <span className="sample-card__icon">👁</span>
          <div className="sample-card__text">
            <div className="sample-card__title">{t('review.sampleTitle')}</div>
            <div className="sample-card__sub">{t('review.sampleSub')}</div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onSample}>{t('review.sampleButton')}</button>
        </div>
      </div>
    </div>
  )
}

/* ── AnalysingView ───────────────────────────────────────────────── */
function AnalysingView({ filename }) {
  const { t } = useLanguage()
  const msgs = [
    t('review.analysingStep1'),
    t('review.analysingStep2'),
    t('review.analysingStep3'),
    t('review.analysingStep4'),
  ]
  return (
    <div className="rr-analysing">
      <div className="analysing-spinner">
        <svg width="72" height="72" className="analysing-spinner__svg">
          <circle cx="36" cy="36" r="28" fill="none" stroke="var(--green-200)" strokeWidth="5" />
          <circle cx="36" cy="36" r="28" fill="none" stroke="var(--green-700)" strokeWidth="5" strokeDasharray="44 132" strokeLinecap="round" />
        </svg>
        <span className="analysing-spinner__emoji">🔍</span>
      </div>
      <div className="analysing-text">
        <div className="analysing-text__title">{t('review.analysingTitle')}</div>
        <div className="analysing-text__file">{filename}</div>
      </div>
      <div className="analysing-dots">
        <span className="ldot" /><span className="ldot" /><span className="ldot" />
      </div>
      <div className="analysing-steps">
        {msgs.map((m, i) => (
          <div key={i} className="analysing-step" style={{ animationDelay: `${i * 0.5}s` }}>
            <span className="analysing-step__dot" />{m}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function ResumeReview() {
  const { lang } = useLanguage()
  const [view, setView] = useState('upload')
  const [file, setFile] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [jobAd, setJobAd] = useState('')
  const [marketMode, setMarketMode] = useState('bangladesh')
  const [reviewContext, setReviewContext] = useState(EMPTY_REVIEW_CONTEXT)
  const [feedback, setFeedback] = useState(null)
  const [streamError, setStreamError] = useState(null)
  // Terminal failure. Distinct from streamError, which annotates feedback that
  // did arrive but looks incomplete.
  const [analysisError, setAnalysisError] = useState(null)
  const [filename, setFilename] = useState('')
  const [isSample, setIsSample] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function analyse(fileArg) {
    const f = (fileArg instanceof File) ? fileArg : file
    if (!f) return
    setIsLoading(true)
    setFeedback(null)
    setStreamError(null)
    setAnalysisError(null)
    setIsSample(false)
    setFilename(f.name)
    setUploadedFile(f)
    setView('analysing')

    await streamResumeReview(f, {
      jobRole: jobRole || undefined,
      jobAd: jobAd || undefined,
      marketMode,
      reviewContext,
      // The narrative feedback is generated in the selected language. Toggling
      // mid-review does not rewrite what is already on screen; the next run
      // comes back in the new language.
      language: lang,
      onPartial: (partial) => {
        setFeedback(partial)
        setView('results')
      },
      onDone: (final) => {
        setFeedback(final)
        setView('results')
        setIsLoading(false)
      },
      onError: (code, msg) => {
        setIsLoading(false)
        // Feedback already on screen means the stream died partway: keep the
        // results and annotate them. Nothing on screen is a total failure and
        // must never route to the results shell with null feedback.
        setFeedback(current => {
          if (current) {
            // Truthiness is all this carries: ResultsView renders its own
            // translated banner rather than the server's wording.
            setStreamError(true)
            setView('results')
          } else {
            setAnalysisError({ code, message: msg })
            setView('error')
          }
          return current
        })
      },
    })
  }

  function showSample() {
    setFeedback(sampleReview(lang))
    setFilename('Sample_Resume.pdf')
    setUploadedFile(null)
    setIsSample(true)
    setIsLoading(false)
    setStreamError(null)
    setView('analysing')
    setTimeout(() => setView('results'), 1400)
  }

  function handleReanalyse() {
    setAnalysisError(null)
    if (isSample) { setView('upload'); return }
    if (file) analyse(); else setView('upload')
  }

  function handleUploadNew() {
    setAnalysisError(null)
    setStreamError(null)
    setFeedback(null)
    setFile(null)
    setUploadedFile(null)
    setView('upload')
  }

  function handleNewFile(f) {
    setFile(f)
    setView('upload')
  }

  return (
    <div className="rr-page">
      <Navbar />
      {view === 'upload' && (
        <UploadView
          file={file}
          setFile={setFile}
          jobRole={jobRole}
          setJobRole={setJobRole}
          jobAd={jobAd}
          setJobAd={setJobAd}
          marketMode={marketMode}
          setMarketMode={setMarketMode}
          reviewContext={reviewContext}
          setReviewContext={setReviewContext}
          onAnalyse={analyse}
          onSample={showSample}
        />
      )}
      {view === 'analysing' && <AnalysingView filename={filename} />}
      {view === 'error' && (
        <ResumeAnalysisError
          code={analysisError?.code}
          message={analysisError?.message}
          filename={filename}
          onRetry={handleReanalyse}
          onUploadNew={handleUploadNew}
        />
      )}
      {view === 'results' && (
        <ResultsView
          filename={filename}
          isSample={isSample}
          feedback={feedback}
          isLoading={isLoading}
          streamError={streamError}
          jobRole={jobRole}
          setJobRole={setJobRole}
          jobAd={jobAd}
          setJobAd={setJobAd}
          onReanalyse={handleReanalyse}
          onUploadNew={() => setView('upload')}
          onNewFile={handleNewFile}
          uploadedFile={uploadedFile}
        />
      )}
    </div>
  )
}
