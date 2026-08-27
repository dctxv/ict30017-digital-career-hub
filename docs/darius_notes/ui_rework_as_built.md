# Interface rework and the account area — as built

**Date:** 2026-08-27
**Session:** Rebuilding the frontend against the new design, wiring it to the API, and finishing the controls that pointed at nothing
**Landed as:** `a4aee5f`, `6d531a1`, `fbff853`, `e24c3ce`, `e4500a7`, `ade7ba7`, merged to `main` at `8d74a53`

The design file settled what the site should look like. It did not settle how the
colours should be declared, what the account area's API should be called, or what
the interface should do about the several controls that had been rendering for
months without working. This records those decisions, the ones that were rejected
on the way, and the defects the work surfaced.

---

## 1. One token layer, or a stylesheet per page

The site had fourteen stylesheets, each declaring its own colours. Three greens
were in use for the same "primary", two radii for the same card, and
`ResumeReview.css` had reached 1,124 lines covering both the upload panel and the
results. The design adds a dark theme, which is what forced the question: a second
palette multiplies whatever structure already exists.

**Rejected: keep per-page colours and add a dark override block to each file.**
This is the smallest diff and it fails on the second change. Fourteen files would
each need a `@media (prefers-color-scheme: dark)` section, nothing would stop a
fifteenth being added without one, and the three greens would become six.

**Rejected: port the design's inline styles as they are.** The design carries
every rule inline on the element — the natural output of a visual editor, and
completely faithful. It is also unreviewable in a diff, unsearchable, and cannot
express a hover state or a media query without a second mechanism.

**Built: `styles/theme.css` declares every colour, radius, shadow and font once,
for both themes, and nothing downstream holds a hex value.** That is what makes
the theme switch a single attribute on `<html>` rather than a sweep. `globals.css`
holds what appears on three or more screens — buttons, pills, fields, cards, page
headers — so a page stylesheet only describes what is particular to that page.

The rule for `globals.css`: something belongs there once a third screen wants it.
Two screens sharing a thing is a coincidence; three is a pattern.

There are now no CSS variables referenced anywhere in the client that the theme
does not declare. That is checkable in one command, and it is worth checking,
because an undefined variable does not error — it resolves to nothing and the
element silently falls back to inherited values. Section 5 covers what that did to
the admin dashboard.

### Appearance follows the system until it doesn't

`ThemeContext` tracks `prefers-color-scheme` while nothing is stored, and stops
the moment the user picks. Someone who chose dark on a laptop that switches to
light at sunrise means dark, not "whatever the laptop thinks". Persisting only
explicit choices is what makes those two cases distinguishable at all.

`index.html` applies the stored value before React mounts, for the same reason the
language line was already there: otherwise the first painted frame is always light
and Latin, and a dark-theme or Bangla user gets a flash and a reflow on every load.

---

## 2. The account area, and why there is no `/api/users/:id`

`/profile` is five tabs — details, plan and usage, review history, security,
privacy — over a new `/api/users` router.

Every route is scoped to `req.user.id` and takes no user id from the caller. An
endpoint that accepts an id is an endpoint that has to be checked at every call
site, and this router has exactly one correct value to check against. The
admin-facing case for reading another account does not exist yet and should get
its own router when it does, rather than a permission branch inside this one.

| Route | Does |
|---|---|
| `GET /api/users/me` | The full profile, including fields `/api/auth/me` omits |
| `PATCH /api/users/me` | Partial edit; changing the email costs the current password |
| `POST /api/users/me/password` | Change password |
| `GET /api/users/me/export` | Everything held about the account, as JSON |
| `DELETE /api/users/me` | Delete |
| `GET/POST/DELETE /api/users/me/subscription` | Read or change the tier |
| `GET /api/resume/history`, `/history/:id` | Past reviews, and one in full |

**PATCH rather than PUT, deliberately.** The account form sends every field, but
the language toggle sends `preferred_language` alone. A PUT would have blanked the
discipline every time somebody switched to Bangla.

**History omits the feedback; `/history/:id` carries it.** `feedback` is by far
the largest column in `ai_reviews`, and a list of twenty reviews would move twenty
full analyses across the wire to render twenty score chips.

**A review belonging to someone else is 404, not 403.** Confirming that a review
exists but is not yours is an answer nobody outside the account is owed. The
`user_id` is in the `WHERE` clause rather than compared after the fetch — both
refuse the request, but only one of them cannot be undone by a later edit that
forgets the check, and the difference is somebody reading another person's resume
analysis.

### Deletion

Content goes for good — every review, resume row and subscription record, in one
transaction, because a half-deleted account is the worst of both outcomes. The
`users` row is kept, deactivated and scrubbed of everything identifying.

