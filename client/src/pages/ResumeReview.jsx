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
 * 2. i18next — all static UI copy (labels, buttons, hints) now goes through
 *    useTranslation()'s t(). The sample review ("View sample") is static demo
 *    copy written into this file, not real AI output, so it IS translated —
 *    SAMPLE_EN / SAMPLE_BN below, picked by the current i18next language and
 *    kept in sync if the user flips the language toggle while viewing it.
 *    Real AI-generated feedback (an actual analysed resume) stays untranslated
 *    until the backend AI-language wiring work (explicitly on hold) resumes.
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
import { useTranslation } from '../i18n/useTranslation'
import { streamResumeReview } from '../api/reviewResume'
import ResultsView from './ResultsView'
import './ResumeReview.css'

/* ── Hardcoded sample data ───────────────────────────────────────── */
/* This is static demo copy authored for this file, not real AI output, so
 * unlike actual resume feedback it IS translated. SAMPLE_EN / SAMPLE_BN carry
 * identical structure; the component below picks whichever matches the
 * current i18next language and re-picks it if the user switches language
 * while the sample is on screen. */
const SAMPLE_EN = {
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

const SAMPLE_BN = {
  overall_score: 52,
  formatting: {
    score: 61,
    feedback: 'জীবনবৃত্তান্তে স্পষ্ট বিভাগ কাঠামো ও সুপাঠ্য লেআউট রয়েছে। তবে বেশ কিছু পুরনো বাংলাদেশি রীতি রয়ে গেছে, যা বহুজাতিক প্রতিষ্ঠানগুলোর ব্যবহৃত আধুনিক ATS সিস্টেমে কর্মক্ষমতা সীমিত করবে।',
    issues: [
      { section: 'যোগাযোগ শিরোনাম', issue: 'LinkedIn URL অনুপস্থিত', suggestion: 'আপনার LinkedIn প্রোফাইলের URL যোগ করুন (যেমন: linkedin.com/in/yourname) — বাংলাদেশি বহুজাতিক প্রতিষ্ঠানের নিয়োগকর্তারা শর্টলিস্ট করার আগে ক্রমবর্ধমানভাবে ডিজিটাল উপস্থিতি যাচাই করছেন।' },
      { section: 'দক্ষতা', issue: '"Computer Knowledge" শিরোনামটি পুরনো', suggestion: '"Technical Skills"-এ পরিবর্তন করুন — আধুনিক নিয়োগকর্তা ও ATS সিস্টেম এই প্রমিত শিরোনাম আশা করে।' },
      { section: 'ফুটার', issue: 'ঘোষণা বিভাগ কোনো মূল্য যোগ করে না', suggestion: 'দক্ষতা বা অর্জনের জন্য জায়গা পুনরুদ্ধার করতে ঘোষণা বিভাগটি সম্পূর্ণভাবে সরিয়ে ফেলুন।' },
    ],
  },
  content_quality: {
    score: 48,
    feedback: 'শিক্ষাগত যোগ্যতা শক্তিশালী, তবে অভিজ্ঞতা বিভাগে পরিমাপযোগ্য অর্জনের গুরুতর ঘাটতি রয়েছে। CAR পদ্ধতি ব্যবহার করে নির্দিষ্ট ফলাফল ছাড়া নিয়োগকর্তারা শর্টলিস্ট করবেন না।',
    strengths: [
      'শিক্ষাগত পটভূমি প্রাসঙ্গিক যোগ্যতা দেখায় (পাওয়ার টেকনোলজিতে ডিপ্লোমা)',
      'প্রশিক্ষণ বিভাগে বৈদ্যুতিক খাতের সাথে সামঞ্জস্যপূর্ণ বাস্তব হাতে-কলমে দক্ষতা অন্তর্ভুক্ত রয়েছে',
    ],
    weaknesses: [
      'অভিজ্ঞতা বিভাগে শুধু বিষয়ক্ষেত্র তালিকাভুক্ত করা হয়েছে — প্রকৃত চাকরির পদ, নিয়োগকর্তা, তারিখ বা ফলাফল নেই',
      'ক্যারিয়ার লক্ষ্য সাধারণ মানের ("একটি গতিশীল পরিবেশে চ্যালেঞ্জিং পদ খুঁজছি") — পাওয়ার সেক্টর ও আপনার মূল যোগ্যতার নাম উল্লেখ করে একটি লক্ষ্যভিত্তিক পেশাদার সারাংশ দিয়ে প্রতিস্থাপন করুন',
      'প্রশিক্ষণ এন্ট্রিতে তারিখের পরিসীমা নেই — "3 months" না লিখে "Jan 2023 – Mar 2023" এভাবে দেখান',
    ],
  },
  language_grammar: {
    score: 61,
    feedback: 'সাধারণভাবে সুপাঠ্য, তবে দুর্বল ক্রিয়াপদ নির্বাচন ও অস্পষ্ট বর্ণনা পেশাদার প্রভাব কমিয়ে দেয়। পুরো জীবনবৃত্তান্তে ব্রিটিশ ইংরেজি প্রমিত করা উচিত।',
    issues: [
      { original: 'Responsible for handling electrical maintenance', corrected: 'Spearheaded electrical maintenance operations for a 12-unit residential complex', type: 'দুর্বল ক্রিয়াপদ' },
      { original: 'Good command in English', corrected: 'Professional working proficiency in English (IELTS 6.5)', type: 'অস্পষ্ট ভাষা বর্ণনা' },
      { original: 'organization (used alongside "organisation")', corrected: 'organisation — standardise to British English throughout', type: 'ব্রিটিশ/আমেরিকান ইংরেজির মিশ্রণ' },
    ],
  },
  action_items: [
    'অভিজ্ঞতা বিভাগ: নিয়োগকর্তা, তারিখের পরিসীমা এবং প্রতিটিতে ২–৩টি CAR-পদ্ধতির বুলেট পয়েন্টসহ অন্তত ২টি প্রকৃত চাকরির পদ যোগ করুন — এটিই নিয়োগকর্তাদের চিহ্নিত করা সবচেয়ে বড় ঘাটতি।',
    'প্রশিক্ষণ বিভাগ: সব এন্ট্রিতে শুরু–শেষের তারিখ যোগ করুন (যেমন: "Jan 2023 – Mar 2023") — তারিখ দেখায় আপনি কখন প্রশিক্ষণ নিয়েছেন, শুধু কতদিন তা নয়।',
    'ক্যারিয়ার লক্ষ্য: একটি নির্দিষ্ট খাত (পাওয়ার, বৈদ্যুতিক বা নবায়নযোগ্য জ্বালানি) লক্ষ্য করে এবং আপনার সবচেয়ে শক্তিশালী যোগ্যতার নাম উল্লেখ করে ২-বাক্যের একটি পেশাদার সারাংশ দিয়ে প্রতিস্থাপন করুন।',
    'দক্ষতা বিভাগ: আপনার লক্ষ্য খাতে ৫টি বর্তমান চাকরির বিজ্ঞাপন পর্যালোচনা করুন এবং তাদের ঠিক কীওয়ার্ড ভাষা অনুসরণ করুন — ATS সিস্টেম কীওয়ার্ড মিলের উপর ব্যাপকভাবে স্কোর করে।',
  ],
  ats_analysis: {
    inferred_role: 'ইলেকট্রিক্যাল ইঞ্জিনিয়ার',
    inferred_industry: 'পাওয়ার ও জ্বালানি',
    keyword_hits: ['ইলেকট্রিক্যাল ওয়্যারিং', 'পাওয়ার সিস্টেম', 'ইন্ডাস্ট্রিয়াল অ্যাটাচমেন্ট', 'AutoCAD', 'সার্কিট ডিজাইন'],
    keyword_gaps: ['PLC প্রোগ্রামিং', 'SCADA', 'লোড ফ্লো বিশ্লেষণ', 'IEEE মানদণ্ড', 'এনার্জি অডিট'],
    heading_risks: [
      { original: 'Computer Knowledge', issue: 'অপ্রচলিত শিরোনাম — অনেক ATS সিস্টেম এটিকে একটি স্বীকৃত বিভাগের সাথে ম্যাপ করতে ব্যর্থ হবে', recommended: 'Technical Skills' },
    ],
    ats_tips: [
      '"PLC Programming" ও "SCADA" স্পষ্টভাবে Technical Skills বিভাগে যোগ করুন — এগুলো বাংলাদেশের পাওয়ার সেক্টরের চাকরির বিজ্ঞাপনে উচ্চ-ফ্রিকোয়েন্সি কীওয়ার্ড।',
      '"Computer Knowledge" শিরোনামটি "Technical Skills" দিয়ে প্রতিস্থাপন করুন — বহুজাতিক প্রতিষ্ঠানের ATS পার্সার এটিকে প্রমিত শনাক্তকারী হিসেবে ব্যবহার করে।',
      'সব শিক্ষাগত এন্ট্রিতে CGPA-র হর অন্তর্ভুক্ত করুন (যেমন: "3.72/4.00") — হর অনুপস্থিত থাকলে বাংলাদেশের দ্বৈত 4.00/5.00 স্কেলে ATS ভুল পাঠ করতে পারে।',
    ],
    standard: 'আন্তর্জাতিক/বহুজাতিক ATS',
    ats_score: 44,
  },
  job_match: null,
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

function describeQuota(quota, isAuthenticated, t) {
  if (!quota) return t('resumeReview.quota.free')
  if (quota.unlimited) return t('resumeReview.quota.premiumUnlimited')
  if (!quota.authenticated || !isAuthenticated) {
    return t('resumeReview.quota.freeLoginPrompt', { limit: quota.limit })
  }
  if (quota.remaining === 0) {
    return t('resumeReview.quota.freeNoneLeft')
  }
  return t('resumeReview.quota.freeRemaining', { count: quota.remaining, remaining: quota.remaining, limit: quota.limit })
}

function UploadView({ file, setFile, jobRole, setJobRole, jobAd, setJobAd, marketMode, setMarketMode, reviewContext, setReviewContext, onAnalyse, onSample }) {
  const { t } = useTranslation()
  const [drag, setDrag] = useState(false)
  const [enhanceOpen, setEnhanceOpen] = useState(false)
  const inputRef = useRef()

  const [fileError, setFileError] = useState('')
  const { isAuthenticated } = useAuth()
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
  const quotaLabel = describeQuota(quota, isAuthenticated, t)

  // Runs for both the picker and the drop zone. accept=".pdf,.docx" only
  // filters the dialog, so a dropped .txt reached the server before this.
  const pick = f => {
    if (!f) return
    const check = validateResumeFile(f)
    if (!check.ok) {
      setFileError(check.message)
      setFile(null)
      return
    }
    setFileError('')
    setFile(f)
  }
  const handleDrop = e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }

  const contextFields = [
    ['applicationChannel', t('resumeReview.context.applicationChannel'), APPLICATION_CHANNEL_OPTIONS],
    ['employerType', t('resumeReview.context.employerType'), EMPLOYER_TYPE_OPTIONS],
    ['candidateStage', t('resumeReview.context.candidateStage'), CANDIDATE_STAGE_OPTIONS],
    ['targetSector', t('resumeReview.context.targetSector'), TARGET_SECTOR_OPTIONS],
  ]

  const coverageItems = [
    ['📋', t('resumeReview.covers.contentQuality.title'), t('resumeReview.covers.contentQuality.desc')],
    ['✏️', t('resumeReview.covers.languageGrammar.title'), t('resumeReview.covers.languageGrammar.desc')],
    ['📐', t('resumeReview.covers.formatStructure.title'), t('resumeReview.covers.formatStructure.desc')],
    ['🔍', t('resumeReview.covers.atsAnalysis.title'), t('resumeReview.covers.atsAnalysis.desc')],
  ]

  return (
    <div className="rr-content">
      <div className="rr-upload-header">
        <h1 className="rr-title">{t('resumeReview.title')}</h1>
        <p className="rr-sub">{t('resumeReview.subtitle')}</p>
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
          <div className="drop-zone__title">{t('resumeReview.dropTitle')}</div>
          <div className="drop-zone__hint">{t('resumeReview.dropHint')}</div>
          <button
            className="btn btn-outline"
            onClick={e => { e.stopPropagation(); inputRef.current.click() }}
          >
            {t('resumeReview.browseFiles')}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            style={{ display: 'none' }}
            onChange={e => pick(e.target.files[0])}
          />
          {fileError && (
            <p className="drop-zone__error" role="alert">{fileError}</p>
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
            <button className="btn btn-ghost btn-sm" onClick={() => setFile(null)}>{t('resumeReview.remove')}</button>
          </div>

          <div className="market-mode-card">
            <div className="market-mode-label">
              <span className="market-mode-icon">🎯</span>
              <span className="market-mode-title">{t('resumeReview.marketMode.title')}</span>
            </div>
            <div className="market-mode-options">
              <button
                className={`market-mode-btn ${marketMode === 'bangladesh' ? 'market-mode-btn--active' : ''}`}
                onClick={() => chooseMarket('bangladesh')}
              >
                <span className="market-mode-btn-label">{t('resumeReview.marketMode.bangladeshLabel')}</span>
                <span className="market-mode-btn-desc">
                  {t('resumeReview.marketMode.bangladeshDesc')}
                </span>
              </button>
              <button
                className={`market-mode-btn ${marketMode === 'international' ? 'market-mode-btn--active' : ''}`}
                onClick={() => chooseMarket('international')}
              >
                <span className="market-mode-btn-label">{t('resumeReview.marketMode.internationalLabel')}</span>
                <span className="market-mode-btn-desc">
                  {t('resumeReview.marketMode.internationalDesc')}
                </span>
              </button>
            </div>
          </div>

          {/* Routes the reviewer's rules. Every field is optional: left alone,
              the server infers it and reports what it inferred. */}
          <div className="context-card">
            <div className="context-card__label">
              <span className="context-card__icon">🧭</span>
              <span className="context-card__title">{t('resumeReview.context.title')}</span>
            </div>
            <p className="context-card__hint">
              {t('resumeReview.context.hint')}
            </p>
            <div className="context-card__grid">
              {contextFields.map(([key, label, options]) => (
                <div className="form-group" key={key}>
                  <label className="form-label" htmlFor={`ctx-${key}`}>{label}</label>
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
              <span className="enhance-card__label">{t('resumeReview.enhance.label')}</span>
              <span className="enhance-card__hint">{t('resumeReview.enhance.hint')}</span>
              <span className="enhance-card__chevron">{enhanceOpen ? '▴' : '▾'}</span>
            </div>
            {enhanceOpen && (
              <div className="enhance-card__fields">
                <div className="form-group">
                  <label className="form-label">{t('resumeReview.enhance.jobRoleLabel')} <span className="optional">{t('resumeReview.enhance.optional')}</span></label>
                  <input
                    className="form-input"
                    placeholder={t('resumeReview.enhance.jobRolePlaceholder')}
                    value={jobRole}
                    onChange={e => setJobRole(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('resumeReview.enhance.jobAdLabel')} <span className="optional">{t('resumeReview.enhance.jobAdOptional')}</span></label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder={t('resumeReview.enhance.jobAdPlaceholder')}
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
            {t('resumeReview.analyseButton')}
          </button>
        </div>
      )}

      <div className="val-section">
        <div className="val-section__label">{t('resumeReview.covers.label')}</div>
        <div className="val-grid">
          {coverageItems.map(([icon, title, desc]) => (
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
            <div className="sample-card__title">{t('resumeReview.sample.title')}</div>
            <div className="sample-card__sub">{t('resumeReview.sample.sub')}</div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onSample}>{t('resumeReview.sample.button')}</button>
        </div>
      </div>
    </div>
  )
}

/* ── AnalysingView ───────────────────────────────────────────────── */
function AnalysingView({ filename }) {
  const { t } = useTranslation()
  const msgs = [
    t('resumeReview.analysing.step1'),
    t('resumeReview.analysing.step2'),
    t('resumeReview.analysing.step3'),
    t('resumeReview.analysing.step4'),
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
        <div className="analysing-text__title">{t('resumeReview.analysing.title')}</div>
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
  const { t, i18n } = useTranslation()
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
            setStreamError(msg || t('resumeReview.streamStoppedEarly'))
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
    setFeedback(i18n.language === 'bn' ? SAMPLE_BN : SAMPLE_EN)
    setFilename('Sample_Resume.pdf')
    setUploadedFile(null)
    setIsSample(true)
    setIsLoading(false)
    setStreamError(null)
    setView('analysing')
    setTimeout(() => setView('results'), 1400)
  }

  // If the user flips the EN/BN toggle while the sample is on screen, swap the
  // sample data to match rather than leaving stale-language text visible. Real
  // analysed feedback is untouched — this only re-picks between SAMPLE_EN and
  // SAMPLE_BN, both static, so there is nothing to re-fetch.
  useEffect(() => {
    if (!isSample) return
    setFeedback(i18n.language === 'bn' ? SAMPLE_BN : SAMPLE_EN)
  }, [i18n.language, isSample])

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
