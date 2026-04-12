# AI Service Progress

**Date:** 11 April 2026

## What I completed today

Today I set up the `ai-service` module for the Digital Career Hub project and organised it so it can be integrated cleanly with the backend.

- Added `.env.example` so environment variables and API keys can be configured safely.
- Added `.gitignore` to keep `node_modules` and `.env` out of version control.
- Configured `package.json` with ES module support and the required dependencies: `dotenv`, `groq-sdk`, and `zod`.
- Added `index.js` as the public entry point for backend integration.
- Created sample mock resume data files in `data/` for testing.
- Added a `custom/` folder where real resume `.txt` files can be dropped for review.
- Added the Zod schema in `src/schemas/resumeSchema.js` for validating resume review responses.
- Built utility helpers in `src/utils/aiClient.js` for AI client setup and model selection.
- Implemented the resume reviewer service in `src/services/resumeReviewer.js`.
- Added a test runner in `tests/testResumeReviewer.js` that supports custom file input.
- Installed dependencies and generated `package-lock.json`.

## AI Service Structure

```text
ai-service/
|-- .env.example
|-- .gitignore
|-- package.json
|-- index.js
|
|-- custom/          <-- drop your own .txt resumes here to review them
|
|-- data/            <-- built-in mock resumes for testing
|   |-- resume_it.txt
|   |-- resume_business.txt
|   `-- resume_engineering.txt
|
|-- src/
|   |-- schemas/resumeSchema.js
|   |-- utils/aiClient.js
|   `-- services/
|       `-- resumeReviewer.js
|
`-- tests/
    `-- testResumeReviewer.js
```

## How to test

```bash
# Review a specific resume file
npm run review -- path/to/yourresume.txt

# Review all .txt files in custom/
npm run review

# Review built-in mock resumes
npm run test:resume
```

## Summary

The `ai-service` folder has the structure needed to review resumes and return structured, Zod-validated JSON feedback through a reusable `analyzeResume` service.
