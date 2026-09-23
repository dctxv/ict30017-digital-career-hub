import { test, expect } from '@playwright/test'

/**
 * The live interview, end to end in a browser.
 *
 * WHAT CAN AND CANNOT BE AUTOMATED HERE
 *
 * Not the microphone. Web Speech recognition needs a real engine, a real
 * device and a real voice, and headless Chromium has none of the three — the
 * genuine article is verified by hand against Chrome, Edge and Firefox using
 * docs/qa/live_interview_manual_test.md, and that script is the record.
 *
 * What IS automated is everything around it, which is where the regressions
 * will be: that one question is shown at a time, that a recognised fragment
 * lands in an editable box, that the timings are sent, that the interview
 * still finishes when speech is unavailable, and that the written mode is
 * untouched. The engine is replaced with a stub the spec drives; the component
 * cannot tell the difference, because it only ever talks to the interface the
 * stub implements.
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

/**
 * A stand-in for the browser's SpeechRecognition.
 *
 * Installed before any application script runs, so the availability check sees
 * it on first render. It implements the parts the hook uses and nothing else,
 * and exposes __speak() so a test can make it "hear" something.
 */
const STUB_ENGINE = () => {
  class FakeRecognition {
    constructor() {
      this.lang = ''
      this.continuous = false
      this.interimResults = false
      this.onstart = null
      this.onresult = null
      this.onerror = null
      this.onend = null
      this.running = false
      // True only while an onend handler is being dispatched. Chrome will not
      // accept a start() during that window, and a stub that did accept one
      // let a real bug through: the hook used to restart the session from
      // inside onend, which Chrome rejects, and the microphone went dead after
      // the first stretch of silence.
      this.ending = false
    }

    start() {
      if (this.running || this.ending) {
        const failure = new Error('recognition has already started')
        failure.name = 'InvalidStateError'
        throw failure
      }
      this.running = true
      window.__recognition = this
      if (this.onstart) this.onstart()
    }

    /** The engine closing the session — by request, or on its own. */
    end() {
      this.running = false
      if (!this.onend) return
      this.ending = true
      try {
        this.onend()
      } finally {
        this.ending = false
      }
    }

    stop() {
      this.end()
    }

    abort() {
      this.running = false
    }
  }

  window.SpeechRecognition = FakeRecognition
  window.__speechCalls = []

  /**
   * The engine closing a "continuous" session by itself, which Chrome does
   * after a few seconds of silence. Nothing asked for it, and the hook is
   * expected to reopen the microphone rather than let it fall shut.
   */
  window.__endSession = () => {
    const recognition = window.__recognition
    if (!recognition) return false
    recognition.end()
    return true
  }

  /** Deliver a final result, as the real engine would. */
  window.__speak = (text) => {
    const recognition = window.__recognition
    if (!recognition?.onresult) return false
    recognition.onresult({
      resultIndex: 0,
      results: Object.assign(
        [[{ transcript: text }]],
        { 0: Object.assign([{ transcript: text }], { isFinal: true }) },
      ),
    })
    return true
  }

  /**
   * Deliver an interim result — a phrase the engine is still revising, which
   * is what it sends for the second or two before it settles on wording.
   */
  window.__speakInterim = (text) => {
    const recognition = window.__recognition
    if (!recognition?.onresult) return false
    recognition.onresult({
      resultIndex: 0,
      results: Object.assign(
        [[{ transcript: text }]],
        { 0: Object.assign([{ transcript: text }], { isFinal: false }) },
      ),
    })
    return true
  }

  /** Deliver an error, as the real engine does when permission is refused. */
  window.__speechError = (code) => {
    const recognition = window.__recognition
    if (!recognition?.onerror) return false
    recognition.onerror({ error: code })
    return true
  }
}

