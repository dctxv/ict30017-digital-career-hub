import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { streamResumeReview } from '../api/reviewResume'
import './ResumeReview.css'

/* ── Hardcoded sample data (for "See a sample review") ──────────── */
const SAMPLE = {
  overall_score: 3,
  overall_summary: "Start with the Experience section — it's essentially empty and is the first gap Bangladeshi recruiters will flag. Add real roles, dates, and outcomes using the CAR method.",
  content_quality: {
    score: 2,
    strengths: [
      'Educational background shows relevant qualification (Diploma in Power Technology)',
      'Training includes practical skills — Electrical House Wiring, Industrial Attachment',
    ],
    improvements: [
      { level: 'critical', head: 'Experience section is essentially empty', detail: 'Only lists topic areas without actual job roles, employers, dates, or descriptions. Add real entries using the CAR method (Context, Action, Result) — this is the single biggest gap recruiters will flag.' },
      { level: 'critical', head: 'Training entries lack date ranges', detail: 'Show start–end dates e.g. Jan 2023 – Mar 2023. Recruiters need to know when you trained, not just how long.' },
      { level: 'important', head: 'Career objective is too vague', detail: 'Replace with a professional summary targeting a specific sector — e.g. power sector, electrical engineering, or renewable energy.' },
      { level: 'polish', head: 'Remove INTERESTS section', detail: '"Gaming, Internet browse" adds no professional value and may appear unprofessional to BD recruiters at MNCs.' },
    ],
  },
  language_and_grammar: {
    score: 4,
    strengths: [
      'Consistent punctuation maintained within most sections',
      'Generally readable structure throughout the document',
    ],
    improvements: [
      { level: 'important', head: 'Vague language proficiency descriptors', detail: 'Replace "fluent" and "Professional working proficiency" with specific levels (B2/C1) or test scores like IELTS 7.0. Bangladeshi MNCs expect specificity.' },
      { level: 'important', head: 'Career objective uses passive, vague language', detail: 'Use active verbs and specific role targets to sound more confident and direct. Avoid phrases like "seeking a suitable position".' },
      { level: 'polish', head: 'Inconsistent capitalisation in section headers', detail: 'Pick Title Case or ALL CAPS and apply it consistently throughout the document.' },
    ],
  },
  formatting_feedback: {
    score: 7,
    strengths: [
      'Sections are clearly separated and labelled',
      'Contact information is at the top and easy to find',
      'Good use of white space — the document is easy to scan',
    ],
    improvements: [
      { level: 'important', head: 'Missing LinkedIn URL', detail: 'Bangladeshi recruiters at MNCs increasingly verify digital footprints before interviews — add your LinkedIn profile URL to the contact section.' },
      { level: 'polish', head: 'Computer Knowledge lists outdated operating systems', detail: 'Remove Windows XP and Windows 7 — these signal an outdated skills profile to modern employers.' },
    ],
  },
  skills_keywords: {
    score: 5,
    strengths: [
      'Technical skills listed are relevant to the electrical engineering field',
      'Diploma subject areas broadly align with common Power sector role requirements',
    ],
    improvements: [
      { level: 'important', head: 'Skills section not aligned to target role keywords', detail: 'Research job ads in your target sector and mirror their exact keyword language — ATS systems score heavily on keyword match, and BD recruiters search for specific terms.' },
      { level: 'important', head: 'Renewable energy not mentioned', detail: 'Solar and renewable energy is a high-growth area in Bangladesh — if you have relevant training or interest, add it explicitly to increase matches with current job ads.' },
    ],
  },
}

/* ── Helpers ─────────────────────────────────────────────────────── */
const displayFilename = name => name.replace(/_/g, ' ')
const bandLabel = score => score <= 3 ? 'Needs significant work' : score <= 6 ? 'Functional but unoptimised' : score <= 8 ? 'Competitive' : 'Exemplary'
const scoreColorClass = score => score <= 4 ? 'sc-red' : score <= 6 ? 'sc-amber' : 'sc-green'
const scoreIcon = score => score <= 4 ? '⚠' : score <= 6 ? '!' : '✓'
const sectionHeaderClass = score => score <= 4 ? 'sh-red' : score <= 6 ? 'sh-amber' : 'sh-green'

