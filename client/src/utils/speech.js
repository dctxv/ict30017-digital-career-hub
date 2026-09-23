/**
 * The browser's own speech recognition, and what to do in the browsers that do
 * not have it.
 *
 * WHY THE BROWSER AND NOT AN API
 *
 * There is no budget for a speech service, and that constraint produced a
 * better privacy story than a funded one would have. Nothing here uploads
 * audio to this project: recognition happens through the browser's own engine,
 * and what reaches the server is the text the candidate read, corrected and
 * chose to submit. There is no recording to store, so the promise the rest of
 * the feature makes about uploads is made trivially here.
 *
 * It also means the quality of the transcript is not ours to improve. It will
 * drop punctuation, run sentences together and mangle proper nouns. That is why
 * the transcript is editable before submission and why the evaluation prompt is
 * told the answers were dictated — the two halves of the same admission.
 *
 * WHO HAS IT
 *
 * Chrome, Edge and Opera implement it, behind the `webkit` prefix. Firefox does
 * not implement it at all, and Safari's support is partial and unreliable
 * enough that it is not claimed here. So roughly a third of visitors will not
 * be able to dictate, which makes the fallback a first-class path rather than
 * an error state: they get the same one-question-at-a-time interview and type
 * their answers, and nothing about the interview or its marking changes.
 *
 * THREE WAYS IT IS UNAVAILABLE, AND THEY ARE NOT THE SAME
 *
 *   unsupported  the browser has no engine. Nothing the user can do; suggest
 *                a browser that does and move on.
 *   insecure     the page is not on HTTPS. Microphone access is gated on a
 *                secure context, so the API may exist and still never work.
 *                Localhost counts as secure, which is exactly why this fails
 *                in testing only after deployment — say so plainly.
 *   denied       the user said no, or the operating system did. Recoverable,
 *                but only by the user, through browser settings this page
 *                cannot open.
 *
 * Telling them apart matters because the remedy differs and a single "speech is
 * unavailable" would send everyone to the wrong one.
 *
 * Deliberately no React in this file. Everything here is a pure function of a
 * window object or a string, which is what lets it be tested in node against a
 * stub — see speech.test.js. The hook that drives an actual microphone lives in
 * components/useSpeechRecognition.js, because it needs a browser and this does
 * not.
 */

/**
 * The language dictation runs in, fixed.
 *
 * English only, agreed with the client: Bengali recognition is a paid API this
 * project has no budget for, and a half-working Bangla mode that transcribes
 * Bengali speech as English phonetics would produce text nobody could mark.
 * The live mode is not offered at all when the interface is in Bangla, so this
 * constant is never in tension with the page around it.
 */
export const SPEECH_LANGUAGE = 'en-US'

/**
 * The constructor, whatever this browser calls it.
 *
 * Takes the window rather than reading the global so the pure helpers in this
 * module can be tested in node against a stub.
 */
export function getSpeechRecognition(win = typeof window === 'undefined' ? undefined : window) {
  if (!win) return null
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null
}

/**
 * Whether dictation can be offered, and if not, which of the three reasons.
 *
 * Checked in this order deliberately. A browser with no engine cannot be fixed
 * by HTTPS, so saying "this page needs HTTPS" to a Firefox user would send them
 * to solve a problem they do not have.
 *
 * @param {Window} [win]
 * @returns {{available: boolean, reason: 'ok'|'unsupported'|'insecure'}}
 */
export function speechAvailability(win = typeof window === 'undefined' ? undefined : window) {
  if (!getSpeechRecognition(win)) return { available: false, reason: 'unsupported' }
  // `isSecureContext` is true on localhost as well as on HTTPS, which is the
  // whole trap: this passes in development and fails the first time the site is
  // opened over plain http on a phone.
  if (win && win.isSecureContext === false) return { available: false, reason: 'insecure' }
  return { available: true, reason: 'ok' }
}

/**
 * Turns a SpeechRecognition error code into something the interface can act on.
 *
 * `fatal` is the part that matters. A denied permission means the microphone is
 * gone for this page until the user changes a browser setting, so the button
 * must stop offering it. Silence or a dropped network is a hiccup — the button
 * stays, because trying again is a reasonable thing to do.
 *
 * `aborted` is what a browser reports when this code stopped it on purpose, so
 * it is not an error at all and returns null rather than flashing a message at
 * somebody who just pressed stop.
 *
 * @param {string} code
 * @returns {{key: string, fatal: boolean}|null}
 */
export function describeSpeechError(code) {
  switch (code) {
    case 'aborted':
      return null
    case 'not-allowed':
    case 'service-not-allowed':
      return { key: 'denied', fatal: true }
    case 'audio-capture':
      return { key: 'noMicrophone', fatal: true }
    case 'language-not-supported':
      return { key: 'languageUnsupported', fatal: true }
    case 'network':
      return { key: 'network', fatal: false }
    case 'no-speech':
      return { key: 'noSpeech', fatal: false }
    default:
      return { key: 'generic', fatal: false }
  }
}

/**
 * Adds a recognised chunk to what is already in the box.
 *
 * Recognition arrives in fragments with no punctuation and no leading capital,
 * so three sentences dictated in one breath come back as three lowercase
 * fragments. This does the small amount of tidying that is safe to do without
 * guessing: one space between fragments, a capital at the very start, and a
 * capital after a fragment that ended a sentence.
 *
 * Deliberately no further than that. Inserting full stops where the speaker
 * paused would put punctuation in the candidate's answer that the candidate did
 * not choose, and they are about to be marked on that answer. The box is
 * editable precisely so the rest is theirs.
 *
 * @param {string} existing
 * @param {string} chunk
 * @returns {string}
 */
export function appendTranscript(existing, chunk) {
  const addition = String(chunk ?? '').replace(/\s+/g, ' ').trim()
  if (!addition) return String(existing ?? '')

  const base = String(existing ?? '').replace(/\s+$/, '')
  const capitalise = (text) => (text ? text[0].toUpperCase() + text.slice(1) : text)

  if (!base) return capitalise(addition)
  // A capital only where the previous fragment actually closed a sentence.
  // Mid-sentence the speaker's next word is not a new sentence and should not
  // be dressed as one.
  const startsNewSentence = /[.!?]["')\]]?$/.test(base)
  return `${base} ${startsNewSentence ? capitalise(addition) : addition}`
}

/**
 * Whether a thrown start() failure just means "it is already running".
 *
 * Worth telling apart, because the two outcomes are opposites. A session that
 * is already open is the state we wanted and there is nothing to report; any
 * other failure means the microphone is NOT open, and the interface must stop
 * claiming it is. The old code caught both and assumed the first, which is how
 * a dead engine went on showing "Listening".
 *
 * Chrome raises a DOMException named InvalidStateError. The name is checked
 * first and the message only as a fallback, because the message is not
 * specified and differs between engines.
 *
 * @param {unknown} cause
 * @returns {boolean}
 */
export function isAlreadyStarted(cause) {
  if (!cause) return false
  if (cause.name === 'InvalidStateError') return true
  return /already (started|running)/i.test(String(cause.message ?? ''))
}
