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
 * The candidate records an answer, presses stop, and Whisper's transcript of it
 * lands in an ordinary editable textarea rather than a read-only panel.
 * Transcription is good and still wrong some of the time — a mangled employer,
 * a misheard tool — and the candidate is marked on this text, so they must be
 * able to fix it. That is also why moving on is blocked while a recording is
 * running or being transcribed: the answer should be read back before it is
 * left behind.
 *
 * THE AUDIO GOES TO THE SERVER, AND NO FURTHER THAN IT NEEDS TO. Each recording
 * is sent to be transcribed (Whisper, on Groq), held in memory for that one
 * request and never stored. What is saved is the text the candidate read,
 * corrected and chose to submit. The intro card says this before anything is
 * recorded.
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
  Mic, Square, LoaderCircle, Clock, ArrowRight, AlertTriangle, Keyboard,
  Target, Sparkles, CheckCircle2, ShieldCheck,
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { appendTranscript, dictationAvailability, MAX_RECORDING_SECONDS } from '../utils/speech'
import { useDictation } from './useDictation'
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
        {t('prep.liveAudioPrivacy')}
      </p>

      {/* Said before the interview starts rather than discovered at question
          one, so somebody whose browser cannot record — or whose server cannot
          transcribe — can choose the written mode instead of finding out
          mid-answer that the button does nothing. */}
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
 * took, whether the microphone has been ruled out) is passed in from the page.
 */
