/**
 * Preparation.jsx
 *
 * The gap board and the mock interview, on one page, because they are the same
 * feature seen from either end.
 *
 * The resume review says what is wrong with a document. The interview says what
 * is thin in an answer. Neither of them says what this person is missing for the
 * role and how they close it, tracked from one week to the next — that is the
 * plan, and both features feed it. Keeping them on separate pages would hide the
 * only thing that makes either of them more than a one-off opinion: a gap that
 * was open in March and is closed in April.
 *
 * Three tabs, mirroring the account area's rail because it is the same shape of
 * problem — one navigation, several panels, only one of which is ever relevant.
 * The interview's own state lives on the page rather than in its tab, so
 * checking the plan mid-interview does not throw away four typed answers.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Target, MessageSquareText, History, ChevronDown, CheckCircle2, Circle, EyeOff,
  RotateCcw, Sparkles, UploadCloud, FileCheck2, ArrowUpRight, ArrowRight,
  BookOpen, Clock, Undo2, FileText, User,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import { CANDIDATE_STAGE_OPTIONS } from '../utils/reviewContext'
import { validateResumeFile, ACCEPTED_EXTENSIONS } from '../utils/resumeFile'
import { fetchProfile } from '../api/account'
import {
  fetchGaps, fetchGapSummary, setGapStatus, fetchInterviewQuota,
  startInterview, submitInterviewAnswers, fetchInterviews, fetchInterview,
} from '../api/preparation'
import './Preparation.css'

const TABS = [
  { key: 'plan', icon: Target, labelKey: 'prep.tabPlan' },
  { key: 'interview', icon: MessageSquareText, labelKey: 'prep.tabInterview' },
  { key: 'history', icon: History, labelKey: 'prep.tabHistory' },
]

const CATEGORIES = ['skill', 'credential', 'evidence', 'experience']
const STATUSES = ['open', 'closed', 'dismissed']

/** Longest advertisement the server accepts. Mirrored so the counter is honest. */
const JOB_AD_MAX = 4000
const ANSWER_MAX = 2500

/*
 * The profile fields the interview reads. The server pitches the questions at
 * these, so the setup panel says which of them it holds; null when the profile
 * has none of them, which is the state a fresh account is in.
 */
function profileFacts(profile) {
  if (!profile) return null
  const facts = {
    discipline: profile.discipline || null,
    institution: profile.institution || null,
    graduation_year: profile.graduation_year || null,
  }
  return Object.values(facts).some(Boolean) ? facts : null
}

/*
 * A default for the stage selector, from the graduation year alone. Only a
 * default: the user can still pick anything, and "Not sure" stays available.
 * A year in the future is a student; a year or less ago is a fresher, which is
 * how the job market here uses the word.
 */
/*
 * The effort line is rendered as "Roughly {effort}", and the model likes to
 * begin the value with the same word — "roughly 1 week" came back and read
 * "Roughly roughly 1 week". The hedge is the label's job, so a leading one on
 * the value goes, in either language.
 */
function trimEffort(effort) {
  return String(effort ?? '')
    .replace(/^(?:roughly|about|around|approximately|approx\.?|আনুমানিক|প্রায়)\s+/i, '')
    .trim()
}

function stageFromGraduationYear(year) {
  const graduated = Number.parseInt(year, 10)
  if (!Number.isInteger(graduated)) return null
  const yearsSince = new Date().getFullYear() - graduated
  if (yearsSince < 0) return 'student'
  if (yearsSince <= 1) return 'fresher'
  if (yearsSince <= 4) return 'early_career'
  if (yearsSince <= 9) return 'experienced'
  return 'senior'
}

/* ── Small pieces ────────────────────────────────────────────────────── */

function CategoryChip({ category }) {
  const { t } = useLanguage()
  return <span className={`prep-chip prep-chip--${category}`}>{t(`prep.category.${category}`)}</span>
}

function SeverityChip({ severity }) {
  const { t } = useLanguage()
  return <span className={`prep-sev prep-sev--${severity}`}>{t(`prep.severity.${severity}`)}</span>
}

/*
 * The progress figure is weighted by severity, not counted, and the label says
 * so. A bare percentage invites the reading that three trivial fixes equal one
 * blocking one, which is the reading the weighting exists to prevent.
 */
