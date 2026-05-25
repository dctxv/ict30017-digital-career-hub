import { parseArgs } from 'node:util';
import { readFileSync } from 'node:fs';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { MODELS } from './model-config.js';
import { buildSystemPrompt } from '../src/services/resumeReviewer.js';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const OUTPUT_ROOT  = path.join(PROJECT_ROOT, 'ai_testing');

dotenv.config({ path: path.join(PROJECT_ROOT, 'server/.env') });

// ── CLI args ──────────────────────────────────────────────────────────────────

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    mode:   { type: 'string', default: 'both' },
    name:   { type: 'string' },
    models: { type: 'string' },
  },
  allowPositionals: true,
});

const resumeFile = positionals[0];
if (!resumeFile) {
  console.error('Usage: node ai-service/scripts/batch-review.js <resume.txt> [--mode bangladesh|international|both] [--name resume_name] [--models model1,model2]');
  process.exit(1);
}

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error('OPENROUTER_API_KEY is not set in server/.env');
  process.exit(1);
}

const resumePath  = path.resolve(resumeFile);
const resumeName  = values.name ?? path.basename(resumeFile, path.extname(resumeFile));
const modelFilter = values.models ? values.models.split(',') : null;
const modelsToRun = modelFilter
  ? MODELS.filter(m => modelFilter.includes(m.folder))
  : MODELS;

const modes = values.mode === 'both'
  ? ['bangladesh', 'international']
  : [values.mode];

const resumeText = readFileSync(resumePath, 'utf-8');
const today      = new Date().toISOString().split('T')[0];

// ── OpenRouter client ─────────────────────────────────────────────────────────

const client = new OpenAI({
  apiKey,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://digital-career-hub.local',
    'X-Title':      'ICT30017 Digital Career Hub',
  },
});

// ── Per-model call ────────────────────────────────────────────────────────────

async function runModel(model, systemPrompt) {
  const start = Date.now();

  const response = await client.chat.completions.create({
    model:       model.openrouterId,
    temperature: 0.1,
    max_tokens:  16000,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: `Please review the following resume:\n\n${resumeText}` },
    ],
  });

  const durationSeconds  = parseFloat(((Date.now() - start) / 1000).toFixed(1));
  const completionTokens = response.usage?.completion_tokens ?? 0;
  const tokensPerSecond  = durationSeconds > 0
    ? parseFloat((completionTokens / durationSeconds).toFixed(1))
    : 0;

  // Use OpenRouter's reported cost directly when available; fall back to pricing table
  const costUsd = response.usage?.cost != null
    ? parseFloat(response.usage.cost.toFixed(8))
    : parseFloat(
        ((( response.usage?.prompt_tokens ?? 0) * model.inputPrice +
           completionTokens                     * model.outputPrice) / 1_000_000).toFixed(8)
      );

  // Reasoning models (e.g. gpt-5-nano, mistral-small) put thinking in message.reasoning
  // and only emit content after reasoning is complete. Fall back to reasoning if content is empty.
  const msg = response.choices[0]?.message;
  const rawContent = (msg?.content?.trim())
    ? msg.content
    : (msg?.reasoning?.trim() ? `<!-- reasoning-only output -->\n${msg.reasoning}` : '');

  return { rawContent, tokenCount: completionTokens, tokensPerSecond, costUsd, durationSeconds };
}

// ── Write analysis file ───────────────────────────────────────────────────────

async function writeAnalysisFile(model, mode, result) {
  const dir = path.join(OUTPUT_ROOT, model.folder, mode);
  await mkdir(dir, { recursive: true });

  const filePath = path.join(dir, `${resumeName}.md`);
  const content = [
    '---',
    `resume: ${resumeName}`,
    `mode: ${mode}`,
    `model: ${model.folder}`,
    `date: ${today}`,
    'metadata:',
    `  tokens_per_second: ${result.tokensPerSecond}`,
    `  token_count: ${result.tokenCount}`,
    `  cost_usd: ${result.costUsd}`,
    `  duration_seconds: ${result.durationSeconds}`,
    '---',
    '',
    '## Analysis Output',
    '',
    result.rawContent,
  ].join('\n');

  await writeFile(filePath, content, 'utf-8');
}

