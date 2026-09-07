# Digital Career Hub — QA Sweep Defect Ledger

**Date** 18 August 2026
**Build under test** `claude/website-qa-testing-3snwws @ 361b00d`
**Stack** Vite `:5173` · Express `:3000` · PostgreSQL 16
**Fixtures** 7 disciplines · 70 paths · 42 resources · 10 alumni
**Method** Every interactive control on every page driven in a real Chromium browser against a locally running stack, with console errors, failed requests and HTTP status codes captured at each step. API-level probes with `curl` covered validation, rate limiting and privilege escalation.

## Summary

| Severity | Count | Definition |
|---|---|---|
| Critical | 4 | Blocks a core journey outright |
| High | 8 | Visible failure or dead control |
| Medium | 12 | Wrong behaviour, workaround exists |
| Low | 12 | Polish, copy and accessibility |
| **Total** | **36** | |

Plus 4 repository hygiene items (not user-facing) and 16 areas verified working as a regression baseline.

---

## Critical

| ID | Finding | Location | Status |
|---|---|---|---|
| C1 | Signing in is never reflected in the UI | `client/src/components/Navbar.jsx:6` + every page component | |
| C2 | Resume Review shows a hardcoded fake user | `client/src/pages/ResumeReview.jsx:345` | |
| C3 | There is no way to log out, anywhere | client — entire app | |
| C4 | Mobile users cannot log in or sign up at all | `client/src/components/Navbar.css:113–129` | |

**C1 — Signing in is never reflected in the UI.**
Register, log in with valid credentials, land on `/`. Expected the navbar to show the signed-in user; actual it still reads "Log in | Sign up" on every page, and survives a reload. Login itself works — `localStorage.user` was correctly set and the token cookie issued. Only the UI is blind to it.
*Root cause.* Navbar takes `user` as a prop (`function Navbar({ user = null })`). Nine of its ten render sites call bare `<Navbar />`, so `user` is always null. `Login.jsx:34` writes the session and navigates away; nothing reads it back for display.
*Fix.* Let Navbar read the session itself — an auth context, or at minimum `JSON.parse(localStorage.getItem('user'))` — instead of depending on a prop no page passes. One fix covers 10 pages.
*Note.* Sign-up is equally invisible: registering only prints "Account created! You can now log in." and clears the form; `localStorage` stays null. Sign-up merely looks successful because it prints a confirmation and login prints nothing.

**C2 — Resume Review shows a hardcoded fake user.**
Visiting `/resume-review` while logged out renders "Isar Ujoodah" in the navbar. The line is `<Navbar user={{ name: 'Isar Ujoodah' }} />` — a demo placeholder that shipped. A genuinely signed-in user with a different name also sees "Isar Ujoodah". One-line fix.

**C3 — There is no way to log out, anywhere.**
`POST /api/auth/logout` exists and works server-side, but no button, link or menu item in the whole UI calls it. Once signed in, the only exit is clearing site data by hand. The session cookie lives one hour; `localStorage.user` lives forever.

**C4 — Mobile users cannot log in or sign up at all.**
At ≤768 px, `.btn-outline-sm, .btn-filled-sm { display: none; }` hides both auth buttons, and the hamburger menu contains only the four content links. Measured at 390 × 844: the Log in button is invisible both before and after opening the menu. On a phone there is no route to authentication except typing `/login` into the address bar.

---

## High

| ID | Finding | Location | Status |
|---|---|---|---|
| H1 | Forgot password, Terms and Privacy are blank white pages | `client/src/App.jsx:17–32` | |
| H2 | Any unknown URL is a blank white page | `client/src/App.jsx:17–32` | |
| H3 | The plan chosen at registration is silently discarded | `Register.jsx:47` · `server/src/routes/auth.js:24–70` | |
| H4 | A failed analysis strands the user in a broken results shell | `ResumeReview.jsx:334–338` · `ResultsView.jsx:747` | |
| H5 | Total failure is described as partial | `ResultsView.jsx:706` | |
| H6 | The client accepts files the server will reject | `ResumeReview.jsx:104–118` | |
| H7 | "Load more resources" does nothing | `Resources.jsx:135` | |
| H8 | Both "Email" buttons on the results page are dead | `ResultsView.jsx:663, :790` | |

