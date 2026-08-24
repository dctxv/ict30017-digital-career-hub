# AI Model Testing

10 resumes × 1 mode (bangladesh) = **10 runs per model**
(International mode testing deferred to later phase)

> **Stale as of Iteration 7.** Every analysis file under this folder was
> generated against the Iteration 6 prompt. Iteration 7 changed the prompt text:
> the shared sections lost the Bangladesh formatting ceiling, both mode blocks
> gained a `MARKET RULES` heading, the `standard` key is no longer requested from
> the model, and both mode blocks were compressed. These outputs therefore no
> longer match what the service produces, and are kept as the Iteration 6 record
> rather than as a current comparison.
>
> Do not re-run all nine models to refresh them. Regenerate only the comparison
> subset the A/B harness uses. See `docs/darius_notes/ai_prompting_engineering.md`,
> Iteration 7, "Outstanding".

## Models Tested

| Model | Summary |
|-------|---------|
| [gemini_2.5_flash](gemini_2.5_flash/summary.md) | |
| [gemini_3.1_flash_lite](gemini_3.1_flash_lite/summary.md) | |
| [gemini_3_flash_preview](gemini_3_flash_preview/summary.md) | |
| [gemma_4_26b_a4b](gemma_4_26b_a4b/summary.md) | |
| [gpt_5.4_nano](gpt_5.4_nano/summary.md) | |
| [gpt_5_nano](gpt_5_nano/summary.md) | |
| [haiku_4.5](haiku_4.5/summary.md) | |
| [llama_3.3_70b](llama_3.3_70b/summary.md) | |
| [mistral_small_4](mistral_small_4/summary.md) | |

---

## Cross-Model Comparison

| Model | Avg tokens/s | Avg token count | Total cost ($) | Avg duration (s) |
|-------|-------------|-----------------|----------------|------------------|
| gemini_2.5_flash | | | | |
| gemini_3.1_flash_lite | | | | |
| gemini_3_flash_preview | | | | |
| gemma_4_26b_a4b | | | | |
| gpt_5.4_nano | | | | |
| gpt_5_nano | | | | |
| haiku_4.5 | | | | |
| llama_3.3_70b | | | | |
| mistral_small_4 | | | | |

---

## Folder Structure

```
docs/ai_model_testing/
  _template.md               ← copy this for each new analysis
  README.md                  ← this file (cross-model comparison)
  {model}/
    summary.md               ← all 10 bangladesh runs for this model
    bangladesh/
      {resume_name}.md       ← one file per resume
```

## File Format

Each analysis file uses YAML frontmatter for metadata:

```markdown
---
resume: tanvir
mode: bangladesh
model: gemini_3.1_flash_lite
date: 2026-05-15
metadata:
  tokens_per_second: 575.5
  token_count: 774
  cost_usd: 0.00133675
  duration_seconds: 1.3
---

## Analysis Output

[AI response here]
```

## Resumes Tested

1. tanvir - Finance/banking graduate
2. farhana - FMCG marketer (ACI Limited, IBA MBA)
3. maliha - Physics lecturer/researcher (PUST)
4. rashed - Structural engineer (CUET)
5-10. [Pending]