function ProgressCard({ summary, onOpenInterview }) {
  const { t, n } = useLanguage()

  if (!summary || summary.total === 0) return null

  return (
    <div className="card card--tinted prep-progress">
      <div className="prep-progress__head">
        <div>
          <p className="eyebrow">{t('prep.progressLabel')}</p>
          <p className="prep-progress__figure">
            {n(summary.percent)}<span className="prep-progress__percent">%</span>
          </p>
          <p className="prep-progress__note">{t('prep.progressWeighted')}</p>
        </div>

        <dl className="prep-progress__counts">
          <div><dt>{t('prep.status.open')}</dt><dd>{n(summary.open)}</dd></div>
          <div><dt>{t('prep.status.closed')}</dt><dd>{n(summary.closed)}</dd></div>
          <div><dt>{t('prep.status.dismissed')}</dt><dd>{n(summary.dismissed)}</dd></div>
        </dl>
      </div>

      <div className="prep-progress__track">
        <span className="prep-progress__fill" style={{ width: `${summary.percent}%` }} />
      </div>

      {summary.nextUp && (
        <div className="prep-next">
          <span className="prep-next__label">{t('prep.nextUp')}</span>
          <p className="prep-next__text">{summary.nextUp.description}</p>
          <div className="prep-next__meta">
            <CategoryChip category={summary.nextUp.category} />
            <SeverityChip severity={summary.nextUp.severity} />
            <span className="prep-next__closeable">
              <Clock size={13} />
              {t(`prep.closeable.${summary.nextUp.closeable}`)}
            </span>
          </div>
        </div>
      )}

      <button type="button" className="btn btn--outline btn--sm prep-progress__cta" onClick={onOpenInterview}>
        <MessageSquareText size={15} />
        {t('prep.practiseThis')}
      </button>
    </div>
  )
}

/*
 * One gap, with everything needed to act on it.
 *
 * The remediation steps are always visible rather than behind a disclosure. A
 * board that shows eight problems and hides all eight answers is a list of
 * things to feel bad about; the steps are the half that makes it a plan.
 */
