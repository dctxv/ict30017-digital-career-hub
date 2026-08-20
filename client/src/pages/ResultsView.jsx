/*
 * ResultsView.jsx
 *
 * CHANGES (extracted from ResumeReview.jsx and enhanced):
 *
 * 1. FILE EXTRACTED — All sub-components and helpers that ResultsView depends
 *    on are co-located here. ResumeReview.jsx must add one import and remove
 *    its inline ResultsView definition:
 *      import ResultsView from './ResultsView'
 *
 * 2. SPLIT-PANE LAYOUT — ResultsView renders a two-column layout.
 *    LEFT panel: PDF viewer (react-pdf). RIGHT panel: feedback cards.
 *    Below 768 px (tracked via window resize listener) the panels stack
 *    vertically — PDF on top (420 px tall), feedback below.
 *    Layout uses inline styles because the project has no Tailwind configured.
 *
 * 3. PDF VIEWER (PDFPanel component) — Renders the uploaded resume PDF.
 *    PDF source is derived in priority order: (1) blob URL created from
 *    uploadedFile (the raw File object passed from ResumeReview), (2)
 *    feedback?.fileUrl (Cloudinary URL from backend), (3) renders nothing.
 *    The blob URL is stored in objUrlRef (useRef) so it is created only once
 *    per file reference; URL.revokeObjectURL is called on unmount and before
 *    each new URL is created to prevent memory leaks. DOCX detection uses the
 *    MIME type (uploadedFile?.type) instead of filename string matching.
 *
 * 4. DYNAMIC SIZING — pdfWidth is measured via ResizeObserver on the PDF
 *    panel container so react-pdf Page components scale correctly at any
 *    viewport width. headerH is measured the same way on stickyRef so the
 *    sticky left panel's top offset stays correct when the enhance strip
 *    opens or closes.
 *
 * 5. PDFJS WORKER — Configured via import.meta.url (Vite-compatible) to
 *    avoid GlobalWorkerOptions version-mismatch warnings. If you see a
 *    "worker source" error in development, replace with the CDN fallback:
 *      pdfjs.GlobalWorkerOptions.workerSrc =
 *        `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
 *
 * REMOVED:
 * - SECTION_PAGE_MAP config object
 * - ViewInResumeBtn component
 * - scrollToPdfPage function (and useCallback import)
 * - pageRefs ref, its numPages sync useEffect, and its PDFPanel prop
 * - onHeaderClick prop from SectionCard (definition and all call sites)
 * - onViewInResume prop from all body/item components and all call sites
 */

import { useState, useEffect, useRef } from 'react'
import html2pdf from 'html2pdf.js'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

/* ── Helpers ─────────────────────────────────────────────────────── */
const displayFilename = name => name.replace(/_/g, ' ')

const bandLabel = score =>
  score <= 30 ? 'Needs significant work'
  : score <= 60 ? 'Functional but unoptimised'
  : score <= 80 ? 'Competitive'
  : 'Exemplary'

const scoreColorClass = score => score <= 40 ? 'sc-red' : score <= 65 ? 'sc-amber' : 'sc-green'
const scoreIcon       = score => score <= 40 ? '⚠' : score <= 65 ? '!' : '✓'
const sectionHeaderClass = score => score <= 40 ? 'sh-red' : score <= 65 ? 'sh-amber' : 'sh-green'
const priorityClass = p => p === 'high' ? 'priority--high' : p === 'medium' ? 'priority--med' : 'priority--low'

/* ── ScoreBadge ──────────────────────────────────────────────────── */
function ScoreBadge({ score, small }) {
  if (typeof score !== 'number') return null
  return (
    <span className={`score-badge ${scoreColorClass(score)}${small ? ' score-badge--sm' : ''}`}>
      <span className="score-badge__icon">{scoreIcon(score)}</span>
      {score}
    </span>
  )
}

