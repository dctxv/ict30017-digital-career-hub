# Prompt Snapshots

Point-in-time copies of the resume reviewer system prompt, kept alongside the
iteration log in `../ai_prompting_engineering.md`.

The log describes each iteration in prose. These files are the actual prompt
text that produced the test results recorded against each iteration, so a
claim in the log can be checked against the thing it describes without
digging through git history.

| File | Iteration | Source commit | Prompt size |
| ---- | --------- | ------------- | ----------- |
| `iteration_04_resumeReviewer.js` | 4 | `1f110fd` (2026-04-14) | ~2,114 tokens |
| `iteration_06_resumeReviewer.js` | 6 | `9417938` (2026-08-04) | ~3,206 BD / ~2,478 INTL |
| `iteration_07_resumeReviewer.js` | 7 | `b877ccf` (2026-08-20) | ~2,918 BD / ~2,040 INTL |

Iteration 8 replaced the single-file prompt with composed modules under
`ai-service/src/prompt/`, so `iteration_07_resumeReviewer.js` is the last
snapshot this folder can hold as one file. From Iteration 8 onward the rendered
goldens under `ai-service/tests/golden/` are the point-in-time record.

Each file is a byte-identical copy of `ai-service/src/services/resumeReviewer.js`
as it stood at the source commit. They are reference material only — nothing
imports them, and they are deliberately not kept in sync with the live service.

For the *rendered* live prompt — the exact text sent to the model, with both
market blocks and all interpolated constants resolved — see the golden snapshots
under `ai-service/tests/golden/`. Those are regenerated and diffed as part of
any prompt change from Iteration 7 onward, so they track the live service; the
files here deliberately do not.

To read the live prompt source, see `ai-service/src/services/resumeReviewer.js`.
To recover any other historical version directly:

```
git show <commit>:ai-service/src/services/resumeReviewer.js
```

`git log --follow -- ai-service/src/services/resumeReviewer.js` lists every
commit that changed the prompt. The `--follow` flag matters: without it, git's
history simplification hides several of them.