**H1.** All three are linked from the auth screens; none has a `<Route>`, and there is no catch-all, so React Router renders nothing. Measured `document.body.innerText.length === 0` on each. The backend `POST /api/auth/forgot-password` and `/reset-password` are fully implemented with hashed tokens and 30-minute expiry — only the screens are missing.

**H2.** No `<Route path="*">`. `/does-not-exist` renders an empty body with only the chatbot bubble floating on white.

**H3.** The Free/Premium tier cards set state and POST `plan: tier`, but `/api/auth/register` destructures only `{ full_name, email, password }`. There is no `plan` or `tier` column in the users table — confirmed with `\d users`. Choosing Premium changes nothing, including the AI model tier: `aiClient.js` always resolves free.

**H4.** On any analysis error the app still switches to `view: 'results'` with `feedback === null`. The result is an "Overall score" card animating loading dots forever, no score, no sections — and the "What next?" strip is gated on `overallScore !== null`, so the Upload new resume button never appears. Reproduced three ways: oversized file, wrong file type, upstream AI failure.

**H5.** The banner reads "Feedback may be incomplete: File too large. Maximum size is 3 MB." There is no feedback at all. The same wording wraps "Invalid file type…" and "Analysis failed."

**H6.** `accept=".pdf,.docx"` only filters the picker dialog. A `.txt` dropped on the drop-zone is accepted, shown in a file card, and offered an Analyse button — the user only learns it is invalid after a full upload round-trip returns 415. A 3.1 MB PDF is accepted with no warning and fails at the server with 413. Neither type nor size is checked before upload.

**H7.** The button has no `onClick`. All 42 resources already render in one fetch and there is no pagination. It is also rendered when a filter matches zero resources — directly beneath "No resources found."

**H8.** ✉ Email in the section nav and ✉ Email to myself in the CTA strip have no `onClick`. No dialog, no navigation, no error. There is no mail endpoint on the server either.

---

## Medium

| ID | Finding | Location | Status |
|---|---|---|---|
| M1 | "Continue with Google" is a dead button | `Login.jsx:83` | |
| M2 | The Bangla toggle only translates resource cards | `LanguageContext.jsx` · all pages | |
| M3 | No Bangla content exists in the seed data | `server/migrations/seed_content_data.sql` | |
| M4 | "PDF" resources render with no banner colour | `Resources.jsx:9–20` vs `AdminDashboard.jsx:5` | |
| M5 | "Find related resources for X" does not filter by X | `CareerPaths.jsx:50–54` · `Resources.jsx:69–76` | |
| M6 | That same button forces a full page reload | `CareerPaths.jsx:53` | |
| M7 | Forging localStorage renders the admin shell | `RequireAuth.jsx:14–22` | |
| M8 | An expired session reports the problem but offers no way out | `AdminDashboard.jsx:62–65` | |
| M9 | A fresh clone will not boot from the documented setup | `server/package.json:13` · `routes/resume.js:8` | |
| M10 | The origin allowlist omits 127.0.0.1, breaking the chatbot | `routes/chatbot.js:229–241` · `app.js:27` | |
| M11 | The free-tier chat limit is written but never wired up | `routes/chatbot.js:190–220` | |
| M12 | Rate limits are per-IP and applied before any identity check | `routes/resume.js:26–32` · `routes/auth.js:17` | |

**M2.** Switching to BN re-fetches `/api/resources?lang=bn` and nothing else. Every piece of static UI copy — headings, filter pills, buttons, the whole Home page, Login, Register, Career Paths, Alumni — stays in English. Career Paths and Alumni send no `lang` parameter at all. The Home page advertises "Switch the entire platform to Bangla with one click — including AI feedback and chatbot responses."

**M3.** `SELECT count(*) FROM resources WHERE title_bn IS NOT NULL` returns 0 of 42. The BN toggle therefore falls back to English on every card and appears to do nothing. The pipeline itself is sound — a resource added through the admin panel with Bangla fields rendered correctly under BN, and the `COALESCE` fallback behaved as designed.

**M4.** The admin offers five types — Guide, Article, Video, Course, PDF — but `typeColors` and `typeDots` define only the first four. A PDF row gets `background: undefined`; measured as `{"bg":"","badgeColor":""}`. One seeded row is already affected.

