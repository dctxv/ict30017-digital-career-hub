/*
 * ResultsView.jsx
 *
 * The analysis beside the document it is about. The feedback column carries the
 * score, the priority actions and the section cards; the aside keeps the
 * uploaded PDF in view so a suggestion about the skills section can be checked
 * against the skills section without leaving the page.
 *
 * Everything rendered here comes from the model's validated response. Where the
 * response has no value — no job advert supplied, so no job_match; a stream cut
 * short, so no ats_analysis — the card is not rendered rather than being filled
 * with a placeholder. A results page that invents structure the analysis does
 * not contain is worse than a shorter one.
 */

import { useEffect, useRef, useState } from 'react'
import html2pdf from 'html2pdf.js'
import { Document, Page, pdfjs } from 'react-pdf'
import {
  FileText, FileSearch, RotateCcw, Download, Maximize2, X, Upload,
  BookOpen, MessageCircle, Lightbulb, ArrowRight, TriangleAlert, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useLanguage } from '../context/LanguageContext'
import { openChatbot } from '../components/chatbotBus'
import './ResultsView.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/* ── Helpers ─────────────────────────────────────────────────────────── */

const displayFilename = name => (name ?? '').replace(/_/g, ' ')

const bandLabelKey = score =>
  score <= 30 ? 'results.band.low'
    : score <= 60 ? 'results.band.mid'
      : score <= 80 ? 'results.band.high'
        : 'results.band.top'

/* One scale, three names, used for every score on the page — the ring, the
   bars, the section headers and the pills. A section scoring 44 must not read
   as healthy in one place and poor in another. */
const toneOf = score => (score <= 40 ? 'low' : score <= 65 ? 'mid' : 'high')

/* ── Score pieces ────────────────────────────────────────────────────── */

function ScoreBadge({ score }) {
  const { n } = useLanguage()
  if (typeof score !== 'number') return null
  return <span className={`score-badge score-badge--${toneOf(score)}`}>{n(score)}</span>
}

function ScoreBar({ label, score }) {
  const { n } = useLanguage()
  if (typeof score !== 'number') return null
  return (
    <div className="score-bar">
      <div className="score-bar__row">
        <span>{label}</span>
        <span className="score-bar__value">{n(score)}</span>
      </div>
      <div className="score-bar__track">
        <span
          className={`score-bar__fill score-bar__fill--${toneOf(score)}`}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  )
}

/* ── Section card ────────────────────────────────────────────────────── */

function SectionCard({ id, title, sub, score, children }) {
  return (
    <section className="rv-card" id={id}>
      <div className="rv-card__head">
        <div>
          <h2 className="rv-card__title">{title}</h2>
          {sub && <p className="rv-card__sub">{sub}</p>}
        </div>
        <ScoreBadge score={score} />
      </div>
      {children}
    </section>
  )
}

function GroupLabel({ tone, children, count }) {
  const { n } = useLanguage()
  return (
    <p className={`rv-group${tone ? ` rv-group--${tone}` : ''}`}>
      {children}
      {typeof count === 'number' && <span className="rv-group__count">({n(count)})</span>}
    </p>
  )
}

/* ── Bodies ──────────────────────────────────────────────────────────── */

