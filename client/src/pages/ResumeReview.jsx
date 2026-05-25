import { useState, useEffect, useRef } from 'react'
import html2pdf from 'html2pdf.js'
import Navbar from '../components/Navbar'
import { streamResumeReview } from '../api/reviewResume'
import './ResumeReview.css'

/* ── Hardcoded sample data ───────────────────────────────────────── */
const SAMPLE = {
  overall_score: 52,
  formatting: {
    score: 61,
    feedback: 'The resume has a clear section structure and readable layout. However, several legacy Bangladeshi conventions are present that would limit performance in modern ATS systems used by multinationals.',
    issues: [
      { section: 'Contact header', issue: 'Missing LinkedIn URL', suggestion: 'Add your LinkedIn profile URL (e.g. linkedin.com/in/yourname) — Bangladeshi MNC recruiters increasingly verify digital footprints before shortlisting.' },
      { section: 'Skills', issue: '"Computer Knowledge" heading is outdated', suggestion: 'Rename to "Technical Skills" — modern recruiters and ATS systems expect this standard heading.' },
      { section: 'Footer', issue: 'Declaration section adds no value', suggestion: 'Remove the declaration section entirely to reclaim space for skills or achievements.' },
    ],
  },
  content_quality: {
    score: 48,
    feedback: 'The educational background is solid but the experience section critically lacks quantified achievements. Recruiters will not shortlist without specific outcomes using the CAR method.',
    strengths: [
      'Educational background shows relevant qualification (Diploma in Power Technology)',
      'Training section includes practical hands-on skills aligned to the electrical sector',
    ],
    weaknesses: [
      'Experience section lists topic areas only — no actual job roles, employers, dates, or outcomes',
      'Career objective is generic ("seeking a challenging position in a dynamic environment") — replace with a targeted professional summary naming the power sector and your key qualifications',
      'Training entries missing date ranges — show "Jan 2023 – Mar 2023", not just "3 months"',
    ],
  },
  language_grammar: {
    score: 61,
    feedback: 'Generally readable, but weak verb choices and vague descriptors reduce professional impact. British English should be standardised throughout.',
    issues: [
      { original: 'Responsible for handling electrical maintenance', corrected: 'Spearheaded electrical maintenance operations for a 12-unit residential complex', type: 'Weak action verb' },
      { original: 'Good command in English', corrected: 'Professional working proficiency in English (IELTS 6.5)', type: 'Vague language descriptor' },
      { original: 'organization (used alongside "organisation")', corrected: 'organisation — standardise to British English throughout', type: 'British/American English mix' },
    ],
  },
  action_items: [
    'Experience section: Add at least 2 real job roles with employer, date range, and 2–3 CAR-method bullet points each — this is the single biggest gap recruiters will flag.',
    'Training section: Add start–end dates to all entries (e.g. "Jan 2023 – Mar 2023") — dates show WHEN you trained, not just how long.',
    'Career objective: Replace with a 2-sentence professional summary targeting a specific sector (power, electrical, or renewable energy) and naming your strongest qualification.',
    'Skills section: Research 5 current job ads in your target sector and mirror their exact keyword language — ATS systems score heavily on keyword match.',
  ],
  ats_analysis: {
    inferred_role: 'Electrical Engineer',
    inferred_industry: 'Power & Energy',
    keyword_hits: ['Electrical Wiring', 'Power Systems', 'Industrial Attachment', 'AutoCAD', 'Circuit Design'],
    keyword_gaps: ['PLC Programming', 'SCADA', 'Load Flow Analysis', 'IEEE Standards', 'Energy Audit'],
    heading_risks: [
      { original: 'Computer Knowledge', issue: 'Non-standard heading — many ATS systems will fail to map this to a recognised section', recommended: 'Technical Skills' },
    ],
    ats_tips: [
      'Add "PLC Programming" and "SCADA" explicitly to the Technical Skills section — these are high-frequency keywords in Bangladeshi power sector job ads.',
      'Replace the "Computer Knowledge" heading with "Technical Skills" — ATS parsers at multinationals use this as the standard identifier.',
      'Include the CGPA denominator for all academic entries (e.g. "3.72/4.00") — missing denominators cause ATS misreads on the dual 4.00/5.00 Bangladesh scale.',
    ],
    standard: 'international/multinational ATS',
    ats_score: 44,
  },
  job_match: null,
}

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

/* ── Shared section card shell ───────────────────────────────────── */
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

/* ── Shared feedback intro ───────────────────────────────────────── */
function FeedbackIntro({ text }) {
  if (!text) return null
  return <p className="section-feedback">{text}</p>
}