**M5.** The button stores both `selectedDiscipline` and `selectedCareer`, but Resources reads `selectedCareer` only in order to delete it. Clicking "Find related resources for Treasury Analyst" lands on 11 generic Finance resources with no mention of Treasury Analyst anywhere on the page.

**M6.** `window.location.href = '/resources'` rather than `useNavigate()` — the only hard navigation in the SPA. It tears down and re-bootstraps the whole React app, causing a white flash and re-fetching everything.

**M7.** `RequireAuth` trusts `localStorage.user.role` alone. Setting `role:"admin"` with no cookie loads the full dashboard chrome — tabs, forms, and the disciplines/paths/resources tables, all of which are public data anyway. Alumni drafts correctly return 401 and every write is rejected 401, so no private data leaks and no unauthorised change is possible. But it looks like a successful breach. There is no `/api/auth/me` to validate the session against.

**M8.** Once the one-hour JWT expires, `localStorage.user` still says admin, so `/admin` loads and shows "Your session has expired. Please log in again." — with zero actionable elements next to it. The same dead end applies to any 401 in the app.

**M9.** Following the README — `cd server && npm install && npm run dev` — crashes with `Cannot find package 'dotenv' imported from ai-service/src/utils/aiClient.js`. The server declares `"ai-service": "file:../ai-service"` but imports it by relative path, which resolves from the real directory and bypasses the `node_modules` symlink, so `openai` and `zod` are never installed. Needs an undocumented `cd ai-service && npm install`.

**M10.** The default is `http://localhost:5173,http://localhost:5174`. Vite prints `127.0.0.1:5173` as a valid URL, and opening the site that way makes every `POST /api/chat` return 403, surfaced as "Something went wrong. Please try again." Confirmed by comparison: the identical request from localhost passes.

**M11.** `enforceDailyTurnLimit` is complete but absent from the route's middleware chain, so `FREE_DAILY_CHAT_LIMIT = 10` and the `chat_message_count` / `chat_count_reset_date` columns are unused. The dead function also queries `users WHERE id = $1`, but the primary key is `user_id` — it would throw the moment it were connected.

**M12.** Resume analysis allows 5 per hour keyed on IP. Every user behind one NAT — a university lab or shared broadband, which is the stated target audience — shares those five. The auth limiter is tighter still: 10 requests per 15 minutes per IP, shared across register, login, forgot-password and reset-password combined. Both verified returning 429.

---

## Low — polish, copy, accessibility

| ID | Finding | Location | Status |
|---|---|---|---|
| L1 | Browser tab still says `digital-career-hub-new` | `client/index.html:7` | |
| L2 | `/favicon.svg` 404s on every page load | `client/index.html:5` | |
| L3 | No meta description | `client/index.html` | |
| L4 | "3 reviews remaining this month" is hardcoded and contradicted twice | `ResumeReview.jsx:222` | |
| L5 | "Upgrade for unlimited" points at the sign-up form | `ResumeReview.jsx:224` | |
| L6 | Register has no form element, and Enter does not submit | `Register.jsx:76–215` | |
| L7 | The password rules are never shown | `Register.jsx:100–130` | |
| L8 | Plan tier cards cannot be reached by keyboard | `Register.jsx:145–163` | |
| L9 | The hamburger button has no accessible name or state | `Navbar.jsx:66` | |
| L10 | Filter pills expose no pressed state | `Resources.jsx` · `CareerPaths.jsx` · `Alumni.jsx` | |
| L11 | Career Paths scrolls sideways on a phone | `CareerPaths.css:59–76` | |
| L12 | Resource search is not trimmed | `Resources.jsx:75` | |

**L4.** Static text tied to no counter. The Register page promises "3 resume reviews per day", and the server enforces 5 per hour per IP. Three different numbers for one limit.
**L7.** The 12-character minimum is enforced server-side only; searching the page for "12 characters" returns zero matches. Users discover the rule by failing.
**L8.** Plain `<div onClick>` with no `role`, `tabIndex` or `aria-selected`.
**L9.** `aria-label` and `aria-expanded` are both null — the one button on the entire site with no accessible name.
**L10.** `aria-pressed` appears on 0 of 14 pills; the EN/BN toggle does this correctly on 2 of 2. The resources search input has no `<label>` or `aria-label`.
**L11.** At a 390 px viewport the body scrolls to 474 px; `.cp-list-col` and `.cp-path-item` both measure 450 px wide. Resume Review overflows 16 px. Home, Resources, Alumni, Login and Register are clean.
**L12.** `"cv"` returns 8 results; `" cv "` returns 0.

