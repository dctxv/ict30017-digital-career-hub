# Mock interview sample data

Everything needed to run the mock interview end to end without inventing inputs
on the spot: three candidate personas with a CV each, a job advertisement for
each of them, and an answer bank per persona so the five answers can be typed
in quickly and still be assessable.

The three cover the input tiers the feature distinguishes between and both
languages the site serves.

| Persona | Stage | Aiming for | CV | Job ad | Answers | Language |
| --- | --- | --- | --- | --- | --- | --- |
| Md. Sakib Hasan | Fresher, B.Sc. CSE 2025 | Junior Software Engineer | `cv_sakib_hasan_cse_fresher.pdf` | `job_ad_junior_software_engineer_en.txt` | `answers_sakib_en.md` | English |
| Nusrat Jahan | Early career, MBA Finance 2024, one year at an NBFI | Management Trainee Officer at a bank | `cv_nusrat_jahan_mba_finance.docx` | `job_ad_mto_bank_bn.txt` (Bangla, English terms) | `answers_nusrat_bn.md` | Bangla |
| Sharmin Sultana | Early career, BBA HRM 2020, admin background | HR Executive in a garments group | `cv_sharmin_sultana_hr.pdf` | `job_ad_hr_executive_en.txt` | `answers_sharmin_en.md` | English |

The `.txt` beside each generated CV is the source text. Sharmin's source is the
existing `ai-service/custom/sharmin.txt`, reused so the same persona appears in
the resume review test material and here.

## Accounts

`server/scripts/seed-interview-samples.js` creates one account per persona with
the profile fields filled in, because the interview reads discipline,
institution and graduation year from the profile and pitches the questions at
that stage. It is safe to run more than once.

```
cd server
node scripts/seed-interview-samples.js
```

| Email | Password | Profile |
| --- | --- | --- |
| `sakib.hasan.sample@example.com` | `SamplePassword123!` | IT · BRAC University · 2025 · English |
| `nusrat.jahan.sample@example.com` | `SamplePassword123!` | Finance · University of Dhaka · 2024 · Bangla |
| `sharmin.sultana.sample@example.com` | `SamplePassword123!` | Business · Daffodil International University · 2020 · English |

All three are on the free plan, so each gets two mock interviews a day. Pass
`--reset-quota` to the script to hand the day's allowance back before a demo.

## Suggested runs

1. **Role only, English.** Sign in as Sakib, type the role, upload nothing.
   The questions must not claim anything about his history — no "your
   experience at", no "your resume shows". The profile line under the tier
   panel should name his discipline and year.
2. **Resume and advertisement, English.** Sakib again, with the PDF and the
   software engineer advertisement. Questions should name his final year
   project or his internship, and at least one should aim at something the
   advertisement asks for that the CV does not evidence (PostgreSQL, Docker,
   TypeScript).
3. **Resume and advertisement, Bangla.** Nusrat, DOCX plus the MTO
   advertisement, with the site switched to Bangla. Every question, verdict
   and gap description should be Bangla; gap keys stay English.
4. **Role only, Bangla.** Nusrat with nothing uploaded. Same no-invention rule
   as run 1, in Bangla.
5. **Resume only, DOCX or PDF.** Sharmin with her CV and no advertisement, to
   see the middle tier and the "add a job advertisement" nudge after results.

After any run, open the Plan tab: the gaps the answers revealed should be on
the board with the interview named as their source, and a second interview for
the same account should have one question labelled "From your plan".
