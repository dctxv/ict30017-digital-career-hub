# PII audit corpus

44 fictional resumes built to test how well the PII mask (`ai-service/src/utils/piiMask.js`) protects real uploads, 15 of them Bangladeshi. The findings and fixes are in [`docs/qa/PII_MASK_AUDIT.md`](../../qa/PII_MASK_AUDIT.md). All 44 run on every `npm test --prefix server`.

Three sets, in the order they were written:

- **Corpus** (26): one per career across 12 countries. The mask was fixed against these.
- **Holdout** (12): written after the mask reached 100% on the corpus, and run blind.
- **Bangladesh holdout** (6): written after that, in the formats Bangladeshi candidates send (BDJobs export, government application form in Bangla, and others), and run blind.

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
| **Holdout** | | | |
| `bd-bank-officer.pdf` | Senior Officer (Retail Banking) | Bangladesh | bd-traditional |
| `pk-electrical-technician.pdf` | Electrical Technician | Pakistan | table-header |
| `ke-community-health-worker.pdf` | Community Health Promoter | Kenya | classic |
| `my-kindergarten-teacher.pdf` | Kindergarten Teacher | Malaysia | sidebar |
| `de-geriatric-nurse.pdf` | Geriatric Nurse | Germany | classic |
| `us-warehouse-supervisor.pdf` | Warehouse Shift Supervisor | United States | modern-header |
| `ae-flight-attendant.pdf` | Cabin Crew | United Arab Emirates | table-header |
| `lk-hotel-chef.pdf` | Chef de Partie | Sri Lanka | bd-traditional |
| `vn-garment-qc-inspector.pdf` | QC Inspector (Garments) | Vietnam | sidebar |
| `au-plumber.pdf` | Licensed Plumber & Gasfitter | Australia | table-header |
| `np-trekking-guide.pdf` | Trekking Guide | Nepal | modern-header |
| `bd-tailor-bangla.pdf` | Sewing Machine Operator, in Bangla | Bangladesh | bd-traditional |
| **Bangladesh holdout** | | | |
| `bd-bdjobs-merchandiser.pdf` | Merchandiser, BDJobs export format | Bangladesh | bd-traditional |
| `bd-ngo-field-officer.pdf` | Field Officer (Microfinance NGO) | Bangladesh | table-header |
| `bd-senior-staff-nurse.pdf` | Senior Staff Nurse | Bangladesh | sidebar |
| `bd-govt-application-bangla.pdf` | Office Assistant, government application form in Bangla | Bangladesh | bd-traditional |
| `bd-heavy-vehicle-driver.pdf` | Heavy Vehicle Driver (overseas employment) | Bangladesh | classic |
| `bd-university-lecturer.pdf` | Lecturer (Environmental Science) | Bangladesh | classic |

The content and the ground truth for each file (every piece of personal information it contains, the content a review must keep, and the account row a logged-in user would have) live in [`server/scripts/pii-audit/corpus.js`](../../../server/scripts/pii-audit/corpus.js) and [`corpus-holdout.js`](../../../server/scripts/pii-audit/corpus-holdout.js).

To cover a new CV format: add a resume that shows it to `corpus-holdout.js`, build its PDF, watch `npm test --prefix server` fail on it, then fix the rule.

## Files here

- `*.pdf` — the resumes. They can also be uploaded to the running app by hand.
- `RESULTS.md` — per-category and per-resume results from the last audit run.
- `results.json` — the same, machine-readable.
- `outbound/<id>.txt` — for each resume, the exact user message that would have been sent to the model provider, as a guest and as a logged-in user, with the mask's own log line.
- `before/` — results from before the fixes, kept as evidence: the original audit, and each holdout set as it scored blind.

## Regenerating

```sh
# rebuild the PDFs (needs Playwright + Chromium; not a project dependency)
node server/scripts/pii-audit/build-pdfs.js

# re-run the audit (no network, no API key: fetch is stubbed)
npm run pii-audit --prefix server

# one holdout set on its own
node server/scripts/pii-audit/run-audit.js --holdout-bd
```
