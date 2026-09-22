# Live interview — manual test script

## Why this document exists

Everything in the live interview that can be automated is automated, in
`client/e2e/live-interview.spec.js`. That spec replaces the browser's speech
engine with a stub it drives, so it proves the plumbing: one question at a
time, a recognised fragment landing in an editable box, timings reaching the
server, the interview finishing when speech is unavailable, and the written
mode still working.

What it cannot prove is that **speech recognition actually works**. A headless
browser has no microphone, no audio device and no recognition engine, so the
one thing the feature is named after is the one thing no test in this
repository touches. That is what this script is for, and it has to be run by a
person with a microphone.

Run it before any release that changes the live interview, the speech module,
or the preparation page.

---

## Before you start

| | |
|---|---|
| **Build** | commit / branch under test: ................................ |
| **Tested by** | ................................ |
| **Date** | ................................ |
| **URL** | ................................ (note whether http or https) |

You need:

- Chrome and Edge (both support Web Speech recognition)
- Firefox (deliberately does not — it is the fallback case)
- A working microphone
- A signed-in account. For section 6 you need a **premium** account; if you
  cannot get one, record section 6 as **not tested** rather than as passed.

**Test on the deployed site, not only on localhost.** `localhost` counts as a
secure context, so microphone access works there even over plain `http`. A
deployment served over `http` will fail where every local test passed. If
there is no deployed site yet, say so in the results table rather than ticking
section 7.

---

## 1. Choosing the mode — Chrome

| # | Step | Expected | Pass |
|---|---|---|---|
| 1.1 | Open `/preparation`, go to the Mock Interview tab | Two mode cards, **Written** selected | ☐ |
| 1.2 | Read the Live card | Says one question at a time, mentions speaking, carries a "Speech to text" badge | ☐ |
| 1.3 | Click **Live** | Card highlights; a line appears saying speech to text is English only | ☐ |
| 1.4 | Read "How it works" below | The three steps now describe the live flow, not the written one | ☐ |
| 1.5 | Click **Start interview** | An intro card appears. **The interview has not started and no clock is running** | ☐ |

## 2. The intro card — Chrome

| # | Step | Expected | Pass |
|---|---|---|---|
| 2.1 | Read the card | Three numbered steps, a line saying no audio is recorded or uploaded, and a follow-up line | ☐ |
| 2.2 | Check the follow-up line | Free account: says follow-ups are premium. Premium: says the interview can ask them | ☐ |
| 2.3 | Click **Begin** | Question 1 appears, large and centred. The timer starts from 0s | ☐ |

## 3. Dictation — Chrome, then repeat the whole section in Edge

| # | Step | Expected | Pass (Chrome) | Pass (Edge) |
|---|---|---|---|---|
| 3.1 | Click **Start speaking** | Browser asks for microphone permission (first time only) | ☐ | ☐ |
| 3.2 | Allow it | Button turns dark and reads **Stop**; a pulsing dot and "Listening" appear | ☐ | ☐ |
| 3.3 | Say: *"I led the data migration for a team of four and we finished two days early"* | Words appear **as you speak** — provisional text in an italic tinted strip below the box | ☐ | ☐ |
| 3.4 | Stop speaking and wait ~2s | The provisional strip empties and the finished sentence is now in the answer box | ☐ | ☐ |
| 3.5 | Check the first letter | Capitalised, even though recognition returns lowercase | ☐ | ☐ |
| 3.6 | Keep talking, adding a second sentence | Appended to the first with a single space, not overwriting it | ☐ | ☐ |
| 3.7 | Click into the answer box and **edit a word** while still listening | Your edit stays. It is not overwritten by the next fragment | ☐ | ☐ |
| 3.8 | Click **Stop** | Listening indicator goes. **The browser's recording indicator in the tab goes out** | ☐ | ☐ |
| 3.9 | Stay silent for ~60 seconds with the mic on | It keeps listening. It does not quietly switch off mid-thought | ☐ | ☐ |

