import { test, expect } from '@playwright/test'
import { logInThroughForm } from './login.js'

/**
 * The live interview, end to end in a browser.
 *
 * WHAT CAN AND CANNOT BE AUTOMATED HERE
 *
 * Not the microphone, and not Whisper. Headless Chromium has no audio device,
 * and a real transcription would spend the server's shared Groq allowance on
 * every run and return different words each time. The genuine article is
 * verified by hand in Chrome, Edge, Firefox and Safari using
 * docs/qa/live_interview_manual_test.md, and that script is the record.
 *
 * What IS automated is everything around it, which is where the regressions
 * will be: that one question is shown at a time, that a recording is uploaded
 * and its transcript lands in an editable box, that moving on waits for the
 * transcript, that the timings are sent, that the interview still finishes
 * when the browser cannot record or the server cannot transcribe, and that
 * the written mode is untouched. The browser's recorder and microphone are
 * replaced with stubs, and the transcribe route is intercepted per test; the
 * component cannot tell the difference, because it only ever talks to the
 * interfaces the stubs implement.
 *
 * Assumes the API on :3000 (the fake in e2e/fake-api is enough) and Vite on
 * :5173, as the rest of the suite does.
 */

const PASSWORD = 'CorrectHorseBattery1'

/**
 * Where the API is. The default is the pair of dev servers playwright.config.js
 * documents; E2E_API_ORIGIN exists so this suite can be pointed at the fake in
 * e2e/fake-api on another port, which is how it gets run when the real server's
 * AI allowance for the day is gone.
 */
const API_ORIGIN = process.env.E2E_API_ORIGIN || 'http://localhost:3000'

const TRANSCRIBE_ROUTE = '**/api/preparation/interviews/*/transcribe'

/** Longer than the hook's MIN_RECORDING_MS, below which a recording is a tap. */
const SPEAKING_MS = 900

/**
 * Stand-ins for MediaRecorder and getUserMedia.
 *
 * Installed before any application script runs, so the availability check sees
 * them on first render. They implement the parts the hook uses and nothing
 * else. `window.__denyMicrophone` makes the next getUserMedia fail with that
 * DOMException name, `window.__hangMicrophone` makes it never settle — a
 * permission prompt nobody answers — and `window.__tracksStopped` counts the
 * microphone being released, which is what turns the browser's recording
 * indicator off.
 */
const STUB_RECORDER = () => {
  class FakeMediaRecorder {
    static isTypeSupported(type) {
      return type.startsWith('audio/webm')
    }

    constructor(stream, options = {}) {
      this.stream = stream
      this.mimeType = options.mimeType || 'audio/webm'
      this.state = 'inactive'
      this.ondataavailable = null
      this.onstop = null
      this.onerror = null
    }

    start() {
      this.state = 'recording'
      window.__recordings = (window.__recordings ?? 0) + 1
    }

    /** As the real one does: a last chunk of data, then stop, asynchronously. */
    stop() {
      if (this.state === 'inactive') return
      this.state = 'inactive'
      const data = new Blob([new Uint8Array(4096)], { type: this.mimeType })
      setTimeout(() => {
        this.ondataavailable?.({ data })
        this.onstop?.()
      }, 0)
    }
  }

  window.MediaRecorder = FakeMediaRecorder
  window.__tracksStopped = 0
  window.__denyMicrophone = null
  window.__hangMicrophone = false

  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: async () => {
        if (window.__hangMicrophone) return new Promise(() => {})
        if (window.__denyMicrophone) {
          const refused = new Error('Permission denied')
          refused.name = window.__denyMicrophone
          throw refused
        }
        return {
          getTracks: () => [{ stop: () => { window.__tracksStopped += 1 } }],
        }
      },
    },
  })
}

/**
 * Intercepts the transcribe route with a fixed answer, and records what was
 * uploaded. `hold` returns a release function instead of answering at once,
 * for the tests about what happens while a transcript is on its way.
 */
async function answerTranscriptions(page, reply, { hold = false } = {}) {
  const uploads = []
  let release = null
  const released = hold ? new Promise(resolve => { release = resolve }) : null

  await page.route(TRANSCRIBE_ROUTE, async (route) => {
    const request = route.request()
    uploads.push({
      contentType: request.headers()['content-type'] ?? '',
      body: request.postDataBuffer()?.toString('latin1') ?? '',
    })
    if (released) await released
    await route.fulfill(typeof reply === 'function' ? reply() : { json: reply })
  })

  return { uploads, release: () => release?.() }
}

