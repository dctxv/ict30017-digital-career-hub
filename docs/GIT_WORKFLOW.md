# Git Workflow Guide

This document explains how the team uses Git and GitHub to collaborate safely.

---

## The Short Version

1. **You each have your own branch** — always work on your branch, never on `main`.
2. When your work is ready, open a **Pull Request** into `main`.
3. **Darius or Isar will review and approve** before it gets merged.
4. That's it.

---

## Branch Structure

```
main
├── darius
├── isar
├── pubu
├── sineth
├── ian
└── shalitha
```

Each person works only on their own branch. When ready, they PR into `main`.

---

## Step-by-Step: Daily Workflow

### 1. Clone the repo (first time only)

```bash
git clone https://github.com/dctxv/ict30017-digital-career-hub.git
cd ict30017-digital-career-hub
```

### 2. Switch to your branch (first time, or after cloning)

```bash
git checkout darius   # use your own name
```

### 3. Before starting work, always sync your branch with `main`

This prevents your branch from drifting too far behind.

```bash
git checkout darius       # make sure you're on your branch
git merge origin/main     # pull in the latest from main
```

### 4. Do your work, then commit

```bash
git add .
git commit -m "add resume upload form"
```

Keep commit messages short and descriptive.

### 5. Push your work to GitHub

```bash
git push
```

---

## Step-by-Step: Opening a Pull Request

When your work is ready to be reviewed and merged into `main`:

1. Go to the repo on GitHub: `github.com/dctxv/ict30017-digital-career-hub`
2. You'll see a banner saying **"Compare & pull request"** — click it.
3. Make sure the **base branch is `main`**.
4. Fill in the PR template — describe what you changed and why.
5. Submit it. Darius or Isar will review it.

---

## What Happens During Review

- Darius or Isar will look through your changes.
- They may leave comments asking for small fixes — just make the changes, commit, and push. The PR updates automatically.
- Once approved, they'll merge it into `main`.
- **You do not merge your own PR.**

---

## How to Undo a Mistake

### Undo your last commit (keeps your changes, just un-commits them)

```bash
git reset --soft HEAD~1
```

### Undo a commit that's already been pushed (safe — creates a new "undo" commit)

```bash
git revert <commit-hash>
git push
```

> Find the commit hash with `git log --oneline`

### Throw away all local changes and go back to your last commit

```bash
git checkout .
```

---

## Common Questions

**Q: What if two of us edit the same file?**
Git will try to merge them automatically. If you both changed the same lines, it will flag a conflict — you fix it manually, commit the fix, and move on. Nothing is lost.

**Q: Can I commit directly to `main`?**
Please don't. Always work on your own branch and open a PR.

**Q: What if I accidentally commit to the wrong branch?**
Don't panic. Tell Darius or Isar. The history is never deleted — it can always be fixed.

**Q: How do I see what branch I'm on?**
```bash
git status
```

**Q: My push was rejected — what do I do?**
Someone else (or you on another machine) pushed to your branch since your last pull. Run:
```bash
git pull
```
Then push again.

---

## Quick Reference

| Action | Command |
|---|---|
| Check current branch | `git status` |
| Switch to your branch | `git checkout yourname` |
| Sync with main | `git merge origin/main` |
| Stage all changes | `git add .` |
| Commit | `git commit -m "message"` |
| Push | `git push` |
| View commit history | `git log --oneline` |
| Undo last commit | `git reset --soft HEAD~1` |
