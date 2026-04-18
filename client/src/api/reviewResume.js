import { parse as parsePartial } from 'partial-json';

const ENDPOINT = 'http://localhost:3000/api/resume/analyze-stream';

/**
 * Streams an AI resume review from the backend.
 *
 * The server emits SSE frames:
 *   data: {"t":"<token piece>"}         — append to accumulator, try partial parse
 *   data: {"done":true,"feedback":{…}}  — final validated object
 *   data: {"error":"…","message":"…"}   — terminal error
 *
 * Callbacks:
 *   onPartial(obj)         — fired as the JSON becomes parseable (may be missing fields)
 *   onDone(feedback)       — fired once with the final validated feedback
 *   onError(code, message) — fired on server-side error; stream ends after
 */
export async function streamResumeReview(file, { onPartial, onDone, onError }) {
  const form = new FormData();
  form.append('resume', file);

  let response;
  try {
    response = await fetch(ENDPOINT, { method: 'POST', body: form });
  } catch (err) {
    onError?.('NETWORK', err.message || 'Could not reach the server.');
    return;
  }

  if (!response.ok) {
    let msg = `Request failed (${response.status}).`;
    try {
      const data = await response.json();
      if (data?.error) msg = data.error;
    } catch { /* response wasn't JSON */ }
    onError?.(`HTTP_${response.status}`, msg);
    return;
  }

  if (!response.body) {
    onError?.('NO_BODY', 'Server returned no response body.');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      if (!frame.startsWith('data:')) continue;

      const payload = frame.slice(5).trim();
      if (!payload) continue;

      let envelope;
      try {
        envelope = JSON.parse(payload);
      } catch {
        continue;
      }

      if (envelope.error) {
        onError?.(envelope.error, envelope.message || 'Analysis failed.');
        return;
      }

      if (envelope.done) {
        onDone?.(envelope.feedback);
        return;
      }

      if (typeof envelope.t === 'string') {
        accumulated += envelope.t;
        try {
          const partial = parsePartial(accumulated);
          if (partial && typeof partial === 'object') onPartial?.(partial);
        } catch { /* not yet parseable */ }
      }
    }
  }
}
