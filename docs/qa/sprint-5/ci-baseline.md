# CI baseline (PPST-23)

The first fully green run of the GitHub Actions workflow (`.github/workflows/ci.yml`): every job passed, no test was skipped, and no secret, `.env` file or database was used. These are the numbers later runs are measured against.

| | |
| --- | --- |
| Run | [CI #3, attempt 1](https://github.com/dctxv/ict30017-digital-career-hub/actions/runs/37015605223) on [PR #34](https://github.com/dctxv/ict30017-digital-career-hub/pull/34) |
| Commit | `18a82bc771620f192fa7b025707369312a395bf3` (`ci/github-actions`, with `main` at `3200cd4c` merged in) |
| Date | 2 October 2026, 13:49:42 to 13:53:27 UTC |
| Total run time | 3 min 45 s (jobs run in parallel) |
| Node | 22.22.0, from `.nvmrc` |
| Result | 4 of 4 jobs passed |

## Jobs

| Job | Result | Duration |
| --- | --- | --- |
| Client lint and unit tests | Passed | 32 s |
| Unit tests and coverage (ai-service) | Passed | 15 s |
| Unit tests and coverage (server) | Passed | 32 s |
| Playwright e2e (Chromium, fake API) | Passed | about 3 min 20 s, of which the suite took 2.7 min |

## Tests per package

| Package | Runner | Passed | Failed | Skipped |
| --- | --- | --- | --- | --- |
| ai-service | `node:test` | 317 | 0 | 0 |
| server | `node:test` | 213 | 0 | 0 |
| client unit | `node:test` | 71 | 0 | 0 |
| client e2e | Playwright, Chromium | 40 | 0 | 0 |
| **Total** | | **641** | **0** | **0** |

Client lint (ESLint): 0 errors, 1 warning. The warning is a missing `useEffect` dependency in `client/src/pages/AdminDashboard.jsx`, which predates this work.

## Line coverage against the 70% target

Node's coverage only reports files a test loads, so a file no test imports simply does not appear. The headline figure therefore counts every source file and scores unloaded ones as 0%, in the same unit Node uses (every physical line). The "loaded files" figure is what Node itself prints.

| Package | All source files | Loaded files only | Branch | Functions | Files loaded | Against 70% |
| --- | --- | --- | --- | --- | --- | --- |
| ai-service | **92.5%** | 92.5% | 80.2% | 88.8% | 29 of 29 | Met. Enforced in CI as a minimum |
| server | **46.3%** | 82.2% | 77.8% | 72.1% | 28 of 55 | Not met. Reported only, no gate |

The server's gap is almost entirely files with no test at all. The largest are `scripts/compare-models.js` (684 lines), `src/routes/users.js` (671), `src/routes/resume.js` (631), `src/routes/chatbot.js` (469), `src/routes/alumni.js` (372), `src/routes/careerPaths.js` (336) and `scripts/check-setup.js` (330). The full list is in each run's job summary and in `summary.json` inside the `coverage-server` artifact.

## Artifacts

Kept for 30 days (until 1 November 2026).

| Name | Contents | Size |
| --- | --- | --- |
| `coverage-ai-service` | `lcov.info`, `tests.tap`, `summary.json` | 36.6 kB |
| `coverage-server` | `lcov.info`, `tests.tap`, `summary.json` | 32.7 kB |
| `playwright-report` | Playwright HTML report | 248.9 kB |

## Skipped and mocked tests

**Skipped: none.** No `node:test` suite reported a skip, and all 40 Playwright tests ran.

**Mocked:** these stand in for a database, the network or an API key.

| Test | What is mocked | Why |
| --- | --- | --- |
| Whole Playwright suite | Runs against `client/e2e/fake-api/server.js`, an in-memory double of the API, started by Playwright in CI | No PostgreSQL, JWT secret or AI key in CI |
| e2e `admin-nav.spec.js`, "an admin sees the Admin navigation entry… (mocked: admin role set through the fake API's /api/test/promote, no database in CI)" | The admin role is set through the fake API's test-only endpoint instead of `psql` | No database in CI. Against the real API it still uses `psql`, and skips with a reason if it can't connect |
| e2e `live-happy-path.spec.js`, "a signed in user uploads a real resume and sees real AI feedback (mocked: fake API returns a canned review, no AI key in CI)" | The analysis is the fake API's canned review | No AI key in CI |
| e2e `live-interview.spec.js` (19 tests) | `MediaRecorder` and `getUserMedia` are stubbed in the page; the transcribe request is intercepted | No microphone in a headless browser, and no Groq key |
| e2e `resume-errors.spec.js` (6 tests), `review-context.spec.js` (3 tests) | The analysis and upload requests are intercepted to force errors and capture what is sent | The behaviour under test is the browser's response to those replies |
| ai-service `piiMaskIntegration.test.js` | `fetch` stubbed to capture the outbound request; dummy `GOOGLE_AI_API_KEY` and model ids | Proves no PII reaches the wire without calling Google |
| ai-service `transcription.test.js` | Groq client stubbed; `GROQ_API_KEY` and `WHISPER_MODEL` set per test | No Groq key, no audio upload |
| server `routes/auth.test.js` | In-memory stand-in for `pool.query`; Have I Been Pwned `fetch` stubbed; email via the console transport | No database, network or SMTP |
| server `routes/transcribe.test.js` | `pool.query` stubbed; `GROQ_API_KEY` empty; test-only `JWT_SECRET` | No database or Groq key |

All other unit tests use only the code under test and files in the repository.

## How green was reached

The first run ([CI #2](https://github.com/dctxv/ict30017-digital-career-hub/actions/runs/37014363963), commit `7661ba7c`) failed the client job.

- **Unit tests:** 70 passed, 1 failed. `styles/tokens.test.js` found CSS variables used but never declared (`--card-bg`, `--color-muted`, `--text`) in `Profile.jsx` and `SecurityDashboard.jsx`.
- **Lint:** 7 errors, in the same security screens.

Both are real bugs introduced by PR 31. The test was not changed. The fixes were already on the Login-Fix branch, so PR 35 was merged into `main` and `main` was merged into this branch. The other three jobs passed on both runs.

## Known warnings

These don't fail the build.

- `actions/upload-artifact@v5` still targets Node 20. GitHub runs it on Node 24 and prints a deprecation warning.
- The fake API has no `GET /api/news`, so the home page's news card shows its error state during e2e. No test asserts on the news card; adding the route to the fake would quiet the log.
- Parallel jobs can race to save the npm cache ("Unable to reserve cache"). The next run reuses it.

## Next steps

- Add route tests for the server's untested routes, starting with `users.js`, `resume.js` and `chatbot.js`, then add a server coverage minimum once all-source coverage passes 70%.
- Optionally, a nightly job against the real API with a PostgreSQL service and an AI key secret, for `npm run check` and the live happy path. That job would need secrets; this one deliberately doesn't.
