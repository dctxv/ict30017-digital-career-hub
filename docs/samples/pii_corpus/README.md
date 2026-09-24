# PII audit corpus

26 fictional resumes, one per career, built to test how well the outbound PII mask (`ai-service/src/utils/piiMask.js`) protects real uploads. The findings are in [`docs/qa/PII_MASK_AUDIT.md`](../../qa/PII_MASK_AUDIT.md).

Every person, number and address is invented. Phone numbers use regulator-reserved fictional ranges where one exists (ACMA `0491 570 xxx`, Ofcom `07700 900xxx`, NANP `555-01xx`).

| File | Career | Country | Layout |
|---|---|---|---|
| `au-registered-nurse.pdf` | Registered Nurse (ICU) | Australia | classic |
| `uk-head-chef.pdf` | Head Chef | United Kingdom | sidebar |
| `bd-garment-production-supervisor.pdf` | Production Supervisor (Garments) | Bangladesh | bd-traditional |
| `bd-primary-teacher-bangla.pdf` | Assistant Teacher (Primary), in Bangla | Bangladesh | classic |
| `au-licensed-electrician.pdf` | Licensed Electrician | Australia | modern-header |
| `us-associate-attorney.pdf` | Associate Attorney | United States | classic |
| `in-chartered-accountant.pdf` | Chartered Accountant | India | table-header |
| `ca-long-haul-truck-driver.pdf` | Long-Haul Truck Driver (AZ) | Canada | sidebar |
| `nz-retail-store-manager.pdf` | Retail Store Manager | New Zealand | classic |
| `ph-graphic-designer.pdf` | Graphic Designer | Philippines | modern-header |
| `uk-social-worker.pdf` | Social Worker | United Kingdom | classic |
| `ng-civil-engineer.pdf` | Civil / Structural Engineer | Nigeria | table-header |
| `bd-pharmacist.pdf` | Pharmacist (QA) | Bangladesh | sidebar |
| `bd-security-guard-overseas.pdf` | Security Guard (overseas employment) | Bangladesh | bd-traditional |
| `au-senior-hairdresser.pdf` | Senior Hairdresser & Colourist | Australia | modern-header |
| `bd-senior-reporter.pdf` | Senior Reporter | Bangladesh | classic |
| `sg-airline-first-officer.pdf` | Airline First Officer (A320) | Singapore | table-header |
| `au-aged-care-worker.pdf` | Personal Care Worker | Australia | classic |
| `bd-agriculture-extension-officer.pdf` | Agriculture Extension Officer | Bangladesh | bd-traditional |
| `bd-medical-officer.pdf` | Medical Officer | Bangladesh | sidebar |
| `au-early-childhood-educator.pdf` | Early Childhood Educator | Australia | modern-header |
| `us-real-estate-agent.pdf` | Real Estate Agent | United States | sidebar |
| `ie-musician-music-teacher.pdf` | Musician & Music Teacher | Ireland | classic |
| `za-diesel-mechanic.pdf` | Diesel Mechanic | South Africa | table-header |
| `au-physiotherapist.pdf` | Physiotherapist | Australia | classic |
| `au-barista-cafe-supervisor.pdf` | Barista / Café Supervisor | Australia (from Colombia) | modern-header |

The content and the ground truth for each file (every piece of personal information it contains, the content a review must keep, and the account row a logged-in user would have) live in [`server/scripts/pii-audit/corpus.js`](../../../server/scripts/pii-audit/corpus.js).

## Files here

- `*.pdf` — the resumes. They can also be uploaded to the running app by hand.
- `RESULTS.md` — per-category and per-resume results from the last audit run.
- `results.json` — the same, machine-readable.
- `outbound/<id>.txt` — for each resume, the exact user message that would have been sent to the model provider, as a guest and as a logged-in user, with the mask's own log line.

## Regenerating

```sh
# rebuild the PDFs (needs Playwright + Chromium; not a project dependency)
node server/scripts/pii-audit/build-pdfs.js

# re-run the audit (no network, no API key: fetch is stubbed)
npm run pii-audit --prefix server
```
