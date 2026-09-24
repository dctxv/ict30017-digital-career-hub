/**
 * PII audit core: runs one corpus resume through the production path and
 * scores what the model provider would have received.
 *
 * Used by the CLI (run-audit.js, which writes the reports) and by the corpus
 * regression test (corpus.test.js, which fails CI on any leak or loss).
 *
 * For a resume this runs server/src/utils/fileParser.extractResume,
 * sanitiseResumeText, the name hint merged into the identity exactly as the
 * upload routes do, then ai-service analyzeResume — with global fetch stubbed,
 * recording the exact request body the OpenAI SDK tried to POST. Nothing below
 * the HTTP boundary is mocked.
 *
 * Every ground-truth item (corpus.js) is classified against the text sent:
 *   masked   present in the extracted text, gone from the request
 *   partial  a name with some of its words still in the request
 *   leaked   still in the request
 *   absent   not in the extracted text at all (extraction lost it), so the
 *            mask cannot be judged on it
 *
 * And the other direction, over-masking, two ways: the `keep` phrases must
 * survive, and a word-by-word diff of the text before and after masking must
 * remove nothing that is not one of the resume's ground-truth items.
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// jszip comes with mammoth, a direct server dependency; used only to write DOCX twins.
import JSZip from 'jszip';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const CORPUS_DIR = path.resolve(HERE, '../../../docs/samples/pii_corpus');
const REPO_DIR = path.resolve(HERE, '../../..');

// The client reads these at call time; nothing is sent to a real endpoint.
process.env.GOOGLE_AI_API_KEY ??= 'audit-key-never-sent';
process.env.AI_MODEL_FREE ??= 'audit-model';
process.env.AI_MODEL_PREMIUM ??= 'audit-model';

const { extractResume } = await import('../../src/utils/fileParser.js');
const { withNameHint } = await import('../../src/utils/maskIdentity.js');
const { sanitiseResumeText } = await import('../../src/utils/sanitise.js');
const { redactPii } = await import('../../src/utils/piiRedactor.js');
const { analyzeResume, inferNameFromHeader, maskPii, inspectMaskedPii, resumeMaskContext } = await import('ai-service');

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
function classify(item, beforeNorm, afterNorm, keep = []) {
  if (isNameLike(item)) {
    // A name word inside content the review must keep is not the name: "Cook"
    // in "Line Cook", "Hill" in "Box Hill Institute". Those phrases are taken
    // out of both sides before the words of the name are looked for.
    // Longest first, so "Store Manager" cannot break up "rose to Store Manager".
    const phrases = [...keep].sort((x, y) => y.length - x.length);
    const strip = (hay) => phrases.reduce((h, phrase) => h.replace(new RegExp(pattern(phrase).source, 'gu'), ' '), hay);
    beforeNorm = strip(beforeNorm);
    afterNorm = strip(afterNorm);
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

export async function writeDocx(entry, dir) {
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

/**
 * A corpus entry is scored from the PDF built for it, plus a DOCX twin. An
 * entry with a `file` (team-samples.js) is a CV already in the repo, scored
 * as it is, with no twin.
 */