> 3.9 is the one people miss. Chrome ends a continuous session by itself after a
> stretch of silence; the hook is supposed to restart it. If the microphone goes
> out on its own, that is a fail.

## 4. Moving through the interview — Chrome

| # | Step | Expected | Pass |
|---|---|---|---|
| 4.1 | Watch the timer for ~10s | Counts up in seconds. Does not jump about or shift the layout | ☐ |
| 4.2 | Read the progress line | "Question 1 of 5", with a progress bar | ☐ |
| 4.3 | Click **Next question** | Question 2 replaces question 1. **Only one question is ever on screen** | ☐ |
| 4.4 | Check the answer box | Empty. The previous answer has not carried over | ☐ |
| 4.5 | Check the timer | Back to 0s for the new question | ☐ |
| 4.6 | Check the microphone | Off. It did not stay open across the question boundary | ☐ |
| 4.7 | Leave an answer blank and look below the box | A warning says moving on will leave it blank | ☐ |
| 4.8 | On the last question | The button reads **Finish and get feedback** | ☐ |
| 4.9 | Click it | An inline confirmation appears — **not** a browser alert box | ☐ |
| 4.10 | Click **Keep answering** | Returns to the question with the answer intact | ☐ |
| 4.11 | Click Finish, then **Submit it** | Assessment runs | ☐ |

## 5. Results and My Plan — Chrome

| # | Step | Expected | Pass |
|---|---|---|---|
| 5.1 | The results screen | Identical in layout to a written interview's: overall score, summary, a card per question | ☐ |
| 5.2 | Each question card | Shows a score, a verdict, strengths and improvements | ☐ |
| 5.3 | Each question card | Also shows how long that answer took | ☐ |
| 5.4 | Read the feedback carefully | **It does not tell you to fix your spelling, punctuation or typing.** If it does, the spoken-answer prompt block is not reaching the model | ☐ |
| 5.5 | Compare the score to a written interview with similar answers | Broadly comparable. A live interview should not score systematically lower for the same substance | ☐ |
| 5.6 | Open the **My Plan** tab | Any gaps the interview found are on the board, exactly as a written interview's would be | ☐ |
| 5.7 | Open **Past Interviews** | The interview is listed and labelled **Live** | ☐ |
| 5.8 | Reopen it from the history | Results load, timings still shown | ☐ |

## 6. Follow-up questions — premium account, Chrome

Skip and mark **not tested** if you cannot get a premium account.

| # | Step | Expected | Pass |
|---|---|---|---|
| 6.1 | Start a live interview | Intro card says the interview can ask follow-ups | ☐ |
| 6.2 | Answer question 1 with something deliberately incomplete — e.g. *"We improved the reporting process a lot"* with no detail | | ☐ |
| 6.3 | Click Next | Button reads "Preparing the next question…" briefly | ☐ |
| 6.4 | Look at the question that appears | If a follow-up came: it is tagged **Follow-up**, says it was asked in response to your last answer, and **refers to something you actually said** | ☐ |
| 6.5 | Check the follow-up's content | It does not mention an employer, project or date you never named | ☐ |
| 6.6 | Answer question 2 thoroughly and specifically | No follow-up, or a genuinely useful one — **not** "can you tell me more about that?" | ☐ |
| 6.7 | Continue to the end | At most **two** follow-ups in the whole interview. Total questions never exceeds 7 | ☐ |
| 6.8 | On the results screen | The follow-up appears **next to the answer it probed**, not at the end | ☐ |

## 7. HTTPS — deployed site

| # | Step | Expected | Pass |
|---|---|---|---|
| 7.1 | Open the deployed site over **https** and start a live interview | Microphone prompt appears and dictation works | ☐ |
| 7.2 | If the site is reachable over plain **http**, open it that way | The mic button is replaced by a notice naming HTTPS as the problem. It does **not** fail silently | ☐ |
| 7.3 | On a phone, over https | Question is the largest thing on screen; buttons are full width; no sideways scrolling | ☐ |

