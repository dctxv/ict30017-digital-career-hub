# Full QA Test Report — Digital Career Hub

**Date:** 18 August 2026
**Build tested:** `claude/website-qa-testing-3snwws` @ `361b00d`
**Method:** Live browser testing (Chromium via Playwright) against a locally
running stack — Vite dev server on `:5173`, Express API on `:3000`, PostgreSQL 16
with all six migrations applied and `seed_content_data.sql` loaded
(7 disciplines, 70 career paths, 42 resources, 10 alumni).
Every interactive control on every page was clicked, plus API-level probes with
`curl` for validation, rate limiting and privilege escalation.

**Scope covered:** Home, Resources, Career Paths, Alumni, Login, Register,
Resume Review (upload + sample + results), Admin Dashboard (all four CRUD tabs),
the floating chatbot widget, the navbar, routing, mobile layout at 390 px,
accessibility, and server-side auth/validation.

**Not covered:** Live AI output quality. The sandbox blocks `openrouter.ai`
(`403 host_not_allowed`), so the AI resume review and chatbot could not produce
real completions. Their *failure paths* were tested and are reported below.

---

## Summary

| Severity | Count |
|---|---|
| 🔴 Critical | 4 |
| 🟠 High | 8 |
| 🟡 Medium | 12 |
| 🔵 Low / polish | 12 |
| **Total** | **36** |

**Working well:** all four admin CRUD tabs (create / edit / cancel / delete,
with correct server-side validation messages surfaced in the UI), every content
filter on Resources / Career Paths / Alumni, the alumni consent gate,
role-based API authorisation, the password show/hide toggle, PDF preview
rendering in the results split-pane, and the EN/BN content pipeline (verified
end-to-end by adding a Bangla-translated resource through the admin panel and
seeing it appear under the BN toggle).

---

## 🔴 Critical

### C1 — Signing in is never reflected in the UI
**Where:** `client/src/components/Navbar.jsx:6`, all page components
**Steps:** Register → log in with valid credentials → land on `/`.
**Expected:** navbar shows the signed-in user.
**Actual:** navbar still shows **“Log in | Sign up”**. Persists across reloads and
on every page. Verified `localStorage.user` was correctly set to
`{"id":1,"full_name":"QA Tester","email":"…","role":"student"}` and the `token`
cookie was issued — so login itself succeeds; only the UI is blind to it.

**Root cause:** `Navbar` takes `user` as a **prop** (`export default function
Navbar({ user = null })`). Nine of the ten render sites call plain `<Navbar />`,
so `user` is always `null`. `Login.jsx:34` writes to `localStorage` and navigates,
but nothing ever reads it back for display.

**Fix:** have `Navbar` read the session itself (a `useAuth` context, or at minimum
`JSON.parse(localStorage.getItem('user'))`) rather than depending on every page
to pass a prop it never passes.

> Note on your assumption: **sign-up does not visually reflect either.** It only
> prints the text “Account created! You can now log in.” and clears the form —
> `localStorage` stays `null` and the navbar is unchanged (verified). The two
> flows are equally broken in the navbar; sign-up just *looks* like it worked
> because it prints a confirmation and login does not.

### C2 — Resume Review page shows a hardcoded fake user
**Where:** `client/src/pages/ResumeReview.jsx:345`
**Steps:** Visit `/resume-review` **while logged out** (`localStorage.user === null`).
**Actual:** navbar renders `Isar Ujoodah`.
`<Navbar user={{ name: 'Isar Ujoodah' }} />` is hardcoded. A signed-in user with a
different name also sees “Isar Ujoodah”. This is a demo placeholder shipped to the
branch, and it makes the app look logged in to anonymous visitors.

### C3 — No way to log out, anywhere
**Where:** entire client
**Actual:** `POST /api/auth/logout` exists and works server-side, but no button,
link or menu item in the whole UI calls it. Once signed in, the only way out is to
clear site data manually. Session cookie survives 1 h; `localStorage.user`
survives forever.

### C4 — Mobile users cannot log in or sign up
**Where:** `client/src/components/Navbar.css:113-129`
**Steps:** Load any page at ≤768 px wide. Tap the hamburger.
**Actual:** `.btn-outline-sm, .btn-filled-sm { display: none; }` hides both auth
buttons on mobile, and the hamburger menu contains **only** the four content links
(Resources / Career paths / Alumni / Resume review). Verified at 390 × 844:
`Log in` visible = `false` both before and after opening the menu. There is no
route to authentication on a phone except typing `/login` in the address bar.

---

## 🟠 High

