/**
 * Record an answer, send it to Whisper, hand back the text — as a React hook.
 *
 * Separated from utils/speech.js so the decisions in that file — which browsers
 * can record, what a given failure means, how a transcript joins the answer —
 * stay testable without a DOM. This half is the part that genuinely needs one:
 * a microphone, a recorder and a user.
 *
 * THE SHAPE OF ONE RECORDING
 *
 *   idle ──start()──▶ starting ──microphone granted──▶ recording
 *     ▲                  │ refused                        │ stop(), or the
 *     │                  ▼                                ▼ time limit
 *     └──────────── (error shown) ◀── transcribing ◀── recorder stopped
 *
 * The transcript is handed to `onResult` rather than held here, because the
 * text it belongs in is the candidate's editable answer and this hook does not
 * own it. It arrives once per recording, all at once: Whisper transcribes a
 * finished clip, so there is no provisional text to show while somebody talks.
 *
 * WHAT HAPPENS TO A RECORDING WHEN THE QUESTION GOES AWAY
 *
 * The component that uses this unmounts whenever the candidate opens another
 * tab of the page, and a spoken answer is minutes of somebody's effort. So an
 * unmount does not throw it away: a recording still running is stopped and
 * sent, and a transcript already on its way is allowed to arrive. `onResult`
 * must therefore write to state that outlives the component, keyed to the
 * question and interview it belongs to — which is what the page's callback
 * does. It is never written to "whichever question is on screen now", so it
 * cannot land in the wrong answer. What is dropped after an unmount is only
 * what there is nobody left to show: the spinner, and any error message.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { transcribeRecording } from '../api/preparation'
import {
  getMediaRecorder,
  recorderAvailability,
  pickRecordingType,
  describeMicrophoneError,
  describeTranscriptionError,
  MAX_RECORDING_SECONDS,
  MIN_RECORDING_MS,
  RECORDING_BITRATE,
} from '../utils/speech'

/**
 * How long to wait for a transcript before giving the candidate their buttons
 * back. The server gives up on Groq inside a minute; this is the backstop for
 * a request that never answers at all, because Next is disabled until it does.
 */
const TRANSCRIBE_TIMEOUT_MS = 75_000

/**
 * @param {{
 *   interviewId: number,
 *   onResult: (text: string) => ({truncated?: boolean}|void),
 *   onFatalError?: (error: {key: string, fatal: true}) => void,
 * }} input `onResult` may report that the answer box could not hold all of the
 *   transcript, which is then said on screen. `onFatalError` is told when the
 *   microphone or the server has gone for good, so the page can stop offering
 *   the button on later questions too
 */
