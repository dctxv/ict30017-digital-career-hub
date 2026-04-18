import { useState } from 'react'
import Navbar from '../components/Navbar'
import { streamResumeReview } from '../api/reviewResume'
import './ResumeReview.css'

function FeedbackCards({ feedback }) {
  if (!feedback) return null

  const formatting = feedback.formatting_feedback
  const content = feedback.content_quality
  const language = feedback.language_and_grammar
  const actions = Array.isArray(feedback.action_items) ? feedback.action_items : []

  return (
    <>
      {typeof feedback.overall_score === 'number' && (
        <div className="fb-score-banner">
          <span className="fb-score-label">Overall score</span>
          <span className="fb-score-value">{feedback.overall_score} / 10</span>
        </div>
      )}

      <FeedbackSection
        title="Content quality"
        tone="green"
        section={content}
      />
      <FeedbackSection
        title="Language and grammar"
        tone="amber"
        section={language}
      />
      <FeedbackSection
        title="Formatting and structure"
        tone="blue"
        section={formatting}
      />

      {actions.length > 0 && (
        <div className="fb-section fb-section--green">
          <div className="fb-header">
            <span className="fb-heading">Action items</span>
            <span className="fb-pill fb-pill--green">{actions.length} items</span>
          </div>
          <ul className="fb-list">
            {actions.map((t, i) => (
              typeof t === 'string' && t.length > 0 ? (
                <li key={i}><span className="fb-dot fb-dot--green" />{t}</li>
              ) : null
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

function FeedbackSection({ title, tone, section }) {
  if (!section || typeof section !== 'object') return null

  const strengths = Array.isArray(section.strengths) ? section.strengths.filter(s => typeof s === 'string' && s.length) : []
  const improvements = Array.isArray(section.improvements) ? section.improvements.filter(s => typeof s === 'string' && s.length) : []
  const score = typeof section.score === 'number' ? section.score : null

  if (strengths.length === 0 && improvements.length === 0 && score === null) return null

  return (
    <div className={`fb-section fb-section--${tone}`}>
      <div className="fb-header">
        <span className="fb-heading">{title}</span>
        {score !== null && (
          <span className={`fb-pill fb-pill--${tone}`}>{score} / 10</span>
        )}
      </div>
      {strengths.length > 0 && (
        <>
          <div className="fb-subheading">Strengths</div>
          <ul className="fb-list">
            {strengths.map((t, i) => (
              <li key={`s-${i}`}><span className={`fb-dot fb-dot--${tone}`} />{t}</li>
            ))}
          </ul>
        </>
      )}
      {improvements.length > 0 && (
        <>
          <div className="fb-subheading">Improvements</div>
          <ul className="fb-list">
            {improvements.map((t, i) => (
              <li key={`i-${i}`}><span className={`fb-dot fb-dot--${tone}`} />{t}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default function ResumeReview() {
  const [file, setFile] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [jobAd, setJobAd] = useState('')
  const [analysed, setAnalysed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [streamError, setStreamError] = useState(null)

  function handleFile(e) {
    const f = e.target.files[0]
    if (f) setFile(f)
  }

  function handleDrop(e) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  async function analyse() {
    if (!file) return
    setLoading(true)
    setAnalysed(false)
    setFeedback(null)
    setStreamError(null)

    await streamResumeReview(file, {
      onPartial: (partial) => {
        setFeedback(partial)
        setAnalysed(true)
      },
      onDone: (final) => {
        setFeedback(final)
        setAnalysed(true)
        setLoading(false)
      },
      onError: (_code, msg) => {
        setStreamError(msg || 'Something went wrong during analysis.')
        setLoading(false)
      },
    })
  }

  return (
    <div className="page-enter">
      <Navbar user={{ name: 'Isar Ujoodah' }} />
      <div className="rr-layout">
        <div className="rr-left">
          <h1 className="rr-title">Resume review</h1>
          <p className="rr-sub">Upload your resume to receive AI-powered feedback tailored to the Bangladeshi job market.</p>

          <div
            className={`upload-zone ${file ? 'upload-zone--filled' : ''}`}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            {file ? (
              <>
                <div className="upload-file-icon">📄</div>
                <div className="upload-file-name">{file.name}</div>
                <button className="upload-change" onClick={() => setFile(null)}>Change file</button>
              </>
            ) : (
              <>
                <div className="upload-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 16V4M12 4L8 8M12 4L16 8" stroke="var(--green-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 18v2a1 1 0 001 1h14a1 1 0 001-1v-2" stroke="var(--green-500)" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="upload-text">Drag and drop your resume here</div>
                <div className="upload-hint">PDF or DOCX — maximum 3MB</div>
                <label className="btn-upload">
                  Choose file
                  <input type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={handleFile} />
                </label>
              </>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Target job role <span className="optional">(optional but recommended)</span></label>
            <input className="form-input" placeholder="e.g. Software Engineer, Financial Analyst, Civil Engineer"
              value={jobRole} onChange={e => setJobRole(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Job advertisement <span className="optional">(optional — paste for gap analysis)</span></label>
            <textarea className="form-textarea" rows={4}
              placeholder="Paste the job advertisement text here to compare your resume against it..."
              value={jobAd} onChange={e => setJobAd(e.target.value)} />
          </div>

          <div className="tier-warning">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0}}>
              <circle cx="7" cy="7" r="6" stroke="var(--amber-text)" strokeWidth="1.2"/>
              <path d="M7 4v3M7 9.5v.5" stroke="var(--amber-text)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Free plan — 3 reviews remaining this month. <a href="/register" className="link-upgrade">Upgrade for unlimited access →</a>
          </div>

          <button className="btn-analyse" onClick={analyse} disabled={!file || loading}>
            {loading ? 'Analysing...' : 'Analyse my resume'}
          </button>
        </div>

        <div className="rr-right">
          <h2 className="rr-title">Feedback</h2>
          {streamError ? (
            <div className="fb-empty fb-empty--error">
              <div className="fb-empty-icon">⚠️</div>
              <p>{streamError}</p>
            </div>
          ) : analysed && feedback ? (
            <>
              <p className="rr-sub">Results for: <strong>{file?.name}</strong>{jobRole ? ` — ${jobRole}` : ''}</p>
              <FeedbackCards feedback={feedback} />
            </>
          ) : loading ? (
            <div className="fb-empty">
              <div className="fb-empty-icon fb-empty-icon--spin">⏳</div>
              <p>Analysing your resume…</p>
            </div>
          ) : (
            <div className="fb-empty">
              <div className="fb-empty-icon">🔍</div>
              <p>Upload your resume and click "Analyse" to see your feedback here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
