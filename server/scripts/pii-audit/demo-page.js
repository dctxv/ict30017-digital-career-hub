/**
 * Renders the side-by-side page `npm run pii-preview -- <cv> --html out.html`
 * writes: the CV as the server extracted it on the left, the resume exactly as
 * the model provider receives it on the right, with every removed value and
 * the placeholder that replaced it highlighted.
 *
 * Built to be shown to someone who does not read code, so it states the
 * result in words and counts before the detail.
 */

const PLACEHOLDER = /\[(NAME|EMAIL|PHONE|ADDRESS|URL|ID|DATE OF BIRTH|PERSONAL)\]/g;

const PLACEHOLDER_LABELS = {
  NAME: ['name', 'names'],
  EMAIL: ['email address', 'email addresses'],
  PHONE: ['phone number', 'phone numbers'],
  ADDRESS: ['address part', 'address parts'],
  URL: ['link or handle', 'links and handles'],
  ID: ['ID number', 'ID numbers'],
  'DATE OF BIRTH': ['date of birth', 'dates of birth'],
  PERSONAL: ['personal detail', 'personal details'],
};

const PLACEHOLDER_NOTES = {
  NAME: 'candidate, parents, referees',
  PERSONAL: 'religion, gender, marital status, blood group',
};

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* ── Diff ───────────────────────────────────────────────────────────────── */

/** Longest-common-subsequence alignment of two arrays: [['same'|'del'|'add', a, b]]. */
function align(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) ops.push(['same', a[i++], b[j++]]);
    else if (dp[i + 1][j] >= dp[i][j + 1]) ops.push(['del', a[i++], null]);
    else ops.push(['add', null, b[j++]]);
  }
  while (i < n) ops.push(['del', a[i++], null]);
  while (j < m) ops.push(['add', null, b[j++]]);
  return ops;
}

/** Word-level diff of one changed stretch: segments for each side, marked where they differ. */
function wordDiff(before, after) {
  const tokens = (s) => s.match(/\s+|[^\s]+/g) ?? [];
  const left = [];
  const right = [];
  for (const [op, a, b] of align(tokens(before), tokens(after))) {
    if (op === 'same') {
      left.push({ text: a, marked: false });
      right.push({ text: b, marked: false });
    } else if (op === 'del') {
      left.push({ text: a, marked: true });
    } else {
      right.push({ text: b, marked: true });
    }
  }
  // Highlight "[DATE OF BIRTH]" or "Md. Abul Hossain" as one run, spaces included.
  for (const side of [left, right]) {
    for (let k = 1; k < side.length - 1; k++) {
      if (!side[k].marked && /^[^\S\n]+$/.test(side[k].text) && side[k - 1].marked && side[k + 1].marked) side[k].marked = true;
    }
  }
  return { left, right };
}

/**
 * One row per line of the extracted CV, lined up with the line the provider
 * receives in its place. A stretch where the line counts differ is one row.
 */
export function buildRows(original, masked) {
  const ops = align(original.split('\n'), masked.split('\n'));
  const rows = [];
  let pending = { del: [], add: [] };
  const flush = () => {
    const { del, add } = pending;
    pending = { del: [], add: [] };
    if (del.length === 0 && add.length === 0) return;
    const pairs = del.length === add.length
      ? del.map((line, k) => [line, add[k]])
      : [[del.join('\n'), add.join('\n')]];
    for (const [before, after] of pairs) rows.push({ changed: true, ...wordDiff(before, after) });
  };
  for (const [op, a, b] of ops) {
    if (op === 'same') {
      flush();
      rows.push({ changed: false, left: [{ text: a, marked: false }], right: [{ text: b, marked: false }] });
    } else {
      pending[op].push(op === 'del' ? a : b);
    }
  }
  flush();
  return rows;
}

/** How many of each placeholder the mask added (a CV template's own ones do not count). */
export function countPlaceholders(original, masked) {
  const count = (text) => {
    const out = {};
    for (const m of text.matchAll(PLACEHOLDER)) out[m[1]] = (out[m[1]] ?? 0) + 1;
    return out;
  };
  const before = count(original);
  const after = count(masked);
  const added = {};
  for (const [type, n] of Object.entries(after)) {
    const diff = n - (before[type] ?? 0);
    if (diff > 0) added[type] = diff;
  }
  return added;
}

