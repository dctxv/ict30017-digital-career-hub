/**
 * Live dictation, as a React hook.
 *
 * Separated from utils/speech.js so the decisions in that file — which browsers
 * can dictate, what a given error means, how a fragment joins the answer — stay
 * testable without a DOM. This half is the part that genuinely needs one: an
 * engine, a microphone and a user.
 *
 * Final fragments are handed to `onResult` rather than held here, because the
 * text they belong in is the candidate's editable answer and this hook does not
 * own it. Interim text IS held here — it is provisional, it is replaced
 * wholesale on every event, and putting it into the answer would mean the
 * candidate could not edit a word without it being overwritten a moment later.
 *
 * THE THING THAT MAKES THIS HARDER THAN IT LOOKS
 *
 * A "continuous" session in Chrome is not continuous. The engine closes it by
 * itself after a stretch of silence — while the candidate is reading the
 * question, for instance — and the only way to keep a microphone open across
 * a whole answer is to notice the close and open a new session. Nearly
 * everything below is about doing that without lying to the interface in
 * either direction: never showing "Listening" over a dead engine, and never
 * switching the microphone off under somebody who is mid-sentence.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getSpeechRecognition,
  speechAvailability,
  describeSpeechError,
  isAlreadyStarted,
  SPEECH_LANGUAGE,
} from '../utils/speech'

/**
 * How long to wait before reopening a session the engine closed by itself.
 *
 * Not zero, and not a round half second. Chrome will not accept a start()
 * until it has finished tearing the old session down, and a value this small
 * is imperceptible mid-answer while still leaving the engine room to land.
 */
const RESTART_DELAY_MS = 250

/**
 * How many silent sessions in a row before saying nothing is being heard.
 *
 * Chrome gives up after roughly eight seconds of quiet, which in an interview
 * is not a fault — it is somebody reading the question and deciding how to
 * answer it. Warning on the first one put "Nothing was picked up. Check your
 * microphone" on screen during every normal thinking pause, so the message was
 * usually wrong, and a candidate who then really did have a dead microphone
 * had no way to tell the difference. Three runs is around twenty-five seconds
 * of genuine silence, which no longer describes anyone who is talking.
 */
const SILENT_RUNS_BEFORE_WARNING = 3

/**
 * @param {{onResult: (chunk: string) => void}} input
 */