That is what `add_user_profile_fields.sql` added `is_active` and `deleted_at` for,
and it buys two things a hard `DELETE` does not: foreign keys elsewhere cannot be
left dangling, and the audit log keeps referring to something rather than to a
hole. The email is rewritten rather than nulled, because the column is `NOT NULL`
and `UNIQUE` — nulling is impossible and leaving it would stop the person ever
registering again with their own address.

---

## 3. The bug that found itself on the way

Deleting an account left its token cryptographically valid for the rest of its
hour, and signature validity is the only thing `requireAuth` can check.
`GET /api/auth/me` refused the deleted account. Every account route served it
happily. A deleted user could go on reading and editing themselves until the token
expired.

`requireActiveAccount` closes it, applied to the whole `/api/users` router rather
than listed per route, so a route added later cannot be added without it. The
review quota middleware already reads the user row, so it checks `is_active` there
at no extra query — a deleted account must not be able to spend an allowance
either. Login and the session probe refuse it with the same generic error a wrong
password gets: whether an address once had an account is not something a stranger
gets to learn.

It costs one query per request on the account routes. That is why it is not
global: those are the routes where acting on a deleted account is a real problem,
and the public content routes read nothing belonging to anyone.

---

## 4. Four defects that only a browser could have found

The account page and the register flow both passed a reading. Driving the whole
journey in Chromium — register, five tabs, delete, 404 — found these in one pass.
The lesson is not that a browser is useful; it is that all four were invisible to
inspection because they are behaviours of the *running* system, not properties of
the source.

**The consent row swallowed its own links.** The terms checkbox was a
`<button role="checkbox">` wrapping a caption that contains links to the terms and
the privacy policy. An `<a>` inside a `<button>` is invalid, and a click landing on
either link navigated away from the half-filled form. Both links pointed at routes
that did not exist, so the one thing a user was required to accept was the one page
they could not read.

**Registering did not land on the account.** `GuestOnly` redirected the instant
the session landed, fighting the page's own `navigate()` and winning — the trace
read `/profile` then `/`. It now records whether the user *arrived* signed in,
once, from the first settled state. Someone who turns up with a valid cookie is
still sent away; someone who authenticates on the page is left alone, because the
page they authenticated on is the thing that knows where they should go. Logging in
with a destination in mind was broken the same way and is fixed by the same change.

**Deleting an account offered a login form.** `RequireAuth` redirects the moment
the session goes away, which is its job, and it won the same race. Deletion now
reloads at the home page, which is also the honest end state: everything still in
memory belongs to an account that has been destroyed.

**The subscription record dropped the payment method.** One row asked "was this a
payment?" and, because signup-chosen Premium has `source='signup'`, answered
"Chosen at registration" and discarded the instrument — the exact field the
migration was added to keep. How a tier was granted and what it was paid with are
two questions and now get two rows.

A fifth, found the same way and not a defect in behaviour: every form field had its
`<label>` wrapped around its control, which makes the accessible name the caption
*plus everything else inside the wrapper*. The password field announced itself as
"Password Show At least 12 characters". Labels are now associated by `htmlFor`, and
hints are referenced with `aria-describedby` so they read as descriptions rather
than as part of the name.

### The check that would have caught the sixth

`translate()` already warns in development for any key neither dictionary defines,
and renders the key itself on screen. `profile.subSource.upgrade` got through
anyway, because a warning in a console nobody is reading is not a signal. The
browser pass now treats those warnings as failures.

---

## 5. What the interface stopped claiming

**The Google sign-in button is gone from both auth screens.** There is no Google
OAuth on the server and there never was; the button had been inert since it was
added. A control that does nothing is worse than an absent one — it spends the
user's attention and then their trust.

**The payment step says on the form that no gateway is connected.** Registration
and the upgrade dialog both show a price, ask for a method, and charge nothing.
That has to be said on the form, not in a commit message or a policy page the user
has already scrolled past. Only the *name* of the instrument reaches the server;
the account and card numbers the form collects never leave the browser, because
there is nothing to reconcile them against and holding an unverified card number
is how a student project ends up with regulated data by accident.

**Priority-tagged action items are not rendered.** The design shows each action
item with a high/medium badge. `action_items` is `string[]` in the model's schema,
so the priorities would have been invented by the frontend. Numbered instead.

**"Load more" only renders when there is more to show.** It previously appeared
under every list, including a list of six, and did nothing.

