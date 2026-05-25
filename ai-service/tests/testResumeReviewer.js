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
  const cliArg = process.argv[2];
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

function printResult(label, result) {
  const divider = '='.repeat(60);
  const subDivider = '-'.repeat(60);
  console.log(divider);
  console.log(`Resume: ${label}`);
  console.log(divider);

  console.log(`Overall Score:    ${result.overall_score}/10`);
  console.log(`Formatting:       ${result.formatting_feedback.score}/10`);
  console.log(`Content Quality:  ${result.content_quality.score}/10`);
  console.log(`Language:         ${result.language_and_grammar.score}/10`);

  console.log(`\n${subDivider}`);
  console.log('FORMATTING');
  console.log(subDivider);
  console.log('Strengths:');
  result.formatting_feedback.strengths.forEach((s) => printItem('  + ', s));
  console.log('\nImprovements:');
  result.formatting_feedback.improvements.forEach((s) => printItem('  ! ', s));

  console.log(`\n${subDivider}`);
  console.log('CONTENT QUALITY');
  console.log(subDivider);
  console.log('Strengths:');
  result.content_quality.strengths.forEach((s) => printItem('  + ', s));
  console.log('\nImprovements:');
  result.content_quality.improvements.forEach((s) => printItem('  ! ', s));

  console.log(`\n${subDivider}`);
  console.log('LANGUAGE & GRAMMAR');
  console.log(subDivider);
  console.log('Strengths:');
  result.language_and_grammar.strengths.forEach((s) => printItem('  + ', s));
  console.log('\nImprovements:');
  result.language_and_grammar.improvements.forEach((s) => printItem('  ! ', s));

  console.log(`\n${subDivider}`);
  console.log('ACTION ITEMS (priority order)');
  console.log(subDivider);
  result.action_items.forEach((item, i) => printItem(`  ${i + 1}. `, item));

  console.log('');
}

console.log('=== RESUME REVIEWER ===\n');

const targets = resolveTargetFiles();

for (const { label, path } of targets) {
  process.stdout.write(`Reviewing ${label}... `);
  try {
    const resumeText = await extractText(path);
    const result = await analyzeResume(resumeText);

    if (result.error) {
      console.log('RATE LIMIT');
      console.error(`  ${result.error}\n`);
    } else {
      console.log('done\n');
      printResult(label, result);
    }
  } catch (err) {
    console.log('ERROR');
    console.error(`  ${err.message}\n`);
  }
}
