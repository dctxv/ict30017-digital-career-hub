# PII Mask Audit and Fixes

**Date** 24 September 2026
**Branch** `pii-masking-fixes` (based on `de3d08f`)
**Modules** `ai-service/src/utils/piiMask.js` (user → model), `server/src/utils/piiRedactor.js` (model → user), `server/src/utils/pdfText.js` + `fileParser.js` (PDF extraction), `server/src/utils/sanitise.js`
**Corpus** `docs/samples/pii_corpus/` — 44 fictional resumes, 445 known pieces of personal information
**Re-run** `npm run pii-audit --prefix server` · the same corpus runs on every `npm test --prefix server`

## Bottom line

On all 44 resumes, every piece of personal information is now masked before anything reaches the model provider. That holds for a guest and for a logged-in user, for PDF and DOCX uploads, and in the inbound redactor if the model ever echoed a CV back. Nothing the review needs was removed.

| | Before | After |
|---|---|---|
| All items, PDF upload, guest | 43% | **442/442 (100%)** |
| All items, PDF upload, logged in | 50% | **442/442 (100%)** |
| All items, DOCX upload, guest | 55% | **443/443 (100%)** |
| Inbound redactor, if the model echoed the CV | 37% | **442/442 (100%)** |
| Candidate's name, PDF, guest | 1 of 27 | **48/48** |
| National IDs, passports, DOB, parents' names, registration numbers, religion and other personal details | 0 of 52 | **138/138** |
| Resumes that lost content the review needs | 8 | **0** |
| Words removed that were not personal (word-by-word diff of all 44) | not measured | **0** |

The corpus holds 445 items; 442 can be judged from the PDF text. The other 3 are in Bangla PDFs whose text layer doesn't hold them in that spelling, and each is checked under the spelling the PDF does hold (section 6).

The same Bangladeshi CV that opened the first version of this report now goes to the provider like this (`outbound/bd-garment-production-supervisor.txt`, abridged):

```
[NAME]
Mobile: [PHONE]
Alternative Mobile: [PHONE]
E-mail: [EMAIL]
Present Address: [ADDRESS]
...
Father's Name : [NAME]
Mother's Name : [NAME]
Date of Birth : [DATE OF BIRTH]
National ID No : [ID]
Permanent Address : [ADDRESS]
Religion : [PERSONAL]
Marital Status : [PERSONAL]
Blood Group : [PERSONAL]
Nationality : Bangladeshi
Reference
[NAME]
General Manager (Production), DBL Group
Mobile: [PHONE]
```

Labels are kept and values removed. The reviewer can still say "remove your father's name for an international CV" without ever seeing the name.

**How far to trust "100%".** It is measured on 44 resumes, and the rules are deterministic, so a format none of them contains can still get through. Two blind rounds measured this honestly (section 3): new resumes, run before any rule was changed for them, scored 87% and then 94%. Each gap they found was fixed with a general rule, and those resumes are now in the regression test. Section 6 has the real limits.

---

## 1. What the first audit found, and what fixed it

The first version of this report, on 26 resumes, found ten problems. Each is fixed below, and the fix is covered by a test.

