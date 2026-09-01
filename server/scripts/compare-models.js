/**
 * Script: compare-models
 * Responsibility: Run the SAME production prompt through several candidate
 * models and score each result mechanically, so a model decision is made on
 * measurements rather than on impressions.
 *
 * Why this exists rather than ai-service/scripts/batch-review.js:
 *
 *  1. That script sends `Please review the following resume:\n\n<text>` as the
 *     user message. Production sends buildUserMessage(), which also carries the
 *     application context block and — on a Bangla run — the language reminder at
 *     the end. The 2026-08-26 Bangla failure was caused by where that reminder
 *     sat, so a harness without it reproduces the failure on every candidate and
 *     blames the model. This one imports the production builders.
 *  2. It is hardcoded to OpenRouter. The app moved to Google AI Studio.
 *  3. It records tokens and latency but decides nothing. The interesting
 *     question is not "how fast" — it is "how often did this model give advice
 *     that would get a BCS application rejected", and that is countable.
 *
 * What gets scored, per run:
 *
 *   parse            did it return JSON at all
 *   schema           does the normalised review satisfy ReviewResponseSchema
 *   protected        headings the server had to strip because the channel
 *                    protects them and the model flagged them anyway
 *   mandated         advice telling a government-form applicant to remove a
 *                    field the form requires — the hard failure from the P83
 *                    brief, and the one that would actually cost someone a job
 *   bangla           narrative coverage, and violations where the model
 *                    translated a field that must stay English
 *
 * Every number here is produced by the same code that runs in production
 * (resolveProtectedHeadings, isMandatedFieldRemovalAdvice, checkBanglaOutput,
 * ReviewResponseSchema), so a model that scores well here scores well in the
 * app for the same reasons.
 *
 * Usage:
 *   node server/scripts/compare-models.js --dry-run
 *   node server/scripts/compare-models.js --verify
 *   node server/scripts/compare-models.js
 *   node server/scripts/compare-models.js --languages en --contexts government_form
 */

import { parseArgs } from 'node:util';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import OpenAI from 'openai';

import { extractText } from '../src/utils/fileParser.js';
import { buildSystemPrompt, buildUserMessage, normalizeResponse } from 'ai-service/src/services/resumeReviewer.js';
import { normaliseContext } from 'ai-service/src/prompt/context.js';
import { withOutputLanguage } from 'ai-service/src/prompt/language.js';
import { ReviewResponseSchema } from 'ai-service/src/schemas/resumeSchema.js';
import { checkBanglaOutput } from 'ai-service/src/quality/banglaOutput.js';
import {
  AI_COMPLETION_PARAMS,
  resolveProtectedHeadings,
  mandatesPersonalFields,
  isMandatedFieldRemovalAdvice,
} from 'ai-service/src/config/reviewConstants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../../');

dotenv.config({ path: path.join(PROJECT_ROOT, 'server/.env') });

/* ── Candidates ────────────────────────────────────────────────────────────
 *
 * Two routes per model where one exists. Google AI Studio is the production
 * path for the Gemini models, so results there are what users would actually
 * get. Haiku is not served by Google AI Studio at all, so it can only be
 * reached through OpenRouter — which is also why running the whole comparison
 * through OpenRouter is the apples-to-apples option, at the cost of not being
 * the exact path production uses for Gemini. The script reports which route
 * each run took so the two are never silently mixed up in the results.
 *
 * Prices are USD per 1M tokens, and are left null where this project has not
 * verified them. A null price prints as "—" rather than as a guess; OpenRouter
 * reports real spend per call and that is used whenever it is available.
 */
const CANDIDATES = [
  {
    key: 'gemini-3.6-flash',
    label: 'Gemini 3.6 Flash (current)',
    google: 'gemini-3.6-flash',
    openrouter: 'google/gemini-3.6-flash',
    inputPrice: null,
    outputPrice: null,
  },
  {
    key: 'gemini-3.6-flash-lite',
    label: 'Gemini 3.6 Flash Lite',
    google: 'gemini-3.6-flash-lite',
    openrouter: 'google/gemini-3.6-flash-lite',
    inputPrice: null,
    outputPrice: null,
  },
  {
    key: 'claude-haiku-4-5',
    label: 'Claude Haiku 4.5',
    // Not served by Google AI Studio. OpenRouter only.
    google: null,
    openrouter: 'anthropic/claude-haiku-4.5',
    inputPrice: 1.00,
    outputPrice: 5.00,
  },
];

