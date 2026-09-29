import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getMediaRecorder,
  recorderAvailability,
  dictationAvailability,
  pickRecordingType,
  describeMicrophoneError,
  describeTranscriptionError,
  appendTranscript,
  MAX_RECORDING_SECONDS,
  MIN_RECORDING_MS,
} from './speech.js'

/**
 * The pure half of the dictation module.
 *
 * The hook itself needs a browser and a microphone and is covered by the e2e
 * spec (against a stubbed recorder) and the manual script in docs/qa. What is
 * testable here is the part that decides WHAT the user is told, and that is the
 * part most likely to be wrong in a way nobody notices: a visitor on plain http
 * told their browser is unsupported, or a server with no key leaving a button
 * that can never work.
 */

/** A window that can record, with whatever is overridden. */
function recordingWindow(overrides = {}) {
  return {
    MediaRecorder: function Recorder() {},
    isSecureContext: true,
    navigator: { mediaDevices: { getUserMedia: async () => ({}) } },
    ...overrides,
  }
}

test('getMediaRecorder', async (t) => {
  await t.test('finds the constructor', () => {
    const win = recordingWindow()
    assert.equal(getMediaRecorder(win), win.MediaRecorder)
  })

  await t.test('no window at all, as in this test runner', () => {
    assert.equal(getMediaRecorder(undefined), null)
  })
})

test('recorderAvailability', async (t) => {
  await t.test('available on a secure page in a browser that can record', () => {
    assert.deepEqual(recorderAvailability(recordingWindow()), { available: true, reason: 'ok' })
  })

  await t.test('unsupported without a recorder, even on an insecure page', () => {
    // A browser that cannot record has two problems and can only fix one of
    // them by changing browser. Telling it to enable HTTPS would be advice for
    // a problem it does not have.
    const win = recordingWindow({ MediaRecorder: undefined, isSecureContext: false })
    assert.deepEqual(recorderAvailability(win), { available: false, reason: 'unsupported' })
  })

  await t.test('insecure on plain http, where the browser hides getUserMedia', () => {
    // The trap: on http most browsers remove navigator.mediaDevices outright.
    // Checked the other way round, every http visitor would be told their
    // browser is unsupported and go looking for a different one.
    const win = recordingWindow({ isSecureContext: false, navigator: {} })
    assert.deepEqual(recorderAvailability(win), { available: false, reason: 'insecure' })
  })

  await t.test('unsupported when there is a recorder but no way to open the microphone', () => {
    const win = recordingWindow({ navigator: {} })
    assert.deepEqual(recorderAvailability(win), { available: false, reason: 'unsupported' })
  })

  await t.test('a missing isSecureContext is not treated as insecure', () => {
    const win = recordingWindow({ isSecureContext: undefined })
    assert.deepEqual(recorderAvailability(win), { available: true, reason: 'ok' })
  })

  await t.test('no window at all', () => {
    assert.deepEqual(recorderAvailability(undefined), { available: false, reason: 'unsupported' })
  })
})

test('dictationAvailability', async (t) => {
  await t.test('available when the browser can record and the server can transcribe', () => {
    assert.deepEqual(dictationAvailability({ serverReady: true, win: recordingWindow() }), { available: true, reason: 'ok' })
  })

  await t.test('not configured when the server has no Groq key', () => {
    assert.deepEqual(
      dictationAvailability({ serverReady: false, win: recordingWindow() }),
      { available: false, reason: 'notConfigured' },
    )
  })

  await t.test('the browser is named first: a server fix would not help it', () => {
    const win = recordingWindow({ MediaRecorder: undefined })
    assert.equal(dictationAvailability({ serverReady: false, win }).reason, 'unsupported')
  })

  await t.test('an interview that does not say is taken as ready', () => {
    // Only an explicit false turns the button off, so an interview object from
    // before the field existed still offers it and the server has the last word.
    assert.equal(dictationAvailability({ win: recordingWindow() }).available, true)
  })
})

test('pickRecordingType', async (t) => {
  await t.test('prefers Opus in webm, which Chrome, Edge and Firefox record best', () => {
    const Recorder = { isTypeSupported: () => true }
    assert.equal(pickRecordingType(Recorder), 'audio/webm;codecs=opus')
  })

  await t.test('falls through to mp4, which is what Safari records', () => {
    const Recorder = { isTypeSupported: type => type === 'audio/mp4' }
    assert.equal(pickRecordingType(Recorder), 'audio/mp4')
  })

  await t.test('lets the browser choose when it supports none of the list', () => {
    assert.equal(pickRecordingType({ isTypeSupported: () => false }), '')
  })

  await t.test('lets the browser choose when it cannot be asked', () => {
    assert.equal(pickRecordingType({}), '')
    assert.equal(pickRecordingType(null), '')
  })

  await t.test('survives a browser that throws on the question', () => {
    assert.equal(pickRecordingType({ isTypeSupported: () => { throw new Error('nope') } }), '')
  })
})