---

## Repository hygiene — not user-facing

| File | Finding | Status |
|---|---|---|
| `README.md` | Unresolved merge conflict markers at lines 13, 15 and 32. The entire "How to run the web / backend" section — the only setup documentation in the repo — sits inside the conflicted block. | |
| `Fullyfunctionalregister.js` | Dead code, never imported, committing a hardcoded `JWT_SECRET = "your_secret_key"` and defining a second, incompatible users schema. Should be deleted. | |
| `server/src/*` | `controllers`, `jobs`, `models`, `services` and `ai-service/parsers` are empty placeholder directories. | |
| Navigation | Nothing in the UI links to `/admin`. An administrator has to type the URL. | |

---

## Verified working — regression baseline

Sixteen areas exercised and behaving correctly. Re-test against this list once the defects above are fixed.

| Area | Result |
|---|---|
| Navbar links, logo, hero CTAs — all seven route correctly, active-link highlighting works | PASS |
| Resources filters — 6 categories × 8 disciplines × search, correct individually, combined and empty | PASS |
| Resource card links — all 42 have real `https` hrefs with `target="_blank" rel="noopener noreferrer"` | PASS |
| Career Paths — 8 discipline filters, 70 path selections, counts, auto-selection, skills, progression, salary | PASS |
| Alumni filters — all 8 correct, including a genuine empty state for Education | PASS |
| Alumni privacy gate — only `is_published AND consent_given` rows are public; `/api/alumni/all` returns 401 to non-admins | PASS |
| Admin CRUD, all four tabs — create, edit, cancel, delete; 409 on duplicate; malformed JSON caught; 400 on future graduation year; publish gated on consent | PASS |
| Role escalation — `POST /register` with `"role":"admin"` ignored, user created as student, confirmed in the database | PASS |
| Login failure paths — empty fields, wrong password, duplicate email, lockout and rate limiting all correct | PASS |
| Password show/hide — toggles input type and button label correctly | PASS |
| Sample resume review — all 6 nav pills scroll, 5 section cards render, scores, rings and badges correct | PASS |
| PDF preview — blob URL from the uploaded File, page renders in the split pane, text layer extracted | PASS |
| Chatbot widget — on all 7 pages; open/close, send disabled when empty, Shift+Enter newline, history retained, error surfaced and input re-enabled | PASS |
| EN/BN content pipeline — Bangla title via admin panel rendered under BN; `COALESCE` fallback confirmed | PASS |
| Injection probe — `<img src=x onerror=alert(1)>` safely escaped by React; resource URLs validated server-side to http/https only | PASS |
| Mobile layout — Home, Resources, Alumni, Login, Register clean at 390 px; chatbot widget fits viewport | PASS |

---

## Recommended fix order

Sequenced by leverage, not severity alone.

1. **C1** — Make Navbar read the session itself instead of taking a prop. One change fixes the reported bug on all ten pages.
2. **C2** — Delete the hardcoded `user={{ name: 'Isar Ujoodah' }}` from Resume Review.
3. **C3 · C4** — Add a logout control, and put the auth actions inside the mobile menu.
4. **H1 · H2** — Add the three missing routes and a catch-all 404. The forgot-password backend is already built and waiting.
5. **H4 · H5 · H6** — Give the resume upload a real error state, and validate file type and size before uploading rather than after.
6. **H7 · H8 · M1** — Either implement or remove the three dead buttons.
7. **M9 · hygiene** — Fix the `ai-service` import so a fresh clone boots, and resolve the README conflict.

---

## Scope and limits

**Covered.** Home, Resources, Career Paths, Alumni, Login, Register, Resume Review (upload, sample, results), the Admin Dashboard across all four CRUD tabs, the floating chatbot, the navbar, routing, mobile layout at 390 px, accessibility, and server-side auth and validation.

**Not covered.** Live AI output quality. The test environment blocks outbound access to the model provider, so the resume review and chatbot could not produce real completions. Their failure paths were tested and are reported above — H4, H5 and M10 all came out of that work.