/** Registers an account and signs in, which every route here requires. */
async function signIn(page) {
  const email = `live.${Date.now()}.${Math.floor(Math.random() * 1000)}@example.com`
  const res = await page.request.post(`${API_ORIGIN}/api/auth/register`, {
    data: { full_name: 'Live Tester', email, password: PASSWORD, plan: 'free' },
  })
  expect(res.ok()).toBeTruthy()

  await logInThroughForm(page, email, PASSWORD)
  await expect(page).toHaveURL(/\/$/, { timeout: 10000 })
  return email
}

/** Opens the interview tab with the questions already generated. */
async function startLiveInterview(page) {
  await page.goto('/preparation')
  await page.getByRole('tab', { name: /mock interview/i }).click()

  await page.getByRole('radio', { name: /live/i }).click()
  await page.getByRole('button', { name: /start/i }).first().click()

  // The intro card, which is where the clock has deliberately not started yet.
  await expect(page.locator('.live-intro')).toBeVisible({ timeout: 20000 })
}

/** Signs in, starts a live interview and begins it. */
async function beginLiveInterview(page) {
  await signIn(page)
  await startLiveInterview(page)
  await page.getByRole('button', { name: /begin/i }).click()
}

/** Records for long enough to count as speech, then stops. */
async function recordAnAnswer(page) {
  await page.getByRole('button', { name: /record answer/i }).click()
  await expect(page.locator('.live__listening')).toBeVisible()
  await page.waitForTimeout(SPEAKING_MS)
  await page.getByRole('button', { name: /stop recording/i }).click()
}

test.use({ viewport: { width: 1280, height: 900 } })