export function useSpeechRecognition({ onResult }) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState(null)

  const recognitionRef = useRef(null)
  // What the USER wants, as opposed to what the engine is currently doing. The
  // two come apart constantly: Chrome ends a continuous session by itself after
  // a stretch of silence, and without this the microphone would quietly switch
  // off mid-thought and the candidate would carry on talking to nothing.
  const wantsToListenRef = useRef(false)
  const restartTimerRef = useRef(null)
  // Consecutive sessions the engine closed without hearing anything. Reset the
  // moment a word arrives, so the count only ever describes silence that is
  // still going on.
  const silentRunsRef = useRef(0)
  const onResultRef = useRef(onResult)

  useEffect(() => { onResultRef.current = onResult }, [onResult])

  // Lazily initialised state rather than a ref: this is read while rendering —
  // it decides whether the microphone button is offered at all — and a ref read
  // during render is exactly what the rules of hooks forbid. It cannot change
  // while the page is open, so a one-shot initialiser is the whole of it.
  const [availability] = useState(speechAvailability)

  const cancelRestart = useCallback(() => {
    if (restartTimerRef.current === null) return
    clearTimeout(restartTimerRef.current)
    restartTimerRef.current = null
  }, [])

  const buildRecognition = useCallback(() => {
    const Recognition = getSpeechRecognition()
    if (!Recognition) return null

    const recognition = new Recognition()
    recognition.lang = SPEECH_LANGUAGE
    recognition.continuous = true
    recognition.interimResults = true

    // The engine's own word for it. `start()` resolving only means the request
    // was accepted — the microphone may still be behind a permission prompt —
    // so this is the one event that can confirm a session really opened.
    recognition.onstart = () => setListening(true)

    // Audio is arriving. Whatever non-fatal complaint is on screen — almost
    // always "Nothing was picked up" from a silence the engine gave up on — is
    // now out of date, and leaving it there tells somebody who IS being heard
    // that they are not. Fatal errors are not cleared here: those took the
    // microphone away, so nothing is about to contradict them.
    recognition.onspeechstart = () => {
      silentRunsRef.current = 0
      setError(current => (current?.fatal ? current : null))
    }

    recognition.onresult = (event) => {
      silentRunsRef.current = 0
      setError(current => (current?.fatal ? current : null))
      let settled = ''
      let pending = ''
      // From resultIndex rather than from zero: earlier results have already
      // been handed over, and replaying them would duplicate every sentence.
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const text = result[0]?.transcript ?? ''
        if (result.isFinal) settled += text
        else pending += text
      }

      if (settled.trim()) {
        onResultRef.current?.(settled)
        // The interim that preceded this fragment is now part of the answer.
        setInterim('')
      }
      setInterim(pending.trim())
    }

    recognition.onerror = (event) => {
      // The engine's code, once, where a developer will see it. Every branch
      // below turns it into something a candidate can act on, which is right
      // for them and useless for diagnosing a browser that is refusing for a
      // reason none of the branches cover.
      if (import.meta.env?.DEV) console.warn(`[speech] ${event?.error}`)

      const described = describeSpeechError(event?.error)
      if (!described) return

      // Silence is only worth mentioning once it has gone on long enough to
      // mean something. Every other complaint is reported the first time.
      if (described.key === 'noSpeech') {
        silentRunsRef.current += 1
        if (silentRunsRef.current < SILENT_RUNS_BEFORE_WARNING) return
      }

      setError(described)
      if (described.fatal) {
        wantsToListenRef.current = false
        cancelRestart()
        setListening(false)
        setInterim('')
      }
    }

    recognition.onend = () => {
      // Whatever was provisional died with the session.
      setInterim('')

      // Ended because the user pressed stop, or moved on, or hit something
      // fatal. All three mean stay closed.
      if (!wantsToListenRef.current) {
        setListening(false)
        return
      }

      // Ended by the engine while the user still wants it running: reopen it,
      // but on a LATER TICK. Chrome rejects a start() issued from inside its
      // own onend with InvalidStateError, because the session it is closing has
      // not finished closing. This used to be a synchronous call whose catch
      // gave up and cleared wantsToListen — so a few seconds of silence while
      // reading the question was enough to switch the microphone off for good.
      //
      // `listening` deliberately stays true across the gap. It is a quarter of
      // a second and the user's intent has not changed; flicking the button
      // back to "Start speaking" and then on again would be a lie in the other
      // direction.
      cancelRestart()
      restartTimerRef.current = setTimeout(() => {
        restartTimerRef.current = null
        if (!wantsToListenRef.current) return
        try {
          recognition.start()
        } catch (cause) {
          // Already running is the state we wanted. Anything else means the
          // microphone is shut and the interface must stop claiming otherwise.
          if (isAlreadyStarted(cause)) return
          if (import.meta.env?.DEV) console.warn('[speech] restart failed', cause)
          wantsToListenRef.current = false
          setListening(false)
          setError({ key: 'generic', fatal: false })
        }
      }, RESTART_DELAY_MS)
    }

    return recognition
  }, [cancelRestart])

  const start = useCallback(() => {
    if (!availability.available) return
    setError(null)
    cancelRestart()

    if (!recognitionRef.current) recognitionRef.current = buildRecognition()
    const recognition = recognitionRef.current
    if (!recognition) return

    // Set before start() rather than after, because a start() that throws
    // because the previous session is still closing is recoverable — onend is
    // about to fire, and this flag is what tells it to reopen.
    wantsToListenRef.current = true
    try {
      recognition.start()
    } catch (cause) {
      if (!isAlreadyStarted(cause)) {
        if (import.meta.env?.DEV) console.warn('[speech] start failed', cause)
        wantsToListenRef.current = false
        setListening(false)
        setError({ key: 'generic', fatal: false })
        return
      }
    }
    // Optimistic, and corrected by onstart a moment later. The button has to
    // respond to the press even in engines that never fire onstart.
    setListening(true)
  }, [availability.available, buildRecognition, cancelRestart])

  /**
   * Drops the provisional text without touching the engine.
   *
   * For the moment the candidate edits the box by hand while a phrase is still
   * in the air: the words they typed are the ones they want, and re-showing a
   * preview underneath them would fight the cursor.
   */
  const clearInterim = useCallback(() => setInterim(''), [])

  const stop = useCallback(() => {
    wantsToListenRef.current = false
    cancelRestart()
    setListening(false)
    setInterim('')
    try {
      recognitionRef.current?.stop()
    } catch {
      // Not running. Nothing to stop.
    }
  }, [cancelRestart])

  // Leaving the question, or the page, releases the microphone. Without this
  // the browser's recording indicator stays lit after the interview has moved
  // on, which is alarming and fair enough.
  useEffect(() => () => {
    wantsToListenRef.current = false
    if (restartTimerRef.current !== null) clearTimeout(restartTimerRef.current)
    try {
      recognitionRef.current?.abort()
    } catch {
      // Already gone.
    }
  }, [])

  return { listening, interim, error, start, stop, clearInterim, availability }
}
