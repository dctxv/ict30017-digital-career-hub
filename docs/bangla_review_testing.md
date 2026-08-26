# Measuring the Bangla resume review

The Bangla reviewer is built and wired end to end. What has never been
established is whether the configured model can actually produce good Bangla,
and that is the only thing standing between "implemented" and "works".

## How to run it

```
node ai-service/scripts/batch-review.js ai-service/custom/tanvir.txt \
  --mode bangladesh --language bn --models <model_folder>
```

Output lands in `ai_testing/<model>/bangladesh-bn/`, beside the existing English
results rather than on top of them, so a comparison is possible.

Each file ends with a **Bangla output check** that the script decides on its
own. Run the same resume in `--language en` first if you want a baseline for
what that model produces when the task is easy.

## What the check decides, and what it cannot

It answers one question mechanically: is each field written in the alphabet it
is supposed to be written in. That covers the two failure modes that are easy to
miss by eye and expensive to ship.

**Under-translation.** The model acknowledges the instruction, writes a Bangla
sentence or two, and drifts back to English. Common in models with thin Bengali
training data. Reported as coverage below 100% with the specific fields named.

**Over-translation.** The model translates fields that must stay English:
`language_grammar.issues[].corrected`, the ATS keyword lists, heading names,
inferred role and industry. This is the one that matters most, because it looks
like *more* success — the page is more Bangla, not less — while telling a
candidate to paste Bangla into an English CV, and breaking keyword matching
against real job adverts. Any single violation fails the run.

**It says nothing about whether the Bangla is any good.** Grammar, register, and
whether it reads like a person wrote it are human judgements. The check exists
so that a Bangla speaker is only asked to read output that is at least in the
right script and has not corrupted the parts a candidate will copy.

## Suggested procedure

1. Pick 5 resumes from `ai-service/custom/` spanning different sectors.
2. Run each at `--language bn` against the models you are considering.
3. Discard any model with contract violations. That is disqualifying, not a
   score to weigh against fluency.
4. Have a Bangla speaker read what survives and rate it for fluency and
   register — particularly whether technical terms stayed English where a
   Bangladeshi job seeker would write them that way (CV, ATS, Bdjobs, HSC).
5. Record the outcome here.

## Model choice is the dominant variable

Prompt tuning cannot rescue a model that does not handle Bengali well. Bengali
is under-represented in most training sets relative to its number of speakers,
and capability varies far more between models than between prompt phrasings. If
the first candidate fails, change the model before rewriting the directive.

Both tiers currently point at **GLM-5.2** (`z-ai/glm-5.2`), per the client
decision of 2026-08-22. That is the model to measure first, and `AI_MODEL_FREE`
and `AI_MODEL_PREMIUM` are the levers if it does not hold up — the variables
stay separate precisely so a change is an env edit rather than a code edit.

Worth knowing before the first run: GLM is trained primarily on Chinese and
English. That does not predict the result either way, but it does mean the
result should not be assumed, and it is why measuring before promising matters
more here than it would with a model whose Bengali is well established.

## Results

_Nothing recorded yet. The ten-model study in `docs/ai_model_testing/` was run
entirely in English — the "bangladesh" label there is the market mode, not the
output language, so it says nothing about Bangla capability._