export async function auditEntry(entry, docxDir) {
  const source = entry.file ? path.join(REPO_DIR, entry.file) : path.join(CORPUS_DIR, `${entry.id}.pdf`);
  const { text: rawText, nameHint } = await extractResume(source);
  const cleanText = sanitiseResumeText(rawText);
  const beforeNorm = norm(cleanText);
  const marketMode = marketFor(entry);

  // The identities the upload routes build (resume.js, preparation.js).
  const guestIdentity = withNameHint(null, nameHint);
  const accountIdentity = withNameHint(entry.account, nameHint);

  const guest = await captureOutbound(cleanText, { identity: guestIdentity, marketMode });
  const account = await captureOutbound(cleanText, { identity: accountIdentity, marketMode });
  // The redactor as the resume route runs it: with the identity and the
  // values the outbound mask removed from this CV.
  const maskedValues = inspectMaskedPii(cleanText, resumeMaskContext(cleanText, guestIdentity), { collectValues: true }).values;
  const echoed = redactPii(cleanText, guestIdentity, maskedValues);

  const guestNorm = norm(guest.userText);
  const accountNorm = norm(account.userText);
  const echoNorm = norm(echoed);

  // DOCX twin, guest only: the comparison is about the header-name guess.
  let docxText = null;
  let docxBefore = null;
  let docxAfter = null;
  if (!entry.file) {
    const docx = await extractResume(await writeDocx(entry, docxDir));
    docxText = sanitiseResumeText(docx.text);
    const docxGuest = await captureOutbound(docxText, { identity: withNameHint(null, docx.nameHint), marketMode });
    docxBefore = norm(docxText);
    docxAfter = norm(docxGuest.userText);
  }

  const items = entry.pii.map((item) => ({
    ...item,
    guest: classify(item, beforeNorm, guestNorm, entry.keep),
    account: classify(item, beforeNorm, accountNorm, entry.keep),
    redactorOnEcho: classify(item, beforeNorm, echoNorm, entry.keep),
    docxGuest: docxText === null ? { status: 'not run' } : classify(item, docxBefore, docxAfter, entry.keep),
  }));

  // The same mask contexts resumeReviewer.buildMaskContext builds, so a lost
  // value can be shown as it was actually rewritten rather than just counted.
  const headerName = inferNameFromHeader(cleanText);
  const contexts = {
    guest: { ...guestIdentity, extraNames: [...(guestIdentity?.extraNames ?? []), headerName].filter(Boolean) },
    account: { ...accountIdentity, extraNames: [...(accountIdentity?.extraNames ?? []), headerName].filter(Boolean) },
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

  const unexplained = {
    guest: unexplainedRemovals(cleanText, resumeBlock(guest.userText), entry),
    account: unexplainedRemovals(cleanText, resumeBlock(account.userText), entry),
  };

  const outbound = [
    `# ${entry.id} — ${entry.career} (${entry.country}), layout: ${entry.layout}`,
    '',
    `Name read from the PDF's largest type: ${JSON.stringify(nameHint)}`,
    `Header name inferred from PDF text: ${JSON.stringify(inferNameFromHeader(cleanText))}`,
    `Header name inferred from DOCX text: ${docxText === null ? '(no DOCX twin)' : JSON.stringify(inferNameFromHeader(docxText))}`,
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
  return {
    outbound,
    id: entry.id,
    career: entry.career,
    sector: entry.sector,
    country: entry.country,
    layout: entry.layout,
    pdfLinesExtracted: rawText.split('\n').filter(Boolean).length,
    nameHintPdf: nameHint,
    headerNamePdf: inferNameFromHeader(cleanText),
    headerNameDocx: docxText === null ? null : inferNameFromHeader(docxText),
    maskLog: { guest: guest.maskLog, account: account.maskLog },
    items,
    keep,
    unexplained,
  };
}

/* ── Over-masking: what was removed that is not personal ────────────────── */

/** The resume as it was placed in the user message. */
const resumeBlock = (userText) => (userText.split('<RESUME>')[1] ?? userText).split('</RESUME>')[0];

/** Word-level longest-common-subsequence diff: the runs of `a` not in `b`. */
function removedRuns(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const runs = [];
  let i = 0;
  let j = 0;
  let del = [];
  let ins = [];
  const flush = () => {
    if (del.length) runs.push({ removed: del.join(' '), became: ins.join(' ') });
    del = [];
    ins = [];
  };
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      flush();
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      del.push(a[i++]);
    } else {
      ins.push(b[j++]);
    }
  }
  while (i < n) del.push(a[i++]);
  while (j < m) ins.push(b[j++]);
  flush();
  return runs;
}

/**
 * Every run of words the mask removed that no ground-truth item accounts for.
 * A run is accounted for when it is part of an item or contains one (or, for
 * a name, one of its words). A run that differs only in Unicode normalisation
 * is not a removal at all.
 */
export function unexplainedRemovals(before, after, entry) {
  const tokens = (text) => text.split(/\s+/).filter(Boolean);
  const out = [];
  for (const run of removedRuns(tokens(before), tokens(after))) {
    const removed = norm(run.removed.replace(/\[(?:NAME|EMAIL|PHONE|ADDRESS|URL|ID|DATE OF BIRTH|PERSONAL)\]/g, ' '));
    if (!removed || removed === norm(run.became)) continue;
    const accounted = entry.pii.some((item) => {
      const value = norm(item.value);
      if (!value) return false;
      if (value.includes(removed) || contains(removed, item.value)) return true;
      return isNameLike(item) && nameTokens(item.value).some((t) => contains(removed, t));
    });
    if (!accounted) out.push(run);
  }
  return out;
}