/** Registers an account and signs in, which every route here requires. */
async function signIn(page) {
  const email = `live.${Date.now()}.${Math.floor(Math.random() * 1000)}@example.com`
  const res = await page.request.post(`${API_ORIGIN}/api/auth/register`, {
    data: { full_name: 'Live Tester', email, password: PASSWORD, plan: 'free' },
  })
  expect(res.ok()).toBeTruthy()

  await page.goto('/login')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.locator('input[type="password"]').first().fill(PASSWORD)
  await page.getByRole('button', { name: /^log in$/i }).click()
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

test.use({ viewport: { width: 1280, height: 900 } })

test.describe('live interview', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(STUB_ENGINE)
  })

  test('asks one question at a time and dictation fills an editable answer', async ({ page }) => {
    await signIn(page)
    await startLiveInterview(page)

    await page.getByRole('button', { name: /begin/i }).click()

    // One question, and only one. This is the whole point of the mode: five
    // questions on a page is a form.
    await expect(page.locator('.live__question')).toHaveCount(1)
    await expect(page.locator('.live__question')).toContainText(/tight deadline/i)
    await expect(page.locator('.live__progress')).toContainText('1')

    // Dictate. The stub delivers a final result exactly as the engine would.
    await page.locator('.live__mic-btn').click()
    await expect(page.locator('.live__listening')).toBeVisible()
    await page.evaluate(() => window.__speak('i led the migration and it shipped on time'))

    const answer = page.locator('#live-answer')
    // Capitalised by appendTranscript, and in a real textarea rather than a
    // read-only panel — speech recognition makes mistakes and the candidate is
    // marked on this text.
    await expect(answer).toHaveValue(/^I led the migration and it shipped on time/)

    // Editable, which is the requirement the read-only version would have failed.
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

  test('keeps listening when the engine closes the session by itself', async ({ page }) => {
    await signIn(page)
    await startLiveInterview(page)
    await page.getByRole('button', { name: /begin/i }).click()

    await page.locator('.live__mic-btn').click()
    await expect(page.locator('.live__listening')).toBeVisible()

    // A few seconds of silence while the candidate reads the question. Chrome
    // ends a continuous session here, and it is not an error — nothing has
    // gone wrong and the user has not asked for anything.
    await page.evaluate(() => window.__endSession())

    // The microphone stays on across the gap, and the button does not flick
    // back to "Start speaking". This is the regression: the session used to be
    // reopened synchronously from inside onend, which the engine rejects, and
    // the failure was swallowed as "already running" — so silence switched the
    // microphone off for good and nothing said afterwards was ever heard.
    await expect(page.locator('.live__listening')).toBeVisible()
    await expect(page.locator('.live__mic-btn')).toContainText(/stop/i)

    // And the reopened session actually hears.
    await expect.poll(
      () => page.evaluate(() => window.__speak('i rewrote the import to stream the file')),
    ).toBe(true)
    await expect(page.locator('#live-answer')).toHaveValue(/rewrote the import to stream the file/)
  })

  test('shows the words in the answer box while they are still being said', async ({ page }) => {
    await signIn(page)
    await startLiveInterview(page)
    await page.getByRole('button', { name: /begin/i }).click()

    await page.locator('.live__mic-btn').click()
    await expect(page.locator('.live__listening')).toBeVisible()

    const answer = page.locator('#live-answer')

    // Still being revised by the engine. It belongs in the box the candidate
    // is watching: parked in a line underneath, the box looked dead for the
    // two or three seconds before a phrase settles, which reads as the
    // microphone not working at all.
    await page.evaluate(() => window.__speakInterim('i led the migration'))
    await expect(answer).toHaveValue(/I led the migration/)

    // Revised, not appended — the engine replaces provisional text wholesale,
    // so the earlier guess must not be left behind in front of it.
    await page.evaluate(() => window.__speakInterim('i led the migration project'))
    await expect(answer).toHaveValue('I led the migration project')

    // Settled. The same words, now committed, with nothing duplicated.
    await page.evaluate(() => window.__speak('i led the migration project and it shipped'))
    await expect(answer).toHaveValue('I led the migration project and it shipped')
  })

  test('lets the candidate type over a phrase still in the air', async ({ page }) => {
    await signIn(page)
    await startLiveInterview(page)
    await page.getByRole('button', { name: /begin/i }).click()

    await page.locator('.live__mic-btn').click()
    await page.evaluate(() => window.__speakInterim('somthing the engine misheard'))

    const answer = page.locator('#live-answer')
    await expect(answer).toHaveValue(/misheard/)

    // Typing wins. The preview must not be re-appended on the next render and
    // start fighting the cursor.
    await answer.fill('I typed this instead.')
    await expect(answer).toHaveValue('I typed this instead.')
    await page.waitForTimeout(300)
    await expect(answer).toHaveValue('I typed this instead.')
  })

  test('does not cry wolf while the candidate is still thinking', async ({ page }) => {
    await signIn(page)
    await startLiveInterview(page)
    await page.getByRole('button', { name: /begin/i }).click()

    await page.locator('.live__mic-btn').click()
    await expect(page.locator('.live__listening')).toBeVisible()

    // Chrome gives up after about eight seconds of quiet and reports
    // no-speech. Reading the question takes longer than that, so the first
    // couple say nothing about the microphone and must stay quiet — the
    // warning used to appear during every normal pause, which made a working
    // microphone look broken and a broken one indistinguishable.
    for (let i = 0; i < 2; i += 1) {
      await page.evaluate(() => { window.__speechError('no-speech'); window.__endSession() })
      await expect(page.locator('.live__speech-warn')).toHaveCount(0)
      await expect(page.locator('.live__listening')).toBeVisible()
    }

    // Sustained silence is worth saying, and it names the thing that is
    // actually usually wrong.
    await page.evaluate(() => { window.__speechError('no-speech'); window.__endSession() })
    await expect(page.locator('.live__speech-warn')).toContainText(/default/i)

    // And it goes the moment a word arrives.
    await page.evaluate(() => window.__speak('here is my answer'))
    await expect(page.locator('.live__speech-warn')).toHaveCount(0)
  })

  test('keeps every fragment when two arrive at once', async ({ page }) => {
    await signIn(page)
    await startLiveInterview(page)
    await page.getByRole('button', { name: /begin/i }).click()

    await page.locator('.live__mic-btn').click()
    await expect(page.locator('.live__listening')).toBeVisible()

    // Two final results in the same tick, which dictation produces constantly.
    // Appending by reading the current answer out of a closure lost the first
    // of them — React batches the two updates, so the second overwrote it and
    // a whole spoken sentence vanished from an answer about to be marked.
    await page.evaluate(() => {
      window.__speak('i owned the rollout')
      window.__speak('and wrote the runbook for it')
    })

    const answer = page.locator('#live-answer')
    await expect(answer).toHaveValue(/i owned the rollout/i)
    await expect(answer).toHaveValue(/wrote the runbook for it/i)
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

  test('falls back to typing when the browser has no speech recognition', async ({ page }) => {
    // Firefox's situation, reproduced in Chromium by removing the engine.
    await page.addInitScript(() => {
      delete window.SpeechRecognition
      delete window.webkitSpeechRecognition
    })

    await signIn(page)
    await startLiveInterview(page)

    // Said on the intro card, BEFORE the interview starts, so somebody can
    // choose the written mode instead of finding out mid-answer.
    await expect(page.locator('.live-intro .live-notice')).toContainText(/does not support speech to text/i)
    await expect(page.locator('.live-intro .live-notice')).toContainText(/Chrome, Edge and Opera/i)

    await page.getByRole('button', { name: /begin/i }).click()

    // No microphone button, and the interview is otherwise completely normal.
    await expect(page.locator('.live__mic-btn')).toHaveCount(0)
    await expect(page.locator('.live-notice')).toBeVisible()
    await expect(page.locator('#live-answer')).toBeEditable()

    await page.locator('#live-answer').fill('Typed because this browser cannot listen.')
    await page.getByRole('button', { name: /next question/i }).click()
    await expect(page.locator('.live__progress')).toContainText('2')
  })

  test('explains a denied microphone and keeps the interview going', async ({ page }) => {
    await signIn(page)
    await startLiveInterview(page)
    await page.getByRole('button', { name: /begin/i }).click()

    await page.locator('.live__mic-btn').click()
    await expect(page.locator('.live__listening')).toBeVisible()

    // What the engine reports when the user, or the operating system, says no.
    await page.evaluate(() => window.__speechError('not-allowed'))

    // The button goes, because it can no longer do anything, and the remedy is
    // named — it is a browser setting this page cannot open.
    await expect(page.locator('.live__mic-btn')).toHaveCount(0)
    await expect(page.locator('.live-notice')).toContainText(/Microphone access was blocked/i)
    await expect(page.locator('.live-notice')).toContainText(/browser settings/i)

    // And the interview is still perfectly usable.
    await page.locator('#live-answer').fill('Typing instead, which works the same.')
    await page.getByRole('button', { name: /next question/i }).click()
    await expect(page.locator('.live__progress')).toContainText('2')
  })

  test('runs to the end and shows the same results screen as the written mode', async ({ page }) => {
    await signIn(page)
    await startLiveInterview(page)
    await page.getByRole('button', { name: /begin/i }).click()

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