/* ── ScoreRing ───────────────────────────────────────────────────── */
function ScoreRing({ score, size = 96 }) {
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 80)
    return () => clearTimeout(t)
  }, [score])

  const r = size / 2 - 8
  const circ = +(2 * Math.PI * r).toFixed(2)
  const offset = drawn ? +((1 - score / 100) * circ).toFixed(2) : circ
  const colorClass = scoreColorClass(score)
  const colors = { 'sc-red': '#be3535', 'sc-amber': '#9a5100', 'sc-green': 'var(--green-700)' }
  const color = colors[colorClass]

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2ddd8" strokeWidth={7} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <div className="score-ring__label">
        <span className="score-ring__num">{score}</span>
        <span className="score-ring__denom">/100</span>
      </div>
    </div>
  )
}

/* ── SectionCard ─────────────────────────────────────────────────── */
function SectionCard({ id, title, score, children }) {
  return (
    <div className="section-card" id={id}>
      <div className={`section-card__header ${typeof score === 'number' ? sectionHeaderClass(score) : 'sh-amber'}`}>
        <span className="section-card__title">{title}</span>
        {typeof score === 'number' && <ScoreBadge score={score} />}
      </div>
      <div className="section-card__body">{children}</div>
    </div>
  )
}

/* ── FeedbackIntro ───────────────────────────────────────────────── */
function FeedbackIntro({ text }) {
  if (!text) return null
  return <p className="section-feedback">{text}</p>
}

/* ── Strength / weakness items ───────────────────────────────────── */
function StrengthItem({ text }) {
  return (
    <div className="strength-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <span className="strength-item__check" style={{ flexShrink: 0 }}>
        <svg width="10" height="8" viewBox="0 0 10 8">
          <path d="M1 4l3 3 5-6" stroke="var(--green-700)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="strength-item__text">{text}</span>
    </div>
  )
}

function WeaknessItem({ text }) {
  return (
    <div className="weakness-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <span className="weakness-item__dot" style={{ flexShrink: 0 }} />
      <span className="weakness-item__text">{text}</span>
    </div>
  )
}

/* ── Content quality body ────────────────────────────────────────── */
function ContentBody({ sec }) {
  if (!sec) return null
  const strengths  = Array.isArray(sec.strengths)  ? sec.strengths.filter(Boolean)  : []
  const weaknesses = Array.isArray(sec.weaknesses) ? sec.weaknesses.filter(Boolean) : []
  return (
    <>
      <FeedbackIntro text={sec.feedback} />
      {strengths.length > 0 && (
        <div className="section-group">
          <div className="group-label group-label--green">Strengths <span className="group-label__count">({strengths.length})</span></div>
          {strengths.map((s, i) => <StrengthItem key={i} text={s} />)}
        </div>
      )}
      {weaknesses.length > 0 && strengths.length > 0 && <div className="section-divider" />}
      {weaknesses.length > 0 && (
        <div className="section-group">
          <div className="group-label group-label--amber">Weaknesses <span className="group-label__count">({weaknesses.length})</span></div>
          {weaknesses.map((w, i) => <WeaknessItem key={i} text={w} />)}
        </div>
      )}
    </>
  )
}

/* ── Formatting body ─────────────────────────────────────────────── */
function FormattingIssueItem({ item }) {
  const [open, setOpen] = useState(true)
  if (!item?.issue) return null
  return (
    <div
      className="fmt-issue"
      onClick={() => setOpen(o => !o)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}
    >
      <div className="fmt-issue__row" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span className="fmt-issue__section">{item.section}</span>
        <span className="fmt-issue__issue" style={{ flex: 1 }}>{item.issue}</span>
        {item.suggestion && <span className="imp-item__chevron">{open ? '▴' : '▾'}</span>}
      </div>
      {open && item.suggestion && (
        <div className="fmt-issue__suggestion">
          <span className="fmt-issue__suggestion-label">Suggestion</span>
          {item.suggestion}
        </div>
      )}
    </div>
  )
}