test('describeMicrophoneError', async (t) => {
  const named = name => Object.assign(new Error(name), { name })

  await t.test('a refused permission is fatal, so the button stops offering', () => {
    assert.deepEqual(describeMicrophoneError(named('NotAllowedError')), { key: 'denied', fatal: true })
    // What older Chrome threw before the name was standardised.
    assert.deepEqual(describeMicrophoneError(named('PermissionDeniedError')), { key: 'denied', fatal: true })
  })

  await t.test('a page that may not use the microphone is not sent to browser settings', () => {
    // An iframe without allow="microphone", or a Permissions-Policy. No
    // browser setting fixes either, so the message must not claim one does.
    assert.deepEqual(describeMicrophoneError(named('SecurityError')), { key: 'blocked', fatal: true })
  })

  await t.test('no microphone is fatal for the same reason', () => {
    assert.deepEqual(describeMicrophoneError(named('NotFoundError')), { key: 'noMicrophone', fatal: true })
  })

  await t.test('a microphone held by another app is worth trying again', () => {
    assert.deepEqual(describeMicrophoneError(named('NotReadableError')), { key: 'micBusy', fatal: false })
  })

  await t.test('anything else still says something', () => {
    assert.deepEqual(describeMicrophoneError(new TypeError('odd')), { key: 'generic', fatal: false })
    assert.deepEqual(describeMicrophoneError(undefined), { key: 'generic', fatal: false })
  })
})

test('describeTranscriptionError', async (t) => {
  const apiError = (status, code) => Object.assign(new Error('x'), { status, code })

  await t.test('a server that cannot transcribe is fatal: nothing will work until it is fixed', () => {
    for (const code of ['TRANSCRIBE_NOT_CONFIGURED', 'TRANSCRIBE_AUTH', 'TRANSCRIBE_MODEL']) {
      assert.deepEqual(describeTranscriptionError(apiError(503, code)), { key: 'notConfigured', fatal: true })
    }
  })

  await t.test('a busy provider is worth a retry', () => {
    assert.deepEqual(describeTranscriptionError(apiError(503, 'TRANSCRIBE_BUSY')), { key: 'busy', fatal: false })
  })

  await t.test('an oversized recording says so', () => {
    assert.deepEqual(describeTranscriptionError(apiError(413, 'TRANSCRIBE_TOO_LARGE')), { key: 'tooLong', fatal: false })
  })

  await t.test('the caller\'s own hourly limit is told apart from the provider being busy', () => {
    assert.deepEqual(describeTranscriptionError(apiError(429, 'TRANSCRIBE_RATE_LIMITED')), { key: 'tooMany', fatal: false })
    assert.deepEqual(describeTranscriptionError(apiError(429, null)), { key: 'tooMany', fatal: false })
  })

  await t.test('a request that never got an answer is the connection', () => {
    assert.deepEqual(describeTranscriptionError(new TypeError('Failed to fetch')), { key: 'network', fatal: false })
  })

  await t.test('anything else is worth one more go', () => {
    assert.deepEqual(describeTranscriptionError(apiError(502, 'TRANSCRIBE_UNAVAILABLE')), { key: 'generic', fatal: false })
    assert.deepEqual(describeTranscriptionError(apiError(422, 'TRANSCRIBE_BAD_AUDIO')), { key: 'generic', fatal: false })
  })
})

test('recording limits', async (t) => {
  await t.test('the longest recording fits the answer box', () => {
    // About 130 spoken words a minute, 6 characters a word: a longer recording
    // would produce more text than the 2,500 character answer can hold.
    assert.ok(MAX_RECORDING_SECONDS * (130 / 60) * 6 <= 2500)
  })

  await t.test('a tap is shorter than any answer', () => {
    assert.ok(MIN_RECORDING_MS < 1000)
  })
})

test('appendTranscript', async (t) => {
  await t.test('capitalises the opening fragment', () => {
    assert.equal(appendTranscript('', 'i led the migration'), 'I led the migration')
  })

  await t.test('passes a punctuated Whisper sentence through untouched', () => {
    assert.equal(appendTranscript('', 'I led the migration.'), 'I led the migration.')
  })

  await t.test('joins mid-sentence without inventing a capital', () => {
    assert.equal(
      appendTranscript('I led the migration', 'over three months'),
      'I led the migration over three months',
    )
  })

  await t.test('capitalises after a fragment that closed a sentence', () => {
    assert.equal(
      appendTranscript('I led the migration.', 'it took three months'),
      'I led the migration. It took three months',
    )
  })

  await t.test('handles a closing quote or bracket after the full stop', () => {
    assert.equal(appendTranscript('he said "go."', 'we went'), 'he said "go." We went')
  })

  await t.test('collapses the whitespace a transcript arrives with', () => {
    assert.equal(appendTranscript('First part', '  second   part  '), 'First part second part')
  })

  await t.test('an empty chunk leaves the answer exactly as it was', () => {
    // An answer that gained a trailing space on every silent recording would be
    // a very annoying bug to find.
    assert.equal(appendTranscript('Already typed', '   '), 'Already typed')
    assert.equal(appendTranscript('Already typed', null), 'Already typed')
  })

  await t.test('never inserts punctuation the speaker did not say', () => {
    // The candidate is marked on this text. Full stops we guessed at would be
    // punctuation they did not choose.
    const result = appendTranscript('I managed the rollout', 'then I trained the team')
    assert.equal(result, 'I managed the rollout then I trained the team')
  })
})
