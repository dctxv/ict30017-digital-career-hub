# AI Testing Output

Generated output root for `ai-service/scripts/batch-review.js`. Each run writes
one markdown file per resume per mode per model, plus a `summary.md` per model:

```
ai_testing/
  {model}/
    summary.md
    bangladesh/{resume_name}.md
    international/{resume_name}.md
```

Nothing here is hand-written. The curated copies that the report draws on live
in `docs/ai_model_testing/`.

## Stale as of Iteration 7

Every file under this folder was generated against the Iteration 6 prompt.
Iteration 7 changed the prompt text: the shared sections lost the Bangladesh
formatting ceiling, both mode blocks gained a `MARKET RULES` heading, the
`standard` key is no longer requested from the model, and both mode blocks were
compressed. These outputs no longer correspond to what the service produces.

They are kept as the Iteration 6 record. Do not re-run all nine models to
refresh them - regenerate only the comparison subset the A/B harness uses:

```
node ai-service/scripts/batch-review.js <resume.txt> --mode both --models <model1,model2>
```

See `docs/darius_notes/ai_prompting_engineering.md`, Iteration 7,
"Outstanding", for what that comparison still needs to establish.
