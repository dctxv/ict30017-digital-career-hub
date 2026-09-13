/**
 * Module: utils/completion
 * Responsibility: One non-streaming JSON request to the model, with the failure
 * handling every caller needs and none of them should restate.
 *
 * The resume reviewer deliberately does not use this. It streams, it logs which
 * language actually arrived, and it carries a repair path shaped by two months
 * of live failures — folding that into a shared helper would mean either
 * flattening what it does or growing this into a second copy of it. What is
 * genuinely common is narrower: send a system prompt and a user message, get a
 * validated object or a reason it did not arrive.
 *
 * The 429 branch is the part worth having in one place. A rate limit here is the
 * PROVIDER throttling us, not the caller spending their allowance, and the two
 * need opposite responses — the reviewer's comments record what happens when
 * they are confused: a premium account with no limit at all was told it had
 * reached its review limit. Every caller returns the same AI_BUSY code so the
 * server can map it to a 503.
 */

import { getGroqClient, getModel } from './aiClient.js';
import { parseAIJSON } from './aiJson.js';
import { classifyAiError, formatAiErrorLog } from './aiErrors.js';

/**
 * @typedef {{ok: true, data: object, model: string, raw: string}} CompletionOk
 * @typedef {{ok: false, code: string, error: string, issues?: unknown}} CompletionFailure
 *   `code` is one of the AI_* codes in utils/aiErrors.js for a provider
 *   failure, or UNREADABLE / INVALID when the provider answered and the answer
 *   could not be used.
 */

/**
 * Sends one request and validates the reply against a Zod schema.
 *
 * @param {object} input
 * @param {string} input.label log prefix, e.g. 'interview'
 * @param {string} input.systemPrompt
 * @param {string} input.userMessage
 * @param {import('zod').ZodTypeAny} input.schema
 * @param {'free'|'premium'} [input.tier]
 * @param {object} [input.params] completion parameters
 * @param {string} [input.language] recorded in the log line only
 * @returns {Promise<CompletionOk|CompletionFailure>}
 */
export async function requestJson({
  label,
  systemPrompt,
  userMessage,
  schema,
  tier = 'free',
  params = {},
  language = 'en',
}) {
  const client = getGroqClient();
  const model = getModel(tier);

  let raw;
  try {
    const response = await client.chat.completions.create({
      model,
      ...params,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });
    raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error('AI returned an empty response.');
  } catch (err) {
    // Every provider failure is classified rather than rethrown: the caller
    // gets a code it can map to a status and the log gets one line that says
    // what to fix, instead of an SDK stack trace and a generic 500.
    const classified = classifyAiError(err);
    console.error(formatAiErrorLog(label, classified));
    return { ok: false, code: classified.code, error: classified.error };
  }

  // The same line the reviewer logs, for the same reason: whether the response
  // started in Bangla is visible at a glance and settles in one line whether a
  // language problem is the request or the model.
  const bengali = /[ঀ-৿]/;
  console.log(
    `[${label}] language=${language} model=${model} chars=${raw.length}`
    + ` responseStartedIn=${bengali.test(raw.slice(0, 600)) ? 'bangla' : 'english'}`
  );

  let parsed;
  try {
    parsed = parseAIJSON(raw, label);
  } catch {
    console.error(`[${label}] First 200 chars:`, raw.slice(0, 200));
    console.error(`[${label}] Last 300 chars:`, raw.slice(-300));
    return {
      ok: false,
      code: 'UNREADABLE',
      error: 'AI returned an unreadable response. Please try again.',
    };
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.error(`[${label}] Schema validation failed:`, JSON.stringify(result.error.issues, null, 2));
    return {
      ok: false,
      code: 'INVALID',
      error: 'The AI returned an unexpected response format. Please try again.',
      issues: result.error.issues,
    };
  }

  return { ok: true, data: result.data, model, raw };
}
