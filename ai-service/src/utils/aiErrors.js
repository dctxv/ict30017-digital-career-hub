/**
 * Module: utils/aiErrors
 * Responsibility: Turn whatever the model provider threw into one of a small
 * set of codes, each with a sentence for the user and a hint for whoever is
 * running the server.
 *
 * Before this existed every call site had one branch: a 429 became AI_BUSY and
 * everything else was rethrown, so a rejected API key, a model closed to new
 * keys, a daily quota spent and a network that cannot reach Google all reached
 * the user as "Analysis failed" and reached the log as a 40-line SDK dump with
 * the actual reason buried in the middle. On a fresh machine — which is where
 * the client will run this — those four are the failures that actually happen,
 * and each one has a different fix.
 *
 * The codes are the contract with the server. It maps them to HTTP statuses and
 * writes one log line per failure; the client's error screen keys its copy off
 * the same code. Add a code here, then add it in both of those places.
 *
 * Google AI Studio's OpenAI-compatible endpoint is the provider this reads, and
 * two of its habits shape the rules below:
 *
 *  - An invalid key is a 400, not a 401. The body says "API key not valid" with
 *    reason API_KEY_INVALID, so a 400 is only AI_BAD_REQUEST once the body has
 *    been checked for that.
 *  - A 429 is either per-minute throttling or the day's free allowance spent,
 *    and the body names which: the QuotaFailure detail carries a quotaId such
 *    as GenerateRequestsPerDayPerProjectPerModel-FreeTier. Telling someone to
 *    "try again in a minute" when the quota resets at midnight Pacific sends
 *    them to retry a request that cannot succeed until tomorrow.
 */

/** One entry per code. `error` is shown to the user; `hint` is for the log. */
const CATALOGUE = Object.freeze({
  AI_AUTH: {
    error: 'The AI service rejected this server\'s API key. The site administrator needs to check the configuration.',
    hint: 'GOOGLE_AI_API_KEY in server/.env was rejected. Create a key at https://aistudio.google.com/apikey and paste it in without quotes, then restart the server.',
    retryable: false,
  },
  AI_MODEL: {
    error: 'The AI model this server is configured to use is not available. The site administrator needs to check the configuration.',
    hint: 'AI_MODEL_FREE / AI_MODEL_PREMIUM in server/.env name a model this key cannot use. Use the bare Google AI Studio id (gemini-3.6-flash, not google/gemini-3.6-flash), and remember the /models listing advertises models that 404 on use. Run `npm run check` in server/ to test a real completion.',
    retryable: false,
  },
  AI_QUOTA: {
    error: 'The AI service\'s daily allowance for this server has been used up. Please try again tomorrow.',
    hint: 'The Google AI Studio project has spent its free-tier daily quota for this model. It resets at midnight Pacific time. Enable billing on the project, use a different model id, or wait.',
    retryable: false,
  },
  AI_BUSY: {
    error: 'The AI service is busy right now. Please try again in a minute.',
    hint: 'The provider throttled the request (per-minute rate limit). Nothing to fix unless it persists.',
    retryable: true,
  },
  AI_UNAVAILABLE: {
    error: 'The AI service is temporarily unavailable. Please try again in a few minutes.',
    hint: 'The provider returned a 5xx. This is on their side; retry later. gemini-3.7-flash in particular returns 503 under demand.',
    retryable: true,
  },
  AI_UNREACHABLE: {
    error: 'The AI service could not be reached. Please check the connection and try again.',
    hint: 'The server could not open a connection to generativelanguage.googleapis.com. Check this machine\'s internet access, proxy and firewall.',
    retryable: true,
  },
  AI_BAD_REQUEST: {
    error: 'The AI service refused the request. The site administrator needs to check the server log.',
    hint: 'The provider rejected the request body with a 400. Usually a completion parameter this endpoint does not accept (frequency_penalty and presence_penalty were removed for exactly this reason) or a prompt over the model\'s context limit.',
    retryable: false,
  },
  AI_ERROR: {
    error: 'The AI service returned an unexpected error. Please try again.',
    hint: 'Unclassified provider failure; see the detail in this log line.',
    retryable: true,
  },
});

export const AI_ERROR_CODES = Object.freeze(Object.keys(CATALOGUE));