function FormattingBody({ sec }) {
  if (!sec) return null
  const issues = Array.isArray(sec.issues) ? sec.issues.filter(x => x?.issue) : []
  return (
    <>
      <FeedbackIntro text={sec.feedback} />
      {issues.length > 0 && (
        <div className="section-group">
          <div className="group-label group-label--amber">Issues <span className="group-label__count">({issues.length})</span></div>
          {issues.map((item, i) => <FormattingIssueItem key={i} item={item} />)}
        </div>
      )}
    </>
  )
}

/* ── Language grammar body ───────────────────────────────────────── */
function LanguageIssueItem({ item }) {
  if (!item?.original) return null
  return (
    <div className="lang-issue">
      <div className="lang-issue__type">{item.type}</div>
      <div className="lang-issue__original">{item.original}</div>
      <div className="lang-issue__arrow">→</div>
      <div className="lang-issue__corrected">{item.corrected}</div>
    </div>
  )
}

function LanguageBody({ sec }) {
  if (!sec) return null
  const issues = Array.isArray(sec.issues) ? sec.issues.filter(x => x?.original) : []
  return (
    <>
      <FeedbackIntro text={sec.feedback} />
      {issues.length > 0 && (
        <div className="section-group">
          <div className="group-label group-label--amber">Issues <span className="group-label__count">({issues.length})</span></div>
          {issues.map((item, i) => <LanguageIssueItem key={i} item={item} />)}
        </div>
      )}
    </>
  )
}