/* ── ScoreBadge ──────────────────────────────────────────────────── */
function ScoreBadge({ score, small }) {
  if (typeof score !== 'number') return null
  return (
    <span className={`score-badge ${scoreColorClass(score)}${small ? ' score-badge--sm' : ''}`}>
      <span className="score-badge__icon">{scoreIcon(score)}</span>
      {score}/10
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
  const offset = drawn ? +((1 - score / 10) * circ).toFixed(2) : circ
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
        <span className="score-ring__denom">/10</span>
      </div>
    </div>
  )
}

/* ── ImprovementItem ─────────────────────────────────────────────── */
function ImprovementItem({ item }) {
  const [open, setOpen] = useState(item.level !== 'polish')
  if (!item || !item.head) return null
  const cls = item.level === 'critical' ? 'imp-crit' : item.level === 'important' ? 'imp-impt' : 'imp-pols'
  return (
    <div
      className={`imp-item ${cls}`}
      onClick={() => setOpen(o => !o)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}
    >
      <div className="imp-item__row">
        <span className="imp-item__dot" />
        <div className="imp-item__content">
          <div className="imp-item__head">{item.head}</div>
          {open && item.detail && (
            <div className="imp-item__detail">{item.detail}</div>
          )}
        </div>
        {item.detail && (
          <span className="imp-item__chevron">{open ? '▴' : '▾'}</span>
        )}
      </div>
    </div>
  )
}

