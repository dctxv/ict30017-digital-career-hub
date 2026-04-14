# Coding Session Timeline

| Field | Value |
| --- | --- |
| Project | P83 Digital Career Hub |
| Author | Darius Clay Tan Yi (AI Lead) |

---

## Session 1 — 6 March 2026
### What Was Done

- Initialised the GitHub repository with `.gitattributes` and a base `README.md`.
- Expanded the README with project description and initial setup notes.

### Outcome

Repository live on GitHub. Clean starting point for the team.

---

## Session 2 — 30 March 2026

**Commits:** `database`

### What Was Done

- Added 4 real Bangladeshi resume PDFs as test data:
  - `BD_Resume_Test_01.pdf` through `BD_Resume_Test_04.pdf`
- Added the BD job market research database ZIP (`BD_jobmarket_database(2023).zip`) for reference during prompt engineering.

### Outcome

Research material available locally. These resumes became the basis for all prompt testing in later sessions.

---

## Session 3 — 13 April 2026
### What Was Done

**Project scaffold (`test 01`)**
- Set up the full monorepo folder structure: `ai-service/`, `server/`, `client/`, `docs/`.
- Built the `ai-service` module end-to-end:
  - `src/schemas/resumeSchema.js` — Zod schema defining the expected JSON shape from the AI (`overall_score`, `formatting_feedback`, `content_quality`, `language_and_grammar`, `action_items`).
  - `src/utils/aiClient.js` — Groq SDK client initialisation with model config.
  - `src/services/resumeReviewer.js` — Core service: calls Groq, parses JSON, validates against Zod schema, returns structured result.
  - `tests/testResumeReviewer.js` — CLI test runner supporting `data/` mock resumes and a `custom/` folder.
  - `index.js` — Exports `analyzeResume` as the public API of the service.
- Added 3 mock resumes in `data/` (IT, engineering, business) for baseline testing.
- Set up `package.json` with `npm run test:resume` and `npm run review` scripts.
- Added GitHub PR template and CODEOWNERS.
- Added progress and test result docs under `docs/`.

**Prompt engineering (`Prompt Engineering Update`)**
- Iterated the system prompt through 4 versions (documented in `ai_prompting_engineering.md`):
  - Iteration 0: Baseline — basic JSON schema, no detection rules.
  - Iteration 1: Research-driven — weighted scoring, CAR method, CGPA detection.
  - Iteration 2: Client-grounded — removed unvalidated rules, reframed personal details as recommendation not penalty.
  - Iteration 3: Legacy detection — Declaration, outdated headings, missing LinkedIn, absent section detection.
  - Iteration 4: Per-entry checks and score calibration — CGPA per-entry enforcement, British English per-entry check, experience date range rule, obsolete skills flagging, formatting score ceiling for legacy-heavy resumes.
- Replaced the 3 generic mock resumes in `data/` with 10 realistic Bangladeshi sample resumes in `custom/` (`sample_resume01.txt` through `sample_resume10.txt`).
- Cleaned up older scattered docs and consolidated prompt engineering notes into `docs/darius_notes/`.

### Outcome

`ai-service` fully functional as a standalone module. `npm run test:resume` produces scored, structured feedback. Prompt validated against 10 sample resumes covering IT, business, and other Bangladeshi CV formats.

---

## Session 4 — 14 April 2026
### What Was Done

- **Fixed garbled Unicode output** in the test runner. Box-drawing characters (`─`) and em dashes (`—`) were rendering as `â"€` / `â€"` on Windows terminals. Replaced all with plain ASCII (`-`).
- **Fixed Zod schema validation crash.** The model was occasionally returning the improvements list as a nested array inside `strengths` (e.g., `["s1", "s2", ["i1", "i2"]]`) and omitting the `improvements` key entirely. Added a `normalizeSection()` function that detects and extracts nested arrays before Zod validation runs.
- **Added single-file argument support** to the test runner. Previously, specifying a filename only worked with absolute paths. Updated `resolveTargetFiles()` so that passing just a filename (e.g., `npm run test:resume -- postgrad-cse-1.txt`) automatically resolves it against the `custom/` folder first.
- **Added server-side score recalculation.** The model sometimes gets the weighted average arithmetic wrong. Overall score is now recalculated server-side after parsing using the formula: `Math.round(content * 0.45 + language * 0.35 + formatting * 0.20)`. The model's `overall_score` value is discarded.

### Outcome

Test runner is stable and user-friendly. Schema validation no longer crashes on malformed model responses. Scores are now deterministic regardless of model arithmetic errors.

---

## Session 5 — 14 April 2026 (continued)

### What Was Done

Built the full file ingestion pipeline inside `server/` as a standalone Express.js API. No frontend — tested via curl / Postman.

**Key decision:** The AI Architecture doc referenced PyMuPDF and python-docx (Python libraries). Since the backend is Node.js, those cannot be used without a Python microservice. Replaced with Node-native equivalents: `pdf-parse` for PDFs, `mammoth` for DOCX. The function signature is unchanged so the libraries can be swapped later without touching anything else.