function ContentBody({ section }) {
  const { t } = useLanguage()
  const strengths = Array.isArray(section.strengths) ? section.strengths.filter(Boolean) : []
  const weaknesses = Array.isArray(section.weaknesses) ? section.weaknesses.filter(Boolean) : []

  return (
    <>
      {section.feedback && <p className="rv-intro">{section.feedback}</p>}

      {strengths.length > 0 && (
        <div className="rv-group-block">
          <GroupLabel tone="good" count={strengths.length}>{t('results.strengths')}</GroupLabel>
          <ul className="rv-list">
            {strengths.map((item, index) => (
              <li key={index} className="rv-list__item rv-list__item--good">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {weaknesses.length > 0 && (
        <div className="rv-group-block">
          <GroupLabel tone="warn" count={weaknesses.length}>{t('results.weaknesses')}</GroupLabel>
          <ul className="rv-list">
            {weaknesses.map((item, index) => (
              <li key={index} className="rv-list__item rv-list__item--warn">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

function LanguageBody({ section }) {
  const { t } = useLanguage()
  const issues = Array.isArray(section.issues) ? section.issues.filter(item => item?.original) : []

  return (
    <>
      {section.feedback && <p className="rv-intro">{section.feedback}</p>}

      {issues.length > 0 && (
        <div className="rv-group-block">
          <GroupLabel tone="warn" count={issues.length}>{t('results.issues')}</GroupLabel>
          <div className="rv-rewrites">
            {issues.map((item, index) => (
              <div key={index} className="rv-rewrite">
                <span className="rv-rewrite__type">{item.type}</span>
                <span className="rv-rewrite__before">{item.original}</span>
                <span className="rv-rewrite__after">{item.corrected}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

/* Suggestions are collapsed by default. Every issue carries one, and expanded
   they turn a scannable list of eight problems into three screens of prose. */
function FormattingIssue({ item }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  if (!item?.issue) return null

  return (
    <div className="rv-issue">
      <button
        type="button"
        className="rv-issue__head"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        disabled={!item.suggestion}
      >
        <span className="rv-issue__section">{item.section}</span>
        <span className="rv-issue__text">{item.issue}</span>
        {item.suggestion && (open ? <ChevronUp size={15} /> : <ChevronDown size={15} />)}
      </button>

      {open && item.suggestion && (
        <p className="rv-issue__suggestion">
          <span className="rv-issue__suggestion-label">{t('results.suggestion')}</span>
          {item.suggestion}
        </p>
      )}
    </div>
  )
}

function FormattingBody({ section }) {
  const { t } = useLanguage()
  const issues = Array.isArray(section.issues) ? section.issues.filter(item => item?.issue) : []

  return (
    <>
      {section.feedback && <p className="rv-intro">{section.feedback}</p>}

      {issues.length > 0 && (
        <div className="rv-group-block">
          <GroupLabel tone="warn" count={issues.length}>{t('results.issues')}</GroupLabel>
          <div className="rv-issues">
            {issues.map((item, index) => <FormattingIssue key={index} item={item} />)}
          </div>
        </div>
      )}
    </>
  )
}

/* ── ATS ─────────────────────────────────────────────────────────────── */

function AtsCard({ ats }) {
  const { t } = useLanguage()
  const hits = Array.isArray(ats.keyword_hits) ? ats.keyword_hits : []
  const gaps = Array.isArray(ats.keyword_gaps) ? ats.keyword_gaps : []
  const risks = Array.isArray(ats.heading_risks) ? ats.heading_risks : []
  const tips = Array.isArray(ats.ats_tips) ? ats.ats_tips : []

  const inferred = [
    ats.inferred_role && t('results.inferredRoleValue', { value: ats.inferred_role }),
    ats.inferred_industry && t('results.inferredIndustryValue', { value: ats.inferred_industry }),
  ].filter(Boolean).join(' · ')

  return (
    <SectionCard
      id="sec-ats"
      title={t('results.card.ats')}
      sub={inferred || null}
      score={typeof ats.ats_score === 'number' ? ats.ats_score : undefined}
    >
      {(hits.length > 0 || gaps.length > 0) && (
        <div className="rv-keywords">
          {hits.length > 0 && (
            <div>
              <GroupLabel tone="good" count={hits.length}>{t('results.keywordsFound')}</GroupLabel>
              <div className="rv-chips">
                {hits.map((keyword, index) => (
                  <span key={index} className="rv-chip rv-chip--hit">{keyword}</span>
                ))}
              </div>
            </div>
          )}

          {gaps.length > 0 && (
            <div>
              <GroupLabel tone="warn" count={gaps.length}>{t('results.keywordGaps')}</GroupLabel>
              <div className="rv-chips">
                {gaps.map((keyword, index) => (
                  <span key={index} className="rv-chip rv-chip--gap">{keyword}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {risks.length > 0 && (
        <div className="rv-group-block">
          <GroupLabel tone="warn" count={risks.length}>{t('results.headingRisks')}</GroupLabel>
          {risks.map((risk, index) => (
            <div key={index} className="rv-risk">
              <div className="rv-risk__swap">
                <span className="rv-rewrite__before">{risk.original}</span>
                <span className="rv-rewrite__after">{risk.recommended}</span>
              </div>
              <p className="rv-risk__why">{risk.issue}</p>
            </div>
          ))}
        </div>
      )}

      {tips.length > 0 && (
        <div className="rv-group-block">
          <GroupLabel tone="good">{t('results.atsTips')}</GroupLabel>
          <ol className="rv-numbered">
            {tips.map((tip, index) => <li key={index}>{tip}</li>)}
          </ol>
        </div>
      )}
    </SectionCard>
  )
}

/* ── Job match ───────────────────────────────────────────────────────── */

function JobMatchCard({ match }) {
  const { t, tc } = useLanguage()
  const matched = Array.isArray(match.matched_keywords) ? match.matched_keywords : []
  const partial = Array.isArray(match.partial_keywords) ? match.partial_keywords : []
  const missing = Array.isArray(match.missing_keywords) ? match.missing_keywords : []
  const recommendations = Array.isArray(match.recommendations) ? match.recommendations : []

  return (
    <SectionCard id="sec-jobmatch" title={t('results.card.jobmatch')} score={match.match_score}>
      <div className="rv-keywords rv-keywords--three">
        {matched.length > 0 && (
          <div>
            <GroupLabel tone="good" count={matched.length}>{t('results.matched')}</GroupLabel>
            <div className="rv-chips">
              {matched.map((keyword, index) => (
                <span key={index} className="rv-chip rv-chip--hit">{keyword}</span>
              ))}
            </div>
          </div>
        )}

        {partial.length > 0 && (
          <div>
            <GroupLabel tone="warn" count={partial.length}>{t('results.partial')}</GroupLabel>
            <div className="rv-partials">
              {partial.map((item, index) => (
                <span key={index} className="rv-partial">
                  {item.resume_term}
                  <ArrowRight size={12} />
                  <strong>{item.required_term}</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        {missing.length > 0 && (
          <div>
            <GroupLabel tone="bad" count={missing.length}>{t('results.missing')}</GroupLabel>
            <div className="rv-chips rv-chips--stack">
              {missing.map((item, index) => (
                <span key={index} className="rv-missing">
                  {/* The priority enum stays English in the model's JSON by
                      contract; only its rendered label is translated. */}
                  <span className={`rv-priority rv-priority--${item.priority}`}>
                    {tc(`results.priority.${item.priority}`, item.priority)}
                  </span>
                  {item.keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {recommendations.length > 0 && (
        <div className="rv-group-block">
          <GroupLabel tone="good">{t('results.recommendations')}</GroupLabel>
          <ol className="rv-numbered">
            {recommendations.map((item, index) => <li key={index}>{item}</li>)}
          </ol>
        </div>
      )}
    </SectionCard>
  )
}

/* ── Document preview ────────────────────────────────────────────────── */

/*
 * The File is handed to <Document> as-is. react-pdf detects a Blob (a File is
 * one) and loads it itself, so nothing here creates or revokes an object URL —
 * which is what previously broke the preview.
 *
 * The old shape built the URL in a useMemo and revoked it in a separate cleanup
 * effect, on the reasoning that an object URL is a pure function of the File.
 * It is not: createObjectURL allocates a resource that must be released, so it
 * is a side effect wearing a value's clothes, and React treats a memo as a
 * discardable hint with no guarantee it will survive.
 *
 * In development that failed every time. StrictMode mounts twice: the memo
 * created URL A, the simulated unmount revoked A, the remount re-ran the effect
 * but the memo handed back the cached, already-dead A. pdf.js fetched a revoked
 * blob and reported "Unexpected server response (0)". A production build was
 * fine, which is exactly the split that gets misread as a bad PDF rather than a
 * bug. Owning no resource is the fix that cannot regress.
 */
function DocumentPreview({ file, feedback, width, onNumPages }) {
  const { t } = useLanguage()
  const [error, setError] = useState(null)
  const [pages, setPages] = useState(0)

  const isDocx = file?.type === DOCX_MIME
  const source = file || feedback?.fileUrl || null

  if (isDocx) {
    return (
      <div className="rv-preview__fallback">
        <span className="rv-preview__fallback-icon"><FileText size={19} /></span>
        <p className="rv-preview__fallback-title">{t('results.docxTitle')}</p>
        <p className="rv-preview__fallback-body">{t('results.docxBody')}</p>
      </div>
    )
  }

  if (!source) return null

  return (
    <>
      {error && (
        <p className="notice notice--error rv-preview__error">
          {t('results.pdfFailed', { message: error })}
        </p>
      )}

      <Document
        file={source}
        onLoadSuccess={({ numPages }) => { setPages(numPages); onNumPages?.(numPages); setError(null) }}
        onLoadError={event => setError(event.message || t('results.pdfUnknownError'))}
        loading={<p className="rv-preview__loading">{t('results.pdfLoading')}</p>}
      >
        {Array.from({ length: pages }, (_, index) => (
          <div key={index} className="rv-preview__page">
            <Page pageNumber={index + 1} width={width || undefined} renderTextLayer renderAnnotationLayer />
          </div>
        ))}
      </Document>
    </>
  )
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function ResultsView({
  filename, isSample, feedback, isLoading, streamError, marketMode,
  onReanalyse, onUploadNew, onNewFile, uploadedFile,
}) {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(false)
  const [previewWidth, setPreviewWidth] = useState(null)
  const previewRef = useRef(null)
  const swapInputRef = useRef(null)

  // react-pdf renders at a fixed pixel width, so it has to be told what the
  // column is currently worth. A ResizeObserver keeps that true through a
  // window resize and through the aside collapsing under the feedback column.
  useEffect(() => {
    const element = previewRef.current
    if (!element) return undefined
    const observer = new ResizeObserver(() => {
      const width = element.clientWidth
      setPreviewWidth(width > 32 ? width - 32 : width)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!expanded) return undefined
    const onKey = event => { if (event.key === 'Escape') setExpanded(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded])

  const downloadPdf = () => {
    const element = document.querySelector('.rv-feedback')
    if (!element) return
    html2pdf().set({
      margin: [0.3, 0.3, 0.3, 0.3],
      filename: `Resume_Review_${(filename || 'Result').replace(/\.[^.]+$/, '')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    }).from(element).save()
  }

  const overall = typeof feedback?.overall_score === 'number' ? feedback.overall_score : null
  const hasPreview = Boolean(uploadedFile || feedback?.fileUrl)

  const marketLabel = marketMode === 'international'
    ? t('review.marketInternational')
    : t('review.marketLocal')

  return (
    <div className="rv">
      {isSample && (
        <div className="rv-sample-notice">
          {t('results.sampleNoticePrefix')} <strong>{t('results.sampleNoticeStrong')}</strong>{' '}
          {t('results.sampleNoticeSuffix')}
        </div>
      )}

      <section className="rv-head">
        <div className="rv-head__inner">
          <div className="rv-head__file">
            <span className="rv-head__icon"><FileText size={21} /></span>
            <div className="rv-head__text">
              <p className="rv-head__name">{displayFilename(filename)}</p>
              <p className="rv-head__meta">{t('results.meta', { market: marketLabel })}</p>
            </div>
          </div>

          <div className="rv-head__actions">
            <input
              ref={swapInputRef}
              type="file"
              accept=".pdf,.docx"
              className="visually-hidden"
              onChange={event => {
                const next = event.target.files?.[0]
                event.target.value = ''
                if (next) onNewFile(next)
              }}
            />
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => swapInputRef.current?.click()}
            >
              <Upload size={15} />
              {t('results.swapFile')}
            </button>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={onReanalyse}
              disabled={isLoading}
            >
              <RotateCcw size={15} />
              {t('results.reanalyse')}
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={downloadPdf}>
              <Download size={15} />
              {t('results.downloadPdf')}
            </button>
          </div>
        </div>
      </section>

      <section className="rv-body">
        <div className="rv-feedback">
          {/* Partial failure only. A total failure never reaches this view:
              ResumeReview routes it to ResumeAnalysisError, which states the
              cause and always offers a way out. This banner therefore always
              sits above feedback that did arrive. */}
          {streamError && (
            <p className="notice notice--warn" role="status">
              <TriangleAlert size={16} />
              {t('results.streamWarning')}
            </p>
          )}

          <section className="rv-card rv-overall" id="sec-overall">
            <p className="eyebrow">{t('results.overallHeading')}</p>

            {overall === null ? (
              <div className="rv-overall__waiting">
                <span className="dots"><span /><span /><span /></span>
              </div>
            ) : (
              <div className="rv-overall__inner">
                <div className="rv-overall__score">
                  <p className={`rv-overall__number rv-overall__number--${toneOf(overall)}`}>
                    {overall}<span className="rv-overall__denom">/100</span>
                  </p>
                  <span className={`rv-band rv-band--${toneOf(overall)}`}>{t(bandLabelKey(overall))}</span>
                </div>

                <div className="rv-overall__bars">
                  <ScoreBar label={t('results.nav.content')} score={feedback?.content_quality?.score} />
                  <ScoreBar label={t('results.nav.language')} score={feedback?.language_grammar?.score} />
                  <ScoreBar label={t('results.nav.format')} score={feedback?.formatting?.score} />
                </div>
              </div>
            )}
          </section>

          {Array.isArray(feedback?.action_items) && feedback.action_items.length > 0 && (
            <SectionCard id="sec-actions" title={t('results.card.actions')}>
              <ol className="rv-actions">
                {feedback.action_items.map((item, index) => <li key={index}>{item}</li>)}
              </ol>
            </SectionCard>
          )}

          {feedback?.content_quality && (
            <SectionCard
              id="sec-content"
              title={t('results.card.content')}
              score={feedback.content_quality.score}
            >
              <ContentBody section={feedback.content_quality} />
            </SectionCard>
          )}

          {feedback?.language_grammar && (
            <SectionCard
              id="sec-language"
              title={t('results.card.language')}
              score={feedback.language_grammar.score}
            >
              <LanguageBody section={feedback.language_grammar} />
            </SectionCard>
          )}

          {feedback?.formatting && (
            <SectionCard
              id="sec-format"
              title={t('results.card.format')}
              score={feedback.formatting.score}
            >
              <FormattingBody section={feedback.formatting} />
            </SectionCard>
          )}

          {feedback?.ats_analysis && <AtsCard ats={feedback.ats_analysis} />}
          {feedback?.job_match && <JobMatchCard match={feedback.job_match} />}
        </div>

        <aside className="rv-aside">
          <div className="rv-preview">
            <div className="rv-preview__head">
              <span className="rv-preview__label">
                <FileText size={16} />
                {t('results.yourResume')}
              </span>
              {hasPreview && (
                <button type="button" className="btn btn--outline btn--sm" onClick={() => setExpanded(true)}>
                  <Maximize2 size={13} />
                  {t('results.viewFull')}
                </button>
              )}
            </div>

            {hasPreview ? (
              <>
                <div className="rv-preview__doc" ref={previewRef}>
                  <DocumentPreview file={uploadedFile} feedback={feedback} width={previewWidth} />
                </div>
                <p className="rv-preview__hint">{t('results.compareHint')}</p>
              </>
            ) : (
              <div className="rv-preview__fallback">
                <span className="rv-preview__fallback-icon"><FileSearch size={19} /></span>
                <p className="rv-preview__fallback-body">{t('results.noPreviewHint')}</p>
                <button type="button" className="btn btn--outline btn--sm" onClick={onUploadNew}>
                  {t('results.uploadNew')}
                </button>
              </div>
            )}
          </div>

          <div className="card card--tinted rv-next">
            <p className="card__title">{t('results.whatNext')}</p>
            <div className="rv-next__buttons">
              <button type="button" className="btn btn--primary rv-next__btn" onClick={onUploadNew}>
                <Upload size={16} />
                {t('results.uploadNew')}
              </button>
              <Link to="/resources" className="btn btn--outline rv-next__btn">
                <BookOpen size={16} />
                {t('results.relatedResources')}
              </Link>
              <button type="button" className="btn btn--outline rv-next__btn" onClick={() => openChatbot()}>
                <MessageCircle size={16} />
                {t('results.askChatbot')}
              </button>
            </div>
          </div>

          <div className="card rv-tip">
            <Lightbulb size={18} />
            <p>
              <strong>{t('results.tipLabel')}</strong> {t('results.tipBody')}
            </p>
          </div>
        </aside>
      </section>

      {expanded && hasPreview && (
        <div className="rv-modal" role="dialog" aria-modal="true" aria-label={displayFilename(filename)}>
          <div className="rv-modal__bar">
            <p className="rv-modal__name">{displayFilename(filename)}</p>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => setExpanded(false)}>
              <X size={15} />
              {t('results.closePreview')}
            </button>
          </div>
          <div className="rv-modal__doc">
            <DocumentPreview file={uploadedFile} feedback={feedback} width={820} />
          </div>
        </div>
      )}
    </div>
  )
}