| # | Issue | Where | Detail |
|---|---|---|---|
| H1 | **`/forgot-password`, `/terms` and `/privacy` render blank white pages** | `App.jsx:17-32` | All three are linked from the auth pages (`Login.jsx:74`, `Register.jsx:194`). None has a `<Route>`, and there is no catch-all route, so React Router renders nothing. Measured `document.body.innerText.length === 0`. The backend `POST /api/auth/forgot-password` and `/reset-password` are fully implemented — only the UI is missing. |
| H2 | **Any unknown URL is a blank white page** | `App.jsx:17-32` | No `<Route path="*">`. `/does-not-exist` renders an empty body with only the chatbot bubble floating on white. Needs a 404 page. |
| H3 | **The chosen plan on Register is silently discarded** | `Register.jsx:47`, `routes/auth.js:24-70` | The Free/Premium tier cards set state and POST `plan: tier`, but `/api/auth/register` destructures only `{ full_name, email, password }`. There is no `plan` or `tier` column in the `users` table (verified with `\d users`). Choosing Premium changes nothing — including the AI model tier, which `aiClient.js` always resolves as `free`. |
| H4 | **A failed analysis strands the user in a broken results shell** | `ResumeReview.jsx:334-338`, `ResultsView.jsx:747` | On any analysis error the app still switches to `view: 'results'` with `feedback === null`. Result: an “Overall score” card animating loading dots **forever**, no score, no sections, and the “What next?” CTA strip is hidden (it is gated on `overallScore !== null`), so the *Upload new resume* button never appears. Reproduced with an oversized file, a wrong file type, and an upstream AI failure. |
| H5 | **Error copy misdescribes total failure as partial** | `ResultsView.jsx:706` | The banner reads *“Feedback may be incomplete: File too large. Maximum size is 3 MB.”* There is no feedback at all. Same wording for `Invalid file type…` and `Analysis failed.` |
| H6 | **The client accepts files the server will reject** | `ResumeReview.jsx:104-118` | `accept=".pdf,.docx"` only filters the *picker dialog*. A `.txt` dropped on the drop-zone (or chosen via “All files”) is accepted, shown in a file card, and the **Analyse my resume** button is offered — the user only learns it is invalid after a full upload round-trip (`415`). Same for size: a 3.1 MB PDF is accepted client-side with no warning and fails at the server (`413`). Neither type nor size is checked before upload. |
| H7 | **“Load more resources” button does nothing** | `Resources.jsx:135` | `<button className="btn-load-more">Load more resources</button>` has no `onClick`. All 42 resources are already rendered in one fetch; there is no pagination. The button is also rendered when the filter matches **zero** resources, directly under “No resources found.” |
| H8 | **Two “Email” buttons are dead** | `ResultsView.jsx:663`, `:790` | `<button className="btn btn-ghost btn-sm">✉ Email</button>` in the section nav and `<button className="btn btn-outline">✉ Email to myself</button>` in the CTA strip both have no `onClick`. Clicking produces nothing — no dialog, no navigation, no error. There is no mail-sending endpoint on the server either. |

---

## 🟡 Medium