**Files created:**

- `server/package.json` — ESM (`"type": "module"`) to match `ai-service`. Includes `start` and `dev` (nodemon) scripts.
- `server/.gitignore` — Excludes `node_modules/`, `uploads/`, `.env`.
- `server/src/middleware/upload.js` — Multer config with dual validation (MIME type + extension) per SPR-05. File size capped at 3 MB. Filenames are randomised using `crypto.randomBytes` — original filename is never used on disk to prevent path traversal. Upgraded to multer v2 (v1.x had known vulnerabilities).
- `server/src/utils/fileParser.js` — Async text extraction. Routes by extension to `pdf-parse` (PDF) or `mammoth` (DOCX). Uses `fs.promises.readFile` throughout. DOCX extraction logs warnings without throwing so partial extractions still succeed.
- `server/src/utils/sanitise.js` — Strips HTML/script blocks, redacts prompt injection patterns (tightened from the original guide to avoid false positives on legitimate resume phrases like "act as a team player"), collapses whitespace, and truncates to 12,000 chars (~3,000 tokens) to stay within Groq's context limit.
- `server/src/routes/resume.js` — `POST /api/resume/analyze`. Runs the full pipeline: extract → sanitise → `analyzeResume()` → return JSON. Handles Groq rate-limit responses as `429`. Temp file is always deleted in `finally` (data minimisation, SPR-10/FR-13). Auth middleware slot is commented in for when Pubuditha's JWT module is ready.
- `server/src/app.js` — Express entry point. Creates `uploads/` at startup. Registers the resume router. 4-argument error middleware catches Multer rejections and returns `413`/`415` with clean messages.

**Improvements over the guide:**
- Server is ESM (`import`/`export`) throughout — the guide used CommonJS `require()`, which cannot load the ESM `ai-service` module.
- Multer filename uses `crypto.randomBytes` instead of `file.originalname` to eliminate path traversal risk.
- `fileParser.js` uses `fs.promises.readFile` (async) instead of `fs.readFileSync`.
- Injection pattern `/act as (a|an)?/` was removed — too broad, would redact "act as a team player" on real resumes. Replaced with more specific patterns.
- Multer upgraded from `1.4.5-lts.1` (vulnerable) to `2.x` (patched).
- Rate-limit responses from the AI service are surfaced as `429` instead of `500`.

### Outcome

`POST /api/resume/analyze` is fully functional. Accepts PDF and DOCX, rejects wrong types (`415`) and oversized files (`413`), extracts and sanitises text, calls the AI service, and returns structured JSON feedback. No frontend required — testable with curl or Postman.

---

## Session 6 — 14 April 2026 (continued)
### What Was Done

**Switched AI provider from Groq to OpenRouter**
- Replaced `groq-sdk` with the `openai` npm package (OpenRouter uses the OpenAI-compatible API).
- Updated `aiClient.js` to point at `https://openrouter.ai/api/v1` with `OPENROUTER_API_KEY`.
- Removed `GROQ_API_KEY` and `GROQ_MODEL` from both `.env` files. New variables: `OPENROUTER_API_KEY` and `AI_MODEL`.
- Model set to `openai/gpt-5-mini`.
- No changes required to `resumeReviewer.js` or any other file — the OpenAI SDK response shape is identical.

**Fixed: model returning objects instead of strings in improvements arrays**
- `gpt-5-mini` responded to the "quote the exact error and provide the correction" instruction by returning structured objects (e.g. `{"error": "a successfully career", "correction": "a successful career"}`) instead of plain strings.
- Added `itemToString()` helper that detects common object shapes (`error`/`correction`, `issue`/`fix`, `quote`/`rewrite`, `original`/`suggested`) and formats them as readable strings (e.g. `"a successfully career" → "a successful career"`). Falls back to joining all string values with ` — `.
- Updated `normalizeSection()` to run every array item through `itemToString()` before Zod validation, covering both `strengths` and `improvements`.

**Fixed: DOCX upload rejected with 415**
- curl sends `application/octet-stream` for DOCX files instead of the full DOCX MIME type, causing the dual MIME+extension validation to reject valid files.
- Removed the MIME type check from `upload.js`. Extension is now the sole gate. The real content validation is downstream — `mammoth` throws on any file that isn't a valid DOCX, so renaming a non-DOCX to `.docx` still gets caught at extraction.

**Fixed: action_items exceeding schema max(10)**
- `gpt-5-mini` returned more than 10 action items, failing Zod's `.max(10)` constraint.
- Added `.slice(0, 10)` in `normalizeResponse()` so oversized lists are trimmed rather than rejected. Priority order is preserved since the model returns items in descending priority.

### Outcome

End-to-end pipeline confirmed working with `gpt-5-mini` via OpenRouter on both PDF (`BD_Resume_Test_01.pdf`) and DOCX (`BD_Resume_Test_02.docx`) inputs. Schema normalizer is now robust against the three failure modes observed across two different model providers.
