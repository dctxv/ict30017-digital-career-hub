import { useState } from 'react'
import Navbar from '../components/Navbar'
import './ResumeReview.css'

const mockFeedback = {
  general: [
    'Your objective statement is too generic — specify your target role and key strengths in 2 sentences.',
    'Work experience section lacks measurable outcomes. Add numbers where possible (e.g. "reduced load time by 30%").',
    'Skills section lists generic tools — organise by category (Programming, Frameworks, Tools).',
  ],
  spelling: [
    'Line 14: "Mangaed" should be "Managed"',
    'Inconsistent date format — use MM/YYYY throughout',
    'Mixed use of past and present tense in job descriptions',
  ],
  gaps: [
    'Job ad requires "REST API experience" — not mentioned in your resume',
    'Missing keyword: "Agile methodology"',
    'Role requires "team leadership" — no evidence in current resume',
    'Missing: "PostgreSQL" listed in job requirements',
  ],
}

export default function ResumeReview() {
  const [file, setFile] = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [jobAd, setJobAd] = useState('')
  const [analysed, setAnalysed] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleFile(e) {
    const f = e.target.files[0]
    if (f) setFile(f)
  }

  function handleDrop(e) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  function analyse() {
    if (!file) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setAnalysed(true) }, 1800)
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
          {analysed ? (
            <>
              <p className="rr-sub">Results for: <strong>{file?.name}</strong>{jobRole ? ` — ${jobRole}` : ''}</p>
              <div className="fb-section fb-section--green">
                <div className="fb-header">
                  <span className="fb-heading">General improvements</span>
                  <span className="fb-pill fb-pill--green">72 / 100</span>
                </div>
                <ul className="fb-list">
                  {mockFeedback.general.map((t, i) => (
                    <li key={i}><span className="fb-dot fb-dot--green" />{t}</li>
                  ))}
                </ul>
              </div>
              <div className="fb-section fb-section--amber">
                <div className="fb-header">
                  <span className="fb-heading">Spelling and consistency</span>
                  <span className="fb-pill fb-pill--amber">{mockFeedback.spelling.length} issues</span>
                </div>
                <ul className="fb-list">
                  {mockFeedback.spelling.map((t, i) => (
                    <li key={i}><span className="fb-dot fb-dot--amber" />{t}</li>
                  ))}
                </ul>
              </div>
              {jobAd && (
                <div className="fb-section fb-section--blue">
                  <div className="fb-header">
                    <span className="fb-heading">Job ad gap analysis</span>
                    <span className="fb-pill fb-pill--blue">{mockFeedback.gaps.length} gaps found</span>
                  </div>
                  <ul className="fb-list">
                    {mockFeedback.gaps.map((t, i) => (
                      <li key={i}><span className="fb-dot fb-dot--blue" />{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="fb-actions">
                <button className="btn-translate">Translate to Bangla</button>
                <button className="btn-download">Download PDF report</button>
              </div>
            </>
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