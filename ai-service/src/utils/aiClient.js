import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Single source of truth: server/.env. Resolved relative to this file so it
// works regardless of the CWD the ai-service is invoked from.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../server/.env') });

let _client = null;

/**
 * Google wraps its error body in a JSON array — `[{ "error": {...} }]` — and
 * the openai SDK reads `body.error`, which an array does not have. Every
 * provider failure therefore surfaced as "400 status code (no body)" with the
 * actual reason ("Please pass a valid API key", "model not found") discarded
 * before anything could read it. This unwraps the first element on error
 * responses only; successful responses pass through untouched.
 *
 * Exported so the setup check and the model comparison harness can build a
 * client that fails with the same readable message the app does.
 *
 * @param {typeof fetch} [baseFetch]
 * @returns {typeof fetch}
 */
export function unwrapProviderErrors(baseFetch = fetch) {
  return async (url, init) => {
    const response = await baseFetch(url, init);
    if (response.ok) return response;

    const text = await response.text();
    let body = text;
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed[0] && typeof parsed[0] === 'object') {
        body = JSON.stringify(parsed[0]);
      }
    } catch {
      // Not JSON: hand it on as it is so the SDK reports the raw text.
    }

    // The body has already been decoded, so the encoding and length headers
    // describe bytes that no longer exist and must not travel with it.
    const headers = new Headers(response.headers);
    headers.delete('content-encoding');
    headers.delete('content-length');

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

export function getGroqClient() {
  if (!_client) {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error(
        'GOOGLE_AI_API_KEY is not set. Add it to server/.env. Create a key at ' +
        'https://aistudio.google.com/apikey.'
      );
    }
    // Google AI Studio speaks the OpenAI wire format at this endpoint, so the
    // `openai` SDK and every existing call site work unchanged. The trailing
    // slash matters: the SDK appends 'chat/completions' to this path, and
    // without it the last segment is replaced rather than extended.
    _client = new OpenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      fetch: unwrapProviderErrors(),
      // Every call site classifies the failure and answers the user itself, so
      // the SDK's own retries only make a rejected key take three times as
      // long to report. Genuinely transient failures return a retryable code
      // and the user is told to try again.
      maxRetries: 1,
    });
  }
  return _client;
}

/* ── Model resolution ──────────────────────────────────────────────────────
 *
 * Models are resolved per tier from the environment. There is deliberately no
 * hardcoded default: a missing value is a startup failure, never a silent
 * substitution. The previous implementation fell back to 'openai/gpt-4o-mini',
 * which meant an unset AI_MODEL silently shipped a banned model to production.
 *
 * Production model: a single model on both tiers until further notice.
 *   free    -> Gemini 3.6 Flash  (gemini-3.6-flash)
 *   premium -> Gemini 3.6 Flash  (gemini-3.6-flash)
 *
 * Model ids here are Google AI Studio ids, which carry no vendor prefix. An
 * OpenRouter-style 'google/gemini-3.6-flash' is a 404 against this endpoint —
 * that is the one thing to check first if resolution starts failing.
 *
 * The second thing to check is whether the model still accepts new keys. The
 * models listing is not authoritative: gemini-2.5-flash was the first value
 * tried here and is still advertised by /v1beta/openai/models, but returns a
 * 404 on use — "no longer available to new users" — because Google closed it
 * to keys created after the fact. A 404 from a chat completion is far more
 * likely to mean this than a bad key or a wrong URL.
 *
 * This supersedes both the GLM-5.2 pair (client decision 2026-08-22, dropped
 * because GLM is not served by Google AI Studio) and the split proposed in the
 * May 2026 feasibility report (Gemini 3.1 Flash Lite free / Claude Haiku 4.5
 * premium, never wired up; the Anthropic half is likewise unavailable here).
 * The per-tier variables stay separate so reinstating a split — within Google's
 * catalogue — is a pure env-var change with no code edit.
 *
 * The tier parameter is live, not a placeholder. Registration persists the
 * chosen plan to users.tier, the quota middleware reads it, and resolveTier in
 * routes/resume.js passes it here — so a premium account genuinely resolves
 * AI_MODEL_PREMIUM. With both variables currently naming the same model that
 * makes no observable difference, which is exactly why this comment is worth
 * keeping accurate: it previously said the opposite, and it is the first thing
 * anyone reads when asking why a premium account behaves like a free one.
 */

export const TIERS = Object.freeze(['free', 'premium']);

const DEFAULT_TIER = 'free';

const TIER_ENV_VAR = Object.freeze({
  free: 'AI_MODEL_FREE',
  premium: 'AI_MODEL_PREMIUM',
});

// Client decision: the GPT-4o family is never a production model. Enforced on
// every resolution, not just at startup, so no code path can reach it even if
// the environment is edited after boot.
const BANNED_MODEL_PATTERN = /gpt-?4o/i;

function readTierModel(tier) {
  const envVar = TIER_ENV_VAR[tier];
  const value = process.env[envVar]?.trim();

  if (!value) {
    // AI_MODEL was the single pre-tier variable. Naming it in the error saves
    // the next person a bisect when their existing .env stops working.
    const legacyHint = process.env.AI_MODEL
      ? ` AI_MODEL is set but no longer read — it was replaced by ${TIERS.map(t => TIER_ENV_VAR[t]).join(' and ')}.`
      : '';
    throw new Error(
      `${envVar} is not set. The ${tier} tier has no model configured and there is ` +
      `no fallback by design. Set ${envVar} in server/.env.${legacyHint}`
    );
  }

  if (BANNED_MODEL_PATTERN.test(value)) {
    throw new Error(
      `${envVar} is set to "${value}", which is in the GPT-4o family. That family is ` +
      'banned as a production model by client decision (May 2026 feasibility report). ' +
      'Choose a different model.'
    );
  }

  return value;
}

/**
 * Validates the model configuration for every tier.
 *
 * Called at server startup (server/src/app.js) so a misconfigured environment
 * fails on boot rather than on the first user request. getModel() re-validates
 * on each call, so this is an early-warning check, not the only guard.
 *
 * @throws {Error} if any tier's model is unset or names a banned model
 */
export function assertModelConfig() {
  for (const tier of TIERS) {
    readTierModel(tier);
  }
}

/**
 * Resolves the model for a tier.
 *
 * @param {'free'|'premium'} [tier='free'] - defaults to free until the plan
 *   system exists; no caller passes a tier yet.
 * @returns {string} the Google AI Studio model id
 * @throws {Error} if the tier is unknown, unconfigured, or names a banned model
 */
export function getModel(tier = DEFAULT_TIER) {
  if (!TIERS.includes(tier)) {
    throw new Error(
      `Unknown model tier "${tier}". Expected one of: ${TIERS.join(', ')}.`
    );
  }
  return readTierModel(tier);
}