/* ── Strength / weakness items ───────────────────────────────────── */
function StrengthItem({ text }) {
  return (
    <div className="strength-item">
      <span className="strength-item__check">
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
    <div className="weakness-item">
      <span className="weakness-item__dot" />
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
      <div className="fmt-issue__row">
        <span className="fmt-issue__section">{item.section}</span>
        <span className="fmt-issue__issue">{item.issue}</span>
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
          <div key={i} className="action-item">
            <span className="action-item__num">{i + 1}</span>
            <span className="action-item__text">{item}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

/* ── ATS analysis card ───────────────────────────────────────────── */
function ATSAnalysisCard({ ats }) {
  if (!ats) return null
  const hits   = Array.isArray(ats.keyword_hits)  ? ats.keyword_hits  : []
  const gaps   = Array.isArray(ats.keyword_gaps)  ? ats.keyword_gaps  : []
  const risks  = Array.isArray(ats.heading_risks) ? ats.heading_risks : []
  const tips   = Array.isArray(ats.ats_tips)      ? ats.ats_tips      : []

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
            <div key={i} className="ats-tip">
              <span className="ats-tip__num">{i + 1}</span>
              <span className="ats-tip__text">{tip}</span>
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
  const matched = Array.isArray(match.matched_keywords)  ? match.matched_keywords  : []
  const partial = Array.isArray(match.partial_keywords)  ? match.partial_keywords  : []
  const missing = Array.isArray(match.missing_keywords)  ? match.missing_keywords  : []
  const recs    = Array.isArray(match.recommendations)   ? match.recommendations   : []

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
            <div key={i} className="action-item">
              <span className="action-item__num">{i + 1}</span>
              <span className="action-item__text">{r}</span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
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
function UploadView({ file, setFile, jobRole, setJobRole, jobAd, setJobAd, marketMode, setMarketMode, onAnalyse, onSample }) {
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

          <div className="market-mode-card">
            <div className="market-mode-label">
              <span className="market-mode-icon">🎯</span>
              <span className="market-mode-title">Who are you applying to?</span>
            </div>
            <div className="market-mode-options">
              <button
                className={`market-mode-btn ${marketMode === 'bangladesh' ? 'market-mode-btn--active' : ''}`}
                onClick={() => setMarketMode('bangladesh')}
              >
                <span className="market-mode-btn-label">Bangladesh employers</span>
                <span className="market-mode-btn-desc">
                  Personal details, declarations and local conventions are treated as standard practice
                </span>
              </button>
              <button
                className={`market-mode-btn ${marketMode === 'international' ? 'market-mode-btn--active' : ''}`}
                onClick={() => setMarketMode('international')}
              >
                <span className="market-mode-btn-label">International / multinational</span>
                <span className="market-mode-btn-desc">
                  Personal details, declarations and photos flagged for removal per Western standards
                </span>
              </button>
            </div>
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
                  <label className="form-label">Job advertisement <span className="optional">(optional — paste for job match analysis)</span></label>
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
            ['📋', 'Content quality', 'Specific experience, CAR-method achievements, and quantified outcomes.'],
            ['✏️', 'Language & grammar', 'Tense consistency, strong action verbs, and professional tone.'],
            ['📐', 'Format & structure', 'ATS-friendly headings, section order, and contact completeness.'],
            ['🔍', 'ATS analysis', 'Keyword coverage, heading risks, and role-specific gap analysis.'],
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
    'Analysing ATS compatibility…',
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

  const handleDownloadPDF = () => {
    const element = document.querySelector('.rr-results');
    if (!element) return;

    const opt = {
      margin:       [0.3, 0.3, 0.3, 0.3],
      filename:     `Resume_Review_${filename ? filename.replace('.pdf', '') : 'Result'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const els = clonedDoc.querySelectorAll('.sec-nav, .cta-strip, .sticky-header, .sample-notice, .stream-warning');
          els.forEach(el => el.style.display = 'none');
        }
      },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const overallScore = typeof feedback?.overall_score === 'number' ? feedback.overall_score : null
  const hasJobMatch  = feedback?.job_match != null

  const navItems = [
    { id: 'overall',   label: 'Overall',   score: null },
    { id: 'content',   label: 'Content',   score: feedback?.content_quality?.score },
    { id: 'language',  label: 'Language',  score: feedback?.language_grammar?.score },
    { id: 'format',    label: 'Format',    score: feedback?.formatting?.score },
    { id: 'actions',   label: 'Actions',   score: null },
    { id: 'ats',       label: 'ATS',       score: feedback?.ats_analysis?.ats_score },
    ...(hasJobMatch ? [{ id: 'jobmatch', label: 'Job match', score: feedback?.job_match?.match_score }] : []),
  ]

  return (
    <div className="rr-results">
      {isSample && (
        <div className="sample-notice">
          👁 This is a sample review — <strong>upload your own resume</strong> to get personalised feedback
        </div>
      )}

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
                onClick={() => scrollTo(id)}
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

      <div className="rr-content">
        {streamError && (
          <div className="stream-warning">
            <span>⚠</span> Feedback may be incomplete: {streamError}
          </div>
        )}

        {/* Overall score card */}
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
          {/* Content quality */}
          {feedback?.content_quality && (
            <SectionCard id="sec-content" title="Content quality" score={feedback.content_quality.score}>
              <ContentBody sec={feedback.content_quality} />
            </SectionCard>
          )}

          {/* Language & grammar */}
          {feedback?.language_grammar && (
            <SectionCard id="sec-language" title="Language & grammar" score={feedback.language_grammar.score}>
              <LanguageBody sec={feedback.language_grammar} />
            </SectionCard>
          )}

          {/* Formatting */}
          {feedback?.formatting && (
            <SectionCard id="sec-format" title="Format & structure" score={feedback.formatting.score}>
              <FormattingBody sec={feedback.formatting} />
            </SectionCard>
          )}

          {/* Action items */}
          {feedback?.action_items && (
            <ActionItemsCard items={feedback.action_items} />
          )}

          {/* ATS analysis */}
          {feedback?.ats_analysis && (
            <ATSAnalysisCard ats={feedback.ats_analysis} />
          )}

          {/* Job match (only when job ad was provided) */}
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
  )
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function ResumeReview() {
  const [view, setView] = useState('upload')
  const [file, setFile] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [jobAd, setJobAd] = useState('')
  const [marketMode, setMarketMode] = useState('bangladesh')
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
      marketMode,
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
          marketMode={marketMode}
          setMarketMode={setMarketMode}
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