/* ── SectionCard ─────────────────────────────────────────────────── */
function SectionCard({ id, sec }) {
  if (!sec || typeof sec !== 'object') return null

  const strengths = Array.isArray(sec.strengths) ? sec.strengths.filter(s => typeof s === 'string' && s) : []
  const allImprovements = Array.isArray(sec.improvements) ? sec.improvements.filter(x => x && x.head) : []

  const groups = [
    { key: 'critical', label: 'Critical fixes', colorClass: 'group-label--red', items: allImprovements.filter(x => x.level === 'critical') },
    { key: 'important', label: 'Important improvements', colorClass: 'group-label--amber', items: allImprovements.filter(x => x.level === 'important') },
    { key: 'polish', label: 'Polish', colorClass: 'group-label--muted', items: allImprovements.filter(x => x.level === 'polish') },
  ].filter(g => g.items.length)

  if (strengths.length === 0 && allImprovements.length === 0 && typeof sec.score !== 'number') return null

  return (
    <div className="section-card" id={id}>
      <div className={`section-card__header ${sectionHeaderClass(sec.score)}`}>
        <span className="section-card__title">{sec.label}</span>
        <ScoreBadge score={sec.score} />
      </div>
      <div className="section-card__body">
        {strengths.length > 0 && (
          <div className="section-group">
            <div className="group-label group-label--green">Strengths <span className="group-label__count">({strengths.length})</span></div>
            {strengths.map((s, i) => (
              <div key={i} className="strength-item">
                <span className="strength-item__check">
                  <svg width="10" height="8" viewBox="0 0 10 8">
                    <path d="M1 4l3 3 5-6" stroke="var(--green-700)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="strength-item__text">{s}</span>
              </div>
            ))}
          </div>
        )}
        {groups.length > 0 && strengths.length > 0 && <div className="section-divider" />}
        {groups.map(g => (
          <div key={g.key} className="section-group">
            <div className={`group-label ${g.colorClass}`}>
              {g.label} <span className="group-label__count">({g.items.length})</span>
            </div>
            {g.items.map((item, i) => <ImprovementItem key={i} item={item} />)}
          </div>
        ))}
      </div>
    </div>
  )
}

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
function UploadView({ file, setFile, jobRole, setJobRole, jobAd, setJobAd, onAnalyse, onSample }) {
  const [drag, setDrag] = useState(false)
  const [enhanceOpen, setEnhanceOpen] = useState(false)
  const inputRef = useRef()

  const pick = f => { if (f) setFile(f) }
  const handleDrop = e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }

  return (
    <div className="rr-content">
      <div className="rr-upload-header">
        <h1 className="rr-title">Resume review</h1>
        <p className="rr-sub">AI-powered feedback tailored to the Bangladeshi job market. Upload your resume to get started.</p>
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
          <div className="drop-zone__title">Drop your resume here</div>
          <div className="drop-zone__hint">PDF or DOCX · up to 3 MB</div>
          <button
            className="btn btn-outline"
            onClick={e => { e.stopPropagation(); inputRef.current.click() }}
          >
            Browse files
          </button>
          <input ref={inputRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={e => pick(e.target.files[0])} />
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
            <button className="btn btn-ghost btn-sm" onClick={() => setFile(null)}>✕ Remove</button>
          </div>

          <div className="enhance-card">
            <div className="enhance-card__trigger" onClick={() => setEnhanceOpen(o => !o)}>
              <span className="enhance-card__star">✦</span>
              <span className="enhance-card__label">Improve my analysis</span>
              <span className="enhance-card__hint">Add job role or ad for targeted feedback</span>
              <span className="enhance-card__chevron">{enhanceOpen ? '▴' : '▾'}</span>
            </div>
            {enhanceOpen && (
              <div className="enhance-card__fields">
                <div className="form-group">
                  <label className="form-label">Target job role <span className="optional">(optional)</span></label>
                  <input
                    className="form-input"
                    placeholder="e.g. Electrical Engineer, Power Sector"
                    value={jobRole}
                    onChange={e => setJobRole(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Job advertisement <span className="optional">(optional — paste for gap analysis)</span></label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Paste the job description here…"
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
            <span>Free plan — <strong>3 reviews remaining</strong> this month</span>
            <a href="/register" className="free-notice__upgrade">Upgrade for unlimited →</a>
          </div>
          <button className="btn btn-primary btn-full" onClick={onAnalyse}>
            Analyse my resume
          </button>
        </div>
      )}

      <div className="val-section">
        <div className="val-section__label">What the analysis covers</div>
        <div className="val-grid">
          {[
            ['📋', 'Content quality', 'Does your experience use the CAR method? Are dates, roles, and results specific?'],
            ['✏️', 'Language & grammar', 'Consistent tenses, professional tone, and specific proficiency levels.'],
            ['📐', 'Format & structure', 'ATS-friendly layout, correct section order, and complete contact details.'],
            ['🛠', 'Skills & keywords', 'Aligned to your target role and keywords BD recruiters actually search for.'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="val-card">
              <div className="val-card__icon">{icon}</div>
              <div className="val-card__title">{title}</div>
              <div className="val-card__desc">{desc}</div>
            </div>
          ))}
        </div>
        <div className="sample-card">
          <span className="sample-card__icon">👁</span>
          <div className="sample-card__text">
            <div className="sample-card__title">See a sample review</div>
            <div className="sample-card__sub">Understand what feedback looks like before uploading</div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onSample}>View sample →</button>
        </div>
      </div>
    </div>
  )
}

/* ── AnalysingView ───────────────────────────────────────────────── */
function AnalysingView({ filename }) {
  const msgs = [
    'Checking content completeness…',
    'Reviewing language quality…',
    'Evaluating format & structure…',
    'Matching skills to BD market…',
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
        <div className="analysing-text__title">Analysing your resume…</div>
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

/* ── ResultsView ─────────────────────────────────────────────────── */
function ResultsView({ filename, isSample, feedback, isLoading, streamError, jobRole, setJobRole, jobAd, setJobAd, onReanalyse, onUploadNew, onNewFile }) {
  const [enhanceOpen, setEnhanceOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('overall')
  const stickyRef = useRef()
  const fileInputRef = useRef()

  const scrollTo = id => {
    setActiveNav(id)
    const el = document.getElementById(`sec-${id}`)
    if (!el) return
    const headerH = stickyRef.current?.offsetHeight ?? 140
    const top = el.getBoundingClientRect().top + window.scrollY - 60 - headerH - 8
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const sections = [
    { id: 'content', label: 'Content', sec: feedback?.content_quality },
    { id: 'language', label: 'Language', sec: feedback?.language_and_grammar },
    { id: 'format', label: 'Format', sec: feedback?.formatting_feedback },
    { id: 'skills', label: 'Skills', sec: feedback?.skills_keywords },
  ]

  const overallScore = typeof feedback?.overall_score === 'number' ? feedback.overall_score : null

  return (
    <div className="rr-results">
      {isSample && (
        <div className="sample-notice">
          👁 This is a sample review — <strong>upload your own resume</strong> to get personalised feedback
        </div>
      )}

      {/* Single sticky block — banner + optional enhance strip + section nav */}
      <div className="sticky-header" ref={stickyRef}>
        <div className="result-banner">
          <div className="result-banner__inner">
            {/* Clickable file pill — opens file picker to swap resume */}
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
              onChange={e => {
                const f = e.target.files[0]
                e.target.value = ''
                if (f) onNewFile(f)
              }}
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
                <input
                  className="form-input"
                  placeholder="Paste job description…"
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
            <button
              className={`nav-pill${activeNav === 'overall' ? ' nav-pill--active' : ''}`}
              onClick={() => scrollTo('overall')}
            >
              Overall
            </button>
            {sections.map(({ id, label, sec }) => (
              <button
                key={id}
                className={`nav-pill${activeNav === id ? ' nav-pill--active' : ''}`}
                onClick={() => scrollTo(id)}
              >
                {label}
                {typeof sec?.score === 'number' && <ScoreBadge score={sec.score} small />}
              </button>
            ))}
          </div>
          <div className="sec-nav__actions">
            <button className="btn btn-ghost btn-sm">⬇ PDF</button>
            <button className="btn btn-ghost btn-sm">✉ Email</button>
          </div>
        </div>
      </div>

      <div className="rr-content">
        {streamError && (
          <div className="stream-warning">
            <span>⚠</span> Feedback may be incomplete: {streamError}
          </div>
        )}

        <div className="overall-card" id="sec-overall">
          {overallScore !== null ? (
            <div className="overall-card__inner">
              <ScoreRing score={overallScore} size={96} />
              <div className="overall-card__text">
                <div className="overall-card__row">
                  <h2 className="overall-card__heading">Overall score</h2>
                  <span className={`band-badge ${overallScore <= 4 ? 'band-badge--red' : overallScore <= 6 ? 'band-badge--amber' : 'band-badge--green'}`}>
                    {bandLabel(overallScore)}
                  </span>
                </div>
                {feedback?.overall_summary && (
                  <p className="overall-card__summary">{feedback.overall_summary}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="overall-card__placeholder">
              <div className="ldot" /><div className="ldot" /><div className="ldot" />
            </div>
          )}
        </div>

        <div className="section-cards">
          {sections.map(({ id, label, sec }) =>
            sec ? (
              <SectionCard key={id} id={`sec-${id}`} sec={{ ...sec, label }} />
            ) : null
          )}
        </div>

        {!isLoading && overallScore !== null && (
          <div className="cta-strip">
            <div className="cta-strip__title">What next?</div>
            <div className="cta-strip__btns">
              <button className="btn btn-primary" onClick={onUploadNew}>↑ Upload new resume</button>
              <button className="btn btn-outline">⬇ Download PDF</button>
              <button className="btn btn-outline">✉ Email to myself</button>
            </div>
            <div className="cta-strip__tip">
              <strong>Tip:</strong> Address the critical items in the section with the lowest score first — that will have the biggest impact.
            </div>
          </div>
        )}
        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function ResumeReview() {
  const [view, setView] = useState('upload')
  const [file, setFile] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [jobAd, setJobAd] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [streamError, setStreamError] = useState(null)
  const [filename, setFilename] = useState('')
  const [isSample, setIsSample] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function analyse(fileArg) {
    const f = (fileArg instanceof File) ? fileArg : file
    if (!f) return
    setIsLoading(true)
    setFeedback(null)
    setStreamError(null)
    setIsSample(false)
    setFilename(f.name)
    setView('analysing')

    await streamResumeReview(f, {
      jobRole: jobRole || undefined,
      jobAd: jobAd || undefined,
      onPartial: (partial) => {
        setFeedback(partial)
        setView('results')
      },
      onDone: (final) => {
        setFeedback(final)
        setView('results')
        setIsLoading(false)
      },
      onError: (_code, msg) => {
        setStreamError(msg || 'Something went wrong during analysis.')
        setView('results')
        setIsLoading(false)
      },
    })
  }

  function showSample() {
    setFeedback(SAMPLE)
    setFilename('Sample_Resume.pdf')
    setIsSample(true)
    setIsLoading(false)
    setStreamError(null)
    setView('analysing')
    setTimeout(() => setView('results'), 1400)
  }

  function handleReanalyse() {
    if (isSample) { setView('upload'); return }
    if (file) analyse(); else setView('upload')
  }

  function handleNewFile(f) {
    setFile(f)
    setView('upload')
  }

  return (
    <div className="rr-page">
      <Navbar user={{ name: 'Isar Ujoodah' }} />
      {view === 'upload' && (
        <UploadView
          file={file}
          setFile={setFile}
          jobRole={jobRole}
          setJobRole={setJobRole}
          jobAd={jobAd}
          setJobAd={setJobAd}
          onAnalyse={analyse}
          onSample={showSample}
        />
      )}
      {view === 'analysing' && <AnalysingView filename={filename} />}
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
        />
      )}
    </div>
  )
}
