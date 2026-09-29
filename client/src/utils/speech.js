/**
 * Recording an answer for Whisper, and what to do when it cannot be recorded.
 *
 * WHY THE BROWSER RECORDS AND WHISPER LISTENS
 *
 * Dictation used to run on the browser's own Web Speech engine. That engine
 * only exists in Chrome, Edge and Opera, so roughly a third of visitors could
 * not speak their answers at all, and the quality of what the rest got
 * depended on which browser they happened to open. The client asked for one
 * recogniser for everybody. So the browser now only does the part every
 * current browser can do — record the microphone — and the recording is sent
 * to the server, transcribed by Whisper (on Groq), and the text comes back into
 * the candidate's editable answer box.
 *
 * The trade is that words no longer appear while they are being said. They
 * appear a few seconds after Stop, all at once, and usually with better
 * punctuation than the browser engine ever managed.
 *
 * AUDIO NOW LEAVES THE BROWSER
 *
 * It did not before, and the page used to say so. The recording goes to this
 * server and on to Groq to be transcribed; the server holds it in memory for
 * that one request and never stores it. The intro card says this in plain words
 * before the interview starts.
 *
 * WHO CAN RECORD
 *
 * Every current desktop and mobile browser: Chrome, Edge, Firefox and Safari
 * all implement MediaRecorder and getUserMedia. What they record differs —
 * webm or ogg with Opus in the first three, mp4 with AAC in Safari — and the
 * server accepts all of them.
 *
 * THREE WAYS IT IS UNAVAILABLE, AND THEY ARE NOT THE SAME
 *
 *   unsupported    the browser cannot record at all. Rare now: an old browser,
 *                  or an in-app browser inside another app.
 *   insecure       the page is not on HTTPS. Microphone access is gated on a
 *                  secure context, so recording may exist and still never work.
 *                  Localhost counts as secure, which is exactly why this fails
 *                  in testing only after deployment — say so plainly.
 *   notConfigured  the server has no Groq key, so there is nothing to send the
 *                  recording to. Only whoever runs the server can fix it.
 *
 * And, once recording is attempted, `denied`: the user or the operating system
 * refused the microphone. Recoverable, but only by the user, through browser
 * settings this page cannot open.
 *
 * Telling them apart matters because the remedy differs and a single "speech is
 * unavailable" would send everyone to the wrong one.
 *
 * Deliberately no React in this file. Everything here is a pure function of a
 * window object, an error or a string, which is what lets it be tested in node
 * against a stub — see speech.test.js. The hook that drives an actual
 * microphone lives in components/useDictation.js, because it needs a browser
 * and this does not.
 */

/**
 * The longest single recording, in seconds.
 *
 * Three minutes is about four hundred spoken words, which is the 2,500
 * character answer cap — a longer recording would produce text the box cannot
 * hold. It also bounds what one press of the button can spend of the server's
 * shared transcription allowance. Recording stops by itself at this point and
 * what was said is transcribed; pressing record again carries on.
 */
export const MAX_RECORDING_SECONDS = 180

/**
 * Recordings shorter than this are treated as an accidental tap and discarded
 * without being sent. Nobody answers a question in under a second, and Whisper
 * given a click of silence tends to reply "Thank you."
 */
export const MIN_RECORDING_MS = 700

/**
 * The bitrate asked of the recorder, in bits per second.
 *
 * Speech is intelligible to Whisper far below a browser's default of around
 * 128 kbps; 32 kbps Opus keeps a three-minute answer under a megabyte, which
 * matters on a phone uploading over mobile data. Browsers treat it as a hint.
 */
export const RECORDING_BITRATE = 32000

/**
 * Container types in order of preference. Opus in webm is what Chrome, Edge and
 * Firefox record best; mp4 is what Safari records. The first one this browser
 * supports is used.
 */
const PREFERRED_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
  'audio/mpeg',
]

/**
 * The MediaRecorder constructor, if this browser has one.
 *
 * Takes the window rather than reading the global so the pure helpers in this
 * module can be tested in node against a stub.
 */
export function getMediaRecorder(win = typeof window === 'undefined' ? undefined : window) {
  return win?.MediaRecorder ?? null
}

/**
 * Whether this browser can record the microphone, and if not, why.
 *
 * Checked in this order deliberately. A browser with no recorder cannot be
 * fixed by HTTPS, so saying "this page needs HTTPS" to it would send somebody
 * to solve a problem they do not have. And on plain http most browsers remove
 * navigator.mediaDevices entirely, so the secure-context check has to come
 * BEFORE the getUserMedia one or every http visitor would be told their
 * browser is unsupported.
 *
 * @param {Window} [win]
 * @returns {{available: boolean, reason: 'ok'|'unsupported'|'insecure'}}
 */
