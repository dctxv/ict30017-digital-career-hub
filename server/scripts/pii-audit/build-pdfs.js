/**
 * Renders the PII audit corpus (corpus.js) to real PDFs.
 *
 * Each resume is laid out as HTML in one of five styles that imitate how CVs
 * actually arrive — a Word-style single column, a Canva-style sidebar, the
 * traditional Bangladeshi format with a personal-details table, a banner
 * header with icon glyphs, and a table-based header — and printed to PDF by
 * Chromium. Layout matters to the audit: the text the mask sees is whatever
 * pdfjs pulls back out of the file, and that depends on how the page was built.
 *
 * Needs Playwright with a Chromium build. It is not a project dependency; the
 * generated PDFs are committed so the audit itself runs without it.
 *
 * Run: node server/scripts/pii-audit/build-pdfs.js
 * Output: docs/samples/pii_corpus/<id>.pdf
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CORPUS } from './corpus.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(HERE, '../../../docs/samples/pii_corpus');

/** Playwright from the project if present, otherwise from the global install. */
function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require('playwright');
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim();
    return require(path.join(globalRoot, 'playwright'));
  }
}

/* ── HTML helpers ───────────────────────────────────────────────────────── */

const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function renderJobs(jobs) {
  return jobs.map((job) => `
    <div class="job">
      <div class="job-head">
        <div><span class="role">${esc(job.role)}</span>${job.org ? ` <span class="org">— ${esc(job.org)}</span>` : ''}${job.place ? `<span class="place">, ${esc(job.place)}</span>` : ''}</div>
        ${job.dates ? `<div class="dates">${esc(job.dates)}</div>` : ''}
      </div>
      ${job.bullets?.length ? `<ul>${job.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
    </div>`).join('');
}

function renderKv(pairs) {
  return `<table class="kv">${pairs.map(([k, v]) => `<tr><td class="k">${esc(k)}</td><td class="colon">:</td><td>${esc(v)}</td></tr>`).join('')}</table>`;
}

function renderRefs(refs) {
  return `<div class="refs">${refs.map((ref) => `
    <div class="ref">
      <div class="ref-name">${esc(ref.name)}</div>
      <div>${esc(ref.role)}${ref.org ? `, ${esc(ref.org)}` : ''}</div>
      ${ref.contact.map((c) => `<div>${esc(c)}</div>`).join('')}
    </div>`).join('')}</div>`;
}

function renderSection(section, { inlineList = false } = {}) {
  let body = '';
  if (section.p) body += `<p>${esc(section.p)}</p>`;
  if (section.jobs) body += renderJobs(section.jobs);
  if (section.list) {
    body += inlineList
      ? `<p>${section.list.map(esc).join(' • ')}</p>`
      : `<ul class="list">${section.list.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
  }
  if (section.kv) body += renderKv(section.kv);
  if (section.refs) body += renderRefs(section.refs);
  if (section.sign) {
    body += `<div class="sign"><div class="sign-line"></div><div>(${esc(section.sign)})</div><div>Signature</div></div>`;
  }
  return `<section><h2>${esc(section.h)}</h2>${body}</section>`;
}

const contactText = (c) => (c.label ? `${esc(c.label)}: ${esc(c.value)}` : esc(c.value));

/* ── Layouts ────────────────────────────────────────────────────────────── */

const BASE_CSS = `
  @page { size: A4; margin: 16mm 15mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Liberation Sans', 'DejaVu Sans', 'FreeSans', sans-serif; font-size: 10.5pt; color: #1d1d1f; line-height: 1.38; margin: 0; }
  body.bn { font-family: 'FreeSans', 'FreeSerif', sans-serif; font-size: 11.5pt; }
  h1 { margin: 0; font-size: 22pt; }
  h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: 0.06em; margin: 14px 0 6px; border-bottom: 1px solid #999; padding-bottom: 2px; }
  body.bn h2 { text-transform: none; letter-spacing: 0; }
  p { margin: 0 0 6px; }
  ul { margin: 2px 0 6px 18px; padding: 0; }
  li { margin: 1px 0; }
  .job { margin-bottom: 8px; }
  .job-head { display: flex; justify-content: space-between; gap: 12px; }
  .role { font-weight: bold; }
  .dates { white-space: nowrap; color: #555; }
  table.kv { border-collapse: collapse; }
  table.kv td { padding: 1px 6px 1px 0; vertical-align: top; }
  table.kv td.k { font-weight: bold; white-space: nowrap; }
  .refs { display: flex; gap: 28px; flex-wrap: wrap; }
  .ref-name { font-weight: bold; }
  .sign { margin-top: 26px; width: 220px; }
  .sign-line { border-top: 1px solid #333; margin-bottom: 2px; }
`;

const LAYOUTS = {
  /* Word-style single column, centred header, contacts on one line. */
  classic: (cv) => `
    <style>
      header { text-align: center; margin-bottom: 8px; }
      .title { font-size: 12pt; color: #444; margin-top: 2px; }
      .contact { margin-top: 4px; }
    </style>
    <header>
      <h1>${esc(cv.name)}</h1>
      ${cv.title ? `<div class="title">${esc(cv.title)}</div>` : ''}
      <div class="contact">${cv.contacts.map(contactText).join(' | ')}</div>
      ${(cv.address ?? []).map((line) => `<div>${esc(line)}</div>`).join('')}
    </header>
    ${cv.sections.map((s) => renderSection(s)).join('')}`,

  /* Canva-style: dark sidebar with contact, skills and personal details. */
  sidebar: (cv) => {
    const sideTypes = (s) => s.list || s.kv;
    const side = cv.sections.filter(sideTypes);
    const main = cv.sections.filter((s) => !sideTypes(s));
    return `
    <style>
      @page { margin: 0; }
      .wrap { display: grid; grid-template-columns: 68mm 1fr; min-height: 297mm; }
      aside { background: #22343c; color: #eef3f5; padding: 16mm 7mm; }
      aside h2 { border-color: #7a929c; color: #fff; }
      aside .kv td.k { display: block; }
      aside table.kv tr { display: block; margin-bottom: 4px; }
      aside table.kv td.colon { display: none; }
      main { padding: 16mm 12mm 16mm 10mm; }
      .title { font-size: 12.5pt; color: #2c6e80; margin: 2px 0 10px; }
      .c-label { font-size: 8.5pt; color: #a9bec6; text-transform: uppercase; margin-top: 6px; }
    </style>
    <div class="wrap">
      <aside>
        <h2>Contact</h2>
        ${cv.contacts.map((c) => `${c.label ? `<div class="c-label">${esc(c.label)}</div>` : ''}<div>${esc(c.value)}</div>`).join('')}
        ${cv.address?.length ? `<div class="c-label">Address</div>${cv.address.map((l) => `<div>${esc(l)}</div>`).join('')}` : ''}
        ${side.map((s) => renderSection(s)).join('')}
      </aside>
      <main>
        <h1>${esc(cv.name)}</h1>
        ${cv.title ? `<div class="title">${esc(cv.title)}</div>` : ''}
        ${main.map((s) => renderSection(s)).join('')}
      </main>
    </div>`;
  },

  /* Traditional Bangladeshi CV: photo box, grey section bars, colon tables,
     declaration and signature at the foot. */
  'bd-traditional': (cv) => `
    <style>
      header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #333; padding-bottom: 8px; }
      header h1 { font-size: 18pt; text-transform: uppercase; }
      .photo { width: 30mm; height: 36mm; border: 1px solid #555; flex: none; }
      h2 { background: #d9d9d9; border: none; padding: 3px 6px; text-transform: none; font-size: 11.5pt; letter-spacing: 0; }
    </style>
    <header>
      <div>
        <h1>${esc(cv.name)}</h1>
        ${cv.contacts.map((c) => `<div>${contactText(c)}</div>`).join('')}
        ${(cv.address ?? []).map((line) => `<div>${esc(line)}</div>`).join('')}
      </div>
      <div class="photo"></div>
    </header>
    ${cv.sections.map((s) => renderSection(s)).join('')}`,

  /* Banner header: first and last name stacked, letter-spaced, with icon
     glyphs in front of each contact detail. */
  'modern-header': (cv) => {
    const parts = cv.name.split(' ');
    const first = parts.slice(0, -1).join(' ') || cv.name;
    const last = parts.length > 1 ? parts[parts.length - 1] : '';
    return `
    <style>
      header { background: #f1ede6; margin: -16mm -15mm 10px; padding: 14mm 15mm 8mm; }
      .first { font-size: 26pt; letter-spacing: 0.18em; font-weight: 300; text-transform: uppercase; }
      .last { font-size: 26pt; letter-spacing: 0.18em; font-weight: bold; text-transform: uppercase; }
      .title { margin: 4px 0 10px; color: #8a5a2b; font-size: 12pt; }
      .contacts { display: flex; flex-wrap: wrap; gap: 4px 18px; font-size: 9.5pt; }
      .icon { color: #8a5a2b; margin-right: 4px; }
    </style>
    <header>
      <div class="first">${esc(first)}</div>
      ${last ? `<div class="last">${esc(last)}</div>` : ''}
      ${cv.title ? `<div class="title">${esc(cv.title)}</div>` : ''}
      <div class="contacts">${cv.contacts.map((c) => `<span><span class="icon">${esc(c.icon ?? '•')}</span>${esc(c.value)}</span>`).join('')}</div>
    </header>
    ${cv.sections.map((s) => renderSection(s, { inlineList: true })).join('')}`;
  },

  /* Header as a two-column table: name left, contacts stacked right. */
  'table-header': (cv) => `
    <style>
      table.head { width: 100%; border-collapse: collapse; border-bottom: 3px solid #1f4e79; margin-bottom: 6px; }
      table.head td { vertical-align: bottom; padding-bottom: 6px; }
      table.head td.right { text-align: right; font-size: 9.5pt; }
      .title { color: #1f4e79; margin-top: 3px; }
      h2 { color: #1f4e79; border-color: #1f4e79; }
    </style>
    <table class="head"><tr>
      <td><h1>${esc(cv.name)}</h1>${cv.title ? `<div class="title">${esc(cv.title)}</div>` : ''}</td>
      <td class="right">${cv.contacts.map((c) => `<div>${contactText(c)}</div>`).join('')}${(cv.address ?? []).map((l) => `<div>${esc(l)}</div>`).join('')}</td>
    </tr></table>
    ${cv.sections.map((s) => renderSection(s)).join('')}`,
};

export function renderHtml(entry) {
  const layout = LAYOUTS[entry.layout];
  if (!layout) throw new Error(`Unknown layout ${entry.layout} for ${entry.id}`);
  return `<!doctype html><html lang="${entry.lang ?? 'en'}"><head><meta charset="utf-8">
    <title>${esc(entry.cv.name)} — CV</title><style>${BASE_CSS}</style></head>
    <body class="${entry.lang === 'bn' ? 'bn' : ''}">${layout(entry.cv)}</body></html>`;
}

/* ── Main ───────────────────────────────────────────────────────────────── */

async function main() {
  const { chromium } = loadPlaywright();
  await fs.mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const only = process.argv.slice(2);

  for (const entry of CORPUS) {
    if (only.length && !only.includes(entry.id)) continue;
    await page.setContent(renderHtml(entry), { waitUntil: 'load' });
    const file = path.join(OUT_DIR, `${entry.id}.pdf`);
    await page.pdf({ path: file, format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log(`wrote ${path.relative(process.cwd(), file)}`);
  }

  await browser.close();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
