import dotenv from 'dotenv';
import { readFileSync, readdirSync, existsSync } from 'fs';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join, resolve, basename, extname } from 'path';

// Load env from server/.env so there's only one source of truth.
dotenv.config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), '../../server/.env'),
});
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import { analyzeResume } from '../src/services/resumeReviewer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'data');
const customDir = join(rootDir, 'custom');

const SUPPORTED_EXTS = ['.txt', '.pdf', '.docx'];
const MARKET_MODES   = ['bangladesh', 'international'];

// --mode accepts both "--mode=international" and "--mode international". The
// spaced form consumes the token after it, so a mode name never falls through
// and gets resolved as a filename.
function parseArgs(tokens) {
  const parsed = { mode: undefined, positionals: [] };
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.startsWith('--mode')) {
      parsed.mode = token.includes('=') ? token.split('=')[1] : tokens[++i];
    } else if (!token.startsWith('--')) {
      parsed.positionals.push(token);
    }
  }
  return parsed;
}

const { mode: modeArg, positionals } = parseArgs(process.argv.slice(2));

// Both market modes run by default. The two paths build different prompts and
// disagree on purpose — international flags the personal-details conventions
// that Bangladesh mode protects — so reviewing one proves nothing about the
// other.
function resolveModes() {
  if (modeArg === undefined || modeArg === 'both') return MARKET_MODES;
  if (!MARKET_MODES.includes(modeArg)) {
    console.error(`Unknown market mode "${modeArg}". Expected one of: ${MARKET_MODES.join(', ')}, both.`);
    process.exit(1);
  }
  return [modeArg];
}

/**
 * Extracts plain text from a resume file (.txt, .pdf, .docx).
 */
async function extractText(filePath) {
  const ext = extname(filePath).toLowerCase();

  if (ext === '.txt') {
    return readFileSync(filePath, 'utf-8');
  }

  if (ext === '.pdf') {
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('PDF appears to be empty or is a scanned image with no text layer.');
    }
    return data.text;
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('DOCX file appears to be empty.');
    }
    return result.value;
  }

  throw new Error(`Unsupported file type: ${ext}. Use .txt, .pdf, or .docx`);
}

function resolveTargetFiles() {
  const cliArg = positionals[0];
  if (cliArg) {
    // Try custom/ first, then fall back to resolving as a path
    const inCustom = join(customDir, cliArg);
    const absPath = existsSync(inCustom) ? inCustom : resolve(cliArg);
    if (!existsSync(absPath)) {
      console.error(`File not found: ${cliArg}`);
      console.error(`Looked in: ${inCustom}`);
      process.exit(1);
    }
    return [{ label: basename(absPath), path: absPath }];
  }

  if (existsSync(customDir)) {
    const customFiles = readdirSync(customDir).filter((f) =>
      SUPPORTED_EXTS.includes(extname(f).toLowerCase())
    );
    if (customFiles.length > 0) {
      console.log(`Found ${customFiles.length} resume(s) in custom/ - reviewing those.\n`);
      return customFiles.map((f) => ({ label: f, path: join(customDir, f) }));
    }
  }

  console.log('No custom resumes found. Running against built-in mock resumes in data/.\n');
  return readdirSync(dataDir)
    .filter((f) => SUPPORTED_EXTS.includes(extname(f).toLowerCase()))
    .map((f) => ({ label: f, path: join(dataDir, f) }));
}

// Wraps a string at `maxWidth` columns, preserving `indent` on continuation lines.
function wrap(text, indent, maxWidth = 100) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (indent.length + test.length > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.join(`\n${indent}`);
}

function printItem(prefix, text) {
  const indent = ' '.repeat(prefix.length);
  console.log(`${prefix}${wrap(text, indent)}`);
}

const subDivider = '-'.repeat(60);

function printSection(title, body) {
  console.log(`\n${subDivider}`);
  console.log(title);
  console.log(subDivider);
  body();
}

function printResult(label, mode, result) {
  const divider = '='.repeat(60);
  console.log(divider);
  console.log(`Resume: ${label}   |   Market mode: ${mode}`);
  console.log(divider);

  console.log(`Overall Score:    ${result.overall_score}/100`);
  console.log(`Formatting:       ${result.formatting?.score ?? '-'}/100`);
  console.log(`Content Quality:  ${result.content_quality?.score ?? '-'}/100`);
  console.log(`Language:         ${result.language_grammar?.score ?? '-'}/100`);

  printSection('FORMATTING', () => {
    console.log(result.formatting?.feedback ?? '(no feedback returned)');
    (result.formatting?.issues ?? []).forEach((i) =>
      printItem('  ! ', `[${i.section}] ${i.issue} -> ${i.suggestion}`));
  });

  printSection('CONTENT QUALITY', () => {
    console.log(result.content_quality?.feedback ?? '(no feedback returned)');
    console.log('\nStrengths:');
    (result.content_quality?.strengths ?? []).forEach((s) => printItem('  + ', s));
    console.log('\nWeaknesses:');
    (result.content_quality?.weaknesses ?? []).forEach((s) => printItem('  ! ', s));
  });

  printSection('LANGUAGE & GRAMMAR', () => {
    console.log(result.language_grammar?.feedback ?? '(no feedback returned)');
    (result.language_grammar?.issues ?? []).forEach((i) =>
      printItem('  ! ', `${i.original} -> ${i.corrected} (${i.type})`));
  });

  // The market modes differ most visibly here: international mode flags the
  // headings Bangladesh mode protects, so heading_risks is the quickest read on
  // whether the selected mode actually took effect.
  const ats = result.ats_analysis;
  if (ats) {
    printSection('ATS ANALYSIS', () => {
      console.log(`Inferred role:     ${ats.inferred_role ?? '-'}`);
      console.log(`Inferred industry: ${ats.inferred_industry ?? '-'}`);
      console.log(`ATS score:         ${ats.ats_score ?? '-'}/100`);
      console.log(`Keyword hits:      ${(ats.keyword_hits ?? []).join(', ') || '-'}`);
      console.log(`Keyword gaps:      ${(ats.keyword_gaps ?? []).join(', ') || '-'}`);
      console.log('Heading risks:');
      (ats.heading_risks ?? []).forEach((h) =>
        printItem('  ! ', `${h.original}: ${h.issue} -> ${h.recommended}`));
      console.log('Tips:');
      (ats.ats_tips ?? []).forEach((t) => printItem('  * ', t));
    });
  }

  printSection('ACTION ITEMS (priority order)', () => {
    (result.action_items ?? []).forEach((item, i) => printItem(`  ${i + 1}. `, item));
  });

  console.log('');
}

console.log('=== RESUME REVIEWER ===\n');

const targets = resolveTargetFiles();
const modes   = resolveModes();

console.log(`Market modes: ${modes.join(', ')}\n`);

for (const { label, path } of targets) {
  let resumeText;
  try {
    resumeText = await extractText(path);
  } catch (err) {
    console.log(`Reading ${label}... ERROR`);
    console.error(`  ${err.message}\n`);
    continue;
  }

  for (const marketMode of modes) {
    process.stdout.write(`Reviewing ${label} (${marketMode})... `);
    try {
      const result = await analyzeResume(resumeText, { marketMode });

      if (result.error) {
        console.log('RATE LIMIT');
        console.error(`  ${result.error}\n`);
      } else {
        console.log('done\n');
        printResult(label, marketMode, result);
      }
    } catch (err) {
      console.log('ERROR');
      console.error(`  ${err.message}\n`);
    }
  }
}
