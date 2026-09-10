# Mock interview — manual test kit

Everything needed to exercise the mock interview and the gap board by hand:
what to set up, which accounts and files to use, what each run should produce,
the negative cases worth trying, and the SQL to confirm any of it actually
reached the database.

Sample CVs, job advertisements and answer banks live in
`docs/samples/mock_interview/`. This document is the procedure that uses them.

---

## 1. Before you start

The mock interview cannot be tested against the e2e fake API — `client/e2e/fake-api/server.js`
does not implement `/api/preparation`. It needs a real server, a real database
and a real `GOOGLE_AI_API_KEY`.

Full setup is README sections 2 and 7. The short form, from a clean checkout:

```
cp server/.env.example server/.env     # then fill GOOGLE_AI_API_KEY, DB_PASSWORD, JWT_SECRET
psql -U postgres -c "CREATE DATABASE career_hub_db;"
cd server && npm install && npm run migrate && npm run check
```

`npm run check` must end with `Everything checks out.` before anything below is
worth attempting — it verifies the model ids and sends one real request to the
provider.

Confirm the preparation migration in particular is applied:

```
cd server
npm run migrate -- --status | grep create_preparation_tables
```

It creates `user_gaps`, `mock_interviews`, and the `mock_interview_count` /
`mock_interview_reset_date` columns on `users`. The server also checks for them
at boot — `[schema] The database is behind the code` on startup means this step
was skipped.

Then two terminals:

```
cd server && npm run dev      # http://localhost:3000
cd client && npm install && npm run dev   # http://localhost:5173
```

---

## 2. Test accounts

```
cd server
node scripts/seed-interview-samples.js
```

Idempotent — safe to run repeatedly. It creates or refreshes three accounts
with the profile fields filled in, which matters because the interview reads
discipline, institution and graduation year and pitches the questions at that
stage.

| Email | Password | Profile | Language |
| --- | --- | --- | --- |
| `sakib.hasan.sample@example.com` | `SamplePassword123!` | IT · BRAC University · 2025 | en |
| `nusrat.jahan.sample@example.com` | `SamplePassword123!` | Finance · University of Dhaka · 2024 | bn |
| `sharmin.sultana.sample@example.com` | `SamplePassword123!` | Business · Daffodil International University · 2020 | en |

All three are free tier: **two interviews per calendar day each**. Hand the
day's allowance back mid-session with:

```
node scripts/seed-interview-samples.js --reset-quota
```

For an account with an empty profile (to check the profile line disappears
rather than showing an empty block), register a fresh one through the UI and
leave the account page blank.

---

## 3. Sample material

| Persona | CV | Job ad | Answer bank |
| --- | --- | --- | --- |
| Sakib (fresher, CSE) | `cv_sakib_hasan_cse_fresher.pdf` | `job_ad_junior_software_engineer_en.txt` | `answers_sakib_en.md` |
| Nusrat (early career, MBA Finance) | `cv_nusrat_jahan_mba_finance.docx` | `job_ad_mto_bank_bn.txt` | `answers_nusrat_bn.md` |
| Sharmin (early career, BBA HRM) | `cv_sharmin_sultana_hr.pdf` | `job_ad_hr_executive_en.txt` | `answers_sharmin_en.md` |

All under `docs/samples/mock_interview/`. The answer banks are stories to draw
on, not scripts — pick whichever fits the question the model actually asked.

Input limits the form enforces, worth having to hand:

| Field | Limit |
| --- | --- |
| Resume upload | `.pdf` or `.docx` only, 3 MB |
| Job advertisement | 4000 characters (truncated silently past that) |
| Target role | 120 characters |
| Each answer | 2500 characters |
| Candidate stage | `student`, `fresher`, `early_career`, `experienced`, `senior`, `unknown` |

---

## 4. Happy-path runs

Sign in, go to `/preparation`. Three tabs: Plan, Interview, History.

### Run 1 — Tier 1, role only, English
Sakib. Type "Junior Software Engineer", upload nothing, no advertisement.

- Five questions.
- **The questions must not claim anything about his history** — no "your
  experience at", no "your resume shows". Tier 1 knows nothing but the role and
  the profile.
- The profile line under the tier panel names his discipline and graduation year.
- Answer all five from the bank, submit, and an assessment comes back with a
  score and per-question verdicts.

