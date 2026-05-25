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