function GapCard({ gap, onDismiss, onRestore, busy }) {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()

  const steps = Array.isArray(gap.remediation?.steps) ? gap.remediation.steps.filter(Boolean) : []
  const resources = Array.isArray(gap.resources) ? gap.resources : []
  const query = gap.remediation?.resource_query ?? ''

  const formatDate = (value) => (value
    ? new Date(value).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
    : '—')

  /*
   * Hands the subject to the Resources page rather than filtering here. The
   * library already knows how to search itself, and the one-shot localStorage
   * key is the pattern Career Paths already uses to hand a discipline over.
   */
  const browseResources = () => {
    try {
      localStorage.setItem('selectedResourceQuery', query)
    } catch {
      // Private browsing. The page still opens, just unfiltered.
    }
    navigate('/resources')
  }

  return (
    <article className={`prep-gap prep-gap--${gap.status}`}>
      <header className="prep-gap__head">
        <div className="prep-gap__tags">
          <CategoryChip category={gap.category} />
          <SeverityChip severity={gap.severity} />
          <span className="prep-gap__closeable">
            <Clock size={13} />
            {t(`prep.closeable.${gap.closeable}`)}
          </span>
        </div>

        {gap.status === 'closed' && (
          <span className="prep-gap__state prep-gap__state--closed">
            <CheckCircle2 size={14} />
            {t('prep.closedOn', { date: formatDate(gap.closed_at) })}
          </span>
        )}
        {gap.status === 'dismissed' && (
          <span className="prep-gap__state">
            <EyeOff size={14} />
            {t('prep.status.dismissed')}
          </span>
        )}
      </header>

      <p className="prep-gap__desc">{gap.description}</p>

      {gap.status !== 'closed' && steps.length > 0 && (
        <div className="prep-gap__block">
          <p className="prep-gap__block-title">{t('prep.howToClose')}</p>
          <ol className="prep-gap__steps">
            {steps.map((step, index) => <li key={index}>{step}</li>)}
          </ol>
        </div>
      )}

      {gap.remediation?.effort && gap.status !== 'closed' && (
        <p className="prep-gap__effort">
          <Clock size={13} />
          {t('prep.effort', { effort: trimEffort(gap.remediation.effort) })}
        </p>
      )}

      {/* Only ever shown on an experience gap. Telling someone the role is out of
          reach without naming one that is not would be the least useful thing
          this feature could do. */}
      {gap.remediation?.alternative_role && (
        <p className="prep-gap__alt">
          <ArrowRight size={14} />
          <span>
            <strong>{t('prep.competitiveNow')}</strong> {gap.remediation.alternative_role}
          </span>
        </p>
      )}

      {gap.status !== 'closed' && (resources.length > 0 || query) && (
        <div className="prep-gap__block">
          <p className="prep-gap__block-title">{t('prep.learnFrom')}</p>
          <div className="prep-gap__resources">
            {resources.map(resource => (
              <a
                key={resource.id}
                className="prep-resource"
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpen size={14} />
                <span className="prep-resource__title">{resource.title}</span>
                <ArrowUpRight size={13} />
              </a>
            ))}
            {query && (
              <button type="button" className="prep-resource prep-resource--more" onClick={browseResources}>
                {t('prep.browseResources', { query })}
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      <footer className="prep-gap__foot">
        <span className="prep-gap__meta">
          {t('prep.source.' + gap.source)}
          {' · '}
          {t('prep.firstSeen', { date: formatDate(gap.first_seen) })}
          {gap.target_role ? ` · ${gap.target_role}` : ''}
        </span>

        {gap.status === 'dismissed' ? (
          <button type="button" className="prep-gap__action" onClick={() => onRestore(gap)} disabled={busy}>
            <Undo2 size={14} />
            {t('prep.restore')}
          </button>
        ) : gap.status === 'open' ? (
          <button type="button" className="prep-gap__action" onClick={() => onDismiss(gap)} disabled={busy}>
            <EyeOff size={14} />
            {t('prep.dismiss')}
          </button>
        ) : null}
      </footer>

      {/* Stated on the card rather than in a tooltip, because the difference
          between dismissed and closed is the difference between the progress
          figure meaning something and meaning nothing. */}
      {gap.status === 'dismissed' && (
        <p className="prep-gap__dismissed-note">{t('prep.dismissedNote')}</p>
      )}

      {/* Descriptions are written by the model in whichever language was
          selected at the time, and are not retranslated on a later visit — a
          machine translation of advice would be a different piece of advice. */}
      {gap.language && gap.language !== lang && (
        <p className="prep-gap__lang-note">{t(`prep.writtenIn.${gap.language}`)}</p>
      )}
    </article>
  )
}

/* ── Plan tab ────────────────────────────────────────────────────────── */

function PlanTab({ gaps, summary, loading, error, onDismiss, onRestore, busyId, onOpenInterview }) {
  const { t, n } = useLanguage()
  const navigate = useNavigate()
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('open')

  const filtered = useMemo(() => gaps.filter(gap => (
    (category === 'all' || gap.category === category)
    && (status === 'all' || gap.status === status)
  )), [gaps, category, status])

  if (loading) return <div className="empty-state">{t('prep.loading')}</div>

  if (error) {
    return <p className="notice notice--error" role="alert">{error}</p>
  }

  if (gaps.length === 0) {
    return (
      <div className="card prep-empty">
        <p className="card__title">{t('prep.emptyTitle')}</p>
        <p className="card__sub">{t('prep.emptyBody')}</p>
        <div className="prep-empty__actions">
          <button type="button" className="btn btn--primary" onClick={() => navigate('/resume-review')}>
            {t('prep.emptyReview')}
          </button>
          <button type="button" className="btn btn--outline" onClick={onOpenInterview}>
            {t('prep.emptyInterview')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <ProgressCard summary={summary} onOpenInterview={onOpenInterview} />

      <div className="card prep-filters">
        <div className="pill-row">
          <button
            type="button"
            className={`pill pill--sm${status === 'all' ? ' pill--on' : ''}`}
            onClick={() => setStatus('all')}
          >
            {t('common.all')}
          </button>
          {STATUSES.map(value => (
            <button
              key={value}
              type="button"
              className={`pill pill--sm${status === value ? ' pill--on' : ''}`}
              onClick={() => setStatus(value)}
            >
              {t(`prep.status.${value}`)}
            </button>
          ))}
        </div>

        <div className="pill-row">
          <button
            type="button"
            className={`pill pill--sm${category === 'all' ? ' pill--on' : ''}`}
            onClick={() => setCategory('all')}
          >
            {t('prep.allCategories')}
          </button>
          {CATEGORIES.map(value => (
            <button
              key={value}
              type="button"
              className={`pill pill--sm${category === value ? ' pill--on' : ''}`}
              onClick={() => setCategory(value)}
            >
              {t(`prep.category.${value}`)}
            </button>
          ))}
        </div>

        <p className="prep-filters__count">
          {t('prep.showing', { shown: n(filtered.length), total: n(gaps.length) })}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">{t('prep.noneInFilter')}</div>
      ) : (
        <div className="prep-gaps">
          {filtered.map(gap => (
            <GapCard
              key={gap.gap_id}
              gap={gap}
              onDismiss={onDismiss}
              onRestore={onRestore}
              busy={busyId === gap.gap_id}
            />
          ))}
        </div>
      )}
    </>
  )
}

/* ── Interview setup ─────────────────────────────────────────────────── */

/*
 * Reports the tier without scolding anyone for it.
 *
 * Every line here states what an input GAINS, never what its absence costs.
 * "Add your resume for questions based on your actual experience" and "your
 * resume is missing" carry the same information, and only one of them tells
 * somebody off before they have started.
 */
function TierPanel({ hasResume, hasJobAd, openGapCount, profile }) {
  const { t, n } = useLanguage()
  const level = !hasResume ? 1 : hasJobAd ? 3 : 2

  // What the interview knows from the account, in the order the profile page
  // asks for it. The year goes through n() so it reads in Bengali digits.
  const details = profile
    ? [profile.discipline, profile.institution, profile.graduation_year && n(profile.graduation_year)]
      .filter(Boolean)
      .join(' · ')
    : ''

  return (
    <div className="prep-tier">
      <div className="prep-tier__steps">
        {[1, 2, 3].map(step => (
          <span key={step} className={`prep-tier__dot${level >= step ? ' prep-tier__dot--on' : ''}`} />
        ))}
      </div>
      <div>
        <p className="prep-tier__title">{t(`prep.tier${level}Title`)}</p>
        <p className="prep-tier__body">{t(`prep.tier${level}Body`)}</p>
        {level < 3 && <p className="prep-tier__nudge">{t(`prep.tier${level}Nudge`)}</p>}
        {openGapCount > 0 && (
          <p className="prep-tier__gaps">
            <Sparkles size={13} />
            {t('prep.willTargetGap', { count: n(openGapCount) })}
          </p>
        )}
        {/* Said either way. With a profile the user sees what will be assumed
            about them; without one they learn there is something to fill in,
            with the link to do it — the questions are pitched at the stage
            the profile implies, and an empty profile means a generic pitch. */}
        <p className="prep-tier__gaps prep-tier__profile">
          <User size={13} />
          {profile ? (
            <span>{t('prep.profileUsed', { details })}</span>
          ) : (
            <span>
              {t('prep.profileMissing')}{' '}
              <Link to="/profile" className="prep-tier__link">{t('prep.profileLink')}</Link>
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

function InterviewSetup({ quota, openGapCount, onStart, starting, error, profile, lastRole }) {
  const { t, n } = useLanguage()
  /*
   * Both fields start from what the account already knows and become the
   * user's own value the moment they touch them. Held as "null until typed"
   * rather than copied into state on mount, because the profile and the
   * interview history arrive after the panel has rendered and a copy taken
   * at mount would have been taken from nothing.
   */
  const [roleInput, setRoleInput] = useState(null)
  const [stageInput, setStageInput] = useState(null)
  const role = roleInput ?? lastRole ?? ''
  const stage = stageInput ?? stageFromGraduationYear(profile?.graduation_year) ?? 'unknown'
  const [jobAd, setJobAd] = useState('')
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const inputRef = useRef(null)

  const pick = (candidate) => {
    if (!candidate) return
    const check = validateResumeFile(candidate)
    if (!check.ok) {
      // Held as a key plus its substitutions rather than a rendered sentence, so
      // an error already on screen re-renders when the language is toggled.
      setFileError({ key: check.messageKey, vars: check.messageVars })
      setFile(null)
      return
    }
    setFileError(null)
    setFile(candidate)
  }

  const quotaLabel = !quota
    ? t('prep.quotaFallback')
    : quota.unlimited
      ? t('prep.quotaUnlimited')
      : quota.remaining === 0
        ? t('prep.quotaExhausted')
        : t(quota.remaining === 1 ? 'prep.quotaRemainingOne' : 'prep.quotaRemainingMany', {
          remaining: n(quota.remaining), limit: n(quota.limit),
        })

  return (
    <>
      <div className="card">
        <p className="card__title">{t('prep.setupTitle')}</p>
        <p className="card__sub">{t('prep.setupSub')}</p>

        <div className="field-grid">
          <div className="field">
            <label className="field__label" htmlFor="prep-role">
              {t('prep.roleLabel')} <span className="optional">{t('common.optional')}</span>
            </label>
            <input
              id="prep-role"
              className="input"
              placeholder={t('prep.rolePlaceholder')}
              value={role}
              onChange={event => setRoleInput(event.target.value)}
            />
            {roleInput === null && lastRole && (
              <span className="field__hint">{t('prep.rolePrefilled')}</span>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="prep-stage">{t('review.contextStage')}</label>
            <span className="select-wrap">
              <select
                id="prep-stage"
                className="select"
                value={stage}
                onChange={event => setStageInput(event.target.value)}
              >
                {CANDIDATE_STAGE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
                ))}
              </select>
              <ChevronDown size={16} className="select-wrap__chevron" />
            </span>
          </div>
        </div>

        <div className="field">
          <span className="field__label">
            {t('prep.resumeLabel')} <span className="optional">{t('common.optional')}</span>
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            className="visually-hidden"
            onChange={event => pick(event.target.files?.[0])}
          />

          {file ? (
            <div className="prep-file">
              <span className="prep-file__icon"><FileCheck2 size={18} /></span>
              <span className="prep-file__name">{file.name}</span>
              <button
                type="button"
                className="prep-file__remove"
                onClick={() => {
                  setFile(null)
                  if (inputRef.current) inputRef.current.value = ''
                }}
              >
                {t('review.remove')}
              </button>
            </div>
          ) : (
            <button type="button" className="prep-drop" onClick={() => inputRef.current?.click()}>
              <UploadCloud size={18} />
              <span>{t('prep.resumeCta')}</span>
            </button>
          )}

          {/* Said plainly, because a user handing over a CV is entitled to know
              what happens to it and this feature genuinely keeps nothing. */}
          <span className="field__hint">{t('prep.resumeNotStored')}</span>

          {fileError && (
            <p className="notice notice--error prep-file-error" role="alert">
              {t(fileError.key, fileError.vars)}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="prep-job-ad">
            {t('prep.jobAdLabel')} <span className="optional">{t('common.optional')}</span>
          </label>
          <textarea
            id="prep-job-ad"
            className="textarea"
            rows={5}
            maxLength={JOB_AD_MAX}
            placeholder={t('prep.jobAdPlaceholder')}
            value={jobAd}
            onChange={event => setJobAd(event.target.value)}
          />
          <span className="field__hint">
            {t('prep.jobAdHint')}
            {jobAd.length > 0 && ` · ${t('prep.charCount', { used: n(jobAd.length), max: n(JOB_AD_MAX) })}`}
          </span>
        </div>

        <TierPanel
          hasResume={Boolean(file)}
          hasJobAd={jobAd.trim().length > 0}
          openGapCount={openGapCount}
          profile={profile}
        />

        {error && <p className="notice notice--error prep-start-error" role="alert">{error}</p>}

        <div className="prep-start">
          <button
            type="button"
            className="btn btn--primary btn--lg"
            disabled={starting || quota?.remaining === 0}
            onClick={() => onStart({
              targetRole: role.trim() || undefined,
              candidateStage: stage !== 'unknown' ? stage : undefined,
              jobAd: jobAd.trim() || undefined,
              resumeFile: file || undefined,
            })}
          >
            {starting ? t('prep.starting') : t('prep.start')}
            <Sparkles size={17} />
          </button>
          <span className="prep-quota">{quotaLabel}</span>
        </div>
      </div>

      <div className="card card--tinted prep-explain">
        <p className="card__title">{t('prep.howItWorks')}</p>
        <ol className="prep-explain__list">
          <li>{t('prep.how1')}</li>
          <li>{t('prep.how2')}</li>
          <li>{t('prep.how3')}</li>
        </ol>
        <p className="prep-explain__note">{t('prep.textOnly')}</p>
      </div>
    </>
  )
}

/* ── Answering ───────────────────────────────────────────────────────── */

function InterviewAnswering({ interview, answers, setAnswers, onSubmit, submitting, error }) {
  const { t, n } = useLanguage()
  const questions = interview.questions ?? []
  const answered = questions.filter(q => (answers[q.index] ?? '').trim().length > 0).length

  return (
    <>
      <div className="card prep-run__head">
        <div>
          <p className="card__title">{interview.role || t('prep.interviewGeneric')}</p>
          {interview.focus && <p className="card__sub">{interview.focus}</p>}
        </div>
        <span className="prep-run__count">
          {t('prep.answeredCount', { answered: n(answered), total: n(questions.length) })}
        </span>
      </div>

      {questions.map(question => (
        <div className="card prep-q" key={question.index}>
          <div className="prep-q__head">
            <span className="prep-q__number">{n(question.index)}</span>
            <span className={`prep-kind prep-kind--${question.kind}`}>
              {t(`prep.kind.${question.kind}`)}
            </span>
            {question.targets_gap_key && (
              <span className="prep-q__gap">
                <Target size={12} />
                {t('prep.fromYourPlan')}
              </span>
            )}
          </div>

          <p className="prep-q__text">{question.question}</p>
          {question.why && <p className="prep-q__why">{question.why}</p>}

          <label className="visually-hidden" htmlFor={`prep-answer-${question.index}`}>
            {question.question}
          </label>
          <textarea
            id={`prep-answer-${question.index}`}
            className="textarea prep-q__answer"
            rows={5}
            maxLength={ANSWER_MAX}
            placeholder={t('prep.answerPlaceholder')}
            value={answers[question.index] ?? ''}
            onChange={event => setAnswers(current => ({ ...current, [question.index]: event.target.value }))}
          />
        </div>
      ))}

      {error && <p className="notice notice--error" role="alert">{error}</p>}

      <div className="prep-submit">
        <button
          type="button"
          className="btn btn--primary btn--lg"
          onClick={onSubmit}
          disabled={submitting || answered === 0}
        >
          {submitting ? t('prep.assessing') : t('prep.submitAnswers')}
        </button>
        {/* Stated before they commit. The assessment is the second and last model
            call of the interview, so there is no second attempt at it. */}
        <span className="prep-quota">
          {answered < questions.length ? t('prep.partialWarning') : t('prep.submitNote')}
        </span>
      </div>
    </>
  )
}

/* ── Results ─────────────────────────────────────────────────────────── */

const toneOf = score => (score <= 40 ? 'low' : score <= 65 ? 'mid' : 'high')

function InterviewResults({ interview, evaluation, gaps, onRestart, onOpenPlan }) {
  const { t, n } = useLanguage()
  const questions = interview.questions ?? []
  const perQuestion = new Map((evaluation.per_question ?? []).map(entry => [Number(entry.index), entry]))
  const level = interview.tierLevel ?? interview.tier_level ?? 1

  return (
    <>
      <div className="card prep-score">
        <div className="prep-score__figure">
          <p className={`prep-score__number prep-score__number--${toneOf(evaluation.overall_score)}`}>
            {n(evaluation.overall_score)}<span className="prep-score__denom">/{n(100)}</span>
          </p>
          <span className={`prep-score__band prep-score__band--${toneOf(evaluation.overall_score)}`}>
            {t(`prep.band.${toneOf(evaluation.overall_score)}`)}
          </span>
        </div>
        <div className="prep-score__text">
          <p className="card__title">{t('prep.resultsTitle')}</p>
          <p className="prep-score__summary">{evaluation.summary}</p>
        </div>
      </div>

      {/* The nudge belongs here and nowhere earlier. Told before starting it is a
          gate; told after results it is the answer to "how do I get more out of
          this next time". */}
      {level < 3 && (
        <p className="notice notice--ok prep-nudge">
          <Sparkles size={16} />
          {t(`prep.tier${level}Nudge`)}
        </p>
      )}

      {questions.map(question => {
        const marked = perQuestion.get(Number(question.index))
        if (!marked) return null
        const strengths = (marked.strengths ?? []).filter(Boolean)
        const improvements = (marked.improvements ?? []).filter(Boolean)

        return (
          <div className="card prep-q" key={question.index}>
            <div className="prep-q__head">
              <span className="prep-q__number">{n(question.index)}</span>
              <span className={`prep-kind prep-kind--${question.kind}`}>
                {t(`prep.kind.${question.kind}`)}
              </span>
              <span className={`prep-q__score prep-q__score--${toneOf(marked.score)}`}>
                {n(marked.score)}
              </span>
            </div>

            <p className="prep-q__text">{question.question}</p>
            {marked.verdict && <p className="prep-q__verdict">{marked.verdict}</p>}

            {strengths.length > 0 && (
              <div className="prep-q__block">
                <p className="prep-q__block-title prep-q__block-title--good">{t('results.strengths')}</p>
                <ul className="prep-q__list">
                  {strengths.map((item, index) => <li key={index} className="prep-q__item--good">{item}</li>)}
                </ul>
              </div>
            )}

            {improvements.length > 0 && (
              <div className="prep-q__block">
                <p className="prep-q__block-title prep-q__block-title--warn">{t('prep.improvements')}</p>
                <ul className="prep-q__list">
                  {improvements.map((item, index) => <li key={index} className="prep-q__item--warn">{item}</li>)}
                </ul>
              </div>
            )}

            {marked.stronger_answer && (
              <p className="prep-q__stronger">
                <span className="prep-q__stronger-label">{t('prep.strongerAnswer')}</span>
                {marked.stronger_answer}
              </p>
            )}
          </div>
        )
      })}

      {/* `gaps` is null on a reopened interview, because what it added to the
          plan was reconciled when it was submitted and is not returned again.
          Null and empty mean different things here — "we did not fetch this"
          against "these answers revealed nothing" — and rendering the second
          for the first would tell somebody their interview found nothing when
          it is the reason half their board exists. */}
      {Array.isArray(gaps) && (
        <div className="card">
          <p className="card__title">{t('prep.gapsFoundTitle')}</p>
          <p className="card__sub">
            {gaps.length > 0
              ? t('prep.gapsFoundSub', { count: n(gaps.length) })
              : t('prep.gapsFoundNone')}
          </p>

          {gaps.length > 0 && (
            <ul className="prep-found">
              {gaps.map(gap => (
                <li className="prep-found__item" key={gap.gap_key}>
                  <CategoryChip category={gap.category} />
                  <span className="prep-found__text">{gap.description}</span>
                  <SeverityChip severity={gap.severity} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="card prep-results__actions">
        <button type="button" className="btn btn--primary" onClick={onOpenPlan}>
          <Target size={16} />
          {t('prep.openPlan')}
        </button>
        <button type="button" className="btn btn--outline" onClick={onRestart}>
          <RotateCcw size={16} />
          {t('prep.newInterview')}
        </button>
        <Link to="/resume-review" className="btn btn--outline">
          <FileText size={16} />
          {t('prep.emptyReview')}
        </Link>
      </div>
    </>
  )
}

/* ── History tab ─────────────────────────────────────────────────────── */

function HistoryTab({ interviews, loading, onOpen, openingId }) {
  const { t, n, lang } = useLanguage()

  const formatDate = (value) => (value
    ? new Date(value).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
    : '—')

  if (loading) return <div className="empty-state">{t('prep.loading')}</div>

  if (interviews.length === 0) {
    return <div className="empty-state">{t('prep.noInterviews')}</div>
  }

  return (
    <div className="card">
      <p className="card__title">{t('prep.historyTitle')}</p>
      <p className="card__sub">{t('prep.historySub')}</p>

      <ul className="prep-history">
        {interviews.map(row => (
          <li className="prep-history__item" key={row.interview_id}>
            <span className="prep-history__icon"><MessageSquareText size={16} /></span>
            <span className="prep-history__text">
              <span className="prep-history__role">{row.target_role || t('prep.interviewGeneric')}</span>
              <span className="prep-history__meta">
                {formatDate(row.created_at)}
                {' · '}
                {t(`prep.tier${row.tier_level}Short`)}
                {/* Only at tiers 1 and 2, where the tier label does not already
                    say it — tier 3 IS a resume and an advertisement, and
                    "Resume and job ad · against a job ad" says it twice. */}
                {row.had_job_ad && row.tier_level !== 3 ? ` · ${t('prep.withJobAd')}` : ''}
              </span>
            </span>

            {row.status === 'complete' ? (
              <span className={`prep-history__score prep-history__score--${toneOf(row.overall_score ?? 0)}`}>
                {n(row.overall_score ?? 0)}
              </span>
            ) : (
              <span className="prep-history__pending">
                <Circle size={12} />
                {t('prep.unfinished')}
              </span>
            )}

            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => onOpen(row)}
              disabled={openingId === row.interview_id}
            >
              {row.status === 'complete' ? t('prep.openInterview') : t('prep.resume')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function Preparation() {
  const { t, lang } = useLanguage()

  const [tab, setTab] = useState('plan')

  const [gaps, setGaps] = useState([])
  const [summary, setSummary] = useState(null)
  const [gapsLoading, setGapsLoading] = useState(true)
  const [gapsError, setGapsError] = useState('')
  const [busyGapId, setBusyGapId] = useState(null)

  const [quota, setQuota] = useState(null)
  const [profile, setProfile] = useState(null)
  const [interviews, setInterviews] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [openingId, setOpeningId] = useState(null)

  // 'setup' | 'answering' | 'results'. Held on the page so switching to the plan
  // mid-interview does not discard answers the user has typed.
  const [stage, setStage] = useState('setup')
  const [interview, setInterview] = useState(null)
  const [answers, setAnswers] = useState({})
  const [evaluation, setEvaluation] = useState(null)
  const [foundGaps, setFoundGaps] = useState(null)
  const [starting, setStarting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [interviewError, setInterviewError] = useState('')

  /*
   * Re-reads the board. Deliberately does not flip back to the loading state:
   * it is called after a dismissal and after an interview as well as on mount,
   * and blanking a board the user is looking at to re-fetch what is mostly the
   * same rows reads as the page having lost their plan.
   */
  const loadGaps = useCallback(() => Promise
    .all([fetchGaps(), fetchGapSummary()])
    .then(([rows, progress]) => {
      setGaps(Array.isArray(rows) ? rows : [])
      setSummary(progress)
      setGapsError('')
    })
    .catch(err => setGapsError(err.message || t('prep.loadFailed')))
    .finally(() => setGapsLoading(false)), [t])

  // Re-read when the language changes: gap descriptions are written by the model
  // in whichever language was selected at the time, and the resource titles come
  // back resolved for the requested language.
  useEffect(() => { loadGaps() }, [loadGaps, lang])

  useEffect(() => {
    fetchInterviewQuota().then(setQuota).catch(() => {})
    // The three fields the server reads for the interview, so the setup panel
    // can say what will be assumed. A failed read leaves the panel saying the
    // profile is empty, which is the safe wording.
    fetchProfile().then(data => setProfile(profileFacts(data))).catch(() => {})
    fetchInterviews()
      .then(rows => setInterviews(Array.isArray(rows) ? rows : []))
      .catch(() => setInterviews([]))
      .finally(() => setHistoryLoading(false))
  }, [])

  const openGapCount = gaps.filter(gap => gap.status === 'open').length
  // What they were preparing for last time, as the starting value for the
  // role field. Newest first, so the first row with a role is the latest.
  const lastRole = interviews.find(row => row.target_role)?.target_role ?? ''

  const changeStatus = async (gap, status) => {
    setBusyGapId(gap.gap_id)
    try {
      await setGapStatus(gap.gap_id, status)
      // Re-read rather than patching locally. Dismissing changes the progress
      // figure, and a percentage recomputed on the client is a second place for
      // it to disagree with the server about what the board says.
      await loadGaps()
    } catch (err) {
      setGapsError(err.message || t('prep.updateFailed'))
    } finally {
      setBusyGapId(null)
    }
  }

  const begin = async (input) => {
    setStarting(true)
    setInterviewError('')
    try {
      const started = await startInterview({ ...input, language: lang })
      setInterview(started)
      setAnswers({})
      setEvaluation(null)
      setFoundGaps(null)
      setStage('answering')
      window.scrollTo({ top: 0 })
      fetchInterviewQuota().then(setQuota).catch(() => {})
    } catch (err) {
      setInterviewError(err.message || t('prep.startFailed'))
    } finally {
      setStarting(false)
    }
  }

  const submit = async () => {
    if (!interview) return
    setSubmitting(true)
    setInterviewError('')
    try {
      const payload = (interview.questions ?? []).map(question => ({
        index: question.index,
        answer: answers[question.index] ?? '',
      }))
      const result = await submitInterviewAnswers(interview.interviewId, payload, lang)
      setEvaluation(result.evaluation)
      setFoundGaps(result.gaps ?? [])
      setStage('results')
      window.scrollTo({ top: 0 })
      // The interview has just written to the board, so both need re-reading.
      loadGaps()
      fetchInterviews().then(rows => setInterviews(Array.isArray(rows) ? rows : [])).catch(() => {})
    } catch (err) {
      setInterviewError(err.message || t('prep.assessFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  /*
   * Opens a past interview. A finished one shows its assessment; an unfinished
   * one reopens for answering with whatever was typed before, which is the only
   * reason the answers are saved on a failed assessment.
   */
  const openPast = async (row) => {
    setOpeningId(row.interview_id)
    setInterviewError('')
    try {
      const full = await fetchInterview(row.interview_id)
      setInterview({
        interviewId: full.interview_id,
        tierLevel: full.tier_level,
        role: full.target_role,
        focus: '',
        questions: full.questions ?? [],
      })
      setAnswers(Object.fromEntries((full.answers ?? []).map(entry => [entry.index, entry.answer])))

      if (full.status === 'complete' && full.evaluation) {
        setEvaluation(full.evaluation)
        setFoundGaps(null)
        setStage('results')
      } else {
        setStage('answering')
      }

      setTab('interview')
      window.scrollTo({ top: 0 })
    } catch (err) {
      setInterviewError(err.message || t('prep.loadFailed'))
      setTab('interview')
    } finally {
      setOpeningId(null)
    }
  }

  const restart = () => {
    setStage('setup')
    setInterview(null)
    setAnswers({})
    setEvaluation(null)
    setFoundGaps(null)
    setInterviewError('')
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="page-enter">
      <Navbar />

      <section className="page-head">
        <div className="shell">
          <h1 className="page-head__title">{t('prep.title')}</h1>
          <p className="page-head__sub">{t('prep.sub')}</p>
        </div>
      </section>

      <section className="prep-body">
        <nav className="prep-rail" aria-label={t('prep.title')}>
          {TABS.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                type="button"
                className={`prep-tab${tab === item.key ? ' prep-tab--on' : ''}`}
                onClick={() => setTab(item.key)}
                aria-current={tab === item.key}
              >
                <Icon size={16} />
                {t(item.labelKey)}
                {item.key === 'plan' && openGapCount > 0 && (
                  <span className="prep-tab__badge">{openGapCount}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="prep-panel">
          {tab === 'plan' && (
            <PlanTab
              gaps={gaps}
              summary={summary}
              loading={gapsLoading}
              error={gapsError}
              onDismiss={gap => changeStatus(gap, 'dismissed')}
              onRestore={gap => changeStatus(gap, 'open')}
              busyId={busyGapId}
              onOpenInterview={() => { setTab('interview'); window.scrollTo({ top: 0 }) }}
            />
          )}

          {tab === 'interview' && stage === 'setup' && (
            <InterviewSetup
              quota={quota}
              openGapCount={openGapCount}
              onStart={begin}
              starting={starting}
              error={interviewError}
              profile={profile}
              lastRole={lastRole}
            />
          )}

          {tab === 'interview' && stage === 'answering' && interview && (
            <InterviewAnswering
              interview={interview}
              answers={answers}
              setAnswers={setAnswers}
              onSubmit={submit}
              submitting={submitting}
              error={interviewError}
            />
          )}

          {tab === 'interview' && stage === 'results' && interview && evaluation && (
            <InterviewResults
              interview={interview}
              evaluation={evaluation}
              gaps={foundGaps}
              onRestart={restart}
              onOpenPlan={() => { setTab('plan'); window.scrollTo({ top: 0 }) }}
            />
          )}

          {tab === 'history' && (
            <HistoryTab
              interviews={interviews}
              loading={historyLoading}
              onOpen={openPast}
              openingId={openingId}
            />
          )}
        </div>
      </section>
    </div>
  )
}