### Run 2 — Tier 3, resume and advertisement, English
Sakib again, with the PDF and the software engineer advertisement.

- At least one question should name something concrete from the CV — the final
  year project or the internship.
- At least one should aim at something the advertisement asks for that the CV
  does not evidence (PostgreSQL, Docker, TypeScript).
- Tier badge should read tier 3.

### Run 3 — Tier 3, Bangla
Nusrat, DOCX plus the MTO advertisement, site switched to Bangla first.

- Every question, verdict and gap description in Bangla.
- Gap *keys* stay English (`skill:sql`) — that is correct, not a bug.

### Run 4 — Tier 1, Bangla
Nusrat, nothing uploaded. Same no-invention rule as run 1, in Bangla.

### Run 5 — Tier 2, resume only
Sharmin with her CV and no advertisement.

- Tier badge reads tier 2.
- The tier-2 nudge appears: "Paste a job advertisement to match the questions
  to the role you are applying for."

### After any run — the link between the two halves
Open the **Plan** tab.

- The weaknesses the answers revealed are on the board, with the interview
  named as their source.
- Run a **second** interview on the same account: one question should be
  labelled "From your plan", aimed at a gap already on the board. This is the
  single most important thing to check — it is what makes preparation a shared
  layer rather than two features sitting beside each other.
- Dismiss a gap: it leaves the progress figure entirely (it does not count as
  closed). Restore it and the figure returns.
- There is deliberately **no** way to mark a gap closed by hand. Closing only
  happens when a later analysis stops finding it.

---

## 5. Negative and edge cases

| # | Do this | Expect |
| --- | --- | --- |
| 1 | Open `/preparation` signed out | Redirect / 401 — every route here requires an account, no guest path |
| 2 | Upload a `.txt` or `.png` as the resume | Rejected as invalid file type, **and the daily allowance is not spent** (the quota check runs after the upload) |
| 3 | Upload a file over 3 MB | Rejected, allowance not spent |
| 4 | Start a third interview on a free account the same day | 429 with "You have used all 2 of your free mock interviews for today." |
| 5 | Submit with every answer blank | 400 "Answer at least one question before submitting." No model call, no allowance spent |
| 6 | Submit answers to an already-assessed interview | 409 "This interview has already been assessed." |
| 7 | `GET /api/preparation/interviews/<id>` for another user's interview | 404, not 403 |
| 8 | `GET /api/preparation/interviews/abc` or `/0` | 400 invalid id |
| 9 | Start an interview and never submit | Row stays `in_progress`; it appears in History as abandoned, not as broken |
| 10 | Paste an advertisement well over 4000 characters | Accepted, silently truncated; the client counter should agree with the server cap |
| 11 | Put an email address and phone number in the CV | The generated questions must not echo them — deterministic PII redaction runs over questions and evaluation |
| 12 | Fire more than 40 preparation requests in an hour | 429 burst limit, keyed per user |
| 13 | Set `AI_MODEL_FREE` to a bogus id, restart, start an interview | Failure is reported **and the allowance is refunded** — check `mock_interview_count` did not increase. Look for `[quota] decision=refund` in the server log |
| 14 | Interrupt the provider mid-submission (bogus model, then submit answers) | The answers are still saved even though the assessment failed — reload and they are not lost |
| 15 | Delete a test account through the account page | Its `mock_interviews` and `user_gaps` rows go with it (`ON DELETE CASCADE`) |

Case 13 is the one most worth doing deliberately. It is the only path where a
user can pay an allowance and receive nothing, and it is easy to regress.

---

## 6. Confirming it reached the database

```
psql -U postgres -d career_hub_db
```

Interviews for one account, newest first:

```sql
SELECT interview_id, tier_level, target_role, status, overall_score,
       model, tier, language, created_at, completed_at
  FROM mock_interviews
 WHERE user_id = (SELECT user_id FROM users WHERE email = 'sakib.hasan.sample@example.com')
 ORDER BY created_at DESC;
```

What to look for: `status` moves `in_progress` → `complete`, `completed_at`
fills in on submission, `tier_level` matches what you supplied (1 role only,
2 with a resume, 3 with a resume and an advertisement), and `model` / `tier` /
`language` are recorded so a score stays interpretable later.

The resume itself must **not** be stored — only its name:

```sql
SELECT interview_id, resume_file_name, job_ad_text IS NOT NULL AS kept_job_ad
  FROM mock_interviews ORDER BY interview_id DESC LIMIT 5;
```