test.describe('live interview', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(STUB_RECORDER)
  })

  test('asks one question at a time and a recording fills an editable answer', async ({ page }) => {
    const { uploads } = await answerTranscriptions(page, { text: 'I led the migration and it shipped on time.' })
    await beginLiveInterview(page)

    // One question, and only one. This is the whole point of the mode: five
    // questions on a page is a form.
    await expect(page.locator('.live__question')).toHaveCount(1)
    await expect(page.locator('.live__question')).toContainText(/tight deadline/i)
    await expect(page.locator('.live__progress')).toContainText('1')

    await recordAnAnswer(page)

    const answer = page.locator('#live-answer')
    await expect(answer).toHaveValue('I led the migration and it shipped on time.')

    // The recording went up as multipart audio, in the type the recorder made.
    expect(uploads).toHaveLength(1)
    expect(uploads[0].contentType).toMatch(/multipart\/form-data/)
    expect(uploads[0].body).toMatch(/name="audio"/)
    expect(uploads[0].body).toMatch(/Content-Type: audio\/webm/)

    // Editable, which is the requirement a read-only transcript would fail:
    // transcription makes mistakes and the candidate is marked on this text.
    await answer.fill('I led the migration and it shipped two days early.')
    await expect(answer).toHaveValue(/two days early/)

    // A second question replaces the first rather than joining it.
    await page.getByRole('button', { name: /next question/i }).click()
    await expect(page.locator('.live__question')).toHaveCount(1)
    await expect(page.locator('.live__question')).toContainText(/reporting table/i)
    await expect(page.locator('.live__progress')).toContainText('2')

    // The answer box starts empty for the new question rather than carrying
    // the last one over.
    await expect(page.locator('#live-answer')).toHaveValue('')
  })

  test('releases the microphone when the recording stops', async ({ page }) => {
    await answerTranscriptions(page, { text: 'An answer.' })
    await beginLiveInterview(page)

    await recordAnAnswer(page)
    await expect(page.locator('#live-answer')).toHaveValue('An answer.')

    // Without this the browser's recording indicator stays lit after the
    // candidate pressed stop, which is alarming and fair enough.
    expect(await page.evaluate(() => window.__tracksStopped)).toBeGreaterThan(0)
    await expect(page.locator('.live__listening')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /record answer/i })).toBeEnabled()
  })

  test('does not move on until the recording has been written down', async ({ page }) => {
    const pending = await answerTranscriptions(page, { text: 'Recorded and read back.' }, { hold: true })
    await beginLiveInterview(page)

    const next = page.getByRole('button', { name: /next question/i })

    // Recording: leaving now would lose the answer.
    await page.getByRole('button', { name: /record answer/i }).click()
    await expect(next).toBeDisabled()
    await expect(page.locator('.live__foot')).toContainText(/finish recording/i)

    // Transcribing: leaving now would drop the answer, unread, into a question
    // that is already behind the candidate.
    await page.waitForTimeout(SPEAKING_MS)
    await page.getByRole('button', { name: /stop recording/i }).click()
    await expect(page.getByRole('button', { name: /writing it down/i })).toBeDisabled()
    await expect(next).toBeDisabled()

    pending.release()
    await expect(page.locator('#live-answer')).toHaveValue('Recorded and read back.')
    await expect(next).toBeEnabled()
  })

  test('keeps what was typed while a recording was being written down', async ({ page }) => {
    const pending = await answerTranscriptions(page, { text: 'And then we shipped it.' }, { hold: true })
    await beginLiveInterview(page)

    const answer = page.locator('#live-answer')
    await answer.fill('I rewrote the import.')
    await recordAnAnswer(page)

    // Typed after pressing stop, before the transcript came back. Appending to
    // the answer as it was when stop was pressed would silently lose this.
    await answer.fill('I rewrote the import to stream the file.')
    pending.release()

    await expect(answer).toHaveValue('I rewrote the import to stream the file. And then we shipped it.')
  })

  test('keeps a spoken answer when another tab is opened while it is written down', async ({ page }) => {
    const pending = await answerTranscriptions(page, { text: 'Said before looking at my plan.' }, { hold: true })
    await beginLiveInterview(page)

    await recordAnAnswer(page)
    await expect(page.getByRole('button', { name: /writing it down/i })).toBeVisible()

    // The interview unmounts while the plan is open. The transcript used to be
    // thrown away with it, and minutes of speaking with it.
    await page.getByRole('tab', { name: /my plan/i }).click()
    await expect(page.locator('.live__question')).toHaveCount(0)
    pending.release()
    await page.waitForTimeout(300)

    await page.getByRole('tab', { name: /mock interview/i }).click()
    await expect(page.locator('#live-answer')).toHaveValue('Said before looking at my plan.')
  })

  test('a microphone prompt nobody answers does not trap the candidate', async ({ page }) => {
    await beginLiveInterview(page)

    await page.evaluate(() => { window.__hangMicrophone = true })
    await page.getByRole('button', { name: /record answer/i }).click()

    // Nothing has been recorded, so there is nothing to wait for. Locking the
    // interview behind a prompt the candidate may have dismissed would leave a
    // reload as the only way out.
    await page.locator('#live-answer').fill('Typed while the prompt sat there.')
    await page.getByRole('button', { name: /next question/i }).click()
    await expect(page.locator('.live__progress')).toContainText('2')
  })

  test('a full answer stops offering the record button', async ({ page }) => {
    await beginLiveInterview(page)

    await page.locator('#live-answer').fill('x'.repeat(2500))
    await expect(page.getByRole('button', { name: /record answer/i })).toBeDisabled()
  })

  test('says so when a transcript does not fit in the answer', async ({ page }) => {
    await answerTranscriptions(page, { text: 'This sentence is longer than the room that is left in the box.' })
    await beginLiveInterview(page)

    await page.locator('#live-answer').fill('y'.repeat(2480))
    await recordAnAnswer(page)

    await expect(page.locator('.live__speech-warn')).toContainText(/limit/i)
    expect((await page.locator('#live-answer').inputValue()).length).toBe(2500)
  })

  test('marks a recorded answer as spoken and a typed one as typed', async ({ page }) => {
    await answerTranscriptions(page, { text: 'A spoken answer.' })
    await signIn(page)

    const saved = []
    await page.route('**/api/preparation/interviews/*/next', async (route) => {
      saved.push(route.request().postDataJSON())
      await route.continue()
    })

    await startLiveInterview(page)
    await page.getByRole('button', { name: /begin/i }).click()

    await recordAnAnswer(page)
    await expect(page.locator('#live-answer')).toHaveValue('A spoken answer.')
    await page.getByRole('button', { name: /next question/i }).click()
    await expect(page.locator('.live__progress')).toContainText('2')

    await page.locator('#live-answer').fill('A typed answer.')
    await page.getByRole('button', { name: /next question/i }).click()
    await expect(page.locator('.live__progress')).toContainText('3')

    // The evaluator is told which answers were dictated, so it does not mark
    // down transcription noise in them.
    expect(saved[0].answers.find(entry => entry.index === 1).source).toBe('speech')
    expect(saved[1].answers.find(entry => entry.index === 2).source).toBe('typed')
  })

  test('says so when nothing was heard, and keeps the button', async ({ page }) => {
    await answerTranscriptions(page, { text: '' })
    await beginLiveInterview(page)

    await recordAnAnswer(page)

    // Nearly always the wrong microphone, which is what the message names.
    await expect(page.locator('.live__speech-warn')).toContainText(/default/i)
    await expect(page.locator('#live-answer')).toHaveValue('')
    await expect(page.getByRole('button', { name: /record answer/i })).toBeEnabled()
  })

  test('does not send an accidental tap to be transcribed', async ({ page }) => {
    const { uploads } = await answerTranscriptions(page, { text: 'Should never arrive.' })
    await beginLiveInterview(page)

    await page.getByRole('button', { name: /record answer/i }).click()
    await page.getByRole('button', { name: /stop recording/i }).click()

    await expect(page.getByRole('button', { name: /record answer/i })).toBeEnabled()
    await page.waitForTimeout(300)
    expect(uploads).toHaveLength(0)
    await expect(page.locator('#live-answer')).toHaveValue('')
  })

  test('a busy transcription service is a line of text, not the end of dictation', async ({ page }) => {
    await answerTranscriptions(page, () => ({
      status: 503,
      json: { error: 'Speech to text is busy right now.', code: 'TRANSCRIBE_BUSY' },
    }))
    await beginLiveInterview(page)

    await recordAnAnswer(page)

    await expect(page.locator('.live__speech-warn')).toContainText(/busy/i)
    await expect(page.getByRole('button', { name: /record answer/i })).toBeEnabled()
  })

  test('sends the time taken with each answer', async ({ page }) => {
    await signIn(page)

    const timed = []
    await page.route('**/api/preparation/interviews/*/next', async (route) => {
      timed.push(route.request().postDataJSON())
      await route.continue()
    })

    await startLiveInterview(page)
    await page.getByRole('button', { name: /begin/i }).click()

    await page.locator('#live-answer').fill('A typed answer.')
    // Long enough that a recorded duration is unambiguously real rather than
    // a rounding artefact around zero.
    await page.waitForTimeout(1500)
    await page.getByRole('button', { name: /next question/i }).click()

    await expect(page.locator('.live__progress')).toContainText('2')

    expect(timed).toHaveLength(1)
    const first = timed[0].answers.find(entry => entry.index === 1)
    expect(first.answer).toBe('A typed answer.')
    expect(first.seconds).toBeGreaterThanOrEqual(1)
    // Typed, not spoken — the microphone was never opened, and the evaluator is
    // told the difference.
    expect(first.source).toBe('typed')

    // A question nobody has reached carries no duration at all. A zero would
    // claim it was answered instantly.
    const untouched = timed[0].answers.find(entry => entry.index === 5)
    expect(untouched.seconds).toBeUndefined()
  })

  test('falls back to typing when the browser cannot record', async ({ page }) => {
    // An old or in-app browser, reproduced in Chromium by removing the recorder.
    await page.addInitScript(() => {
      delete window.MediaRecorder
    })

    await signIn(page)
    await startLiveInterview(page)

    // Said on the intro card, BEFORE the interview starts, so somebody can
    // choose the written mode instead of finding out mid-answer.
    await expect(page.locator('.live-intro .live-notice')).toContainText(/cannot record from a microphone/i)
    await expect(page.locator('.live-intro .live-notice')).toContainText(/Chrome, Edge, Firefox and Safari/i)

    await page.getByRole('button', { name: /begin/i }).click()

    // No microphone button, and the interview is otherwise completely normal.
    await expect(page.locator('.live__mic-btn')).toHaveCount(0)
    await expect(page.locator('.live-notice')).toBeVisible()
    await expect(page.locator('#live-answer')).toBeEditable()

    await page.locator('#live-answer').fill('Typed because this browser cannot record.')
    await page.getByRole('button', { name: /next question/i }).click()
    await expect(page.locator('.live__progress')).toContainText('2')
  })

  test('says up front when the server cannot transcribe', async ({ page }) => {
    await signIn(page)

    // A server with no Groq key says so when the interview starts.
    await page.route('**/api/preparation/interviews', async (route) => {
      if (route.request().method() !== 'POST') return route.continue()
      const response = await route.fetch()
      const body = await response.json()
      await route.fulfill({ response, json: { ...body, dictationAvailable: false } })
    })

    await startLiveInterview(page)
    await expect(page.locator('.live-intro .live-notice')).toContainText(/not been set up/i)

    await page.getByRole('button', { name: /begin/i }).click()
    await expect(page.locator('.live__mic-btn')).toHaveCount(0)
    await expect(page.locator('#live-answer')).toBeEditable()
  })

  test('stops offering the microphone when the server turns out not to be set up', async ({ page }) => {
    await answerTranscriptions(page, () => ({
      status: 503,
      json: { error: 'Speech to text is not set up on this server.', code: 'TRANSCRIBE_NOT_CONFIGURED' },
    }))
    await beginLiveInterview(page)

    await recordAnAnswer(page)

    await expect(page.locator('.live__mic-btn')).toHaveCount(0)
    await expect(page.locator('.live-notice')).toContainText(/not been set up/i)

    // And not offered again on the next question, where it would only fail the
    // same way.
    await page.locator('#live-answer').fill('Typing instead.')
    await page.getByRole('button', { name: /next question/i }).click()
    await expect(page.locator('.live__progress')).toContainText('2')
    await expect(page.locator('.live__mic-btn')).toHaveCount(0)
  })

  test('explains a denied microphone and keeps the interview going', async ({ page }) => {
    await beginLiveInterview(page)

    // What getUserMedia throws when the user, or the operating system, says no.
    await page.evaluate(() => { window.__denyMicrophone = 'NotAllowedError' })
    await page.getByRole('button', { name: /record answer/i }).click()

    // The button goes, because it can no longer do anything, and the remedy is
    // named — it is a browser setting this page cannot open.
    await expect(page.locator('.live__mic-btn')).toHaveCount(0)
    await expect(page.locator('.live-notice')).toContainText(/Microphone access was blocked/i)
    await expect(page.locator('.live-notice')).toContainText(/browser settings/i)

    // And the interview is still perfectly usable.
    await page.locator('#live-answer').fill('Typing instead, which works the same.')
    await page.getByRole('button', { name: /next question/i }).click()
    await expect(page.locator('.live__progress')).toContainText('2')
    await expect(page.locator('.live__mic-btn')).toHaveCount(0)
  })

  test('runs to the end and shows the same results screen as the written mode', async ({ page }) => {
    await beginLiveInterview(page)

    for (let i = 1; i <= 5; i += 1) {
      await expect(page.locator('.live__progress')).toContainText(String(i))
      await page.locator('#live-answer').fill(`Answer number ${i}, with a specific example in it.`)

      if (i < 5) {
        await page.getByRole('button', { name: /next question/i }).click()
      } else {
        // The last step is irreversible, so it asks first — and asks inline
        // rather than through a native alert, which gets dismissed by reflex.
        await page.getByRole('button', { name: /finish and get feedback/i }).click()
        await expect(page.locator('.live__confirm-text')).toBeVisible()
        await page.getByRole('button', { name: /submit it/i }).click()
      }
    }

    // The written mode's results screen, reached by the written mode's
    // endpoint, rendered by the written mode's component.
    await expect(page.locator('.prep-score')).toBeVisible({ timeout: 20000 })
    await expect(page.locator('.prep-score__number')).toContainText('68')
    await expect(page.locator('.prep-q')).toHaveCount(5)
  })

  test('the written mode still works and never mentions a microphone', async ({ page }) => {
    await signIn(page)
    await page.goto('/preparation')
    await page.getByRole('tab', { name: /mock interview/i }).click()

    // Written is the default; selecting it explicitly is what a user does.
    // Not anchored at the end: the accessible name of a mode card is its title
    // plus the sentence explaining it, which is the point of the card.
    await page.getByRole('radio', { name: /^written/i }).click()
    await page.getByRole('button', { name: /start/i }).first().click()

    // All five at once, which is what this mode is for.
    await expect(page.locator('.prep-q')).toHaveCount(5, { timeout: 20000 })
    await expect(page.locator('.live__mic-btn')).toHaveCount(0)
    await expect(page.locator('.live__question')).toHaveCount(0)

    await page.locator('textarea.prep-q__answer').first().fill('A written answer.')
    await page.getByRole('button', { name: /submit for assessment/i }).click()

    await expect(page.locator('.prep-score')).toBeVisible({ timeout: 20000 })
  })
})
