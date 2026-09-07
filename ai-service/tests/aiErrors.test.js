/**
 * Tests for the provider failure classifier.
 *
 * Each case is a failure that has actually been seen against Google AI Studio,
 * in the shape the openai SDK hands it over — once the array body has been
 * unwrapped by aiClient.js. The point of pinning them is that every one of
 * these used to reach the user as "Analysis failed" and the log as a stack
 * trace, and the fix for each is different.
 *
 * Run: npm test --prefix ai-service
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import OpenAI from 'openai';

import { classifyAiError, formatAiErrorLog, messageForAiErrorCode, AI_ERROR_CODES } from '../src/utils/aiErrors.js';
import { unwrapProviderErrors } from '../src/utils/aiClient.js';

/** Builds the error the SDK would throw for a given status and Google body. */
function sdkError(status, body) {
  return OpenAI.APIError.generate(status, body, undefined, new Headers());
}

describe('classifyAiError', () => {
  it('reads an invalid key, which Google reports as a 400', () => {
    const err = sdkError(400, { error: { code: 400, message: 'Please pass a valid API key', status: 'INVALID_ARGUMENT' } });
    const out = classifyAiError(err);
    assert.equal(out.code, 'AI_AUTH');
    assert.equal(out.retryable, false);
    assert.match(out.hint, /GOOGLE_AI_API_KEY/);
  });

  it('treats 401 and 403 as the key being rejected', () => {
    assert.equal(classifyAiError(sdkError(401, { error: { message: 'unauthenticated' } })).code, 'AI_AUTH');
    assert.equal(classifyAiError(sdkError(403, { error: { message: 'permission denied' } })).code, 'AI_AUTH');
  });

  it('reads a model this key cannot use', () => {
    const err = sdkError(404, {
      error: { code: 404, message: 'models/gemini-2.5-flash is no longer available to new users.', status: 'NOT_FOUND' },
    });
    const out = classifyAiError(err);
    assert.equal(out.code, 'AI_MODEL');
    assert.match(out.hint, /AI_MODEL_FREE/);
  });

  it('separates a spent daily quota from a per-minute throttle', () => {
    const exhausted = sdkError(429, {
      error: {
        code: 429,
        message: 'You exceeded your current quota, please check your plan and billing details.',
        status: 'RESOURCE_EXHAUSTED',
        details: [{ '@type': 'type.googleapis.com/google.rpc.QuotaFailure', violations: [{ quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier' }] }],
      },
    });
    assert.equal(classifyAiError(exhausted).code, 'AI_QUOTA');

    const throttled = sdkError(429, { error: { code: 429, message: 'Resource has been exhausted (e.g. check quota).', status: 'RESOURCE_EXHAUSTED' } });
    assert.equal(classifyAiError(throttled).code, 'AI_BUSY');
    assert.equal(classifyAiError(throttled).retryable, true);
  });

  it('keeps the old stringified-429 path working', () => {
    assert.equal(classifyAiError(new Error('Request failed with 429')).code, 'AI_BUSY');
  });

  it('reads a provider outage', () => {
    assert.equal(classifyAiError(sdkError(503, { error: { message: 'The model is overloaded.' } })).code, 'AI_UNAVAILABLE');
    assert.equal(classifyAiError(sdkError(500, undefined)).code, 'AI_UNAVAILABLE');
  });

  it('reads a network that cannot reach the provider', () => {
    const cause = Object.assign(new Error('getaddrinfo ENOTFOUND generativelanguage.googleapis.com'), { code: 'ENOTFOUND' });
    const err = new OpenAI.APIConnectionError({ message: 'Connection error.', cause });
    const out = classifyAiError(err);
    assert.equal(out.code, 'AI_UNREACHABLE');
    assert.equal(out.status, null);
  });

  it('reads a rejected request body as a bad request, not as a key problem', () => {
    const err = sdkError(400, { error: { message: 'Invalid JSON payload received. Unknown name "frequency_penalty": Cannot find field.' } });
    assert.equal(classifyAiError(err).code, 'AI_BAD_REQUEST');
  });

  it('never throws, and labels the unknown as AI_ERROR with the detail kept', () => {
    const out = classifyAiError({ weird: true, message: 'something odd' });
    assert.equal(out.code, 'AI_ERROR');
    assert.match(out.detail, /something odd/);
    assert.equal(classifyAiError(undefined).code, 'AI_ERROR');
  });

  it('gives every code a user sentence and an operator hint', () => {
    for (const code of AI_ERROR_CODES) {
      assert.ok(messageForAiErrorCode(code), `${code} has no user message`);
    }
    assert.equal(messageForAiErrorCode('NOT_A_CODE'), null);
  });

  it('formats one greppable log line naming the fix', () => {
    const line = formatAiErrorLog('chatbot', classifyAiError(sdkError(401, { error: { message: 'nope' } })));
    assert.match(line, /^\[ai-upstream\] source=chatbot code=AI_AUTH status=401/);
    assert.match(line, /aistudio\.google\.com/);
  });
});

describe('unwrapProviderErrors', () => {
  it('unwraps the array body Google sends on failure so the SDK can read it', async () => {
    const body = JSON.stringify([{ error: { code: 400, message: 'Please pass a valid API key', status: 'INVALID_ARGUMENT' } }]);
    const fakeFetch = async () => new Response(body, {
      status: 400,
      headers: { 'content-type': 'application/json', 'content-encoding': 'gzip', 'content-length': '999' },
    });

    const response = await unwrapProviderErrors(fakeFetch)('https://example.test', {});
    assert.equal(response.status, 400);
    assert.equal(response.headers.get('content-encoding'), null);
    const parsed = await response.json();
    assert.equal(parsed.error.message, 'Please pass a valid API key');
  });

  it('leaves successful responses untouched', async () => {
    const original = new Response('{"ok":true}', { status: 200 });
    const fakeFetch = async () => original;
    const response = await unwrapProviderErrors(fakeFetch)('https://example.test', {});
    assert.strictEqual(response, original);
  });

  it('passes a non-JSON error body through as text', async () => {
    const fakeFetch = async () => new Response('<html>502 Bad Gateway</html>', { status: 502 });
    const response = await unwrapProviderErrors(fakeFetch)('https://example.test', {});
    assert.equal(await response.text(), '<html>502 Bad Gateway</html>');
  });
});
