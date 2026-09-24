# PII Mask Audit — 26 resumes across careers and countries

**Date** 24 September 2026
**Build under test** `pii-masking-fixes` (based on `de3d08f`)
**Modules** `ai-service/src/utils/piiMask.js` (user → model), `server/src/utils/piiRedactor.js` (model → user)
**Corpus** `docs/samples/pii_corpus/` — 26 fictional resumes, 232 known pieces of personal information
**Raw results** `docs/samples/pii_corpus/RESULTS.md`, exact text sent per resume in `docs/samples/pii_corpus/outbound/`
**Re-run** `npm run pii-audit --prefix server`

## Bottom line

The mask is **reliable for email addresses** and good for phone numbers and street lines in the formats it was written for (Bangladeshi and Australian mobiles, `+` international numbers, "House 12, Road 7", "15 Glenferrie Road"). It is **not reliable for anything else**, and on a PDF upload it almost never masks the candidate's name.

| | PDF, guest | PDF, logged in |
|---|---|---|
| All 232 items | **43%** masked | **50%** masked |
| Only what the mask claims to cover (name, email, phone, address, URL) | 56% | 66% |
| Candidate's own name, fully masked | **1 of 27** | 12 of 27 |
| Government IDs, dates of birth, parents' names, registration numbers, religion | **0 of 52** | **0 of 52** |

A typical guest upload of a traditional Bangladeshi CV — the product's main market — still sends the provider the candidate's full name, father's and mother's names, date of birth, 17-digit NID, home village, religion, blood group and one of their two phone numbers. From `outbound/bd-garment-production-supervisor.txt` (verbatim, with `...` where text is cut):

```
MD. ABDUL KARIM SHEIKH Mobile: [PHONE] Alternative Mobile: 017 1122 3344 E-mail: [EMAIL]
Present Address: [ADDRESS], Uttara, [ADDRESS] ...
Father's Name : Md. Abdul Jalil Sheikh Mother's Name : Mst. Rokeya Begum
Date of Birth : 15-03-1990 National ID No : 19902692512345678
Permanent Address : Village: Char Bhadrasan, Post: Char Bhadrasan, Upazila: Char Bhadrasan, District: Faridpur
Religion : Islam Marital Status : Married Blood Group : B+ ...
Reference Engr. Mizanur Rahman ... Mobile: [PHONE]
Declaration ... (Md. Abdul Karim Sheikh) Signature
```

The system prompt already tells the model to *"never reproduce names, addresses, phone numbers, emails, NID or passport numbers, dates of birth, religion, marital status, blood group, or referee contact details"* (`ai-service/tests/golden/systemPrompt.bangladesh.txt:22`). So the project already treats all of these as PII. The mask was only ever built to cover the first four.

---

## 1. What the masking covers today

Two separate layers, pointing in opposite directions.

**`piiMask` — user → model.** Every request goes through `withOutboundMasking` in `aiClient.js`, and a request made without a masking context throws. That chokepoint is well designed: no feature can forget to mask. What it masks:

| Rule | Catches | Does not catch |
|---|---|---|
| `email` | any `local@domain.tld` | — |
| `profile-url` | linkedin, github, gitlab, twitter/x, facebook, instagram, behance, dribbble, medium, stackoverflow, kaggle, bitbucket URLs | youtube, soundcloud, tiktok, muckrack, linktr.ee; bare `@handles` |
| `personal-site` | `*.github.io`, `vercel.app`, `netlify.app`, `herokuapp.com`, `wordpress.com`, `blogspot.com` | every other portfolio host (`myportfolio.com`, custom domains) |
| `phone-bd` | `01XXX-XXXXXX`, `+880 1XXX XXXXXX`, Bengali numerals | `017 1122 3344`, `0171-2345678` |
| `phone-au` | `04XX XXX XXX`, `(0X) XXXX XXXX`, `+61 …` | — |
| `phone-international` | anything starting with `+` | local forms without `+` |
| `phone-grouped` | NANP `XXX-XXX-XXXX`, and any other 3-3-4 | 4-3-4 (Philippines, Nigeria), UK `07700 900 372`, 4-4 (Singapore) |
| `address-bd` | `House 12, Road 7, Block C` and Bangla `বাসা ১২, রোড ৫` | `Flat 5C, Green Valley Apartments`, `Village: … P.O: … Upazila: …` |
| `address-street` | `12 Oak Street` with one of 22 street types | `Way`, `Close`, ordinal streets (`West 57th Street`), `Plot 15, Admiralty Way` |
| `address-au-postcode` | `Hawthorn VIC 3122` | — (and it has a false positive, see F9) |
| `address-bd-postcode` | `Dhaka-1209` for 14 cities | — |
| known strings | the account's stored name (and each word of it), email and phone; the name guessed from the CV's first lines | anything spelt differently from the stored value |