| # | Issue | Where | Detail |
|---|---|---|---|
| M1 | **“Continue with Google” is a dead button** | `Login.jsx:83` | Fully styled with the Google logo, no `onClick`, no OAuth route on the server. Clicking does nothing. Users will read this as a broken sign-in, not an unbuilt feature. |
| M2 | **The Bangla toggle only translates resource cards** | `LanguageContext.jsx`, all pages | Switching to BN re-fetches `/api/resources?lang=bn` and nothing else. All static UI copy (headings, filter pills, buttons, the entire Home page, Login, Register, Career Paths, Alumni) stays in English. The Home page advertises *“Switch the entire platform to Bangla with one click — including AI feedback and chatbot responses.”* Career Paths and Alumni have no `lang` parameter at all. |
| M3 | **No Bangla content exists in the seed data** | `migrations/seed_content_data.sql` | `SELECT count(*) FROM resources WHERE title_bn IS NOT NULL` = **0** of 42. The BN toggle therefore falls back to English for every card, so it appears to do nothing. (The pipeline itself works — I added a resource with Bangla fields via the admin panel and it rendered correctly under BN.) |
| M4 | **`PDF` resource type renders with no banner colour** | `Resources.jsx:9-20` vs `AdminDashboard.jsx:5` | `RESOURCE_TYPES` offers `['Guide','Article','Video','Course','PDF']`, but `typeColors`/`typeDots` only define the first four. A `PDF` resource gets `background: undefined` and `color: undefined` — measured as `{"bg":"","badgeColor":""}` — a transparent banner with an unstyled badge. One seeded row is already affected. |
| M5 | **“Find related resources for X” doesn’t filter by X** | `CareerPaths.jsx:50-54`, `Resources.jsx:69-76` | The button writes both `selectedDiscipline` **and** `selectedCareer` to `localStorage`, but Resources reads `selectedCareer` only to delete it. Clicking “Find related resources for **Treasury Analyst**” lands on 11 generic Finance resources with no mention of Treasury Analyst anywhere on the page (verified). |
| M6 | **That same button does a full page reload** | `CareerPaths.jsx:53` | `window.location.href = '/resources'` instead of `useNavigate()`. Tears down and re-bootstraps the whole React app, causing a white flash and re-fetching everything — the only hard navigation in the SPA. |
| M7 | **Forging `localStorage` renders the admin shell** | `RequireAuth.jsx:14-22` | `RequireAuth` trusts `localStorage.user.role` alone. Setting `role:"admin"` with **no cookie** loads the full Admin Dashboard chrome — tabs, forms, and 7 disciplines / 70 paths / 42 resources in the tables (all public data). Alumni drafts correctly return `401` and every write is rejected `401`, **so no private data leaks and no unauthorised change is possible** — but it looks like a successful breach to a marker or a user. There is no `/api/auth/me` to validate the session against. |
| M8 | **Expired session shows an error with no way to act on it** | `AdminDashboard.jsx:62-65` | After the 1 h JWT expires, `localStorage.user` still says admin, so `/admin` loads, shows *“Your session has expired. Please log in again.”* — and offers no login link or button (`0` actionable elements found). Same dead end for any 401 anywhere in the app. |
| M9 | **`ai-service` dependencies are not installed by the documented setup** | `server/package.json:13`, `routes/resume.js:8` | Following the README (`cd server && npm install && npm run dev`) on a fresh clone **crashes on boot**: `Cannot find package 'dotenv' imported from ai-service/src/utils/aiClient.js`. The server declares `"ai-service": "file:../ai-service"` but imports it by *relative path* (`../../../ai-service/index.js`), which resolves from the real directory, bypassing the `node_modules` symlink — so `openai` and `zod` are never installed. Requires an undocumented `cd ai-service && npm install`. |
| M10 | **`ALLOWED_ORIGINS` omits `127.0.0.1`, breaking the chatbot** | `routes/chatbot.js:229-241`, `app.js:27` | The default allowlist is `http://localhost:5173,http://localhost:5174`. Vite prints `127.0.0.1:5173` as a valid URL; opening the site that way makes every `POST /api/chat` return **403 Forbidden**, surfaced to the user as “Something went wrong. Please try again.” Confirmed: identical request from `localhost` passes the check. |
| M11 | **Free-tier chat limit is written but never enforced** | `routes/chatbot.js:190-220` | `enforceDailyTurnLimit` is defined and complete but is **not in the route's middleware chain** (`router.post('/', chatIpRateLimit, validateCsrfOrigin, attachOptionalUser, validateChatBody, …)`). The `FREE_DAILY_CHAT_LIMIT = 10` and the `chat_message_count` / `chat_count_reset_date` columns added by `add_chat_turn_tracking.sql` are unused. The dead function also queries `users WHERE id = $1`, but the primary key is `user_id` — it would throw if wired up as-is. |
| M12 | **Resume rate limit is per-IP and pre-auth** | `routes/resume.js:26-32` | 5 analyses per hour, keyed on IP, applied before any identity check. Every user behind one NAT — a university lab or shared broadband, the stated target audience — shares those 5. The auth limiter (`routes/auth.js:17`) is stricter: 10 requests / 15 min per IP shared across register + login + forgot-password + reset-password combined. Both verified returning `429`. |

---

## 🔵 Low / polish

| # | Issue | Where | Detail |
|---|---|---|---|
| L1 | Browser tab title is the scaffold default `digital-career-hub-new` | `client/index.html:7` | Should be the product name. |
| L2 | `/favicon.svg` 404s on every page load | `client/index.html:5` | There is no `client/public/` directory. Produces a console error on every navigation. |
| L3 | No `<meta name="description">` | `client/index.html` | Zero found. |
| L4 | Hardcoded “Free plan — **3 reviews remaining** this month” | `ResumeReview.jsx:222` | Static text, not tied to any counter. Also contradicts the Register page, which says “3 resume reviews per **day**”, and the actual server limit of 5 per hour per IP. |
| L5 | “Upgrade for unlimited →” links to `/register` | `ResumeReview.jsx:224` | Sends existing users to a sign-up form. There is no upgrade or billing flow. |
| L6 | Register has no `<form>` and Enter does not submit | `Register.jsx:76-215` | Login handles Enter via two per-input `onKeyDown` handlers; Register has none, so pressing Enter in any field does nothing. Neither page uses a real `<form>`, which also costs browser autofill and password-manager integration. |
| L7 | No client-side password rules shown | `Register.jsx:100-130` | The 12-character minimum is enforced server-side only. Zero on-screen hint (searched for “12 characters” — 0 matches). Users learn the rule by failing. |
| L8 | Plan tier cards are unreachable by keyboard | `Register.jsx:145-163` | Plain `<div onClick>` with no `role`, `tabIndex` or `aria-selected`. Keyboard and screen-reader users cannot select a plan. |
| L9 | Hamburger button has no accessible name or state | `Navbar.jsx:66` | `aria-label` and `aria-expanded` are both `null`; it is the one button on the site with no accessible name. |
| L10 | Filter pills expose no pressed state | `Resources.jsx`, `CareerPaths.jsx`, `Alumni.jsx` | `aria-pressed` on 0 of 14 pills. (The EN/BN toggle does this correctly — 2 of 2.) The resources search input has no `<label>` or `aria-label` either. |
| L11 | Horizontal scroll on Career Paths at phone width | `CareerPaths.css:59-76` | At 390 px the body scrolls to **474 px**; `.cp-list-col` and `.cp-path-item` measure 450 px wide. Resume Review overflows 16 px (406 px) from the hamburger. Home, Resources, Alumni, Login and Register are all clean. |
| L12 | Resource search is not trimmed | `Resources.jsx:75` | `"cv"` → 8 results; `"  cv  "` → 0. Paste a term with a trailing space and the page reads as empty. |

