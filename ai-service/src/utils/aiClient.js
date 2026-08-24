import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Single source of truth: server/.env. Resolved relative to this file so it
// works regardless of the CWD the ai-service is invoked from.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../server/.env') });

let _client = null;

export function getGroqClient() {
  if (!_client) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error(
        'OPENROUTER_API_KEY is not set. Add it to your .env file.'
      );
    }
    _client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
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
 * Production models (May 2026 feasibility report, confirmed with the client):
 *   free    -> Gemini 3.1 Flash Lite  (google/gemini-3.1-flash-lite)
 *   premium -> Claude Haiku 4.5       (anthropic/claude-haiku-4.5)
 *
 * Live calls to those two are not wired yet — pending client API budget
 * approval. Both tiers currently point at the same working model, so the
 * cutover is a pure env-var change with no code edit.
 *
 * The tier parameter exists so free/premium routing is structurally present.
 * Nothing selects a tier yet: registration ignores the chosen plan, so every
 * caller defaults to 'free'. This is the seam for that work, not the work.
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
 * @returns {string} the OpenRouter model id
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
