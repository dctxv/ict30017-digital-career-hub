/**
 * LiveInterview.jsx
 *
 * The mock interview conducted one question at a time, answered out loud.
 *
 * WHAT THIS IS NOT
 *
 * It is not a second interview feature. The questions came from the same
 * generator the written mode uses, the answers go to the same evaluator, and
 * what they reveal lands on the same gap board. This component is a
 * PRESENTATION — a different way through an interview that already existed —
 * and everything below is about pacing and capture. There is no scoring here,
 * no prompt, and no second copy of anything the written mode does.
 *
 * WHY ONE QUESTION AT A TIME IS THE POINT
 *
 * Five questions on a page is a form. One question on a page, with a clock
 * running and no way back, is an interview. The written mode is the better
 * tool for drafting careful answers and it stays; this is the one that
 * rehearses the thing that actually happens in the room.
 *
 * THE TRANSCRIPT IS A DRAFT, NOT A RECORD
 *
 * Browser speech recognition is free, private and wrong a fair amount of the
 * time. So what it produces lands in an ordinary editable textarea rather than
 * a read-only panel: the candidate is marked on this text and must be able to
 * fix it. Interim results are shown separately and never written into the box,
 * because text that rewrites itself under the cursor cannot be edited.
 *
 * NO AUDIO LEAVES THE BROWSER. There is no recorder here, nothing to upload
 * and nothing to store — recognition is the browser's own, and what reaches
 * the server is the text the candidate read and chose to submit.
 *
 * WHY THERE IS AN OUTER AND AN INNER COMPONENT
 *
 * LiveQuestion is mounted fresh for every question, keyed on its index. That is
 * not a detail: the clock, the draft state and the microphone all belong to ONE
 * question, and remounting is what guarantees none of them survives into the
 * next one. A single component resetting three pieces of state in an effect
 * would do the same thing less reliably, and would leave the microphone open
 * across a question boundary the first time a reset was forgotten.
 */

import { useEffect, useRef, useState } from 'react'
import {
  Mic, MicOff, Clock, ArrowRight, AlertTriangle, Keyboard,
  Target, Sparkles, CheckCircle2, ShieldCheck,
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { appendTranscript } from '../utils/speech'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useAnswerDuration } from './useAnswerDuration'
import './LiveInterview.css'

/** Mirrors ANSWER_MAX_CHARS on the server, so the counter cannot lie. */
const ANSWER_MAX = 2500

/* ── Small pieces ────────────────────────────────────────────────────── */

/**
 * Why dictation is not on offer, and what to do instead.
 *
 * Every variant ends by pointing at the textarea, because in every one of them
 * the interview carries on unchanged. This is a notice, not an error: nothing
 * has failed except a convenience.
 */
function SpeechNotice({ reasonKey }) {
  const { t } = useLanguage()
  return (
    <div className="live-notice" role="status">
      <span className="live-notice__icon"><Keyboard size={17} /></span>
      <span>
        <strong className="live-notice__title">{t('prep.speech.unavailableTitle')}</strong>
        <span className="live-notice__body">{t(`prep.speech.${reasonKey}`)}</span>
      </span>
    </div>
  )
}

/**
 * The card between generating the questions and being asked the first one.
 *
 * It exists so the clock does not start while somebody is still reading a
 * microphone permission prompt. It is also the only honest place to say the
 * three things that change about this mode — one at a time, no going back, and
 * whether the microphone is going to work at all — early enough for the
 * candidate to go back and choose the written mode instead.
 */