| # | Finding | Fix |
|---|---|---|
| F1 | A guest's name was masked on 1 of 27 PDFs. The parser joined every text item with `' '`, so a page became one line, and the header-name guess never saw a line. When it did fire, it swallowed the job title ("Priya Raghunathan Registered Nurse"). | `pdfText.js` builds text from pdfjs's own line ends and spaces. The name is read from the **largest type on page 1** and passed to the mask as a known name for every upload (`extractResume` → `withNameHint`). The sanitiser no longer merges lines or turns a stripped icon into a paragraph break. |
| F2 | For a logged-in user, only names written exactly like the account were masked. Nicknames, accents, apostrophes, extra names and letter-spaced headings all got through. | Name matching ignores accents and treats `'`, `’`, `-` and spaces alike. The CV's own name (F1) covers nicknames and extra names. Letter-spaced headings (`M A R I A`) are collapsed at extraction. |
| F3 | 0 of 52 government IDs, dates of birth, parents' names, registration numbers or religion values were masked. | **Labelled fields** in English and Bangla: the label is kept and the value masked. This covers Father's/Mother's/Spouse's Name, Date of Birth, NID/Passport/NRIC/PAN/CNIC/TIN…, Religion, Marital Status, Blood Group, Height, Weight and more. Also bare NID shapes (10/13/17 digits), registration numbers after a keyword ("BMDC Reg.: A-65432"), and anything after "No." with four or more digits. |
| F4 | Phones: 76%. | Every grouping of Bangladeshi mobile numbers, national numbers with a trunk `0`, any number after a phone label, and the account phone however it is grouped. |
| F5 | Addresses: 54%. | Anchors are widened to the whole address line. Added: Bangladeshi `Village: … P.O: … Upazila: … District:` and `Holding No. …, Road No. …`, P.O. boxes, dwelling prefixes, and postcodes from more countries. |
| F6 | Handles and sites: 42%. | Bare `@handles`, labelled ids (`Skype:`), 30 more profile hosts, and the candidate's own email domain wherever it appears. |
| F7 | Referee names always leaked. | Names in a References section are masked, and their roles and organisations kept. Relatives are covered too: brother, nominee, emergency contact, C/O. |
| F8 | Bangla PDFs arrived garbled. | Vowel signs are put back in order, the split `ো` is rebuilt, and pdfjs's fake spaces after conjuncts are dropped. Bangla labels are matched even when extraction damaged them. Glyphs the PDF never mapped still can't be recovered (section 6). |
| F9 | Over-masking in 8 resumes. | Fixed individually, with regression tests. `TAFE NSW 2015` is no longer a postcode (the digits must be a valid postcode for the state, and not a year). The job title in a bad header guess is gone with F1. A single word of a name is masked only where it stands as a name, so `Line Cook` and `Box Hill Institute` survive. |
| F10 | The inbound redactor caught 37%. | It now also runs the mask's value rules and known-name matching. The server also hands it **exactly the values the mask removed** from the CV, so anything masked going out is masked coming back. Advice about a field ("remove your religion") contains no one's religion, so it is untouched. |

## 2. The corpus

- **26 original resumes:** one per career across 12 countries, in five layouts that imitate real exports (Word single column, Canva sidebar, traditional Bangladeshi with a personal-details table, a banner header with letter-spaced name and icons, and a table header).
- **12 holdout resumes:** written after the mask reached 100% on the first 26, to test whether the fixes generalised. They cover Bangladesh (banking, Bangla tailoring CV), Pakistan, Kenya, Malaysia, Germany, the US, the UAE, Sri Lanka, Vietnam, Australia and Nepal.
- **6 Bangladesh holdout resumes:** written after the mask reached 100% on the first 38, in the formats Bangladeshi candidates actually send:
  - a **BDJobs export**
  - an NGO field officer's CV with a `C/O …, Zilla:` address
  - a nurse with her Bangla name in brackets
  - a **Bangla government job application form**
  - an overseas driver's CV with a licence, a guardian's phone and an emergency contact
  - a lecturer's CV with publications.

15 of the 44 are Bangladeshi, 3 of them in Bangla script. Every resume carries ground truth in `server/scripts/pii-audit/corpus.js` / `corpus-holdout.js`: each piece of personal information by category, the content the review must keep, and the account row a logged-in user would have.

## 3. How it was verified

**The real path.** `audit-core.js` runs each PDF through `extractResume` → `sanitiseResumeText` → the identity the upload routes build → `analyzeResume`, with `fetch` stubbed. It records the JSON body the OpenAI SDK tried to send, so nothing below the HTTP boundary is mocked. Matching ignores case, punctuation, spacing, numeral alphabet and Bangla vowel-sign order, so a value counts as leaked if the model could still read it.

**Three ways to fail:** a personal item still in the request; a `keep` phrase gone; or any word removed that is not personal. The last is a word-by-word diff of the text before and after masking, with every removed run matched against the ground truth. It caught over-masking the keep lists did not, e.g. `Jan 2019` read as a registration number and `Check 1234567` losing its label.

**Blind rounds.** Each holdout set was run before any rule was changed for it:

| Blind round | Guest | Logged in | What it found |
|---|---|---|---|
| 12 holdout resumes | 97/111 (87%) | 97/111 (87%) | CNIC, ABN, "Father Name" without the 's, P.O. Box, `-straße`, Malay and Vietnamese streets, `House No. 45`, `Ward No. 7`, place of birth, arm reach; `NVQ Level 4,` read as an address; a sole trader's surname in his business name |
| 6 Bangladesh resumes | 68/72 (94%) | 69/72 (96%) | `Name (in English):` (a bracketed label), `Brother:` / emergency contact names, a licence label that took the whole line |

