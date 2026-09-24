/**
 * PII mask audit: what personal information in a real uploaded resume reaches
 * the model provider?
 *
 * For every PDF in docs/samples/pii_corpus this runs the production path end
 * to end — server/src/utils/fileParser.extractText, sanitiseResumeText, then
 * ai-service analyzeResume — with global fetch stubbed, and records the exact
 * request body the OpenAI SDK tried to POST. Nothing below the HTTP boundary
 * is mocked, so the result is what the provider would actually receive.
 *
 * Two scenarios per resume:
 *   guest    no account, so the mask has patterns and the CV-header name guess
 *   account  logged in, with the account row from corpus.js as the identity
 *
 * Every ground-truth item in corpus.js is then classified against the text
 * that was sent:
 *   masked   present in the extracted text, gone from the request
 *   partial  a name with some of its words still in the request
 *   leaked   still in the request
 *   absent   not in the extracted text at all (extraction mangled it), so the
 *            mask cannot be judged on it
 *
 * The same resumes are also written out as DOCX and run as a guest, because
 * the two formats extract differently and that difference turns out to decide
 * whether a guest's name is masked.
 *
 * Run: node server/scripts/pii-audit/run-audit.js
 * Writes: docs/samples/pii_corpus/results.json
 *         docs/samples/pii_corpus/RESULTS.md
 *         docs/samples/pii_corpus/outbound/<id>.txt
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// jszip comes with mammoth, a direct server dependency; used only to write DOCX twins.
import JSZip from 'jszip';
import { CORPUS, CATEGORY_LABELS } from './corpus.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORPUS_DIR = path.resolve(HERE, '../../../docs/samples/pii_corpus');
const OUTBOUND_DIR = path.join(CORPUS_DIR, 'outbound');

// The client reads these at call time; nothing is sent to a real endpoint.
process.env.GOOGLE_AI_API_KEY ??= 'audit-key-never-sent';
process.env.AI_MODEL_FREE ??= 'audit-model';
process.env.AI_MODEL_PREMIUM ??= 'audit-model';

const { extractText } = await import('../../src/utils/fileParser.js');
const { sanitiseResumeText } = await import('../../src/utils/sanitise.js');
const { redactPii } = await import('../../src/utils/piiRedactor.js');
const { analyzeResume, inferNameFromHeader, maskPii } = await import('ai-service');

/* ── Capturing the wire ─────────────────────────────────────────────────── */

let sentBodies = [];
let maskLogLines = [];

const realFetch = globalThis.fetch;
const realLog = console.log;
const realWarn = console.warn;
const realError = console.error;