**The admin dashboard was rendering on colours that no longer exist.** Its
stylesheet referenced `--green-500`, `--text-muted`, `--white` and a dozen more.
An undefined variable resolves to nothing, so the page fell back to inherited
colours — near-black text on a near-black surface in dark mode. This is the failure
mode section 1 warns about, and it is worth noting that nothing broke loudly: the
build passed, the lint passed, and the page rendered. It was only wrong to look at.

---

## 6. Subscription provenance

`subscriptions` gained two things.

`payment_method`, because on this market bKash-versus-card is the most useful
signal the project can collect about whether anyone would actually pay, and
`source='signup'` throws it away. Descriptive only; nothing is entitled by it.

`'upgrade'` as a `source` value, because none of the existing four describes
someone pressing Upgrade on their own profile. `'signup'` is a lie about when it
happened and renders on screen as "Chosen at registration". `'manual'`
misattributes it to an administrator who did nothing. `'payment'` claims money
changed hands. `'trial'` implies an expiry that nothing sets or sweeps.

The whole point of that table is that a tier becomes a fact with a provenance
instead of a column somebody set. A provenance that is wrong is worse than no
table at all, which is why the constraint was widened rather than one of the four
stretched to cover a case it does not describe.

Cancelling closes the record rather than deleting it, and leaves the day's counters
alone — someone who ran eight reviews on Premium has run eight reviews today, and
resetting the count would hand them a fresh free allowance for cancelling.

---

## 7. Carrying `fetchList` across

`main` gained `api/fetchList.js` while this branch was being written, for a real
failure: `fetch()` does not reject on an HTTP error, so a 500 resolved normally,
the error body went into state the component treats as an array, and the page died
at `resources.filter(...)` with a white screen.

The rebuilt pages never had that crash — they guard with `response.ok` — but they
answered a failed request with an empty list, which renders as "No resources found.
Try a different filter." A server that is down and an empty catalogue looked
identical, and the page confidently blamed the filter.

Adopting the helper on this branch rather than at merge time was the point: these
three files were rewritten wholesale, so the merge conflicts on the entire page
body and whichever side is taken silently becomes the answer.

Two details beyond a straight port. The failure is logged with the endpoint and the
server's own error text, because "check the console for details" is only useful if
there are details there. And the empty state and the count both stand down when the
banner is up — telling someone their filter matched nothing directly underneath
"could not load this list" is two answers to one question.

---

## 8. What is deliberately not done

**No mailer.** `/forgot-password` and `/reset-password` exist and work, and the
reset token still goes to the server log because no provider is configured. The
page says so rather than letting someone wait for an email that will never arrive.
Both fields stay editable so the token can be pasted; the reset link shape
(`?email=…&token=…`) already works for the day a provider is added.

**No expiry sweep.** `subscriptions.expires_at` is nullable and nothing sets or
enforces it. Every Premium account is therefore permanent, which is accurate today
and will stop being accurate the moment a trial or a real payment exists.

**Deletion is not offered to administrators.** There is no way for an admin to
delete someone else's account, on purpose. That is a different set of guarantees
and belongs with an audit trail of who deleted whom.

**The chatbot has no retention policy.** Unchanged by this work, and still the most
sensitive data the project holds — free text about people's own job situations.
Guests are never stored and deleting a user destroys their conversations, but
history otherwise accumulates indefinitely by default.

---

## 9. Verification

Both suites pass: 18 client, 79 server. Lint is clean apart from one pre-existing
`exhaustive-deps` warning in `AdminDashboard.jsx`. The build produces no errors.

Beyond that, against the running database and a real browser:

- Registration through deletion, both languages of the partial PATCH, and the email
  and password re-auth paths on correct, wrong and absent passwords.
- A second account gets 404 for someone else's review, and after deletion all eight
  account routes refuse the same still-valid token with no review, resume or
  subscription row left attached.
- The reset flow: request, wrong token refused, real token accepted, old password
  dead, new one live, token refused on reuse.
- Upgrade and downgrade, including that the usage meter becomes unlimited, the
  chosen method is recorded, and a second upgrade returns the existing record
  rather than an error.
- All three content pages against a dead API: navigation intact, failure stated,
  nothing said about filters.

The scripts that drive the browser passes are throwaway and were not committed. If
they are wanted as regression tests they belong in `client/e2e/` alongside the
Playwright config, which already assumes both dev servers are running.

---

## 10. One operational note

The dev server's proxy target is now overridable with `API_PROXY_TARGET`.
Hardcoding port 3000 is fine for one developer and unworkable for two — a second
checkout of the repo cannot run its own API without taking the port from the first.
This work was done in a `git worktree` beside the main checkout for exactly that
reason, and the two ran side by side on 3100/5273 throughout.