**Nothing** matches government IDs, dates of birth, parents' names, professional registration numbers, religion, marital status or blood group. The NID rule that exists in the inbound redactor (`piiRedactor.js:116`) was never ported to the outbound mask.

**`piiRedactor` — model → user.** Only matters if the model echoes a value back. It is a strictly weaker set of rules (no Australian phones or postcodes, no known-name pass, no personal-site rule) with one addition: 10/13/17-digit national IDs.

## 2. How this was tested

- **26 resumes, one per career**, across 12 countries: registered nurse, head chef, garment production supervisor, Bangla-script primary teacher, electrician, attorney, chartered accountant, truck driver, retail manager, graphic designer, social worker, civil engineer, pharmacist, overseas security guard, hairdresser, journalist, airline pilot, aged-care worker, agriculture extension officer, medical officer, early-childhood educator, real-estate agent, music teacher, diesel mechanic, physiotherapist and barista. Seven are Bangladeshi and seven Australian.
- **Five layouts** that imitate real exports: a Word-style single column, a Canva-style sidebar, the traditional Bangladeshi format (personal-details table, declaration, signature), a banner header with letter-spaced name and icon glyphs, and a table-based header. Rendered by Chromium to real PDFs (`server/scripts/pii-audit/build-pdfs.js`).
- **Ground truth per resume** (`server/scripts/pii-audit/corpus.js`): every piece of personal information, tagged by category (232 in total), plus the content the review needs to keep (employers, qualifications, job titles).
- **The real pipeline.** `run-audit.js` calls the production `extractText` → `sanitiseResumeText` → `analyzeResume` with `fetch` stubbed. It records the JSON body the OpenAI SDK actually tried to POST. Nothing below the HTTP boundary is mocked.
- **Scenarios:** a guest, a logged-in user whose account row is given per resume, and for comparison the same resume as a DOCX uploaded by a guest.
- **Matching** ignores case, punctuation, spacing, numeral alphabet and Bangla vowel-sign order. So a value counts as leaked if the model could still read it: `O Connor` for `O’Connor`, `M A R I A` for a letter-spaced `MARIA`, and garbled-but-legible Bangla all count.

## 3. Results

Items fully masked out of items present in the extracted text.

| Category | PDF, guest | PDF, logged in | DOCX, guest | Redactor, if echoed |
|---|---|---|---|---|
| Candidate name | 1/27 (4%) · 2 partial | 12/27 (44%) · 9 partial | 24/27 (89%) · 1 partial | 0/27 |
| Email | 26/26 (100%) | 26/26 (100%) | 26/26 (100%) | 26/26 |
| Phone | 28/37 (76%) | 29/37 (78%) | 28/37 (76%) | 22/37 |
| Address | 29/54 (54%) | 29/54 (54%) | 31/54 (57%) | 20/54 |
| Profile URL / handle | 8/19 (42%) | 12/19 (63%) | 11/19 (58%) | 7/19 |
| Referee details | 8/16 (50%) | 8/16 (50%) | 8/16 (50%) | 4/16 |
| Government ID | 0/15 | 0/15 | 0/15 | 4/15 |
| Registration / licence no. | 0/14 | 0/14 | 0/14 | 2/14 |
| Date of birth | 0/8 | 0/8 | 0/8 | 0/8 |
| Parent's name | 0/8 | 0/8 · 2 partial | 0/8 · 3 partial | 0/8 |
| Sensitive (religion, blood group…) | 0/7 | 0/7 | 0/8 | 0/7 |

