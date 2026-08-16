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

Each file is a byte-identical copy of `ai-service/src/services/resumeReviewer.js`
as it stood at the source commit. They are reference material only — nothing
imports them, and they are deliberately not kept in sync with the live service.

To read the live prompt, see `ai-service/src/services/resumeReviewer.js`.
To recover any other historical version directly:

```
git show <commit>:ai-service/src/services/resumeReviewer.js
```

`git log --follow -- ai-service/src/services/resumeReviewer.js` lists every
commit that changed the prompt. The `--follow` flag matters: without it, git's
history simplification hides several of them.
