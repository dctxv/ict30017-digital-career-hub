import { useEffect, useRef, useState } from 'react'
import {
  UploadCloud, FileCheck2, Sparkles, CheckCircle2, Eye, ChevronDown, ChevronUp,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import ResumeAnalysisError from './ResumeAnalysisError'
import ResultsView from './ResultsView'
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
import './ResumeReview.css'

const CONTEXT_FIELDS = [
  ['applicationChannel', 'review.contextChannel', APPLICATION_CHANNEL_OPTIONS],
  ['employerType', 'review.contextEmployer', EMPLOYER_TYPE_OPTIONS],
  ['candidateStage', 'review.contextStage', CANDIDATE_STAGE_OPTIONS],
  ['targetSector', 'review.contextSector', TARGET_SECTOR_OPTIONS],
]

const COVERAGE = ['Content', 'Language', 'Format', 'Ats']

/*
 * Reads the caller's real remaining allowance.
 *
 * Three different numbers previously described one limit: static "3 reviews
 * remaining this month" text here, "3 resume reviews per day" on the register
 * page, and 5 per hour per IP in the server. The server is now the only
 * authority and this hook renders whatever it reports. Enforcement stays in
 * backend middleware; nothing here decides anything.
 */
function useReviewQuota() {
  const [quota, setQuota] = useState(null)

  useEffect(() => {
    let cancelled = false
    apiFetch('/api/resume/quota')
      .then(response => (response.ok ? response.json() : null))
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
  if (quota.remaining === 0) return t('review.quotaExhausted')
  const key = quota.remaining === 1 ? 'review.quotaRemainingOne' : 'review.quotaRemainingMany'
  return t(key, { remaining: n(quota.remaining), limit: n(quota.limit) })
}

function formatSize(bytes) {
  if (!bytes) return null
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/* ── Upload ──────────────────────────────────────────────────────────── */

function UploadView({
  file, setFile, jobRole, setJobRole, jobAd, setJobAd,
  marketMode, setMarketMode, reviewContext, setReviewContext,
  onAnalyse, onSample,
}) {
  const [dragging, setDragging] = useState(false)
  const [enhanceOpen, setEnhanceOpen] = useState(false)
  const [fileError, setFileError] = useState(null)
  const inputRef = useRef(null)
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

  // Runs for both the picker and the drop zone. accept=".pdf,.docx" only
  // filters the dialog, so a dropped .txt reached the server before this.
  const pick = (candidate) => {
    if (!candidate) return
    const check = validateResumeFile(candidate)
    if (!check.ok) {
      // Held as a key plus its substitutions, not as a rendered sentence, so an
      // error already on screen re-renders in the new language if the user
      // toggles rather than freezing in the language it was raised in.
      setFileError({ key: check.messageKey, vars: check.messageVars })
      setFile(null)
      return
    }
    setFileError(null)
    setFile(candidate)
  }

  const clearFile = () => {
    setFile(null)
    setFileError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <>
      <section className="page-head">
        <div className="shell rr-head">
          <h1 className="page-head__title">{t('review.title')}</h1>
          <p className="page-head__sub">{t('review.sub')}</p>
        </div>
      </section>

      <section className="rr-upload">
        <div className="rr-upload__main">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            className="visually-hidden"
            onChange={event => pick(event.target.files?.[0])}
          />

          {/* One control, two states. A separate "remove" button beside a filled
              drop zone reads as a second upload target; the zone itself becomes
              the way back once it holds something. */}
          <div
            className={`drop${file ? ' drop--filled' : ''}${dragging ? ' drop--dragging' : ''}`}
            onDragOver={event => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={event => {
              event.preventDefault()
              setDragging(false)
              pick(event.dataTransfer.files?.[0])
            }}
          >
            {file ? (
              <div className="drop__file">
                <span className="drop__file-icon"><FileCheck2 size={21} /></span>
                <span className="drop__file-text">
                  <span className="drop__file-name">{file.name}</span>
                  <span className="drop__file-meta">{formatSize(file.size)} · {file.name.split('.').pop().toUpperCase()}</span>
                </span>
                <button type="button" className="drop__remove" onClick={clearFile}>
                  {t('review.remove')}
                </button>
              </div>
            ) : (
              <button type="button" className="drop__empty" onClick={() => inputRef.current?.click()}>
                <span className="drop__icon"><UploadCloud size={24} /></span>
                <span className="drop__title">{t('review.dropTitle')}</span>
                <span className="drop__hint">{t('review.dropHint')}</span>
                <span className="drop__browse">{t('review.browse')}</span>
              </button>
            )}
          </div>

          {fileError && (
            <p className="notice notice--error rr-file-error" role="alert">
              {t(fileError.key, fileError.vars)}
            </p>
          )}

          <div className="card rr-card">
            <p className="card__title">{t('review.marketTitle')}</p>
            <div className="rr-choices">
              {[
                ['bangladesh', 'review.marketLocal', 'review.marketLocalDesc'],
                ['international', 'review.marketInternational', 'review.marketInternationalDesc'],
              ].map(([mode, labelKey, descKey]) => (
                <button
                  key={mode}
                  type="button"
                  className={`rr-choice${marketMode === mode ? ' rr-choice--on' : ''}`}
                  onClick={() => chooseMarket(mode)}
                  aria-pressed={marketMode === mode}
                >
                  <span className="rr-choice__radio" />
                  <span className="rr-choice__text">
                    <span className="rr-choice__label">{t(labelKey)}</span>
                    <span className="rr-choice__desc">{t(descKey)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Routes the reviewer's rules. Every field is optional: left alone,
              the server infers it and reports what it inferred. */}
          <div className="card rr-card">
            <p className="card__title">{t('review.contextTitle')}</p>
            <p className="card__sub">{t('review.contextHint')}</p>
            <div className="field-grid">
              {CONTEXT_FIELDS.map(([key, labelKey, options]) => (
                <label className="field" key={key} htmlFor={`ctx-${key}`}>
                  <span className="field__label">{t(labelKey)}</span>
                  <span className="select-wrap">
                    <select
                      id={`ctx-${key}`}
                      className="select"
                      value={reviewContext[key]}
                      onChange={event => chooseContext(key, event.target.value)}
                    >
                      {options.map(option => (
                        <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="select-wrap__chevron" />
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="card rr-card rr-enhance">
            <button
              type="button"
              className="rr-enhance__trigger"
              onClick={() => setEnhanceOpen(open => !open)}
              aria-expanded={enhanceOpen}
            >
              <Sparkles size={16} />
              <span className="rr-enhance__label">{t('review.enhanceLabel')}</span>
              <span className="rr-enhance__hint">{t('review.enhanceHint')}</span>
              {enhanceOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {enhanceOpen && (
              <div className="rr-enhance__fields">
                <label className="field">
                  <span className="field__label">
                    {t('review.jobRoleLabel')} <span className="optional">{t('common.optional')}</span>
                  </span>
                  <input
                    className="input"
                    placeholder={t('review.jobRolePlaceholder')}
                    value={jobRole}
                    onChange={event => setJobRole(event.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field__label">
                    {t('review.jobAdLabel')} <span className="optional">{t('review.jobAdOptional')}</span>
                  </span>
                  <textarea
                    className="textarea"
                    rows={4}
                    placeholder={t('review.jobAdPlaceholder')}
                    value={jobAd}
                    onChange={event => setJobAd(event.target.value)}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="rr-submit">
            <button
              type="button"
              className="btn btn--primary btn--lg"
              onClick={onAnalyse}
              disabled={!file}
            >
              {t('review.analyse')}
              <Sparkles size={17} />
            </button>
            <span className="rr-quota">{describeQuota(quota, isAuthenticated, t, n)}</span>
          </div>
        </div>

        <aside className="rr-aside">
          <div className="card card--tinted">
            <p className="eyebrow">{t('review.coversLabel')}</p>
            <div className="rr-covers">
              {COVERAGE.map(name => (
                <div className="rr-cover" key={name}>
                  <CheckCircle2 size={18} className="rr-cover__tick" />
                  <div>
                    <p className="rr-cover__title">{t(`review.covers${name}`)}</p>
                    <p className="rr-cover__desc">{t(`review.covers${name}Desc`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <p className="card__title">{t('review.sampleTitle')}</p>
            <p className="rr-sample__sub">{t('review.sampleSub')}</p>
            <button type="button" className="btn btn--outline btn--sm" onClick={onSample}>
              {t('review.sampleButton')}
              <Eye size={15} />
            </button>
          </div>
        </aside>
      </section>
    </>
  )
}

/* ── Analysing ───────────────────────────────────────────────────────── */

/*
 * The step list is a progress hint, not a report: the server streams one JSON
 * object and does not announce which section it is writing. Steps advance on a
 * timer that stops at the last one rather than looping, so it never claims to
 * have finished something the response has not delivered.
 */
function AnalysingView({ filename }) {
  const { t } = useLanguage()
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setStep(current => Math.min(current + 1, 3)), 1600)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="rr-analysing">
      <span className="spinner spinner--lg" />
      <h1 className="rr-analysing__title">{t('review.analysingTitle')}</h1>
      <p className="rr-analysing__file">{filename}</p>

      <div className="rr-analysing__steps">
        {[1, 2, 3, 4].map((number, index) => {
          const done = step > index
          const active = step === index
          return (
            <div className="rr-step" key={number}>
              <span className={`rr-step__dot${done ? ' rr-step__dot--done' : active ? ' rr-step__dot--on' : ''}`} />
              <span className={`rr-step__label${done || active ? ' rr-step__label--on' : ''}`}>
                {t(`review.analysingStep${number}`)}
              </span>
            </div>
          )
        })}
        <div className="rr-analysing__bar"><span /></div>
      </div>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────────────────── */

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
    const target = fileArg instanceof File ? fileArg : file
    if (!target) return

    setIsLoading(true)
    setFeedback(null)
    setStreamError(null)
    setAnalysisError(null)
    setIsSample(false)
    setFilename(target.name)
    setUploadedFile(target)
    setView('analysing')
    window.scrollTo({ top: 0 })

    await streamResumeReview(target, {
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
      onError: (code, message) => {
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
            setAnalysisError({ code, message })
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
    setView('results')
    window.scrollTo({ top: 0 })
  }

  function handleReanalyse() {
    setAnalysisError(null)
    if (isSample) { setView('upload'); return }
    if (file) analyse()
    else setView('upload')
  }

  function handleUploadNew() {
    setAnalysisError(null)
    setStreamError(null)
    setFeedback(null)
    setFile(null)
    setUploadedFile(null)
    setView('upload')
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="page-enter rr">
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
          marketMode={marketMode}
          jobRole={jobRole}
          setJobRole={setJobRole}
          jobAd={jobAd}
          setJobAd={setJobAd}
          onReanalyse={handleReanalyse}
          onUploadNew={handleUploadNew}
          onNewFile={(next) => { setFile(next); analyse(next) }}
          uploadedFile={uploadedFile}
        />
      )}
    </div>
  )
}
