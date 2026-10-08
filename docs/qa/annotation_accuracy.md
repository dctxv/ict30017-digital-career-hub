# Resume annotation: placement accuracy

The results page draws each review finding onto the resume preview by finding
the text the model quoted (`client/src/utils/quoteMatch.js`). Two things decide
whether a finding gets a mark, and they were measured separately on 8 October
2026.

## 1. Can a quote be found in the rendered document?

Quotes were sampled from exactly what the model is sent (server extraction,
then the PII mask, placeholders included), one 3–12 word window per line, and
searched for in the PDF.js text layer the preview renders. Word files were
searched in their converted text.

Corpus: the 44 PDFs in `docs/samples/pii_corpus`, the 8 files in
`docs/database` and the 3 in `docs/samples/mock_interview`, including three
Bangla-script resumes and two `.docx` files.

| Quotes | Placed |
|---|---|
| All sampled (1,108) | 96.2% |
| With at least 10 letters of real text (969) | **100%** |
| Bangla-script, at least 10 letters of real text (12) | **100%** |

Every miss was a line that is almost all placeholders, such as
`[PHONE] [EMAIL] [ADDRESS]`, which no finding would quote.

Bangla needed one rule: vowel signs are ignored when comparing, because a PDF
stores them in visual order and the server reorders them before the model sees
the text. Before that rule, Bangla placement was 18%.

## 2. Does the model quote the resume faithfully?

Measured on the saved outputs in `docs/ai_model_testing` and `ai_testing`
(6 models, 10 sample resumes), against the source text in `ai-service/custom`.
These outputs predate the current QUOTES rule in the prompt, so they are a
lower bound.

| What is quoted | Quotes | Placed |
|---|---|---|
| Heading risks (`heading_risks[].original`) | 82 | **100%** |
| Language issues (`language_grammar.issues[].original`) | 162 | **98%** |
| Job-ad keywords (whole-word match) | 685 | **91%** |

The keyword misses are mostly terms the model generalised and the resume does
not contain ("Market Analysis", "Machine Learning (implied by AI Security)"),
which correctly get no mark, plus `C++` and `C#`, too short once punctuation is
set aside.

## Not yet measured

`formatting.issues[].quotes` and `content_quality.weak_bullets` are new and
have no saved model output. They need a run with a live API key. Formatting
is expected to place least often, because the model only ever sees text and
cannot point at spacing, fonts or alignment.

## What happens when a quote is not found

The finding is still listed in the side panel, marked "Could not find this
exact text on the page", and no mark is drawn. The matcher only accepts an
exact match, or a near match for quotes of 16+ letters with at most 12% of
letters different. A missing mark is preferred to a wrong one.
