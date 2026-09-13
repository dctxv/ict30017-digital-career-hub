/**
 * Module: utils/aiStatus
 * Responsibility: The one table that turns an ai-service failure code into an
 * HTTP status, so the resume, preparation and chat routes cannot disagree.
 *
 * Two rules, and both are about what the client can tell apart.
 *
 * A provider failure is never a 429. The client's error screen reads 429 as
 * the caller's own allowance being spent — which is what the quota middleware
 * and the per-IP limiter send — and a throttled provider rendered that way
 * once told a premium account it had reached a limit it does not have.
 *
 * Transient failures are 503 and configuration failures are 502. The
 * distinction is for whoever reads the log: a 503 says wait and retry, a 502
 * says the server itself is misconfigured and no amount of retrying by the
 * user will change the outcome. The code itself is sent in the body either
 * way, so the screen can say which.
 */

import { AI_ERROR_CODES } from 'ai-service';

const STATUS_BY_CODE = Object.freeze({
  AI_BUSY: 503,
  AI_QUOTA: 503,
  AI_UNAVAILABLE: 503,
  AI_UNREACHABLE: 503,
  AI_AUTH: 502,
  AI_MODEL: 502,
  AI_BAD_REQUEST: 502,
  AI_ERROR: 502,
});

const KNOWN = new Set(AI_ERROR_CODES);

/**
 * @param {unknown} code
 * @returns {boolean} whether this is a provider-failure code from ai-service
 */
export function isAiErrorCode(code) {
  return typeof code === 'string' && KNOWN.has(code);
}

/**
 * @param {string} code an AI_* code
 * @returns {number} the HTTP status to answer with
 */
export function statusForAiErrorCode(code) {
  return STATUS_BY_CODE[code] ?? 502;
}