18 of 26 resumes kept everything the review needs. The other eight lost something (F9).

## 4. Findings

Ordered by how much personal information each one lets through.

### F1 — A guest's name is masked on 1 of 27 PDF uploads (DOCX: 24 of 27)

For a guest there is no account name, so the only name source is `inferNameFromHeader`, which reads "the first few lines" of the CV. A PDF has no lines by then:

1. `fileParser.extractFromPDF` joins every text item on a page with `' '` (`fileParser.js:74`). Every PDF, from any producer, becomes one line per page.
2. `sanitiseResumeText` step 1 (`sanitise.js:41`) joins any remaining single `\n` between two word characters.

So the "first line" is the whole page, it is longer than 50 characters, and the guess returns `null`. It fires on 3 of 26 PDFs, only where a stripped em-dash or icon happened to leave three spaces, and all 3 guesses were wrong:

- `"Priya Raghunathan Registered Nurse"` masked the name, but also masked **every "Registered" and "Nurse" in the CV**, turning her referee into `[NAME] Unit Manager`.
- `"Rafsan Haque Senior Reporter"` did the same to "Senior" and "Reporter".
- `"L I A M O"` (a letter-spaced heading) masked the first name and left `C O N N O R`.

DOCX works because mammoth separates paragraphs with `\n\n`, which survives both steps. The unit and integration tests all build their resumes with `\n` between lines, the DOCX shape, so they have never exercised the PDF path. The mock interview (`preparation.js:373`) uses the same extract → sanitise → header-guess path and has the same gap.

### F2 — A logged-in user's name is masked only when the CV spells it exactly like the account (12 of 27)

The known-name pass is a literal, case-insensitive match. Real accounts and CVs differ:

| Resume | Account | CV | Sent |
|---|---|---|---|
| civil engineer | `Emeka Obi` | `Chukwuemeka Obi` | `Chukwuemeka` (a word boundary stops `Emeka` matching inside it) |
| hairdresser, barista | `Jess Tran`, `Valentina Gomez` | `Jessica Tran`, `Valentina Gómez Ramírez` | these CVs are also letter-spaced (last row), but on their own the names mask to `Jessica [NAME]` and `[NAME] Gómez Ramírez` |
| music teacher | `Siobhan O'Sullivan` | `Siobhán O’Sullivan` | whole name: the fada doesn't match, and the sanitiser turns `’` into a space |
| truck driver, pilot, doctor, garment supervisor, agriculture officer, physio | shorter name | extra names | `Singh`, `Wei Jie`, `Chowdhury`, `Sheikh`, `Sarkar`, `Wei` |
| Bangla teacher | `Farzana Yasmin` | `মোছাঃ ফারজানা ইয়াসমিন` | whole name (different script) |
| the 5 banner layouts | — | letter-spaced heading | `M A R I A I S A B E L S A N T O S`; four sent in full, the electrician's as `C O N N O R` |

The known-phone pass has the same problem. The account stores `07700 900372`, the CV says `07700 900 372`, and the number goes out.

### F3 — Government IDs, dates of birth, parents' names and registration numbers: 0 of 52

No rule targets them. These went out for every resume that had them:

- **National IDs:** Bangladesh NID (10, 13 and 17 digits, and in Bengali numerals), Singapore NRIC, Aadhaar, PAN, South African ID (which encodes the date of birth), UK National Insurance number.
- **Other ID numbers:** passport numbers, driver licence numbers, a DBS certificate number.
- **Professional register numbers**, each of which a public register maps straight back to a name: AHPRA (nurse, physio), BMDC (doctor), Pharmacy Council, COREN, ICAI, NY Bar, TREC, Working with Children and NDIS screening.
- **Personal details:** dates of birth, father's and mother's names, religion, blood group, marital status, height and weight.

A Personal Information block is standard on Bangladeshi CVs, and the international prompt (`systemPrompt.international.txt:173-178`) tells the model to flag these fields for removal. So the model needs to see the **label**, but never the **value**.

### F4 — Phones: 76–78%

