import 'dotenv/config';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve, basename } from 'path';
import { analyzeResume } from '../src/services/resumeReviewer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDir = join(rootDir, 'data');
const customDir = join(rootDir, 'custom');

function resolveTargetFiles() {
  const cliArg = process.argv[2];
  if (cliArg) {
    const absPath = resolve(cliArg);
    if (!existsSync(absPath)) {
      console.error(`File not found: ${absPath}`);
      process.exit(1);
    }
    return [{ label: basename(absPath), path: absPath }];
  }

  if (existsSync(customDir)) {
    const customFiles = readdirSync(customDir).filter((f) => f.endsWith('.txt'));
    if (customFiles.length > 0) {
      console.log(`Found ${customFiles.length} resume(s) in custom/ â€” reviewing those.\n`);
      return customFiles.map((f) => ({ label: f, path: join(customDir, f) }));
    }
  }

  console.log('No custom resumes found. Running against built-in mock resumes in data/.\n');
  return readdirSync(dataDir)
    .filter((f) => f.endsWith('.txt'))
    .map((f) => ({ label: f, path: join(dataDir, f) }));
}

function printResult(label, result) {
  const divider = 'â”€'.repeat(60);
  console.log(divider);
  console.log(`Resume: ${label}`);
  console.log(divider);

  console.log(`Overall Score:    ${result.overall_score}/10`);
  console.log(`Formatting:       ${result.formatting_feedback.score}/10`);
  console.log(`Content Quality:  ${result.content_quality.score}/10`);
  console.log(`Language:         ${result.language_and_grammar.score}/10`);

  console.log('\nFormatting â€” Strengths:');
  result.formatting_feedback.strengths.forEach((s) => console.log(`  + ${s}`));
  console.log('Formatting â€” Improvements:');
  result.formatting_feedback.improvements.forEach((s) => console.log(`  ! ${s}`));

  console.log('\nContent Quality â€” Strengths:');
  result.content_quality.strengths.forEach((s) => console.log(`  + ${s}`));
  console.log('Content Quality â€” Improvements:');
  result.content_quality.improvements.forEach((s) => console.log(`  ! ${s}`));

  console.log('\nLanguage & Grammar â€” Strengths:');
  result.language_and_grammar.strengths.forEach((s) => console.log(`  + ${s}`));
  console.log('Language & Grammar â€” Improvements:');
  result.language_and_grammar.improvements.forEach((s) => console.log(`  ! ${s}`));

  console.log('\nAction Items (priority order):');
  result.action_items.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));

  console.log('');
}

console.log('=== RESUME REVIEWER ===\n');

const targets = resolveTargetFiles();

for (const { label, path } of targets) {
  process.stdout.write(`Reviewing ${label}... `);
  try {
    const resumeText = readFileSync(path, 'utf-8');
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