/* ── Contexts ──────────────────────────────────────────────────────────────
 *
 * Three, chosen because each one makes a different failure countable:
 *
 *   government_form  is the only context where mandated-field removal advice is
 *                    measurable, and it is the failure with real consequences —
 *                    a BCS application rejected for following our advice.
 *   bdjobs_fresher   protects the widest set of headings, so it is where
 *                    heading over-flagging shows up most.
 *   multinational_it protects nothing and is supposed to flag those same
 *                    fields, so it catches a model that has simply learned to
 *                    stay quiet rather than learned the rule.
 *
 * A model that scores well on all three understands the routing. A model that
 * scores well on the first two only has learned to say nothing.
 */
const CONTEXTS = {
  bdjobs_fresher: {
    label: 'Bdjobs / fresher / RMG',
    context: { applicationChannel: 'bdjobs_profile', candidateStage: 'fresher', targetSector: 'rmg_manufacturing' },
  },
  government_form: {
    label: 'Government form / BCS',
    context: { applicationChannel: 'government_form', employerType: 'government' },
  },
  multinational_it: {
    label: 'Multinational / senior / IT',
    context: { employerType: 'multinational', candidateStage: 'senior', targetSector: 'it_software' },
  },
};

// ── CLI ───────────────────────────────────────────────────────────────────