/* ── Action items card ───────────────────────────────────────────── */
function ActionItemsCard({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null
  return (
    <SectionCard id="sec-actions" title="Priority action items">
      <div className="action-list">
        {items.map((item, i) => (
          <div key={i} className="action-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span className="action-item__num" style={{ flexShrink: 0 }}>{i + 1}</span>
            <span className="action-item__text" style={{ flex: 1 }}>{item}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

/* ── ATS analysis card ───────────────────────────────────────────── */
function ATSAnalysisCard({ ats }) {
  if (!ats) return null
  const hits  = Array.isArray(ats.keyword_hits)  ? ats.keyword_hits  : []
  const gaps  = Array.isArray(ats.keyword_gaps)  ? ats.keyword_gaps  : []
  const risks = Array.isArray(ats.heading_risks) ? ats.heading_risks : []
  const tips  = Array.isArray(ats.ats_tips)      ? ats.ats_tips      : []

  return (
    <SectionCard
      id="sec-ats"
      title="ATS analysis"
      score={typeof ats.ats_score === 'number' ? ats.ats_score : undefined}
    >
      {(ats.inferred_role || ats.inferred_industry) && (
        <div className="ats-meta">
          {ats.inferred_role && <span className="ats-meta__item"><strong>Inferred role:</strong> {ats.inferred_role}</span>}
          {ats.inferred_industry && <span className="ats-meta__item"><strong>Industry:</strong> {ats.inferred_industry}</span>}
        </div>
      )}

      {(hits.length > 0 || gaps.length > 0) && (
        <div className="keyword-row">
          {hits.length > 0 && (
            <div className="keyword-col">
              <div className="group-label group-label--green">Keywords found <span className="group-label__count">({hits.length})</span></div>
              <div className="keyword-chips">
                {hits.map((k, i) => <span key={i} className="keyword-chip keyword-chip--hit">{k}</span>)}
              </div>
            </div>
          )}
          {gaps.length > 0 && (
            <div className="keyword-col">
              <div className="group-label group-label--red">Keyword gaps <span className="group-label__count">({gaps.length})</span></div>
              <div className="keyword-chips">
                {gaps.map((k, i) => <span key={i} className="keyword-chip keyword-chip--gap">{k}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {risks.length > 0 && (
        <div className="section-group" style={{ marginTop: 14 }}>
          <div className="group-label group-label--amber">Heading risks <span className="group-label__count">({risks.length})</span></div>
          {risks.map((r, i) => (
            <div key={i} className="heading-risk">
              <span className="heading-risk__original">"{r.original}"</span>
              <span className="heading-risk__arrow">→</span>
              <span className="heading-risk__recommended">"{r.recommended}"</span>
              <div className="heading-risk__issue">{r.issue}</div>
            </div>
          ))}
        </div>
      )}

      {tips.length > 0 && (
        <div className="section-group" style={{ marginTop: 14 }}>
          <div className="group-label group-label--green">ATS tips</div>
          {tips.map((tip, i) => (
            <div key={i} className="ats-tip" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span className="ats-tip__num" style={{ flexShrink: 0 }}>{i + 1}</span>
              <span className="ats-tip__text" style={{ flex: 1 }}>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

/* ── Job match card ──────────────────────────────────────────────── */
function JobMatchCard({ match }) {
  if (!match) return null
  const matched = Array.isArray(match.matched_keywords) ? match.matched_keywords : []
  const partial = Array.isArray(match.partial_keywords) ? match.partial_keywords : []
  const missing = Array.isArray(match.missing_keywords) ? match.missing_keywords : []
  const recs    = Array.isArray(match.recommendations)  ? match.recommendations  : []

  return (
    <SectionCard id="sec-jobmatch" title="Job match" score={match.match_score}>
      <div className="job-match-grid">
        {matched.length > 0 && (
          <div className="keyword-col">
            <div className="group-label group-label--green">Matched <span className="group-label__count">({matched.length})</span></div>
            <div className="keyword-chips">
              {matched.map((k, i) => <span key={i} className="keyword-chip keyword-chip--hit">{k}</span>)}
            </div>
          </div>
        )}
        {partial.length > 0 && (
          <div className="keyword-col">
            <div className="group-label group-label--amber">Partial <span className="group-label__count">({partial.length})</span></div>
            {partial.map((p, i) => (
              <div key={i} className="partial-keyword">
                <span>{p.resume_term}</span>
                <span className="partial-keyword__arrow">→</span>
                <span className="partial-keyword__target">{p.required_term}</span>
              </div>
            ))}
          </div>
        )}
        {missing.length > 0 && (
          <div className="keyword-col">
            <div className="group-label group-label--red">Missing <span className="group-label__count">({missing.length})</span></div>
            {missing.map((m, i) => (
              <div key={i} className="missing-keyword">
                <span className={`priority-badge ${priorityClass(m.priority)}`}>{m.priority}</span>
                <span>{m.keyword}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {recs.length > 0 && (
        <div className="section-group" style={{ marginTop: 14 }}>
          <div className="section-divider" style={{ marginBottom: 14 }} />
          <div className="group-label group-label--green">Recommendations</div>
          {recs.map((r, i) => (
            <div key={i} className="action-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span className="action-item__num" style={{ flexShrink: 0 }}>{i + 1}</span>
              <span className="action-item__text" style={{ flex: 1 }}>{r}</span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

/* ── PDFPanel ────────────────────────────────────────────────────── */
// Renders the uploaded resume as a scrollable PDF using react-pdf.
// PDF source priority: uploadedFile blob URL → feedback?.fileUrl → render nothing.
// DOCX detection uses the MIME type so it works regardless of filename casing.
// The blob URL is stored in objUrlRef and only created once per File reference.
// URL.revokeObjectURL is called on unmount and before each new URL is created.
function PDFPanel({ uploadedFile, feedback, pdfWidth, numPages, setNumPages }) {
  const [pdfError, setPdfError] = useState(null)
  const [blobUrl, setBlobUrl] = useState(null)
  const objUrlRef = useRef(null)

  const isDocx =
    uploadedFile?.type ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

  useEffect(() => {
    // Revoke the previous object URL before creating a new one
    if (objUrlRef.current) {
      URL.revokeObjectURL(objUrlRef.current)
      objUrlRef.current = null
    }
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile)
      objUrlRef.current = url
      setBlobUrl(url)
    } else {
      setBlobUrl(null)
    }
    return () => {
      if (objUrlRef.current) {
        URL.revokeObjectURL(objUrlRef.current)
        objUrlRef.current = null
      }
    }
  }, [uploadedFile])

  // Priority: blob URL from uploadedFile → backend fileUrl → nothing
  const pdfSrc = blobUrl || feedback?.fileUrl || null

  if (isDocx) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
        <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>Word document</div>
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
          PDF preview is not available for .docx files. Review the AI feedback in the right panel.
        </div>
      </div>
    )
  }

  if (!pdfSrc) return null

  return (
    <>
      {pdfError && (
        <div style={{ padding: '10px 14px', marginBottom: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#be3535', fontSize: 12 }}>
          Failed to load PDF: {pdfError}
        </div>
      )}
      <Document
        file={pdfSrc}
        onLoadSuccess={({ numPages: n }) => { setNumPages(n); setPdfError(null) }}
        onLoadError={e => setPdfError(e.message || 'Unknown error')}
        loading={
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Loading PDF…
          </div>
        }
      >
        {numPages > 0 && Array.from({ length: numPages }, (_, i) => (
          <div
            key={i}
            style={{ marginBottom: 8, boxShadow: '0 1px 6px rgba(0,0,0,.15)', borderRadius: 2, overflow: 'hidden' }}
          >
            <Page
              pageNumber={i + 1}
              width={pdfWidth || undefined}
              renderTextLayer
              renderAnnotationLayer
            />
          </div>
        ))}
      </Document>
    </>
  )
}

/* ── ResultsView ─────────────────────────────────────────────────── */
export default function ResultsView({
  filename, isSample, feedback, isLoading, streamError,
  jobRole, setJobRole, jobAd, setJobAd,
  onReanalyse, onUploadNew, onNewFile,
  uploadedFile,
}) {
  const [enhanceOpen, setEnhanceOpen] = useState(false)
  const [activeNav,   setActiveNav]   = useState('overall')
  const [numPages,    setNumPages]     = useState(0)
  const [pdfWidth,    setPdfWidth]     = useState(null)
  const [headerH,     setHeaderH]      = useState(148)
  const [isMobile,    setIsMobile]     = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  )

  const stickyRef       = useRef()
  const fileInputRef    = useRef()
  const pdfContainerRef = useRef()

  // Measure sticky header height for left-panel sticky offset
  useEffect(() => {
    const el = stickyRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeaderH(el.offsetHeight ?? 148))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Measure PDF container width for react-pdf page scaling
  useEffect(() => {
    const el = pdfContainerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth
      setPdfWidth(w > 32 ? w - 32 : w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Responsive layout: stack below 768 px
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Scroll the feedback panel to a section card
  const scrollToSection = id => {
    setActiveNav(id)
    const el = document.getElementById(`sec-${id}`)
    if (!el) return
    const hh = stickyRef.current?.offsetHeight ?? 140
    const top = el.getBoundingClientRect().top + window.scrollY - hh - 8
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const handleDownloadPDF = () => {
    const element = document.querySelector('.rr-results')
    if (!element) return
    const opt = {
      margin:      [0.3, 0.3, 0.3, 0.3],
      filename:    `Resume_Review_${filename ? filename.replace('.pdf', '') : 'Result'}.pdf`,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2, useCORS: true, scrollY: 0,
        onclone: clonedDoc => {
          clonedDoc
            .querySelectorAll('.sec-nav, .cta-strip, .sticky-header, .sample-notice, .stream-warning, [data-pdf-panel]')
            .forEach(el => (el.style.display = 'none'))
        },
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    }
    html2pdf().set(opt).from(element).save()
  }

  const overallScore = typeof feedback?.overall_score === 'number' ? feedback.overall_score : null
  const hasJobMatch  = feedback?.job_match != null

  const navItems = [
    { id: 'overall',  label: 'Overall',   score: null },
    { id: 'content',  label: 'Content',   score: feedback?.content_quality?.score },
    { id: 'language', label: 'Language',  score: feedback?.language_grammar?.score },
    { id: 'format',   label: 'Format',    score: feedback?.formatting?.score },
    { id: 'actions',  label: 'Actions',   score: null },
    { id: 'ats',      label: 'ATS',       score: feedback?.ats_analysis?.ats_score },
    ...(hasJobMatch ? [{ id: 'jobmatch', label: 'Job match', score: feedback?.job_match?.match_score }] : []),
  ]

  return (
    <div className="rr-results">
      {isSample && (
        <div className="sample-notice">
          👁 This is a sample review — <strong>upload your own resume</strong> to get personalised feedback
        </div>
      )}

      {/* ── Sticky header (full width) ──────────────────────────────── */}
      <div className="sticky-header" ref={stickyRef}>
        <div className="result-banner">
          <div className="result-banner__inner">
            <button
              className="file-pill file-pill--swap"
              title="Click to upload a different resume"
              onClick={() => fileInputRef.current.click()}
            >
              <svg width="11" height="14" viewBox="0 0 11 14">
                <rect x="1" y="1" width="7.5" height="11.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 1v3.5h3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              {displayFilename(filename)}
              <span className="file-pill__swap-icon">↑</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files[0]; e.target.value = ''; if (f) onNewFile(f) }}
            />
            <button className="btn btn-sm btn-banner" onClick={() => setEnhanceOpen(o => !o)}>
              ✦ Add job context {enhanceOpen ? '▴' : '▾'}
            </button>
            <button className="btn btn-sm btn-reanalyse" onClick={onReanalyse} disabled={isLoading}>
              ↺ Re-analyse
            </button>
          </div>
        </div>

        {enhanceOpen && (
          <div className="enhance-strip">
            <div className="enhance-strip__fields">
              <div className="form-group">
                <label className="form-label">Target job role</label>
                <input
                  className="form-input"
                  placeholder="e.g. Electrical Engineer"
                  value={jobRole}
                  onChange={e => setJobRole(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Job advertisement</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Paste job description for job match analysis…"
                  value={jobAd}
                  onChange={e => setJobAd(e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-sm btn-reanalyse-strip" onClick={onReanalyse} disabled={isLoading}>
              Re-analyse ↺
            </button>
          </div>
        )}

        <div className="sec-nav">
          <div className="sec-nav__pills">
            {navItems.map(({ id, label, score }) => (
              <button
                key={id}
                className={`nav-pill${activeNav === id ? ' nav-pill--active' : ''}`}
                onClick={() => scrollToSection(id)}
              >
                {label}
                {typeof score === 'number' && <ScoreBadge score={score} small />}
              </button>
            ))}
          </div>
          <div className="sec-nav__actions">
            <button className="btn btn-ghost btn-sm" onClick={handleDownloadPDF}>⬇ PDF</button>
            <button className="btn btn-ghost btn-sm">✉ Email</button>
          </div>
        </div>
      </div>

      {/* ── Split pane ──────────────────────────────────────────────── */}
      {/* alignItems:flex-start is required for position:sticky to work on
          the left panel — flex stretch overrides sticky in most browsers. */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'flex-start' }}>

        {/* LEFT — PDF viewer (sticky sidebar) */}
        <div
          ref={pdfContainerRef}
          data-pdf-panel
          style={{
            position:     isMobile ? 'relative' : 'sticky',
            top:          isMobile ? 'auto' : headerH,
            width:        isMobile ? '100%' : '50%',
            height:       isMobile ? 420 : `calc(100vh - ${headerH}px)`,
            overflowY:    'auto',
            borderRight:  isMobile ? 'none' : '1px solid #e2ddd8',
            borderBottom: isMobile ? '1px solid #e2ddd8' : 'none',
            background:   '#f0ede8',
            padding:      16,
            boxSizing:    'border-box',
            flexShrink:   0,
          }}
        >
          <PDFPanel
            uploadedFile={uploadedFile}
            feedback={feedback}
            pdfWidth={pdfWidth}
            numPages={numPages}
            setNumPages={setNumPages}
          />
        </div>

        {/* RIGHT — Feedback cards */}
        <div style={{ flex: 1, minWidth: 0, padding: isMobile ? '20px 16px' : '24px 20px' }}>
          {/* Partial failure only. A total failure never reaches this view:
              ResumeReview routes it to ResumeAnalysisError, which states the
              cause and always offers a way out. This banner therefore always
              sits above feedback that did arrive. */}
          {streamError && (
            <div className="stream-warning" role="status">
              <span>⚠</span> This analysis stopped early, so some sections may be missing.
              {" "}What is shown below is accurate as far as it goes. Re-run the analysis for a complete review.
            </div>
          )}

          {/* Overall score */}
          <div className="overall-card" id="sec-overall">
            {overallScore !== null ? (
              <div className="overall-card__inner">
                <ScoreRing score={overallScore} size={96} />
                <div className="overall-card__text">
                  <div className="overall-card__row">
                    <h2 className="overall-card__heading">Overall score</h2>
                    <span className={`band-badge ${overallScore <= 40 ? 'band-badge--red' : overallScore <= 65 ? 'band-badge--amber' : 'band-badge--green'}`}>
                      {bandLabel(overallScore)}
                    </span>
                  </div>
                  <div className="overall-card__miniscores">
                    {[
                      { label: 'Content',  score: feedback?.content_quality?.score },
                      { label: 'Language', score: feedback?.language_grammar?.score },
                      { label: 'Format',   score: feedback?.formatting?.score },
                    ].filter(x => typeof x.score === 'number').map(({ label, score }) => (
                      <div key={label} className="miniscore">
                        <span className="miniscore__label">{label}</span>
                        <ScoreBadge score={score} small />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="overall-card__placeholder">
                <div className="ldot" /><div className="ldot" /><div className="ldot" />
              </div>
            )}
          </div>

          <div className="section-cards">
            {feedback?.content_quality && (
              <SectionCard
                id="sec-content"
                title="Content quality"
                score={feedback.content_quality.score}
              >
                <ContentBody sec={feedback.content_quality} />
              </SectionCard>
            )}

            {feedback?.language_grammar && (
              <SectionCard
                id="sec-language"
                title="Language & grammar"
                score={feedback.language_grammar.score}
              >
                <LanguageBody sec={feedback.language_grammar} />
              </SectionCard>
            )}

            {feedback?.formatting && (
              <SectionCard
                id="sec-format"
                title="Format & structure"
                score={feedback.formatting.score}
              >
                <FormattingBody sec={feedback.formatting} />
              </SectionCard>
            )}

            {feedback?.action_items && (
              <ActionItemsCard items={feedback.action_items} />
            )}

            {feedback?.ats_analysis && (
              <ATSAnalysisCard ats={feedback.ats_analysis} />
            )}

            {feedback?.job_match && (
              <JobMatchCard match={feedback.job_match} />
            )}
          </div>

          {!isLoading && overallScore !== null && (
            <div className="cta-strip">
              <div className="cta-strip__title">What next?</div>
              <div className="cta-strip__btns">
                <button className="btn btn-primary" onClick={onUploadNew}>↑ Upload new resume</button>
                <button className="btn btn-outline" onClick={handleDownloadPDF}>⬇ Download PDF</button>
                <button className="btn btn-outline">✉ Email to myself</button>
              </div>
              <div className="cta-strip__tip">
                <strong>Tip:</strong> Work through the priority action items first — each one is tied to a specific section and will have the biggest impact on recruiter shortlisting.
              </div>
            </div>
          )}
          <div style={{ height: 80 }} />
        </div>
      </div>
    </div>
  )
}