export function LiveIntro({ interview, availability, onBegin }) {
  const { t, n } = useLanguage()
  const total = interview.questions?.length ?? 0

  return (
    <div className="card live-intro">
      <p className="eyebrow">{t('prep.modeLive')}</p>
      <p className="card__title">{interview.role || t('prep.interviewGeneric')}</p>
      {interview.focus && <p className="card__sub">{interview.focus}</p>}

      <ol className="live-intro__list">
        <li>{t('prep.howLive1')}</li>
        <li>{t('prep.howLive2')}</li>
        <li>{t('prep.howLive3')}</li>
      </ol>

      <p className="live-intro__privacy">
        <ShieldCheck size={15} />
        {t('prep.liveNoAudio')}
      </p>

      {/* Said before the interview starts rather than discovered at question
          one, so somebody on Firefox can choose the written mode instead of
          finding out mid-answer that the button does nothing. */}
      {!availability.available && <SpeechNotice reasonKey={availability.reason} />}

      <p className={`live-intro__followups${interview.followUpsAvailable ? '' : ' live-intro__followups--off'}`}>
        <Sparkles size={14} />
        {t(interview.followUpsAvailable ? 'prep.liveFollowUpsOn' : 'prep.liveFollowUpsPremium')}
      </p>

      <div className="live-intro__go">
        <button type="button" className="btn btn--primary btn--lg" onClick={onBegin}>
          {t('prep.liveBegin')}
          <ArrowRight size={17} />
        </button>
        <span className="prep-quota">
          {t('prep.liveProgress', { current: n(1), total: n(total) })}
        </span>
      </div>
    </div>
  )
}

/* ── One question ────────────────────────────────────────────────────── */

/**
 * A single question, its clock, and the microphone that answers it.
 *
 * Mounted fresh per question — see the note at the top of the file. Everything
 * it owns is deliberately scoped to the question on screen, and everything that
 * must outlive it (the answers, which question we are on, how long each one
 * took) is passed in from the page.
 */