/* ── Page ───────────────────────────────────────────────────────────────── */

const STYLE = `
:root {
  --paper: #f3f5f7;
  --surface: #ffffff;
  --ink: #17202a;
  --muted: #586473;
  --rule: #dce1e7;
  --gone-bg: #fbe3df;
  --gone-ink: #9a1b11;
  --ph-bg: #d9eee9;
  --ph-ink: #0a584e;
  --accent: #0a584e;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --paper: #0f1318;
    --surface: #161c23;
    --ink: #e3e8ee;
    --muted: #97a2b1;
    --rule: #28313b;
    --gone-bg: #3d1914;
    --gone-ink: #ffb3a7;
    --ph-bg: #0f3631;
    --ph-ink: #8fe0d2;
    --accent: #8fe0d2;
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --paper: #0f1318;
  --surface: #161c23;
  --ink: #e3e8ee;
  --muted: #97a2b1;
  --rule: #28313b;
  --gone-bg: #3d1914;
  --gone-ink: #ffb3a7;
  --ph-bg: #0f3631;
  --ph-ink: #8fe0d2;
  --accent: #8fe0d2;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font: 15px/1.55 "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
}
.page { max-width: 1320px; margin: 0 auto; padding: 32px 16px 48px; display: grid; gap: 24px; }
header { display: grid; gap: 12px; max-width: 72ch; }
.eyebrow { margin: 0; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
h1 { margin: 0; font-size: clamp(26px, 4vw, 34px); line-height: 1.15; font-weight: 600; text-wrap: balance; }
.verdict { margin: 0; font-size: 17px; }
.verdict strong { font-variant-numeric: tabular-nums; }
.meta { margin: 0; color: var(--muted); font-size: 13.5px; }
.meta code { font-family: "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace; font-size: 12.5px; }
.counts { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none; }
.counts li {
  display: flex; align-items: baseline; gap: 6px;
  padding: 5px 10px; border-radius: 999px;
  background: var(--ph-bg); color: var(--ph-ink); font-size: 13.5px;
}
.counts b { font-variant-numeric: tabular-nums; font-size: 15px; }
.counts small { color: var(--ph-ink); opacity: 0.8; font-size: 12px; }
.bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; }
.legend { display: flex; flex-wrap: wrap; gap: 8px 20px; margin: 0; color: var(--muted); font-size: 13.5px; }
.toggle { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
.toggle input { width: 16px; height: 16px; accent-color: var(--accent); }
.toggle input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.compare { background: var(--surface); border: 1px solid var(--rule); border-radius: 8px; overflow: hidden; }
.row { display: grid; grid-template-columns: 1fr 1fr; }
.row + .row { border-top: 1px solid var(--rule); }
.row.head { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 1; background: var(--surface); }
.row.head div { padding: 10px 14px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
.cell {
  padding: 3px 14px; min-width: 0;
  font: 13px/1.6 "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace;
  white-space: pre-wrap; overflow-wrap: anywhere;
}
.cell + .cell, .row.head div + div { border-left: 1px solid var(--rule); }
.row.same .cell { color: var(--muted); }
.row.changed .cell { padding-block: 6px; }
.gone { background: var(--gone-bg); color: var(--gone-ink); text-decoration: line-through; text-decoration-thickness: 1px; border-radius: 3px; padding: 0 2px; }
.ph { background: var(--ph-bg); color: var(--ph-ink); font-weight: 600; border-radius: 3px; padding: 0 2px; }
.only-changed .row.same { display: none; }
footer { color: var(--muted); font-size: 13px; max-width: 80ch; display: grid; gap: 6px; }
footer p { margin: 0; }
footer code { font-family: "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace; font-size: 12px; }
@media (max-width: 760px) {
  .row { grid-template-columns: 1fr; }
  .row.head { display: none; }
  .cell + .cell { border-left: 0; }
  .cell::before { content: attr(data-side); display: block; font: 600 10.5px/1.8 "IBM Plex Sans", system-ui, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
  .row.same .cell + .cell { display: none; }
  .row.same .cell::before { content: none; }
}
`;