The `+` forms, Bangladeshi and Australian mobiles, and NANP numbers are all caught. Nine local forms without a `+` leak: two UK mobiles (`07700 900461`, `07700 900 372`), Philippines and Nigeria 4-3-4 (`0917 123 4567`), Mumbai landline `022 2634 5678`, NZ landline `(09) 555 0876`, Singapore 8-digit `9123 4567`, and two Bangladeshi groupings people do write (`017 1122 3344`, `0171-2345678`).

### F5 — Addresses: 54%

Numbered street lines and AU/BD postcodes are caught. What leaks:

- **Postcodes elsewhere:** UK, US ZIP, Canadian, Irish Eircode, NZ, Singapore, Indian PIN and South African codes.
- **Missing street types:** `Way` and `Close`.
- **Ordinal streets:** `West 57th Street`.
- **Unit and flat prefixes:** `Apt 12C`, `#05-67`.
- **Building-name addresses:** `Flat 302, Sai Krupa CHS`, `Flat 5C, Green Valley Apartments`.
- **Plot-style addresses:** `Plot 15, Admiralty Way`.
- **Bangladeshi village addresses:** every `Village: … P.O: … Upazila: … District: …` permanent address, which is the most specific location on a rural candidate's CV.

### F6 — Profile URLs and handles: 42% guest, 63% logged in

URLs on the listed hosts are caught. None of the 5 bare handles were (`@chefdancook`, `@isa.designs`, `@hairbyjess_bne`, `@rafsan_reports`, `@sarahsellsaustin`). Handles matter most in exactly the non-tech careers this corpus adds: hair, food, design, real estate and journalism. SoundCloud and YouTube URLs leak. The Muck Rack URL was masked only because the wrong header guess in F1 happened to fire on that CV. A custom portfolio domain is masked only when a known name is inside it: `sarahmitchellhomes.com` and `hairbyjess.com.au` are masked for the logged-in accounts `Sarah Mitchell` and `Jess Tran`. Both leak for a guest, even on DOCX, where the header guess `Jessica` isn't a substring of `hairbyjess`.

### F7 — Referee names always leak (7 of 7)

Referee phones and emails are masked when their format is recognised: 8 of 9 were, and the miss was a UK landline, `0161 234 5000`. Referee names never are. That is a third party's personal data, and the candidate can't consent for them.

### F8 — Bangla PDFs are garbled before the mask sees them

pdfjs returns this Bangla CV with pre-base vowel signs out of order, a space between every cluster, and some conjuncts dropped: `মা ছাঃ ফা র জা না ই য়া স িম ন` for `মোছাঃ ফারজানা ইয়াসমিন`, and `মা হা    দ পু র` for `মোহাম্মদপুর`. It is still readable, so the name, `বাসা ২৭, রোড ৪`, `ঢাকা-১২০৭` and both parents' names reach the model. None of the Bangla rules can match them. Digits survive extraction, so the phone number in Bengali numerals *is* masked. This is also a review-quality problem, well beyond privacy: every Bangla PDF reaches the model in this state.

### F9 — Over-masking: eight resumes lose content the review needs

| Resume | Lost | Became | Cause |
|---|---|---|---|
| electrician, aged-care worker | `TAFE NSW 2015`, `TAFE SA 2020` | `[ADDRESS]` | the AU postcode rule reads `<Word> <STATE> <year>` as suburb + postcode. NSW postcodes start with 2, so any NSW qualification or job line with a year is exposed. Affects guests too. |
| nurse, journalist | `Registered Nurse`, `Senior Reporter`, `Staff Reporter` | `[NAME]`, `Staff [NAME]` | the wrong header guess from F1 |
| head chef | `Line Cook` | `Line [NAME]` | candidate is `Daniel Cook`, and every name word is masked everywhere, case-insensitively |
| retail manager | `rose to Store Manager` | `[NAME] to Store Manager` | candidate is `Rose Walker` |
| early childhood | `Box Hill Institute` | `Box [NAME] Institute` | candidate is `Grace Hill` |
| agriculture officer | `Religion: Islam` | `Religion: [NAME]` | candidate is `Shafiqul Islam` |