### Repository hygiene (not user-facing)

- **`README.md` contains unresolved merge conflict markers** (`<<<<<<< Updated upstream` at line 13, `=======`, `>>>>>>> Stashed changes` at line 32). The entire “How to run the web / backend” section — the only setup documentation — sits inside the conflicted block.
- **`server/src/middleware/Fullyfunctionalregister.js`** is dead code (never imported) that commits a hardcoded secret, `const JWT_SECRET = "your_secret_key"`, and defines a second, incompatible `users` schema. It should be deleted.
- `server/src/{controllers,jobs,models,services}` and `ai-service/parsers` are empty placeholder directories.
- There is no route to `/admin` from anywhere in the UI — an admin must type the URL.

---

## Verified working (regression baseline)

| Area | Result |
|---|---|
| Navbar links, logo, hero CTAs | All 7 route correctly; active-link highlighting works |
| Resources: 6 category × 8 discipline filters, search | All correct; combined filters correct; empty state correct |
| Resources: 42 outbound card links | All have real `https://` hrefs with `target="_blank" rel="noopener noreferrer"` |
| Career Paths: 8 discipline filters, 70 path selections | Correct counts, correct auto-selection, correct detail panes (skills, 5-step progression, salaries) |
| Alumni: 8 discipline filters | Correct, including a genuine empty state for Education |
| Alumni privacy gate | Only `is_published AND consent_given` rows are public; `/api/alumni/all` returns 401 to non-admins |
| Admin CRUD × 4 tabs | Create, edit, cancel, delete all work; duplicate name → 409 surfaced; bad progression JSON caught client-side; future graduation year → server 400 surfaced; publish checkbox correctly disabled until consent is ticked |
| Role escalation | `POST /register` with `"role":"admin"` is ignored — user created as `student` (verified in DB) |
| Login failure paths | Empty fields, wrong password, duplicate email, lockout and rate limiting all return correct messages |
| Password show/hide toggle | Toggles `type` and button label correctly |
| Resume Review sample flow | All 6 nav pills scroll to their sections; 5 section cards render; scores, rings and badges correct |
| PDF preview | Blob URL created from the uploaded `File`, page renders in the split pane, text layer extracted correctly |
| Chatbot widget | Present on all 7 pages; open/close, disabled-send-when-empty, Shift+Enter newline, history retained across open/close, error surfaced and input re-enabled after failure |
| EN/BN content pipeline | Bangla title added via admin appeared correctly under the BN toggle; `COALESCE` fallback to English confirmed |
| XSS probe | `<img src=x onerror=alert(1)>` in the resources search is safely escaped by React; resource URLs are validated server-side to `http:`/`https:` only |
| Mobile layout | Home, Resources, Alumni, Login, Register have no horizontal overflow at 390 px; chatbot widget fits the viewport |

---

## Recommended fix order

1. **C1** — make `Navbar` read the session instead of taking a prop. One change fixes the reported bug on all 10 pages.
2. **C2** — delete the hardcoded `user={{ name: 'Isar Ujoodah' }}`.
3. **C3 + C4** — add a logout control, and put the auth actions in the mobile menu.
4. **H1 + H2** — add `/forgot-password`, `/terms`, `/privacy` and a `*` 404 route.
5. **H4 + H5 + H6** — give the resume upload a real error state (and validate type/size before uploading).
6. **H7 + H8 + M1** — either implement or remove the three dead buttons.
7. **M9** — fix the `ai-service` import so a fresh clone boots, and repair the README.
