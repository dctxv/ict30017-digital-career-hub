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
 *    and ONLY RetryInfo.retryDelay tells them apart. Two things that look like
 *    they would are captured fixtures in the tests, and both lie:
 *
 *      the prose      "You exceeded your current quota, please check your plan
 *                     and billing details" is boilerplate. Google sends it
 *                     word for word for a 48-second throttle.
 *      the quotaId    a burst of 26 requests against gemini-3.6-flash comes
 *                     back as GenerateRequestsPerDayPerProjectPerModel-FreeTier
 *                     — PerDay, in the name — with quotaValue 20 and
 *                     retryDelay 48s. It is a per-minute window wearing a
 *                     daily label.
 *
 *    Matching on either read every burst as the day being gone and told people
 *    to come back tomorrow when the window refilled inside a minute. The delay
 *    is the one field that is about the thing anybody actually wants to know:
 *    how long until this works again.
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
    hint: 'The Google AI Studio project has spent its free-tier daily quota for this model: the 429 asked for a wait measured in hours, or named a daily quota and gave no retry delay at all. It resets at midnight Pacific time. Enable billing on the project, use a different model id, or wait.',
    retryable: false,
  },
  AI_BUSY: {
    error: 'The AI service is busy right now. Please try again in a minute.',
    hint: 'The provider throttled the request (per-minute rate limit). Google AI Studio\'s free tier allows 20 requests per minute per model, so a burst — an e2e run, a seeding script, or a few users at once — spends it in seconds and it refills within the minute. Nothing to fix unless it persists; if it does, enable billing or space the calls out.',
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
 * A quota that calls itself daily.
 *
 * Only consulted when the provider gave no retry delay at all, because the
 * name is not trustworthy on its own: Google returns this exact quotaId for a
 * window that refills in 48 seconds. Better than nothing when there is nothing
 * else, and never allowed to overrule a delay that has been stated.
 */
const PER_DAY_QUOTA = /per_?day|requests?_per_day|per-day/i;

/**
 * Past this much waiting, "please try again in a minute" stops being honest.
 *
 * An hour rather than something tighter because per-minute windows are the
 * only short ones Google uses, and the gap between one of those and a reset at
 * midnight Pacific is wide enough that nothing sensible lives in between.
 */
const DAILY_WAIT_SECONDS = 3600;

/**
 * How long the provider asked the caller to wait, in seconds, if it said.
 *
 * Google gives this two ways and not always both: as prose in the message
 * ("Please retry in 54.961456669s") and as a RetryInfo detail carrying a
 * retryDelay. Either will do — the only question asked of it below is whether
 * the wait is seconds or hours.
 *
 * @param {string} detail
 * @returns {number|null}
 */
function retryAfterSeconds(detail) {
  const prose = /retry in ([\d.]+)\s*s/i.exec(detail);
  if (prose) return Number(prose[1]);
  const structured = /retryDelay\D{0,4}([\d.]+)s/i.exec(detail);
  if (structured) return Number(structured[1]);
  return null;
}

/**
 * Which of the two 429s this is.
 *
 * Defaults to the throttle, deliberately. When the body names no quota, "try
 * again in a minute" costs one wasted retry if it is wrong; "try again
 * tomorrow" costs the rest of the day, and the person reading it is usually
 * mid-task. A genuinely spent day names its quota or asks for hours, so the
 * evidence runs in the direction that makes the cheap default the safe one.
 *
 * @param {string} detail
 * @returns {'AI_QUOTA'|'AI_BUSY'}
 */
function classifyThrottle(detail) {
  // The stated delay settles it whenever there is one, ahead of any name in
  // the body — see the header: the quotaId says PerDay for a window that
  // refills in under a minute, so a name that disagrees with the clock is the
  // name that is wrong.
  const wait = retryAfterSeconds(detail);
  if (wait !== null) return wait >= DAILY_WAIT_SECONDS ? 'AI_QUOTA' : 'AI_BUSY';
  if (PER_DAY_QUOTA.test(detail)) return 'AI_QUOTA';
  return 'AI_BUSY';
}

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
    code = classifyThrottle(detail);
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