`resume_file_name` holds the filename; there is no column holding the extracted
text, and the temp upload is deleted in the route's `finally` block. Check the
server log for `[interview] Temp file deleted:` and confirm the upload directory
is empty after a run (`server/uploads/`).

The gap board, and that the interview fed it:

```sql
SELECT gap_id, gap_key, source, category, severity, status, target_role,
       language, first_seen, last_seen, closed_at, dismissed_at
  FROM user_gaps
 WHERE user_id = (SELECT user_id FROM users WHERE email = 'sakib.hasan.sample@example.com')
 ORDER BY last_seen DESC;
```

What to look for: `source = 'interview'` on gaps the interview raised,
`gap_key` in the `category:subject` form (`skill:sql`), and — after a second
interview — `last_seen` updated on an existing row rather than a duplicate row
appearing beside it. The unique index on `(user_id, gap_key)` is what the whole
progress figure rests on; duplicates mean it has broken.

Quota counters:

```sql
SELECT email, tier, mock_interview_count, mock_interview_reset_date
  FROM users WHERE email LIKE '%.sample@example.com';
```

---

## 7. API-only testing with curl

The login token is set as an httpOnly cookie, so use a cookie jar. There is
also an `Authorization: Bearer` fallback for clients that cannot hold one, but
the token is not returned in the login response body — the jar is the easy path.

```bash
BASE=http://localhost:3000
JAR=/tmp/prep-cookies.txt

# Sign in
curl -s -c $JAR -X POST $BASE/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"sakib.hasan.sample@example.com","password":"SamplePassword123!"}'

# What is left today
curl -s -b $JAR $BASE/api/preparation/quota

# Start an interview (tier 3: role + resume + advertisement)
curl -s -b $JAR -X POST $BASE/api/preparation/interviews \
  -F 'targetRole=Junior Software Engineer' \
  -F 'candidateStage=fresher' \
  -F "resume=@docs/samples/mock_interview/cv_sakib_hasan_cse_fresher.pdf" \
  -F "jobAd=$(cat docs/samples/mock_interview/job_ad_junior_software_engineer_en.txt)" \
  -F 'language=en'

# Submit answers — index matches the question order that came back above
curl -s -b $JAR -X POST $BASE/api/preparation/interviews/1/answers \
  -H 'Content-Type: application/json' \
  -d '{"answers":[{"index":0,"answer":"I finished my B.Sc. in CSE at BRAC University in 2025..."}],"language":"en"}'

# History, and one interview in full
curl -s -b $JAR $BASE/api/preparation/interviews
curl -s -b $JAR $BASE/api/preparation/interviews/1

# The board
curl -s -b $JAR $BASE/api/preparation/gaps
curl -s -b $JAR $BASE/api/preparation/summary
curl -s -b $JAR -X PATCH $BASE/api/preparation/gaps/1 \
  -H 'Content-Type: application/json' -d '{"status":"dismissed"}'
```

Note that the questions are **not** sent back on submission. The server uses the
ones it wrote and stored; a client cannot substitute its own.

---

## 8. Resetting between runs

```
# Hand back today's interview allowance for the three sample accounts
cd server && node scripts/seed-interview-samples.js --reset-quota
```

To clear one account's interview and gap history without deleting the account:

```sql
DELETE FROM mock_interviews
 WHERE user_id = (SELECT user_id FROM users WHERE email = 'sakib.hasan.sample@example.com');
DELETE FROM user_gaps
 WHERE user_id = (SELECT user_id FROM users WHERE email = 'sakib.hasan.sample@example.com');
UPDATE users SET mock_interview_count = 0, mock_interview_reset_date = NULL
 WHERE email = 'sakib.hasan.sample@example.com';
```

Clearing the gaps is what lets you re-test the "From your plan" question from a
clean board rather than against gaps a previous run left behind.

---

## 9. What is deliberately not testable

Straight from the spec's out-list, so nobody files these as defects: voice input
or output, live coding assessment, real-time interruption or follow-up
questioning, video, and anything requiring a maintained skills taxonomy or a
curated role dataset. The interview is five questions written in one call and
marked in a second — it is not a conversation.

There is also no "use my last resume" option anywhere, and that is by design:
the extracted text of a past upload is never stored, so there is nothing on the
server to reuse. Asking for the file again is what keeps that true.