function LiveQuestion({
  question, position, total, answer, onAnswerChange, onSpeechSource,
  isLast, onNext, onFinish, submitting, loadingNext, error,
}) {
  const { t, n } = useLanguage()
  const formatDuration = useAnswerDuration()

  const [elapsed, setElapsed] = useState(0)
  const [confirming, setConfirming] = useState(false)
  const startedAtRef = useRef(null)

  /*
   * The clock.
   *
   * Wall clock from the moment the question appears to the moment Next is
   * pressed, which is the honest measure of "how long did this take you" — it
   * includes the thinking, which is the part an interview is really testing.
   * Started in an effect rather than at render, because Date.now() during
   * render is impure and would differ between the two renders React may do.
   */
  useEffect(() => {
    startedAtRef.current = Date.now()
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  /*
   * A recognised fragment joins the answer as it stands right now.
   *
   * Passed straight to the hook rather than through a ref of its own: the hook
   * already keeps the latest callback in a ref, updated by an effect, so what
   * it invokes is always this render's closure and this render's `answer`. A
   * second cache here would only be a second thing to keep in step — and one
   * that went stale would silently overwrite whatever was typed between two
   * recognition events.
   */
  const { listening, interim, error: speechError, start, stop, availability } = useSpeechRecognition({
    onResult: (chunk) => {
      onAnswerChange(appendTranscript(answer ?? '', chunk).slice(0, ANSWER_MAX))
      // Recorded the moment speech contributes anything, and never unset: an
      // answer that was dictated and then tidied up by hand still carries
      // transcription artefacts, and the evaluator needs to know that.
      onSpeechSource()
    },
  })

  const answered = (answer ?? '').trim().length > 0
  const fatalSpeechError = speechError?.fatal === true
  const micOffered = availability.available && !fatalSpeechError
  const busy = submitting || loadingNext
  const progress = total > 0 ? ((position + 1) / total) * 100 : 0

  /** Seconds spent on this question, measured at the moment the button is hit. */
  const secondsTaken = () => Math.max(
    0,
    Math.round((Date.now() - (startedAtRef.current ?? Date.now())) / 1000),
  )

  const leave = (handler) => {
    // The microphone closes before anything else happens. A recognition event
    // arriving after we have moved on would append the last question's audio to
    // the next question's answer.
    stop()
    handler(secondsTaken())
  }

  return (
    <div className="card live">
      <header className="live__bar">
        <span className="live__progress">
          {t('prep.liveProgress', { current: n(position + 1), total: n(total) })}
        </span>
        <span className="live__timer" aria-label={t('prep.liveElapsed')}>
          <Clock size={14} />
          {formatDuration(elapsed)}
        </span>
      </header>

      <div className="live__track" aria-hidden="true">
        <span className="live__fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="live__tags">
        {question.kind === 'follow_up' ? (
          <span className="live__chip live__chip--follow">
            <Sparkles size={12} />
            {t('prep.liveFollowUp')}
          </span>
        ) : (
          <span className={`prep-kind prep-kind--${question.kind}`}>
            {t(`prep.kind.${question.kind}`)}
          </span>
        )}
        {question.targets_gap_key && (
          <span className="prep-q__gap">
            <Target size={12} />
            {t('prep.fromYourPlan')}
          </span>
        )}
      </div>

      {/* The question, and the reason this mode exists: large, centred, alone
          on the screen. Announced to assistive technology as it changes,
          because a question that silently replaces another is a question a
          screen reader user never hears. */}
      <h2 className="live__question" aria-live="polite">{question.question}</h2>
      {question.kind === 'follow_up' && (
        <p className="live__follow-note">{t('prep.liveFollowUpNote')}</p>
      )}
      {question.why && <p className="live__why">{question.why}</p>}

      <div className="live__mic">
        {micOffered ? (
          <button
            type="button"
            className={`live__mic-btn${listening ? ' live__mic-btn--on' : ''}`}
            onClick={listening ? stop : start}
            disabled={busy}
            aria-pressed={listening}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
            {listening ? t('prep.liveStop') : t('prep.liveStart')}
          </button>
        ) : (
          <SpeechNotice reasonKey={fatalSpeechError ? speechError.key : availability.reason} />
        )}

        {listening && (
          <span className="live__listening" role="status">
            <span className="live__pulse" aria-hidden="true" />
            {t('prep.liveListening')}
          </span>
        )}
      </div>

      {/* A non-fatal hiccup: silence, or a dropped connection. The button is
          still there and trying again is reasonable, so this is a line of text
          rather than the full notice. */}
      {speechError && !fatalSpeechError && (
        <p className="live__speech-warn" role="status">
          <AlertTriangle size={14} />
          {t(`prep.speech.${speechError.key}`)}
        </p>
      )}

      <label className="field__label live__answer-label" htmlFor="live-answer">
        {t('prep.liveAnswerLabel')}
      </label>
      <textarea
        id="live-answer"
        className="textarea live__answer"
        rows={6}
        maxLength={ANSWER_MAX}
        placeholder={t('prep.liveAnswerPlaceholder')}
        value={answer ?? ''}
        disabled={busy}
        onChange={event => onAnswerChange(event.target.value)}
      />

      {/* Provisional text, kept out of the box on purpose: it is replaced
          wholesale on every recognition event, and inside the textarea it would
          overwrite whatever the candidate was editing. */}
      {interim && <p className="live__interim" aria-live="off">{interim}</p>}

      <p className="live__hint">{t('prep.liveTranscriptHint')}</p>

      {error && <p className="notice notice--error" role="alert">{error}</p>}

      <footer className="live__foot">
        {!answered && (
          <p className="live__warn">
            <AlertTriangle size={14} />
            {t('prep.liveBlankWarning')}
          </p>
        )}
        {answered && !isLast && <p className="live__warn live__warn--quiet">{t('prep.liveNoGoingBack')}</p>}

        {confirming ? (
          /* An inline confirm rather than a browser dialog. This is the last
             irreversible step in the interview and it deserves to be read, not
             dismissed by reflex from a native alert. */
          <div className="live__confirm">
            <p className="live__confirm-text">{t('prep.liveConfirmFinish')}</p>
            <div className="live__confirm-actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => leave(onFinish)}
                disabled={busy}
              >
                {submitting ? t('prep.assessing') : t('prep.liveConfirmYes')}
                <CheckCircle2 size={16} />
              </button>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setConfirming(false)}
                disabled={busy}
              >
                {t('prep.liveConfirmNo')}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn--primary btn--lg live__next"
            onClick={isLast ? () => { stop(); setConfirming(true) } : () => leave(onNext)}
            disabled={busy}
          >
            {loadingNext ? t('prep.liveThinking') : isLast ? t('prep.liveFinish') : t('prep.liveNext')}
            <ArrowRight size={17} />
          </button>
        )}
      </footer>
    </div>
  )
}

/* ── The runner ──────────────────────────────────────────────────────── */

/**
 * @param {object} props
 * @param {object} props.interview the started interview, questions included
 * @param {Record<number, string>} props.answers shared with the page, so leaving
 *   the tab mid-interview does not discard what has been said
 * @param {Function} props.setAnswers
 * @param {object} props.live position, per-answer metadata and whether the
 *   candidate has begun — held by the page for the same reason
 * @param {Function} props.setLive
 * @param {Function} props.onAdvance called with the full answer payload; the
 *   page saves it and may add a follow-up question
 * @param {Function} props.onFinish called with the same payload, to submit
 * @param {boolean} props.submitting
 * @param {boolean} props.loadingNext
 * @param {string} props.error
 */
export default function LiveInterview({
  interview, answers, setAnswers, live, setLive,
  onAdvance, onFinish, submitting, loadingNext, error,
}) {
  const questions = interview.questions ?? []
  const position = Math.min(live.position ?? 0, Math.max(questions.length - 1, 0))
  const question = questions[position]

  if (!question) return null

  const questionIndex = question.index

  /*
   * Everything answered so far, in the shape the server stores.
   *
   * Built at the moment the button is pressed, because the seconds for the
   * question being left are measured then and have not reached state yet —
   * they are passed in rather than read back out.
   */
  const buildPayload = (seconds) => {
    const source = live.meta?.[questionIndex]?.source === 'speech'
      ? 'speech'
      : ((answers[questionIndex] ?? '').trim() ? 'typed' : null)

    return questions.map((item) => {
      const meta = item.index === questionIndex
        ? { seconds, source }
        : (live.meta?.[item.index] ?? {})
      return {
        index: item.index,
        answer: answers[item.index] ?? '',
        // Omitted rather than defaulted. A question nobody has reached has no
        // duration, and sending 0 would claim it was answered instantly.
        ...(Number.isFinite(meta.seconds) ? { seconds: meta.seconds } : {}),
        ...(meta.source ? { source: meta.source } : {}),
      }
    })
  }

  const remember = (payload) => {
    const mine = payload.find(entry => entry.index === questionIndex)
    setLive(current => ({
      ...current,
      meta: {
        ...current.meta,
        [questionIndex]: {
          ...(current.meta?.[questionIndex] ?? {}),
          seconds: mine?.seconds,
          ...(mine?.source ? { source: mine.source } : {}),
        },
      },
    }))
  }

  return (
    <LiveQuestion
      /* The key is load-bearing, not a list warning silencer. It is what makes
         every question a fresh clock, a fresh draft and a released microphone. */
      key={questionIndex}
      question={question}
      position={position}
      total={questions.length}
      answer={answers[questionIndex] ?? ''}
      onAnswerChange={value => setAnswers(current => ({ ...current, [questionIndex]: value }))}
      onSpeechSource={() => setLive(current => ({
        ...current,
        meta: {
          ...current.meta,
          [questionIndex]: { ...(current.meta?.[questionIndex] ?? {}), source: 'speech' },
        },
      }))}
      isLast={position >= questions.length - 1}
      onNext={(seconds) => {
        const payload = buildPayload(seconds)
        remember(payload)
        onAdvance({ payload, afterIndex: questionIndex })
      }}
      onFinish={(seconds) => {
        const payload = buildPayload(seconds)
        remember(payload)
        onFinish({ payload })
      }}
      submitting={submitting}
      loadingNext={loadingNext}
      error={error}
    />
  )
}