function LiveQuestion({
  interviewId, question, position, total, answer, onAnswerChange, onTranscript,
  serverReady, blockedKey, onDictationBlocked,
  isLast, onNext, onFinish, submitting, loadingNext, error,
}) {
  const { t, n } = useLanguage()
  const formatDuration = useAnswerDuration()

  const [elapsed, setElapsed] = useState(0)
  const [confirming, setConfirming] = useState(false)
  const startedAtRef = useRef(null)
  // Whether this browser can record and this server can transcribe. Neither
  // changes while the page is open, so it is worked out once.
  const [availability] = useState(() => dictationAvailability({ serverReady }))

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
   * A transcript is handed to the page, which appends it to this question's
   * answer as it stands when the transcript arrives. The page rather than this
   * component, because the transcript can arrive after this component has gone
   * — the candidate opened another tab while it was being written down — and
   * appending there rather than to the `answer` this closure holds keeps
   * whatever the candidate typed while they waited.
   *
   * The check for a full box is only for the message. The page does the
   * trimming, against the answer as it really is.
   */
  const dictation = useDictation({
    interviewId,
    onResult: (text) => {
      const truncated = appendTranscript(answer ?? '', text).length > ANSWER_MAX
      onTranscript(text)
      return { truncated }
    },
    // A refused microphone or a server that cannot transcribe will be the same
    // on the next question, so the page stops offering the button for the rest
    // of the interview rather than letting it fail again five times.
    onFatalError: (described) => onDictationBlocked(described.key),
  })
  const { recording, transcribing, error: speechError } = dictation

  const answered = (answer ?? '').trim().length > 0
  // Nothing more a recording could add. Offering the button anyway would spend
  // the shared allowance on words the box then cuts off.
  const answerFull = (answer ?? '').length >= ANSWER_MAX
  const blocked = blockedKey ?? (speechError?.fatal ? speechError.key : null)
  const micOffered = availability.available && !blocked
  const busy = submitting || loadingNext
  // Moving on waits for a recording to be stopped and written down, so a
  // spoken answer is read back before it is left behind. Not for the
  // microphone prompt, though: a prompt the candidate never answers would
  // otherwise leave them unable to move on at all.
  const capturing = recording || transcribing
  const locked = busy || capturing
  const progress = total > 0 ? ((position + 1) / total) * 100 : 0

  /** Seconds spent on this question, measured at the moment the button is hit. */
  const secondsTaken = () => Math.max(
    0,
    Math.round((Date.now() - (startedAtRef.current ?? Date.now())) / 1000),
  )

  const leave = (handler) => handler(secondsTaken())

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
            className={`live__mic-btn${recording ? ' live__mic-btn--on' : ''}`}
            onClick={recording ? dictation.stop : dictation.start}
            // Pressable only to start from rest or to stop a recording. While
            // the microphone is opening or the answer is being transcribed
            // there is nothing a press could sensibly do, and a full answer
            // has no room for more.
            disabled={busy || (!recording && (dictation.busy || answerFull))}
            aria-pressed={recording}
          >
            {transcribing
              ? <LoaderCircle size={18} className="live__spin" />
              : recording ? <Square size={15} /> : <Mic size={18} />}
            {transcribing ? t('prep.liveTranscribing') : recording ? t('prep.liveStop') : t('prep.liveStart')}
          </button>
        ) : (
          <SpeechNotice reasonKey={blocked ?? availability.reason} />
        )}

        {recording && (
          <span className="live__listening">
            <span className="live__pulse" aria-hidden="true" />
            {/* The word is the live region; the running count beside it is not,
                or a screen reader would read out every second. */}
            <span role="status">{t('prep.liveRecording')}</span>
            <span className="live__rec-time" aria-hidden="true">{formatDuration(dictation.seconds)}</span>
          </span>
        )}
      </div>

      {/* A non-fatal hiccup: nothing heard, a busy service, a dropped
          connection. The button is still there and trying again is
          reasonable, so this is a line of text rather than the full notice. */}
      {speechError && !speechError.fatal && (
        <p className="live__speech-warn" role="status">
          <AlertTriangle size={14} />
          {t(`prep.speech.${speechError.key}`, { minutes: n(MAX_RECORDING_SECONDS / 60), max: n(ANSWER_MAX) })}
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
        onChange={(event) => onAnswerChange(event.target.value)}
      />

      <p className="live__hint">{t('prep.liveTranscriptHint')}</p>

      {error && <p className="notice notice--error" role="alert">{error}</p>}

      <footer className="live__foot">
        {capturing ? (
          <p className="live__warn live__warn--quiet">{t('prep.liveStopFirst')}</p>
        ) : (
          <>
            {!answered && (
              <p className="live__warn">
                <AlertTriangle size={14} />
                {t('prep.liveBlankWarning')}
              </p>
            )}
            {answered && !isLast && <p className="live__warn live__warn--quiet">{t('prep.liveNoGoingBack')}</p>}
          </>
        )}

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
                disabled={locked}
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
            onClick={isLast ? () => setConfirming(true) : () => leave(onNext)}
            disabled={locked}
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
 * @param {object} props.live position, per-answer metadata, whether the
 *   candidate has begun and whether dictation has been ruled out — held by the
 *   page for the same reason
 * @param {Function} props.setLive
 * @param {(interviewId: number, index: number, text: string) => void} props.onTranscript
 *   adds a transcript to one question's answer; held by the page, because a
 *   transcript can arrive after this component has unmounted
 * @param {Function} props.onAdvance called with the full answer payload; the
 *   page saves it and may add a follow-up question
 * @param {Function} props.onFinish called with the same payload, to submit
 * @param {boolean} props.submitting
 * @param {boolean} props.loadingNext
 * @param {string} props.error
 */
export default function LiveInterview({
  interview, answers, setAnswers, live, setLive, onTranscript,
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
         every question a fresh clock, a fresh draft and a released microphone,
         and what drops a transcript still in flight for the question before. */
      key={questionIndex}
      interviewId={interview.interviewId}
      question={question}
      position={position}
      total={questions.length}
      answer={answers[questionIndex] ?? ''}
      onAnswerChange={value => setAnswers(current => ({ ...current, [questionIndex]: value }))}
      /* Bound to this interview and this question here, so a transcript that
         arrives late can only ever join the answer it was spoken for. */
      onTranscript={text => onTranscript(interview.interviewId, questionIndex, text)}
      serverReady={interview.dictationAvailable}
      blockedKey={live.dictationBlocked ?? null}
      onDictationBlocked={key => setLive(current => ({ ...current, dictationBlocked: key }))}
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
