# Session 3 — Testing Observations

**Date:** 2026-05-04

---

## Bugs fixed this session

### Bug 1 — American English spelling flagged as errors
**Symptom:** Language section flagged "optimisation" → suggested "optimization".
**Root cause:** Prompt had no English variant instruction; model defaulted to American English.
**Fix:** Added Commonwealth English guard to Section 3 of system prompt.

### Bug 2 — Personal Information flagged as content weakness
**Symptom:** `content_quality.weaknesses` included "father's name, mother's name (Bangladeshi convention but unnecessary)".
**Root cause:** Bangladesh convention guard was only in Section 1 (formatting). Section 2 had no equivalent.
**Fix:** Added explicit convention guard to Section 2 of system prompt, matching the language in Section 1.

---

## Open observation — duplicate header on multi-page resumes

**What happened:** Model correctly flagged name and contact details appearing twice in the extracted text.
**Why:** The resume is two pages; the header repeats on page 2 (standard Bangladeshi multi-page CV practice). The PDF parser extracts both pages linearly, so the model sees two identical header blocks and treats it as a formatting error.
**Model's recommendation:** "Remove duplicate header" — technically correct from an ATS standpoint, but confusing for a Bangladeshi user who expects the header on each page.

**Decision:** No prompt fix now.
**Watch in Session 4:** If this false positive recurs consistently across other multi-page resumes, add to Section 1:
> "A repeated header on page 2 of a multi-page resume is acceptable and should not be flagged."