function quietServices() {
  // The services log every step; keep only the mask's own summary line.
  console.log = (...args) => {
    const line = args.join(' ');
    if (line.startsWith('[pii-mask]')) maskLogLines.push(line);
  };
  console.warn = () => {};
  console.error = () => {};
  globalThis.fetch = async (_url, init) => {
    sentBodies.push(JSON.parse(init.body));
    // Any well-formed completion will do: the request has already been
    // captured, and a review that fails to parse afterwards is irrelevant.
    return new Response(JSON.stringify({
      id: 'audit', choices: [{ index: 0, message: { role: 'assistant', content: '{}' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 1, completion_tokens: 1 },
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
}

function restoreServices() {
  console.log = realLog;
  console.warn = realWarn;
  console.error = realError;
  globalThis.fetch = realFetch;
}

/** Runs one resume review and returns the user-role text that was sent. */
async function captureOutbound(cleanText, { identity, marketMode }) {
  sentBodies = [];
  maskLogLines = [];
  quietServices();
  try {
    await analyzeResume(cleanText, { identity, marketMode }).catch(() => {});
  } finally {
    restoreServices();
  }
  if (sentBodies.length === 0) throw new Error('nothing reached the wire, so nothing was measured');
  const userText = sentBodies
    .flatMap((body) => body.messages)
    .filter((message) => message.role === 'user')
    .map((message) => (typeof message.content === 'string' ? message.content : JSON.stringify(message.content)))
    .join('\n');
  return { userText, maskLog: maskLogLines.join(' ; ') };
}

/* ── Matching ───────────────────────────────────────────────────────────── */

const toAsciiDigits = (s) => s
  .replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6))
  .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

/**
 * The form used on BOTH sides of every comparison: case, punctuation, numeral
 * alphabet and combining marks all ignored.
 *
 * Each of those is there because the text the model receives is not the text
 * the candidate typed, and a value is still disclosed if it arrives altered:
 *   - the sanitiser turns curly quotes and dashes into spaces, so "O’Connor"
 *     arrives as "O Connor";
 *   - a letter-spaced heading extracts as "M A R I A  S A N T O S";
 *   - Bangla extracts with its vowel signs reordered and a space between
 *     every cluster ("ফা র জা না"), so marks are dropped and the letters that
 *     remain are compared in order.
 * Without this the audit would score an altered-but-readable name as masked.
 */
const norm = (s) => toAsciiDigits(String(s).normalize('NFKC'))
  .toLowerCase()
  .replace(/\p{M}/gu, '')
  .replace(/[^\p{L}\p{N}@]+/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const WORD = '[\\p{L}\\p{N}]';
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The value's letters and digits in order, with at most one space between any
 * two of them, bounded on both sides. Covers every grouping of a number
 * ('0491 570 156', '0491570156') and every spacing of a word.
 */
function pattern(value) {
  const chars = [...norm(value).replace(/[^\p{L}\p{N}@]/gu, '')];
  return new RegExp(`(?<!${WORD})${chars.map(escapeRe).join(' ?')}(?!${WORD})`, 'u');
}

const digitCount = (s) => (toAsciiDigits(s).match(/\d/g) ?? []).length;
const contains = (haystackNorm, value) => pattern(value).test(haystackNorm);

/** Honorifics and particles that identify no one on their own. */
const PARTICLES = new Set([
  'md', 'mst', 'mohammad', 'mohammed', 'muhammad', 'engr', 'dr', 'prof', 'late', 'ca', 'mr', 'mrs', 'ms',
  'মোঃ', 'মোছাঃ', 'মোসাঃ',
]);

const isNameLike = (item) => ['name', 'family'].includes(item.cat)
  || (item.cat === 'referee' && digitCount(item.value) < 4 && !item.value.includes('@'));

const nameTokens = (value) => norm(value).split(' ').filter((t) => [...t].length >= 3 && !PARTICLES.has(t));

/**
 * @returns {{status: 'masked'|'partial'|'leaked'|'absent', left?: string[]}}
 */
function classify(item, beforeNorm, afterNorm) {
  if (isNameLike(item)) {
    const tokens = nameTokens(item.value);
    const fullBefore = contains(beforeNorm, item.value);
    const tokensBefore = tokens.filter((t) => contains(beforeNorm, t));
    if (!fullBefore && tokensBefore.length === 0) return { status: 'absent' };
    if (fullBefore && contains(afterNorm, item.value)) return { status: 'leaked', left: tokensBefore };
    const left = tokensBefore.filter((t) => contains(afterNorm, t));
    if (left.length === tokensBefore.length && left.length > 0) return { status: 'leaked', left };
    if (left.length > 0) return { status: 'partial', left };
    return { status: 'masked' };
  }
  if (!contains(beforeNorm, item.value)) return { status: 'absent' };
  return { status: contains(afterNorm, item.value) ? 'leaked' : 'masked' };
}

/* ── DOCX twin ──────────────────────────────────────────────────────────── */

/** Flattens a corpus entry into the paragraphs a Word version would have. */
function docxParagraphs({ cv }) {
  const out = [cv.name];
  if (cv.title) out.push(cv.title);
  for (const c of cv.contacts) out.push(c.label ? `${c.label}: ${c.value}` : c.value);
  out.push(...(cv.address ?? []));
  for (const s of cv.sections) {
    out.push(s.h);
    if (s.p) out.push(s.p);
    for (const j of s.jobs ?? []) {
      out.push([j.role, j.org, j.place, j.dates].filter(Boolean).join(' — '));
      out.push(...(j.bullets ?? []));
    }
    out.push(...(s.list ?? []));
    for (const [k, v] of s.kv ?? []) out.push(`${k}: ${v}`);
    for (const r of s.refs ?? []) out.push(r.name, `${r.role}, ${r.org}`, ...r.contact);
    if (s.sign) out.push(`(${s.sign})`);
  }
  return out;
}

async function writeDocx(entry, dir) {
  const xmlEsc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const body = docxParagraphs(entry)
    .map((p) => `<w:p><w:r><w:t xml:space="preserve">${xmlEsc(p)}</w:t></w:r></w:p>`)
    .join('');
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`);
  const file = path.join(dir, `${entry.id}.docx`);
  await fs.writeFile(file, await zip.generateAsync({ type: 'nodebuffer' }));
  return file;
}

/* ── Run ────────────────────────────────────────────────────────────────── */

const marketFor = (entry) => (entry.country.startsWith('Bangladesh') ? 'bangladesh' : 'international');

async function auditEntry(entry, docxDir) {
  const rawText = await extractText(path.join(CORPUS_DIR, `${entry.id}.pdf`));
  const cleanText = sanitiseResumeText(rawText);
  const beforeNorm = norm(cleanText);
  const marketMode = marketFor(entry);

  const guest = await captureOutbound(cleanText, { identity: null, marketMode });
  const account = await captureOutbound(cleanText, { identity: entry.account, marketMode });
  const echoed = redactPii(cleanText);

  const guestNorm = norm(guest.userText);
  const accountNorm = norm(account.userText);
  const echoNorm = norm(echoed);

  // DOCX twin, guest only: the comparison is about the header-name guess.
  const docxText = sanitiseResumeText(await extractText(await writeDocx(entry, docxDir)));
  const docxGuest = await captureOutbound(docxText, { identity: null, marketMode });
  const docxBefore = norm(docxText);
  const docxAfter = norm(docxGuest.userText);

  const items = entry.pii.map((item) => ({
    ...item,
    guest: classify(item, beforeNorm, guestNorm),
    account: classify(item, beforeNorm, accountNorm),
    redactorOnEcho: classify(item, beforeNorm, echoNorm),
    docxGuest: classify(item, docxBefore, docxAfter),
  }));

  // The same mask contexts resumeReviewer.buildMaskContext builds, so a lost
  // value can be shown as it was actually rewritten rather than just counted.
  const headerName = inferNameFromHeader(cleanText);
  const contexts = {
    guest: { extraNames: [headerName].filter(Boolean) },
    account: { ...entry.account, extraNames: [headerName].filter(Boolean) },
  };
  const rewrite = (value, context) => {
    const at = cleanText.toLowerCase().indexOf(value.toLowerCase());
    const window = at >= 0 ? cleanText.slice(at, at + value.length + 12) : value;
    return maskPii(window, context).replace(/\s+/g, ' ').trim();
  };

  const keep = entry.keep.map((value) => {
    const present = contains(beforeNorm, value);
    const outcome = (afterNorm) => (!present ? 'absent' : contains(afterNorm, value) ? 'kept' : 'lost');
    const result = { value, guest: outcome(guestNorm), account: outcome(accountNorm) };
    if (result.guest === 'lost') result.guestRewrite = rewrite(value, contexts.guest);
    if (result.account === 'lost') result.accountRewrite = rewrite(value, contexts.account);
    return result;
  });

  const outbound = [
    `# ${entry.id} — ${entry.career} (${entry.country}), layout: ${entry.layout}`,
    '',
    `Header name inferred from PDF text: ${JSON.stringify(inferNameFromHeader(cleanText))}`,
    `Header name inferred from DOCX text: ${JSON.stringify(inferNameFromHeader(docxText))}`,
    `Extracted PDF text: ${rawText.split('\n').filter(Boolean).length} line(s) before sanitising, ${cleanText.split('\n').filter(Boolean).length} after`,
    '',
    '## Guest — mask log',
    guest.maskLog,
    '',
    '## Guest — user message as sent to the provider',
    guest.userText,
    '',
    '## Logged in — account identity',
    JSON.stringify(entry.account),
    '',
    '## Logged in — mask log',
    account.maskLog,
    '',
    '## Logged in — user message as sent to the provider',
    account.userText,
    '',
  ].join('\n');
  await fs.writeFile(path.join(OUTBOUND_DIR, `${entry.id}.txt`), outbound);

  return {
    id: entry.id,
    career: entry.career,
    sector: entry.sector,
    country: entry.country,
    layout: entry.layout,
    pdfLinesExtracted: rawText.split('\n').filter(Boolean).length,
    headerNamePdf: inferNameFromHeader(cleanText),
    headerNameDocx: inferNameFromHeader(docxText),
    maskLog: { guest: guest.maskLog, account: account.maskLog },
    items,
    keep,
  };
}

/* ── Report ─────────────────────────────────────────────────────────────── */

const SCENARIOS = ['guest', 'account', 'docxGuest', 'redactorOnEcho'];

function tally(results) {
  const byCat = {};
  for (const r of results) {
    for (const item of r.items) {
      const cat = (byCat[item.cat] ??= Object.fromEntries(SCENARIOS.map((s) => [s, { masked: 0, partial: 0, leaked: 0, absent: 0 }])));
      for (const s of SCENARIOS) cat[s][item[s].status] += 1;
    }
  }
  return byCat;
}

const pct = (n, d) => (d === 0 ? '—' : `${Math.round((100 * n) / d)}%`);
const cell = (t) => {
  const judged = t.masked + t.partial + t.leaked;
  return `${t.masked}/${judged} (${pct(t.masked, judged)})${t.partial ? ` · ${t.partial} partial` : ''}`;
};
const mark = { masked: '✅', partial: '🟡', leaked: '❌', absent: '⚪' };

function renderMarkdown(results) {
  const byCat = tally(results);
  const lines = [];
  lines.push('# PII mask audit — raw results');
  lines.push('');
  lines.push('Generated by `node server/scripts/pii-audit/run-audit.js`. The analysis is in `docs/qa/PII_MASK_AUDIT.md`.');
  lines.push('');
  lines.push('Each cell is items fully masked / items present in the extracted text. ✅ masked · 🟡 partly masked (some name words left) · ❌ leaked · ⚪ not in the extracted text, so not judged.');
  lines.push('');
  lines.push('## By category');
  lines.push('');
  lines.push('| Category | PDF, guest | PDF, logged in | DOCX, guest | Inbound redactor, if the model echoed it |');
  lines.push('|---|---|---|---|---|');
  for (const [cat, label] of Object.entries(CATEGORY_LABELS)) {
    const t = byCat[cat];
    if (!t) continue;
    lines.push(`| ${label} | ${cell(t.guest)} | ${cell(t.account)} | ${cell(t.docxGuest)} | ${cell(t.redactorOnEcho)} |`);
  }
  const total = (s) => Object.values(byCat).reduce((acc, t) => {
    for (const k of Object.keys(acc)) acc[k] += t[s][k];
    return acc;
  }, { masked: 0, partial: 0, leaked: 0, absent: 0 });
  lines.push(`| **All** | **${cell(total('guest'))}** | **${cell(total('account'))}** | **${cell(total('docxGuest'))}** | **${cell(total('redactorOnEcho'))}** |`);
  lines.push('');

  lines.push('## Content kept for the review');
  lines.push('');
  lines.push('The value, then what the text starting at that value looked like after masking.');
  lines.push('');
  lines.push('| Resume | Guest kept | Logged in kept | Lost as a guest | Lost when logged in |');
  lines.push('|---|---|---|---|---|');
  for (const r of results) {
    const count = (s) => `${r.keep.filter((k) => k[s] === 'kept').length}/${r.keep.filter((k) => k[s] !== 'absent').length}`;
    const lost = (s) => r.keep.filter((k) => k[s] === 'lost').map((k) => `\`${k.value}\` → \`${k[`${s}Rewrite`]}\``).join('<br>') || '—';
    lines.push(`| ${r.id} | ${count('guest')} | ${count('account')} | ${lost('guest')} | ${lost('account')} |`);
  }
  lines.push('');

  lines.push('## Per resume');
  for (const r of results) {
    lines.push('');
    lines.push(`### ${r.id} — ${r.career}, ${r.country}`);
    lines.push('');
    lines.push(`Layout \`${r.layout}\` · PDF extracted as ${r.pdfLinesExtracted} line(s) · header name guessed from PDF: ${r.headerNamePdf ? `\`${r.headerNamePdf}\`` : '**none**'} · from DOCX: ${r.headerNameDocx ? `\`${r.headerNameDocx}\`` : '**none**'}`);
    lines.push('');
    lines.push('| Category | Value | PDF guest | PDF logged in | DOCX guest | Redactor on echo |');
    lines.push('|---|---|---|---|---|---|');
    for (const item of r.items) {
      const show = (res) => `${mark[res.status]}${res.status === 'partial' ? ` left: ${res.left.join(', ')}` : ''}`;
      lines.push(`| ${CATEGORY_LABELS[item.cat]}${item.note ? ` (${item.note})` : ''} | \`${item.value}\` | ${show(item.guest)} | ${show(item.account)} | ${show(item.docxGuest)} | ${show(item.redactorOnEcho)} |`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

async function main() {
  await fs.mkdir(OUTBOUND_DIR, { recursive: true });
  const docxDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pii-audit-'));

  const results = [];
  for (const entry of CORPUS) {
    results.push(await auditEntry(entry, docxDir));
    realLog(`audited ${entry.id}`);
  }

  await fs.writeFile(path.join(CORPUS_DIR, 'results.json'), `${JSON.stringify(results, null, 2)}\n`);
  await fs.writeFile(path.join(CORPUS_DIR, 'RESULTS.md'), renderMarkdown(results));
  await fs.rm(docxDir, { recursive: true, force: true });

  const byCat = tally(results);
  realLog('\ncategory            guest        account      docx-guest   redactor-echo');
  for (const [cat, t] of Object.entries(byCat)) {
    realLog(`${cat.padEnd(18)}  ${SCENARIOS.map((s) => cell(t[s]).padEnd(12)).join(' ')}`);
  }
}

main().catch((err) => {
  restoreServices();
  console.error(err);
  process.exitCode = 1;
});