Both rounds are now at 100%. Snapshots of the results before fixing are kept in `docs/samples/pii_corpus/before/`.

**Standing checks:**
- `npm test --prefix server` runs all 44 resumes (`scripts/pii-audit/corpus.test.js`, about 5 seconds). I verified it fails when a rule is broken: removing the date-of-birth labels failed 22 items at once.
- The integration test now asserts that **no service's system prompt is altered** by the mask. The first version of the label rules rewrote the review prompt's own headings, so the guard is there for a reason.
- New unit tests: `piiMaskFields.test.js` (46), `pdfText.test.js`, `sanitise.test.js`, `maskIdentity.test.js`, and redactor additions.
- Totals: 283 ai-service tests and 178 server tests, all passing.

## 4. What changed in behaviour

Worth knowing before this merges:

- **The model sees the CV's lines.** Extraction keeps line breaks instead of flattening each page into one line. That is better input for the review too, and all 7 golden system prompts are unchanged.
- **The sanitiser keeps dashes, curly quotes and bullets** (U+2010–U+2027). pdfjs extracts them correctly, and stripping them turned `2019 – 2023` into two unrelated years and `O’Connor` into two words. Icons and dingbats are still stripped, to a space rather than a paragraph break.
- **New placeholders:** `[ID]`, `[DATE OF BIRTH]`, `[PERSONAL]`, alongside `[NAME] [EMAIL] [PHONE] [ADDRESS] [URL]`. The review prompt already treats bracketed placeholders as text not to reproduce.
- **System prompts** get the value rules and known names, but not the label or References rules, which read document structure and would rewrite instructions about CVs.
- **The redactor** takes the identity and the masked values (`redactPiiDeepWithFindings(feedback, identity, maskedValues)`). New markers: `[redacted-name]`, `[redacted-url]`, `[redacted-personal]`. The stream holdback is 160 characters (was 64), and releases land on a space, never inside a known value.
- **API additions:**
  - `extractResume(filePath)` → `{ text, nameHint }`; `extractText` is unchanged.
  - `withNameHint(identity, hint)`.
  - `resumeMaskContext(text, identity)`.
  - `inspectMaskedPii(text, identity, { collectValues, labelledFields, referees })`.

## 5. What works well and should stay

- The chokepoint design: a request without a masking context throws, and mask logs carry only rule names and counts. The collected values are held in memory and never logged.
- Deterministic rules with no model calls. The guarantee does not depend on the provider.
- Placeholders keep the document legible, and labels survive, so the review quality the prompts were written for is preserved.

## 6. Limits

- **Formats outside the corpus.** The blind rounds show the realistic rate on unseen formats before fixing: 87–94%. The workflow for a new format is to add a resume that shows it to `corpus-holdout.js`, see it fail in `npm test`, and add a general rule. Bangladesh is the priority market and has the most coverage (15 resumes, 3 in Bangla script). The other countries are covered well beyond need, but less deeply.
- **Bangla PDFs lose some glyphs for good.** Some PDFs have no Unicode mapping for certain conjuncts and rephs (e.g. `ক্ত` in আক্তার, `ক্ষ` in দক্ষিণপাড়া), and no extractor can recover what the file doesn't store. Masking still works: the name comes from the largest type as the PDF holds it, and damaged labels are matched tolerantly. The 3 affected items can only be judged in their extracted spelling, and the test says so. What remains is a **review-quality** problem, since the model reads those words damaged. Bangla DOCX uploads are unaffected.
- **Third-party names in free text** are not masked unless they are labelled (a referee, a relative, a C/O). "Reported to Mr. X" in a bullet still reaches the model. Doing this would mean guessing at names in prose, which this module deliberately avoids because it destroys employer names.
- **Scanned PDFs** have no text layer and are rejected before masking, as before.

## 7. Reproducing

```sh
node server/scripts/pii-audit/build-pdfs.js      # rebuild the PDFs (needs Playwright + Chromium)
npm run pii-audit --prefix server                # full report → docs/samples/pii_corpus/RESULTS.md
npm test --prefix server                         # includes the 44-resume regression test
npm test --prefix ai-service                     # mask rules, system-prompt guard
```

`docs/samples/pii_corpus/outbound/<id>.txt` holds, for each resume, the exact user message that would have been sent as a guest and as a logged-in user.