const { values } = parseArgs({
  options: {
    resume:    { type: 'string', default: 'docs/database/BD_Resume_Test_01.pdf' },
    models:    { type: 'string' },
    contexts:  { type: 'string' },
    languages: { type: 'string', default: 'en,bn' },
    provider:  { type: 'string', default: 'auto' },
    out:       { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    verify:    { type: 'boolean', default: false },
    help:      { type: 'boolean', default: false },
  },
  allowPositionals: false,
});

if (values.help) {
  console.log(`
Compare candidate models on the production prompt.

  --resume <path>       resume to review (.pdf, .docx or .txt)
                        default: docs/database/BD_Resume_Test_01.pdf
  --models  a,b         subset of: ${CANDIDATES.map(c => c.key).join(', ')}
  --contexts a,b        subset of: ${Object.keys(CONTEXTS).join(', ')}
  --languages en,bn     default: en,bn
  --provider auto|google|openrouter
                        auto  = Google AI Studio for Gemini, OpenRouter for Haiku
  --out <dir>           output directory
  --verify              check every model id resolves, then exit
  --dry-run             print the plan and the cost exposure, then exit
`);
  process.exit(0);
}

const selectedModels = values.models
  ? CANDIDATES.filter(c => values.models.split(',').map(s => s.trim()).includes(c.key))
  : CANDIDATES;

const selectedContexts = (values.contexts
  ? values.contexts.split(',').map(s => s.trim())
  : Object.keys(CONTEXTS)
).filter(k => {
  if (CONTEXTS[k]) return true;
  console.error(`Unknown context "${k}". Known: ${Object.keys(CONTEXTS).join(', ')}`);
  process.exit(1);
});

const selectedLanguages = values.languages.split(',').map(s => s.trim()).filter(l => l === 'en' || l === 'bn');

if (selectedModels.length === 0) { console.error('No models selected.'); process.exit(1); }
if (selectedLanguages.length === 0) { console.error('No languages selected (use en, bn or en,bn).'); process.exit(1); }

/* ── Provider routing ──────────────────────────────────────────────────────
 *
 * Clients are built lazily so that a run using only one provider does not
 * require the other provider's key. Asking for an OpenRouter key to compare two
 * Gemini models on Google AI Studio would be a pointless obstacle.
 */
const clients = {};

function clientFor(provider) {
  if (clients[provider]) return clients[provider];

  if (provider === 'google') {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_AI_API_KEY is not set in server/.env');
    clients.google = new OpenAI({
      apiKey,
      // The trailing slash matters: the SDK appends 'chat/completions' to this
      // path, and without it the last segment is replaced rather than extended.
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
    return clients.google;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set in server/.env');
  clients.openrouter = new OpenAI({
    apiKey,
    // COMPARE_BASE_URL lets the harness be smoke-tested against a local stub
    // that speaks the OpenAI wire format, so the run/scoring/report path can be
    // exercised without spending money on 18 real calls. Unset in normal use.
    baseURL: process.env.COMPARE_BASE_URL ?? 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://digital-career-hub.local',
      'X-Title': 'ICT30017 Digital Career Hub',
    },
  });
  return clients.openrouter;
}

/**
 * Decides which provider serves a candidate, honouring --provider where the
 * model supports it. Returns null when the requested route does not exist,
 * which is a skip rather than an error: Haiku on --provider google is a
 * meaningful thing to ask for and a meaningless thing to attempt.
 */
function routeFor(candidate) {
  const wanted = values.provider;

  if (wanted === 'google') {
    return candidate.google ? { provider: 'google', modelId: candidate.google } : null;
  }
  if (wanted === 'openrouter') {
    return candidate.openrouter ? { provider: 'openrouter', modelId: candidate.openrouter } : null;
  }
  // auto: production path where one exists, OpenRouter otherwise.
  if (candidate.google && process.env.GOOGLE_AI_API_KEY) {
    return { provider: 'google', modelId: candidate.google };
  }
  return candidate.openrouter ? { provider: 'openrouter', modelId: candidate.openrouter } : null;
}

// ── Response parsing ──────────────────────────────────────────────────────

/**
 * Pulls a JSON object out of a model response.
 *
 * Deliberately forgiving in the same ways production is: models wrap JSON in
 * markdown fences and prepend commentary despite being told not to. A harness
 * that is stricter than production would report failures users never see.
 */
function parseModelJson(raw) {
  const text = String(raw ?? '').trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1].trim() : text;

  try {
    return JSON.parse(body);
  } catch {
    const first = body.indexOf('{');
    const last = body.lastIndexOf('}');
    if (first === -1 || last <= first) throw new Error('no JSON object found');
    return JSON.parse(body.slice(first, last + 1));
  }
}

// ── Scoring ───────────────────────────────────────────────────────────────

/**
 * Counts heading_risks the server would strip for this context.
 *
 * This measures raw model compliance, not what the user sees — production
 * removes these. A high count is not a broken review; it means the model is
 * leaning on the backstop rather than following the rule, which matters when
 * choosing between models precisely because the backstop cannot cover
 * everything.
 */
function countProtectedHeadingHits(parsed, context) {
  const matchers = resolveProtectedHeadings(context);
  if (matchers.length === 0) return 0;

  const risks = parsed?.ats_analysis?.heading_risks;
  if (!Array.isArray(risks)) return 0;

  return risks.filter(h => matchers.some(re => re.test(String(h?.original ?? '')))).length;
}

/**
 * Counts advice telling the candidate to remove a field the application
 * mandates. Mirrors filterMandatedFieldAdvice's field coverage exactly, so the
 * count is what production would have had to strip.
 */
function countMandatedRemovalHits(parsed, context) {
  if (!mandatesPersonalFields(context)) return { count: 0, samples: [] };

  const texts = [
    ...(parsed?.formatting?.issues ?? []).map(i => `${i?.section ?? ''} ${i?.issue ?? ''} ${i?.suggestion ?? ''}`),
    ...(parsed?.content_quality?.weaknesses ?? []),
    ...(Array.isArray(parsed?.action_items) ? parsed.action_items : []),
    ...(parsed?.ats_analysis?.ats_tips ?? []),
  ].filter(t => typeof t === 'string' && t.trim());

  const hits = texts.filter(isMandatedFieldRemovalAdvice);
  return { count: hits.length, samples: hits.slice(0, 3).map(t => t.slice(0, 160)) };
}

// ── One run ───────────────────────────────────────────────────────────────

async function runOne({ candidate, route, contextKey, language, resumeText }) {
  const context = normaliseContext(CONTEXTS[contextKey].context);
  const systemPrompt = withOutputLanguage(buildSystemPrompt(context), language);
  const userMessage = buildUserMessage(resumeText, { context, language });

  const started = Date.now();
  const response = await clientFor(route.provider).chat.completions.create({
    model: route.modelId,
    ...AI_COMPLETION_PARAMS,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });
  const durationMs = Date.now() - started;

  const raw = response.choices?.[0]?.message?.content ?? '';
  const promptTokens = response.usage?.prompt_tokens ?? 0;
  const completionTokens = response.usage?.completion_tokens ?? 0;

  const costUsd = response.usage?.cost != null
    ? Number(response.usage.cost)
    : (candidate.inputPrice != null && candidate.outputPrice != null
      ? (promptTokens * candidate.inputPrice + completionTokens * candidate.outputPrice) / 1_000_000
      : null);

  const result = {
    model: candidate.key,
    modelLabel: candidate.label,
    provider: route.provider,
    modelId: route.modelId,
    context: contextKey,
    language,
    durationMs,
    promptTokens,
    completionTokens,
    costUsd,
    rawLength: raw.length,
  };

  let parsed;
  try {
    parsed = parseModelJson(raw);
    result.parse = 'ok';
  } catch (err) {
    result.parse = 'failed';
    result.parseError = err.message;
    result.raw = raw.slice(0, 2000);
    return result;
  }

  result.protectedHeadingHits = countProtectedHeadingHits(parsed, context);

  const mandated = countMandatedRemovalHits(parsed, context);
  result.mandatedRemovalHits = mandated.count;
  result.mandatedRemovalSamples = mandated.samples;

  // Score the review a user would receive, not the raw output: production
  // normalises before validating, and a model should not be marked down for
  // something the server fixes on every request.
  let normalised;
  try {
    normalised = normalizeResponse(parsed, context);
  } catch (err) {
    result.schema = 'failed';
    result.schemaError = `normalise threw: ${err.message}`;
    return result;
  }

  const validated = ReviewResponseSchema.safeParse(normalised);
  result.schema = validated.success ? 'ok' : 'failed';
  if (!validated.success) {
    result.schemaIssues = validated.error.issues.slice(0, 5).map(i => `${i.path.join('.')}: ${i.message}`);
  }

  if (language === 'bn') {
    const check = checkBanglaOutput(normalised);
    result.banglaCoverage = Math.round(check.coverage * 100);
    result.banglaViolations = check.violations.length;
    result.banglaMissing = check.missing;
    result.banglaViolationSamples = check.violations.slice(0, 3);
  }

  if (validated.success) result.review = validated.data;
  return result;
}

// ── Verify model ids ──────────────────────────────────────────────────────

/*
 * The models listing is not authoritative on this provider: gemini-2.5-flash is
 * still advertised by /v1beta/openai/models and returns a 404 on use, because
 * Google closed it to keys created after the fact. A one-token completion is
 * the only reliable check, and it costs almost nothing compared with
 * discovering the problem 18 calls into a comparison.
 */
async function verifyModels() {
  console.log('Verifying model ids with a minimal completion each.\n');
  let allOk = true;

  for (const candidate of selectedModels) {
    const route = routeFor(candidate);
    if (!route) {
      console.log(`  SKIP  ${candidate.key.padEnd(24)} no route for --provider ${values.provider}`);
      continue;
    }
    try {
      await clientFor(route.provider).chat.completions.create({
        model: route.modelId,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ok' }],
      });
      console.log(`  OK    ${candidate.key.padEnd(24)} ${route.provider}: ${route.modelId}`);
    } catch (err) {
      allOk = false;
      const status = err?.status ? `${err.status} ` : '';
      console.log(`  FAIL  ${candidate.key.padEnd(24)} ${route.provider}: ${route.modelId}`);
      console.log(`        ${status}${err?.message?.split('\n')[0] ?? err}`);
      if (err?.status === 404) {
        console.log('        A 404 here usually means the id is wrong or the model is closed to new keys,');
        console.log('        not that the key is bad. Check the id against the provider\'s current catalogue.');
      }
    }
  }
  return allOk;
}

// ── Report ────────────────────────────────────────────────────────────────

function fmt(n, digits = 0) {
  return n == null ? '—' : n.toFixed(digits);
}

function buildReport(results, meta) {
  const lines = [];
  const models = [...new Set(results.map(r => r.model))];

  lines.push('# Model comparison', '');
  lines.push(`- resume: \`${meta.resume}\``);
  lines.push(`- contexts: ${selectedContexts.join(', ')}`);
  lines.push(`- languages: ${selectedLanguages.join(', ')}`);
  lines.push(`- runs: ${results.length}`);
  lines.push('');

  // Headline table: one row per model, aggregated.
  lines.push('## Summary', '');
  lines.push('| Model | Route | OK | Schema fail | Protected headings | Mandated removals | Bangla coverage | Bangla violations | Median latency | Total cost |');
  lines.push('|---|---|---|---|---|---|---|---|---|---|');

  for (const key of models) {
    const rows = results.filter(r => r.model === key);
    const ok = rows.filter(r => r.parse === 'ok' && r.schema === 'ok').length;
    const schemaFail = rows.filter(r => r.parse === 'failed' || r.schema === 'failed').length;
    const protectedHits = rows.reduce((a, r) => a + (r.protectedHeadingHits ?? 0), 0);
    const mandatedHits = rows.reduce((a, r) => a + (r.mandatedRemovalHits ?? 0), 0);

    const bnRows = rows.filter(r => r.language === 'bn' && r.banglaCoverage != null);
    const bnCoverage = bnRows.length
      ? Math.round(bnRows.reduce((a, r) => a + r.banglaCoverage, 0) / bnRows.length)
      : null;
    const bnViolations = bnRows.reduce((a, r) => a + (r.banglaViolations ?? 0), 0);

    const latencies = rows.map(r => r.durationMs).filter(Boolean).sort((a, b) => a - b);
    const median = latencies.length ? latencies[Math.floor(latencies.length / 2)] : null;

    const costs = rows.map(r => r.costUsd).filter(c => c != null);
    const totalCost = costs.length === rows.length && costs.length > 0
      ? costs.reduce((a, c) => a + c, 0)
      : null;

    const route = rows[0]?.provider ?? '—';
    const label = rows[0]?.modelLabel ?? key;

    lines.push(
      `| ${label} | ${route} | ${ok}/${rows.length} | ${schemaFail} | ${protectedHits} | `
      + `${mandatedHits} | ${bnCoverage == null ? '—' : bnCoverage + '%'} | ${bnViolations} | `
      + `${median == null ? '—' : (median / 1000).toFixed(1) + 's'} | `
      + `${totalCost == null ? '—' : '$' + totalCost.toFixed(5)} |`
    );
  }

  lines.push('');
  lines.push('**Protected headings** — headings the server had to strip because the channel protects them and the model flagged them anyway. Lower is better; these never reach the user, but a high count means the model is leaning on the backstop rather than following the rule.');
  lines.push('');
  lines.push('**Mandated removals** — advice telling a government-form applicant to remove a field the form requires. This is the hard failure: acting on it gets a BCS application rejected. Any number above zero is a finding, not a nit.');
  lines.push('');
  lines.push('**Bangla coverage** — share of narrative fields actually written in Bangla. **Bangla violations** — fields that must stay English but were translated (CV correction text, ATS keywords). A single violation fails the run: it tells the candidate to paste Bangla into an English CV.');
  lines.push('');

  // Per-run detail.
  lines.push('## Every run', '');
  lines.push('| Model | Context | Lang | Parse | Schema | Protected | Mandated | Bangla | Latency | Cost |');
  lines.push('|---|---|---|---|---|---|---|---|---|---|');

  for (const r of results) {
    const bangla = r.language === 'bn'
      ? (r.banglaCoverage == null ? '—' : `${r.banglaCoverage}%${r.banglaViolations ? ` (${r.banglaViolations} viol)` : ''}`)
      : '—';
    lines.push(
      `| ${r.model} | ${r.context} | ${r.language} | ${r.parse ?? 'error'} | ${r.schema ?? '—'} | `
      + `${r.protectedHeadingHits ?? '—'} | ${r.mandatedRemovalHits ?? '—'} | ${bangla} | `
      + `${fmt(r.durationMs / 1000, 1)}s | ${r.costUsd == null ? '—' : '$' + r.costUsd.toFixed(5)} |`
    );
  }

  // Findings worth reading in full rather than as a count.
  const withMandated = results.filter(r => (r.mandatedRemovalHits ?? 0) > 0);
  if (withMandated.length) {
    lines.push('', '## Mandated-field removal advice (verbatim)', '');
    lines.push('Each of these told a government-form applicant to remove something the form requires.', '');
    for (const r of withMandated) {
      lines.push(`**${r.model} · ${r.context} · ${r.language}**`, '');
      for (const s of r.mandatedRemovalSamples ?? []) lines.push(`- ${s}`);
      lines.push('');
    }
  }

  const withViolations = results.filter(r => (r.banglaViolations ?? 0) > 0);
  if (withViolations.length) {
    lines.push('', '## Bangla contract violations (verbatim)', '');
    lines.push('Fields that must stay English but came back in Bangla.', '');
    for (const r of withViolations) {
      lines.push(`**${r.model} · ${r.context}**`, '');
      for (const v of r.banglaViolationSamples ?? []) lines.push(`- \`${v.field}\` — ${v.value}`);
      lines.push('');
    }
  }

  const failures = results.filter(r => r.error);
  if (failures.length) {
    lines.push('', '## Runs that did not complete', '');
    for (const r of failures) lines.push(`- **${r.model} · ${r.context} · ${r.language}** — ${r.error}`);
    lines.push('');
  }

  lines.push('', '---', '');
  lines.push('_Generated by `server/scripts/compare-models.js`. Every check uses the same code that runs in production; whether the Bangla reads well is still a human judgement._');

  return lines.join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────

const plan = [];
for (const candidate of selectedModels) {
  const route = routeFor(candidate);
  if (!route) {
    console.warn(`Skipping ${candidate.key}: no route under --provider ${values.provider}.`);
    continue;
  }
  for (const contextKey of selectedContexts) {
    for (const language of selectedLanguages) {
      plan.push({ candidate, route, contextKey, language });
    }
  }
}

if (plan.length === 0) {
  console.error('Nothing to run.');
  process.exit(1);
}

console.log(`Plan: ${plan.length} API calls`);
for (const candidate of selectedModels) {
  const route = routeFor(candidate);
  console.log(`  ${candidate.key.padEnd(24)} ${route ? `${route.provider}: ${route.modelId}` : 'SKIPPED'}`);
}
console.log(`  contexts:  ${selectedContexts.join(', ')}`);
console.log(`  languages: ${selectedLanguages.join(', ')}`);
console.log('');

if (values['dry-run']) {
  console.log('Dry run — nothing sent.');
  process.exit(0);
}

if (values.verify) {
  const ok = await verifyModels();
  process.exit(ok ? 0 : 1);
}

const resumePath = path.resolve(PROJECT_ROOT, values.resume);
let resumeText;
try {
  resumeText = resumePath.endsWith('.txt')
    ? await readFile(resumePath, 'utf-8')
    : await extractText(resumePath);
} catch (err) {
  console.error(`Could not read resume at ${resumePath}: ${err.message}`);
  process.exit(1);
}
console.log(`Resume: ${values.resume} (${resumeText.length} chars extracted)\n`);

const results = [];
let n = 0;

for (const item of plan) {
  n += 1;
  const tag = `${item.candidate.key} · ${item.contextKey} · ${item.language}`;
  process.stdout.write(`[${n}/${plan.length}] ${tag} ... `);

  try {
    const result = await runOne({ ...item, resumeText });
    results.push(result);

    const bits = [`${(result.durationMs / 1000).toFixed(1)}s`];
    if (result.parse !== 'ok') bits.push('PARSE FAILED');
    else {
      if (result.schema !== 'ok') bits.push('SCHEMA FAILED');
      if (result.mandatedRemovalHits) bits.push(`${result.mandatedRemovalHits} MANDATED`);
      if (result.protectedHeadingHits) bits.push(`${result.protectedHeadingHits} protected`);
      if (item.language === 'bn') bits.push(`${result.banglaCoverage}% bn`);
      if (result.banglaViolations) bits.push(`${result.banglaViolations} VIOLATIONS`);
    }
    console.log(bits.join(' · '));
  } catch (err) {
    // One model being unavailable should not cost the whole comparison.
    const status = err?.status ? `${err.status} ` : '';
    const message = `${status}${err?.message?.split('\n')[0] ?? err}`;
    console.log(`ERROR — ${message}`);
    results.push({
      model: item.candidate.key,
      modelLabel: item.candidate.label,
      provider: item.route.provider,
      modelId: item.route.modelId,
      context: item.contextKey,
      language: item.language,
      error: message,
    });
  }
}

const stamp = new Date().toISOString().split('T')[0];
const outDir = path.resolve(PROJECT_ROOT, values.out ?? `ai_testing/comparison/${stamp}`);
await mkdir(outDir, { recursive: true });

await writeFile(
  path.join(outDir, 'results.json'),
  JSON.stringify({ resume: values.resume, generated: new Date().toISOString(), results }, null, 2),
  'utf-8'
);

const report = buildReport(results, { resume: values.resume });
await writeFile(path.join(outDir, 'summary.md'), report, 'utf-8');

console.log(`\nWrote ${outDir}/summary.md`);
console.log(`      ${outDir}/results.json\n`);
console.log(report.split('\n## Every run')[0]);