/**
 * Pulls the provider's own message out of an SDK error, wherever it put it.
 *
 * The openai SDK exposes the parsed body as `err.error`, which for Google is
 * `{ error: { code, message, status, details } }`. Older paths and non-SDK
 * errors only have `err.message`. Everything is flattened to one string so the
 * rules below can grep it without caring which shape arrived.
 */
function describe(err) {
  const parts = [];
  if (err?.message) parts.push(String(err.message));
  const body = err?.error;
  if (body) {
    try {
      parts.push(typeof body === 'string' ? body : JSON.stringify(body));
    } catch {
      // Unserialisable body: the message alone will have to do.
    }
  }
  if (err?.cause?.message) parts.push(String(err.cause.message));
  if (err?.code) parts.push(String(err.code));
  return parts.join(' | ');
}

function statusOf(err) {
  const status = err?.status ?? err?.statusCode ?? err?.response?.status;
  return Number.isInteger(status) ? status : null;
}

const NETWORK_CODES = /\b(ECONNREFUSED|ECONNRESET|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|EHOSTUNREACH|ENETUNREACH|UND_ERR|CERT_|SELF_SIGNED)/;

/**
 * @typedef {{code: string, error: string, hint: string, retryable: boolean, status: number|null, detail: string}} ClassifiedAiError
 */

/**
 * Classifies a failure thrown by the model client.
 *
 * Never throws. Anything it does not recognise comes back as AI_ERROR with the
 * original message in `detail`, so a caller can always log one line and reply
 * with a sentence rather than rethrowing.
 *
 * @param {unknown} err
 * @returns {ClassifiedAiError}
 */
export function classifyAiError(err) {
  const status = statusOf(err);
  const detail = describe(err);
  const lower = detail.toLowerCase();

  let code;

  if (status === 401 || status === 403) {
    code = 'AI_AUTH';
  } else if (status === 400 && /api[ _]?key|api_key_invalid|unauthenticated|permission/i.test(detail)) {
    code = 'AI_AUTH';
  } else if (status === 404) {
    code = 'AI_MODEL';
  } else if (status === 400 && /model/i.test(detail) && /not (found|supported|available)|no longer available|unknown/i.test(detail)) {
    code = 'AI_MODEL';
  } else if (status === 429) {
    // Daily exhaustion names a per-day quota in the body; a minute-level
    // throttle does not. Billing wording is the other tell: "check your plan
    // and billing details" only appears once the allowance is gone.
    code = /perday|per_day|daily|billing|resource_exhausted.*quota|exceeded your current quota/i.test(lower.replace(/\s+/g, ''))
      || /per\s*day|daily|billing details|exceeded your current quota/i.test(detail)
      ? 'AI_QUOTA'
      : 'AI_BUSY';
  } else if (status !== null && status >= 500) {
    code = 'AI_UNAVAILABLE';
  } else if (status === 400) {
    code = 'AI_BAD_REQUEST';
  } else if (status === null && (NETWORK_CODES.test(detail) || /fetch failed|connection error|network|socket hang up|timed? ?out/i.test(detail))) {
    code = 'AI_UNREACHABLE';
  } else if (status === null && /429/.test(detail)) {
    // Kept for the one path that stringified a 429 before this module existed.
    code = 'AI_BUSY';
  } else {
    code = 'AI_ERROR';
  }

  const entry = CATALOGUE[code];
  return {
    code,
    error: entry.error,
    hint: entry.hint,
    retryable: entry.retryable,
    status,
    detail: detail.slice(0, 600),
  };
}

/**
 * The single log line every call site writes for a classified failure.
 *
 * Shaped so one grep — `[ai-upstream]` — finds every provider failure, and so
 * the line says what to do rather than only what happened.
 *
 * @param {string} label caller, e.g. 'AI-stream' or 'chatbot'
 * @param {ClassifiedAiError} classified
 * @returns {string}
 */
export function formatAiErrorLog(label, classified) {
  const status = classified.status === null ? 'none' : classified.status;
  return `[ai-upstream] source=${label} code=${classified.code} status=${status} detail=${JSON.stringify(classified.detail)}\n[ai-upstream] ${classified.hint}`;
}

/**
 * Convenience for callers that only need the user-facing sentence for a code
 * they already hold, such as the server mapping a code to a response.
 *
 * @param {string} code
 * @returns {string|null}
 */
export function messageForAiErrorCode(code) {
  return CATALOGUE[code]?.error ?? null;
}