### F10 — The inbound redactor would catch even less

If the model echoed values back, the redactor would catch 37% of them overall and **0 of 27 names**. It has no Australian phone or postcode rules. It is the last line of defence for what gets stored and shown, so it should share rules with the mask rather than being maintained separately.

## 5. What works well

- **Email: 26 of 26 masked in every scenario and layout**, including inside Bangla text.
- The chokepoint design: a request without a masking context throws, and logs carry only rule names and counts.
- Bangladeshi and Australian mobiles in their common forms, Bengali numerals, and every `+`-prefixed number.
- `House/Road` and numbered street lines, and AU/BD postcodes.
- Placeholders keep the document legible (`Mobile: [PHONE] | Email: [EMAIL]`), and in 18 of 26 resumes nothing the review needs was touched.

## 6. Recommendations

In order of value for effort. None of these are implemented yet.

1. **Give the header guess a real signal on PDFs.** Two measured options on this corpus:
   - Emit `\n\n` at each pdfjs `hasEOL` in `extractFromPDF`: the guess goes from **0 to 14 of 26** correct, and it stops swallowing job titles. One-line change.
   - Take the largest-font text on page 1 as the name (pdfjs gives each item's transform): **25 of 26**, including sidebar and letter-spaced layouts. Pass it from the server as `extraNames`.
   Either one also fixes the mock interview.
2. **Label-anchored value masking** for the personal-details block, in English and Bangla: `Father's/Mother's/Spouse Name`, `Date of Birth`/`DOB`, `NID`/`National ID`, `Passport`, `NRIC`, `Aadhaar`, `PAN`, `ID Number`, `NI number`, `Religion`, `Marital Status`, `Blood Group`, `Height`, `Weight`, and `পিতার নাম`, `মাতার নাম`, `জন্ম তারিখ`, `জাতীয় পরিচয়পত্র`, `ধর্ম`. Keep the label and mask to the end of the value (`Father's Name: [PERSONAL]`), so the reviewer can still say "remove this for international CVs". This single change covers most of F3.
3. **Port the NID rule** (10/13/17 digits) from `piiRedactor` into `piiMask`. Add passport, NRIC and SA ID shapes, and label-anchored registration and licence numbers (`AHPRA`, `BMDC`, `Reg. No`, `Licence No`, `Membership No`, `WWC`).
4. **Label-anchored phones and addresses:** after `Mobile:`, `Phone:`, `Tel:`, `Cell:`, `WhatsApp:`, mask the digit run in any grouping. After `Address:`, `Present/Permanent Address:`, `Village:`, `ঠিকানা:`, mask to the end of the field. The label is what makes a bare digit run safe to take, so the rules against false positives on years still hold.
5. **Fix the AU postcode false positive.** Don't match when the 4 digits are followed by another year or `Present`, or when the word before the state is `TAFE`, `University` or `Institute`.
6. **Normalise known names the way the text is normalised:** fold diacritics and treat `’`, `'` and `-` alike on both sides. Only match single name words in Capitalised or UPPER case, which fixes `rose to` (not `Line Cook`).
7. **Bare `@handles`, `Skype:`**, and more hosts (youtube, soundcloud, tiktok, linktr.ee, muckrack).
8. **Referee names:** mask the name line inside a References section, or the name directly before a referee's phone or email.
9. **Put this corpus in CI** with a floor per category, so a regression, or a new feature that reads CVs, is caught. The current tests only use DOCX-shaped input.
10. **Look at Bangla PDF extraction** as a separate review-quality issue (F8).

## 7. Limitations

- The PDFs are generated by Chromium. Word and Canva exports lay out text differently, but the flattening in F1 happens in our own `extractFromPDF`, whatever produced the file, so F1 generalises. F8 may be better or worse with other producers and fonts.
- All data is fictional. Phone numbers use regulator-reserved fictional ranges where one exists.
- The resume review path was run end to end. The mock interview was checked by reading the code, which uses the same extraction and header guess. The chatbot, which takes typed text, was not in scope.
- Match results depend on the harness's normalisation (section 2). Every leak and over-mask listed above was checked by hand against the files in `outbound/`.