const SCRIPT = `
(() => {
  const box = document.getElementById('only-changed');
  const compare = document.getElementById('compare');
  if (!box || !compare) return;
  const apply = () => compare.classList.toggle('only-changed', box.checked);
  box.addEventListener('change', apply);
  apply();
})();
`;

/** Consecutive marked segments become one highlight, so a value reads as a unit. */
function renderSegments(segments, className) {
  const runs = [];
  for (const { text, marked } of segments) {
    const last = runs[runs.length - 1];
    if (last && last.marked === marked) last.text += text;
    else runs.push({ text, marked });
  }
  return runs
    .map(({ text, marked }) => {
      if (!marked || !text.trim()) return escapeHtml(text);
      // Keep surrounding spaces outside the highlight.
      const [, lead, core, trail] = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
      return `${escapeHtml(lead)}<span class="${className}">${escapeHtml(core)}</span>${escapeHtml(trail)}`;
    })
    .join('') || '&#8203;';
}

/**
 * The page body (no <html>/<head>): what an artifact viewer wraps itself.
 * `document` adds the wrapper for a file opened straight in a browser.
 */
export function renderDemoBody({ file, uploadedAs, nameHint, original, masked, command }) {
  const rows = buildRows(original, masked);
  const added = countPlaceholders(original, masked);
  const total = Object.values(added).reduce((a, b) => a + b, 0);
  const changedRows = rows.filter((r) => r.changed).length;

  const chips = Object.keys(PLACEHOLDER_LABELS)
    .filter((type) => added[type])
    .map((type) => {
      const [one, many] = PLACEHOLDER_LABELS[type];
      const note = PLACEHOLDER_NOTES[type] ? ` <small>${escapeHtml(PLACEHOLDER_NOTES[type])}</small>` : '';
      return `<li><b>${added[type]}</b> ${escapeHtml(added[type] === 1 ? one : many)}${note}</li>`;
    })
    .join('');

  const body = rows.map((row) => `
<div class="row ${row.changed ? 'changed' : 'same'}">
  <div class="cell" data-side="Uploaded CV">${renderSegments(row.left, 'gone')}</div>
  <div class="cell" data-side="Sent to the AI">${renderSegments(row.right, 'ph')}</div>
</div>`).join('');

  const verdict = total > 0
    ? `<strong>${total}</strong> personal ${total === 1 ? 'detail was' : 'details were'} replaced with placeholders before the request left the server. The rest of the CV reaches the AI unchanged, so the review still has everything it needs.`
    : 'No personal details were found to replace in this CV.';

  return `<title>What the AI Sees</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;600&display=swap">
<style>${STYLE}</style>
<div class="page">
  <header>
    <p class="eyebrow">CV privacy check</p>
    <h1>What the AI sees when this CV is uploaded</h1>
    <p class="verdict">${verdict}</p>
    <p class="meta">File <code>${escapeHtml(file)}</code> · uploaded as ${escapeHtml(uploadedAs)} · name read from the layout: ${escapeHtml(nameHint ?? 'none')} · ${changedRows} of ${rows.length} lines changed</p>
    ${chips ? `<ul class="counts" aria-label="What was replaced">${chips}</ul>` : ''}
  </header>
  <div class="bar">
    <p class="legend"><span><span class="gone">struck through</span> removed from the CV</span><span><span class="ph">[PLACEHOLDER]</span> what the AI gets instead</span></p>
    <label class="toggle" for="only-changed"><input type="checkbox" id="only-changed"> Show only lines with personal details</label>
  </div>
  <div class="compare" id="compare">
    <div class="row head"><div>Uploaded CV, as the server reads it</div><div>Sent to the AI</div></div>
    ${body}
  </div>
  <footer>
    <p>Nothing was sent to an AI provider to make this page. The upload path ran for real (text extraction, clean-up, masking), and the outgoing request was captured just before it would have left the server.</p>
    <p>The right-hand column is the resume part of that request, word for word. The rest of the request is the app's own instructions, which contain no CV data.</p>
    ${command ? `<p>Made with <code>${escapeHtml(command)}</code></p>` : ''}
  </footer>
</div>
<script>${SCRIPT}</script>
`;
}

/** A complete HTML document, for a file opened straight in a browser. */
export function renderDemoDocument(options) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
</head>
<body>
${renderDemoBody(options)}
</body>
</html>
`;
}