// ── Update summary.md ─────────────────────────────────────────────────────────

const SUMMARY_HEADER = (folder) => [
  `# ${folder} — Summary`,
  '',
  '| Resume | Mode | Tokens/s | Token Count | Cost ($) | Duration (s) |',
  '|--------|------|----------|-------------|----------|--------------|',
].join('\n');

async function updateSummary(model, mode, result) {
  const summaryPath = path.join(OUTPUT_ROOT, model.folder, 'summary.md');

  const newRow = `| ${resumeName} | ${mode} | ${result.tokensPerSecond} | ${result.tokenCount} | ${result.costUsd} | ${result.durationSeconds} |`;

  // Create summary if it doesn't exist
  let exists = false;
  try { await access(summaryPath); exists = true; } catch {}

  if (!exists) {
    await writeFile(summaryPath, SUMMARY_HEADER(model.folder) + '\n' + newRow + '\n', 'utf-8');
    return;
  }

  const raw   = await readFile(summaryPath, 'utf-8');
  const lines = raw.split('\n');

  // Case 1: existing row for this resume+mode
  const existingIdx = lines.findIndex(line => {
    const cols = line.split('|').map(c => c.trim());
    return cols[1] === resumeName && cols[2] === mode;
  });
  if (existingIdx !== -1) {
    lines[existingIdx] = newRow;
    await writeFile(summaryPath, lines.join('\n'), 'utf-8');
    return;
  }

  // Case 2: placeholder row with empty metrics
  const placeholderIdx = lines.findIndex(line => {
    const cols = line.split('|').map(c => c.trim());
    return cols.length >= 7 && cols[1] !== '' && cols[3] === '' && cols[4] === '' && cols[5] === '' && cols[6] === '';
  });
  if (placeholderIdx !== -1) {
    lines[placeholderIdx] = newRow;
    await writeFile(summaryPath, lines.join('\n'), 'utf-8');
    return;
  }

  // Case 3: append after last table row
  const lastTableRow = lines.reduce((last, line, i) => line.startsWith('|') ? i : last, -1);
  lines.splice(lastTableRow + 1, 0, newRow);
  await writeFile(summaryPath, lines.join('\n'), 'utf-8');
}

// ── Run one mode ──────────────────────────────────────────────────────────────

async function runMode(mode) {
  console.log(`\n── Mode: ${mode} ${'─'.repeat(50 - mode.length)}`);

  const systemPrompt = buildSystemPrompt(mode);

  const settled = await Promise.allSettled(
    modelsToRun.map(async model => {
      const result = await runModel(model, systemPrompt);
      await writeAnalysisFile(model, mode, result);
      await updateSummary(model, mode, result);
      return { model, result };
    })
  );

  printTable(settled, mode);
  return settled;
}

// ── Console table ─────────────────────────────────────────────────────────────

function printTable(settled, mode) {
  const COL = [26, 14, 10, 13, 12, 10];
  const hr  = '+' + COL.map(n => '-'.repeat(n + 2)).join('+') + '+';
  const row = cols => '| ' + cols.map((c, i) => String(c).padEnd(COL[i])).join(' | ') + ' |';

  console.log(hr);
  console.log(row(['Model', 'Mode', 'Tokens/s', 'Token Count', 'Cost ($)', 'Duration']));
  console.log(hr);

  let totalCost = 0;
  for (const s of settled) {
    if (s.status === 'fulfilled') {
      const { model, result } = s.value;
      totalCost += result.costUsd;
      console.log(row([model.folder, mode, result.tokensPerSecond, result.tokenCount, result.costUsd, `${result.durationSeconds}s`]));
    } else {
      const idx   = settled.indexOf(s);
      const model = modelsToRun[idx];
      console.log(row([model?.folder ?? '?', mode, 'FAILED', '-', '-', '-']));
      console.error(`  Error (${model?.folder}): ${s.reason?.message ?? s.reason}`);
    }
  }

  console.log(hr);
  console.log(`Total cost (${mode}): $${totalCost.toFixed(6)}\n`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log(`\nResume: ${resumeName}  |  Modes: ${modes.join(', ')}  |  Models: ${modelsToRun.length}`);

for (const mode of modes) {
  await runMode(mode);
}