**If there is no deployed site, write "no deployment" here and leave 7.1–7.3 unticked:**
................................................................

## 8. Fallback: a browser without Web Speech — Firefox

| # | Step | Expected | Pass |
|---|---|---|---|
| 8.1 | Open `/preparation` in Firefox, choose Live, click Start interview | Intro card appears **with a notice on it** — before the interview begins | ☐ |
| 8.2 | Read the notice | Says this browser does not support speech to text, **names Chrome, Edge and Opera**, and says to type instead | ☐ |
| 8.3 | Click **Begin** | No microphone button anywhere | ☐ |
| 8.4 | Type an answer | Works normally | ☐ |
| 8.5 | Complete the interview | Runs to the end and produces results exactly as in Chrome | ☐ |
| 8.6 | Check the results | Nothing is missing or broken because speech was unavailable | ☐ |

## 9. Denied microphone permission — Chrome

Reset the site's microphone permission first: click the padlock in the address
bar → Site settings → Microphone → Reset, then reload.

| # | Step | Expected | Pass |
|---|---|---|---|
| 9.1 | Start a live interview and click **Start speaking** | Permission prompt appears | ☐ |
| 9.2 | Click **Block** | The microphone button **disappears** — it can no longer do anything | ☐ |
| 9.3 | Read the notice | Says access was blocked and tells you to allow the microphone in browser settings and reload | ☐ |
| 9.4 | Type an answer and click Next | Interview continues completely normally | ☐ |
| 9.5 | Finish the interview | Results are produced as usual | ☐ |
| 9.6 | Now allow the microphone in site settings and reload | The button is back and dictation works | ☐ |

## 10. Bangla

| # | Step | Expected | Pass |
|---|---|---|---|
| 10.1 | Switch the interface to Bangla and open the Mock Interview tab | **No mode picker at all.** Live is not offered | ☐ |
| 10.2 | Start an interview | The written interview, in Bangla, exactly as before | ☐ |
| 10.3 | Switch back to English, open Past Interviews | A live interview run in English is still listed and still opens | ☐ |

## 11. The written mode is undamaged

The point of the whole feature is that this still works identically.

| # | Step | Expected | Pass |
|---|---|---|---|
| 11.1 | Choose **Written**, start an interview | All five questions on one page, as before | ☐ |
| 11.2 | Check the page | No microphone button, no timer, no progress bar | ☐ |
| 11.3 | Answer some and submit | Results as before | ☐ |
| 11.4 | Check the results | **No "took Xs" anywhere.** A written interview times nothing | ☐ |
| 11.5 | Open a written interview from **before** this change | Opens and renders normally, labelled Written | ☐ |
| 11.6 | Check My Plan | Gaps reconcile as before | ☐ |

## 12. Responsive

| # | Width | Expected | Pass |
|---|---|---|---|
| 12.1 | Phone, 390px | Question left-aligned and still the largest text. Mic and Next buttons full width. No horizontal scrolling | ☐ |
| 12.2 | Tablet, ~834px | Question centred, comfortable measure | ☐ |
| 12.3 | Desktop, 1280px+ | Question centred, card does not stretch the full width | ☐ |
| 12.4 | Any width, **dark mode** | Every colour resolves. No white-on-white or black-on-black | ☐ |

---

## Results

| Section | Chrome | Edge | Firefox | Notes |
|---|---|---|---|---|
| 1 Mode picker | | | | |
| 2 Intro card | | | | |
| 3 Dictation | | | n/a | |
| 4 Moving through | | | | |
| 5 Results and plan | | | | |
| 6 Follow-ups (premium) | | | | |
| 7 HTTPS / deployed | | | | |
| 8 Unsupported fallback | n/a | n/a | | |
| 9 Denied permission | | | n/a | |
| 10 Bangla | | | | |
| 11 Written undamaged | | | | |
| 12 Responsive | | | | |

**Defects found:**

1. ................................................................
2. ................................................................
3. ................................................................

**Signed off by:** ................................  **Date:** ..................