export function recorderAvailability(win = typeof window === 'undefined' ? undefined : window) {
  if (!getMediaRecorder(win)) return { available: false, reason: 'unsupported' }
  // Only an explicit false counts: `isSecureContext` is true on localhost as
  // well as on HTTPS, which is the whole trap — this passes in development and
  // fails the first time the site is opened over plain http on a phone.
  if (win.isSecureContext === false) return { available: false, reason: 'insecure' }
  if (typeof win.navigator?.mediaDevices?.getUserMedia !== 'function') {
    return { available: false, reason: 'unsupported' }
  }
  return { available: true, reason: 'ok' }
}

/**
 * Whether dictation can be offered in this interview: the browser must be able
 * to record, and the server must be able to transcribe.
 *
 * The browser is asked first, for the same reason as above — a candidate on a
 * browser that cannot record would gain nothing from being told the server is
 * not set up.
 *
 * @param {{serverReady?: boolean, win?: Window}} [input] `serverReady` is the
 *   interview's `dictationAvailable`; anything but an explicit false is taken
 *   as ready, so an interview object without the field still offers the button
 * @returns {{available: boolean, reason: 'ok'|'unsupported'|'insecure'|'notConfigured'}}
 */
export function dictationAvailability({ serverReady, win } = {}) {
  const browser = recorderAvailability(win ?? (typeof window === 'undefined' ? undefined : window))
  if (!browser.available) return browser
  if (serverReady === false) return { available: false, reason: 'notConfigured' }
  return browser
}

/**
 * The container to ask the recorder for, or '' to let the browser choose.
 *
 * @param {{isTypeSupported?: (type: string) => boolean}|null} Recorder
 * @returns {string}
 */
export function pickRecordingType(Recorder) {
  if (typeof Recorder?.isTypeSupported !== 'function') return ''
  return PREFERRED_TYPES.find(type => {
    try {
      return Recorder.isTypeSupported(type)
    } catch {
      return false
    }
  }) ?? ''
}

/**
 * Turns a getUserMedia failure into something the interface can act on.
 *
 * `fatal` is the part that matters. A denied permission, a page that may not
 * use the microphone, or a missing microphone means the button cannot do
 * anything until something outside this page changes, so it must stop being
 * offered. A microphone
 * held by another app is a hiccup — closing the other app and trying again is
 * a reasonable thing to do.
 *
 * The names are DOMException names. The two legacy ones are what older Chrome
 * and Firefox threw before the names were standardised.
 *
 * @param {unknown} cause
 * @returns {{key: string, fatal: boolean}}
 */
export function describeMicrophoneError(cause) {
  switch (cause?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return { key: 'denied', fatal: true }
    // Not the user: the page is not allowed to ask at all, usually because it
    // is embedded in another site or app that has not granted the microphone.
    // Sending them to their browser settings would be sending them nowhere.
    case 'SecurityError':
      return { key: 'blocked', fatal: true }
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return { key: 'noMicrophone', fatal: true }
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return { key: 'micBusy', fatal: false }
    default:
      return { key: 'generic', fatal: false }
  }
}

/** Server codes that mean nothing will transcribe until the server is fixed. */
const SERVER_NOT_READY = new Set(['TRANSCRIBE_NOT_CONFIGURED', 'TRANSCRIBE_AUTH', 'TRANSCRIBE_MODEL'])

/**
 * Turns a failed transcription request into something the interface can act on.
 *
 * Keyed off the server's `code` rather than its sentence, so the words on
 * screen come from this app's own translations. A request that never got an
 * answer at all — fetch rejected before any status — is the connection.
 *
 * @param {{status?: number, code?: string, name?: string}} error an ApiError, or
 *   whatever fetch threw
 * @returns {{key: string, fatal: boolean}}
 */
export function describeTranscriptionError(error) {
  const code = error?.code
  if (SERVER_NOT_READY.has(code)) return { key: 'notConfigured', fatal: true }
  if (code === 'TRANSCRIBE_BUSY') return { key: 'busy', fatal: false }
  if (code === 'TRANSCRIBE_TOO_LARGE') return { key: 'tooLong', fatal: false }
  if (code === 'TRANSCRIBE_RATE_LIMITED' || error?.status === 429) return { key: 'tooMany', fatal: false }
  if (!Number.isInteger(error?.status)) return { key: 'network', fatal: false }
  return { key: 'generic', fatal: false }
}

/**
 * Adds a transcribed chunk to what is already in the box.
 *
 * Whisper returns punctuated, capitalised sentences, so most of the time this
 * only has to put one space between what was there and what arrived. The rest
 * is for the edges: a candidate who typed half a sentence and then recorded
 * the end of it, or an answer recorded in several parts. It capitalises the
 * very start and after a fragment that ended a sentence, and nothing more.
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
