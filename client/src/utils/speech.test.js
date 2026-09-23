import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getSpeechRecognition,
  speechAvailability,
  describeSpeechError,
  appendTranscript,
  SPEECH_LANGUAGE,
} from './speech.js'

/**
 * The pure half of the speech module.
 *
 * The hook itself needs a browser and a microphone and is covered by the manual
 * script in docs/qa. What is testable here is the part that decides WHAT the
 * user is told, and that is the part most likely to be wrong in a way nobody
 * notices: a Firefox user sent to enable HTTPS, or a denied permission that
 * leaves the button offering a microphone it cannot open.
 */

test('getSpeechRecognition finds the constructor under either name', async (t) => {
  await t.test('the standard name', () => {
    const win = { SpeechRecognition: function Standard() {}, isSecureContext: true }
    assert.equal(getSpeechRecognition(win), win.SpeechRecognition)
  })

  await t.test('the webkit prefix, which is what Chrome and Edge actually ship', () => {
    const win = { webkitSpeechRecognition: function Prefixed() {}, isSecureContext: true }
    assert.equal(getSpeechRecognition(win), win.webkitSpeechRecognition)
  })

  await t.test('neither', () => {
    assert.equal(getSpeechRecognition({ isSecureContext: true }), null)
  })

  await t.test('no window at all, as in this test runner', () => {
    assert.equal(getSpeechRecognition(undefined), null)
  })
})

test('speechAvailability', async (t) => {
  const Recognition = function Recognition() {}

  await t.test('available on a secure page in a supporting browser', () => {
    const result = speechAvailability({ webkitSpeechRecognition: Recognition, isSecureContext: true })
    assert.deepEqual(result, { available: true, reason: 'ok' })
  })

  await t.test('unsupported wins over insecure', () => {
    // A Firefox user on http has two problems and can only fix one of them by
    // changing browser. Telling them to enable HTTPS would be advice for a
    // problem they do not have.
    const result = speechAvailability({ isSecureContext: false })
    assert.deepEqual(result, { available: false, reason: 'unsupported' })
  })

  await t.test('insecure when the engine exists but the page is not secure', () => {
    // The case that passes every local test and fails on the deployed site.
    const result = speechAvailability({ webkitSpeechRecognition: Recognition, isSecureContext: false })
    assert.deepEqual(result, { available: false, reason: 'insecure' })
  })

  await t.test('a missing isSecureContext is not treated as insecure', () => {
    // Only an explicit false counts. An older browser that does not define the
    // property should not be told its connection is the problem.
    const result = speechAvailability({ webkitSpeechRecognition: Recognition })
    assert.deepEqual(result, { available: true, reason: 'ok' })
  })
})

test('describeSpeechError', async (t) => {
  await t.test('a denied permission is fatal, so the button stops offering', () => {
    assert.deepEqual(describeSpeechError('not-allowed'), { key: 'denied', fatal: true })
    assert.deepEqual(describeSpeechError('service-not-allowed'), { key: 'denied', fatal: true })
  })

  await t.test('no microphone is fatal for the same reason', () => {
    assert.deepEqual(describeSpeechError('audio-capture'), { key: 'noMicrophone', fatal: true })
  })

  await t.test('silence and network trouble are not fatal', () => {
    assert.equal(describeSpeechError('no-speech').fatal, false)
    assert.equal(describeSpeechError('network').fatal, false)
  })

  await t.test('an abort we caused is not an error to report', () => {
    assert.equal(describeSpeechError('aborted'), null)
  })

  await t.test('an unknown code still says something', () => {
    assert.deepEqual(describeSpeechError('something-new'), { key: 'generic', fatal: false })
  })
})

test('appendTranscript', async (t) => {
  await t.test('capitalises the opening fragment', () => {
    assert.equal(appendTranscript('', 'i led the migration'), 'I led the migration')
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

  await t.test('collapses the whitespace recognition arrives with', () => {
    assert.equal(appendTranscript('First part', '  second   part  '), 'First part second part')
  })

  await t.test('an empty chunk leaves the answer exactly as it was', () => {
    // Recognition fires with nothing in it more often than you would expect,
    // and an answer that gained a trailing space on every silence would be a
    // very annoying bug to find.
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

test('dictation is English only, as agreed with the client', () => {
  assert.equal(SPEECH_LANGUAGE, 'en-US')
})