export function useDictation({ interviewId, onResult, onFatalError }) {
  const [phase, setPhaseState] = useState('idle')
  const [error, setError] = useState(null)
  const [seconds, setSeconds] = useState(0)

  // A mirror of `phase` for the callbacks, which must not act on the value a
  // render captured: two quick presses would both see 'idle' and open two
  // microphones.
  const phaseRef = useRef('idle')
  const streamRef = useRef(null)
  // The recorder currently in use. Each recorder's own handlers check they are
  // still this one before touching anything, so a recorder that errored and
  // was replaced cannot stop the next one's microphone or take its audio.
  const recorderRef = useRef(null)
  const startedAtRef = useRef(0)
  const tickRef = useRef(null)
  const limitRef = useRef(null)
  // Set when the recording was stopped by the time limit rather than by the
  // candidate, so the transcript can arrive with a note saying why.
  const hitLimitRef = useRef(false)
  const disposedRef = useRef(false)
  const callbacksRef = useRef({ interviewId, onResult, onFatalError })

  useEffect(() => {
    callbacksRef.current = { interviewId, onResult, onFatalError }
  }, [interviewId, onResult, onFatalError])

  const setPhase = useCallback((next) => {
    phaseRef.current = next
    if (!disposedRef.current) setPhaseState(next)
  }, [])

  const show = useCallback((described) => {
    if (!disposedRef.current) setError(described)
  }, [])

  const report = useCallback((described) => {
    show(described)
    if (described?.fatal) callbacksRef.current.onFatalError?.(described)
  }, [show])

  /** Turns the microphone off. The browser's recording indicator goes with it. */
  const releaseMicrophone = useCallback(() => {
    clearInterval(tickRef.current)
    tickRef.current = null
    clearTimeout(limitRef.current)
    limitRef.current = null
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
  }, [])

  const deliver = useCallback(async (recording) => {
    setPhase('transcribing')
    const controller = new AbortController()
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, TRANSCRIBE_TIMEOUT_MS)

    try {
      const text = await transcribeRecording(callbacksRef.current.interviewId, recording, { signal: controller.signal })
      if (text.trim()) {
        // Delivered even if the question has unmounted since: the callback is
        // keyed to the question this recording answers. See the header.
        const outcome = callbacksRef.current.onResult?.(text)
        show(outcome?.truncated
          ? { key: 'truncated', fatal: false }
          : hitLimitRef.current ? { key: 'limitReached', fatal: false } : null)
      } else {
        // Whisper heard nothing it would stand behind. Usually the wrong
        // microphone, which is what the message is about.
        show({ key: 'noSpeech', fatal: false })
      }
    } catch (cause) {
      if (import.meta.env?.DEV) console.warn('[dictation] transcription failed', cause)
      // Aborted by the timer: the request is gone and the connection is the
      // likeliest reason.
      report(timedOut ? { key: 'network', fatal: false } : describeTranscriptionError(cause))
    } finally {
      clearTimeout(timer)
      setPhase('idle')
    }
  }, [report, setPhase, show])

  const handleStop = useCallback((recorder, chunks, requestedType) => {
    // A recorder that errored has already been retired, and its late stop
    // event must not touch the microphone or phase of whatever came next.
    if (recorderRef.current !== recorder) return
    recorderRef.current = null
    const elapsed = Date.now() - startedAtRef.current
    releaseMicrophone()

    // The recorder's own report of what it produced wins over what was asked
    // for: a browser may have ignored the request, and the server decodes by
    // type.
    const type = recorder.mimeType || requestedType || chunks[0]?.type || 'audio/webm'
    const recording = new Blob(chunks, { type })

    // An accidental tap. Sending it would spend part of the shared allowance on
    // a click, and Whisper tends to answer silence with "Thank you."
    if (elapsed < MIN_RECORDING_MS || recording.size === 0) {
      setPhase('idle')
      return
    }

    deliver(recording)
  }, [deliver, releaseMicrophone, setPhase])

  const stop = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    try {
      // Fires a last dataavailable and then onstop, which does the rest.
      recorder.stop()
    } catch {
      recorderRef.current = null
      releaseMicrophone()
      setPhase('idle')
    }
  }, [releaseMicrophone, setPhase])

  const start = useCallback(async () => {
    if (phaseRef.current !== 'idle' || !recorderAvailability().available) return
    show(null)
    setPhase('starting')
    hitLimitRef.current = false

    let stream
    try {
      // Echo cancellation and noise suppression are browser defaults, asked
      // for explicitly because a laptop playing the question aloud through its
      // own speakers is exactly the room this is recorded in.
      stream = await window.navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      })
    } catch (cause) {
      if (import.meta.env?.DEV) console.warn('[dictation] microphone refused', cause)
      setPhase('idle')
      report(describeMicrophoneError(cause))
      return
    }

    // The question was left while the permission prompt was open. Nothing has
    // been said yet, so there is nothing to keep.
    if (disposedRef.current) {
      stream.getTracks().forEach(track => track.stop())
      phaseRef.current = 'idle'
      return
    }

    const Recorder = getMediaRecorder()
    const mimeType = pickRecordingType(Recorder)
    let recorder
    try {
      recorder = new Recorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: RECORDING_BITRATE,
      })
    } catch {
      // A browser that refuses the options still records with its own.
      try {
        recorder = new Recorder(stream)
      } catch (cause) {
        if (import.meta.env?.DEV) console.warn('[dictation] recorder refused', cause)
        stream.getTracks().forEach(track => track.stop())
        setPhase('idle')
        report({ key: 'generic', fatal: false })
        return
      }
    }

    // This recording's audio, and only this recording's.
    const chunks = []
    streamRef.current = stream
    recorderRef.current = recorder

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunks.push(event.data)
    }
    recorder.onstop = () => handleStop(recorder, chunks, mimeType)
    recorder.onerror = (event) => {
      if (recorderRef.current !== recorder) return
      if (import.meta.env?.DEV) console.warn('[dictation] recorder error', event?.error)
      // Retired before it is stopped, so its own stop event is ignored: what
      // it captured before the error is not trusted to decode.
      recorderRef.current = null
      try {
        if (recorder.state !== 'inactive') recorder.stop()
      } catch {
        // Already stopped.
      }
      releaseMicrophone()
      setPhase('idle')
      report({ key: 'generic', fatal: false })
    }

    try {
      // A one-second timeslice rather than one blob at the end, so a recorder
      // that dies mid-answer has handed over most of what it heard.
      recorder.start(1000)
    } catch (cause) {
      if (import.meta.env?.DEV) console.warn('[dictation] recorder did not start', cause)
      recorderRef.current = null
      releaseMicrophone()
      setPhase('idle')
      report({ key: 'generic', fatal: false })
      return
    }

    startedAtRef.current = Date.now()
    setSeconds(0)
    tickRef.current = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000))
    }, 1000)
    limitRef.current = setTimeout(() => {
      hitLimitRef.current = true
      stop()
    }, MAX_RECORDING_SECONDS * 1000)
    setPhase('recording')
  }, [handleStop, releaseMicrophone, report, setPhase, show, stop])

  // Leaving the question, or the page, turns the microphone off. A recording
  // in progress is stopped and still sent — see the header for why — and a
  // transcript already on its way is left to arrive. Re-armed on mount because
  // StrictMode mounts, unmounts and mounts again in development.
  useEffect(() => {
    disposedRef.current = false
    return () => {
      disposedRef.current = true
      const recorder = recorderRef.current
      try {
        if (recorder && recorder.state !== 'inactive') recorder.stop()
      } catch {
        // Already stopped.
      }
      releaseMicrophone()
    }
  }, [releaseMicrophone])

  return {
    phase,
    recording: phase === 'recording',
    transcribing: phase === 'transcribing',
    // Anything but idle.
    busy: phase !== 'idle',
    seconds,
    error,
    start,
    stop,
  }
}
