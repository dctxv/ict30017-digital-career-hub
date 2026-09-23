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
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getSpeechRecognition,
  speechAvailability,
  describeSpeechError,
  SPEECH_LANGUAGE,
} from '../utils/speech'

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
  const onResultRef = useRef(onResult)

  useEffect(() => { onResultRef.current = onResult }, [onResult])

  // Lazily initialised state rather than a ref: this is read while rendering —
  // it decides whether the microphone button is offered at all — and a ref read
  // during render is exactly what the rules of hooks forbid. It cannot change
  // while the page is open, so a one-shot initialiser is the whole of it.
  const [availability] = useState(speechAvailability)

  const buildRecognition = useCallback(() => {
    const Recognition = getSpeechRecognition()
    if (!Recognition) return null

    const recognition = new Recognition()
    recognition.lang = SPEECH_LANGUAGE
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
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
      const described = describeSpeechError(event?.error)
      if (!described) return
      setError(described)
      if (described.fatal) {
        wantsToListenRef.current = false
        setListening(false)
        setInterim('')
      }
    }

    recognition.onend = () => {
      // Ended by the engine while the user still wants it running: restart.
      // Guarded on wantsToListen so pressing stop, unmounting, or hitting a
      // fatal error all end it for good rather than looping.
      if (wantsToListenRef.current) {
        try {
          recognition.start()
          return
        } catch {
          // Already starting, or the engine is gone. Fall through and report
          // it as stopped rather than claiming a microphone that is not open.
          wantsToListenRef.current = false
        }
      }
      setListening(false)
      setInterim('')
    }

    return recognition
  }, [])

  const start = useCallback(() => {
    if (!availability.available) return
    setError(null)

    if (!recognitionRef.current) recognitionRef.current = buildRecognition()
    const recognition = recognitionRef.current
    if (!recognition) return

    wantsToListenRef.current = true
    try {
      recognition.start()
      setListening(true)
    } catch {
      // start() throws if it is already running. That is the state we wanted,
      // so it is not worth reporting.
      setListening(true)
    }
  }, [availability.available, buildRecognition])

  const stop = useCallback(() => {
    wantsToListenRef.current = false
    setListening(false)
    setInterim('')
    try {
      recognitionRef.current?.stop()
    } catch {
      // Not running. Nothing to stop.
    }
  }, [])

  // Leaving the question, or the page, releases the microphone. Without this
  // the browser's recording indicator stays lit after the interview has moved
  // on, which is alarming and fair enough.
  useEffect(() => () => {
    wantsToListenRef.current = false
    try {
      recognitionRef.current?.abort()
    } catch {
      // Already gone.
    }
  }, [])

  return { listening, interim, error, start, stop, availability }
}
