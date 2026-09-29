import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

/**
 * POST /api/preparation/interviews/:id/transcribe, through the real router.
 *
 * The database is replaced by a stub on the shared pool, and no Groq key is set,
 * so nothing here needs PostgreSQL or reaches the network. What is pinned is
 * everything the route decides before a recording could be sent anywhere: that
 * it serves only the caller's own open live interview, that it refuses
 * anything that is not audio, and that a server with no key says so rather
 * than failing obscurely. Those are the checks that keep the server's shared
 * Whisper allowance from being spent on anything but interview answers.
 */

// Set before the router is imported, so dotenv — which never overwrites a
// variable that is already defined — cannot load a real key from server/.env
// and send a test recording to Groq.
process.env.GROQ_API_KEY = '';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-to-pass-the-check';

const { default: pool } = await import('../db.js');
const { default: preparationRouter } = await import('./preparation.js');
const { AUDIO_MAX_BYTES } = await import('ai-service');

/** interview_id → row, as the route's lookup would find it for user 7. */
let interviews = new Map();

pool.query = async (sql, params) => {
  if (/FROM users WHERE user_id/.test(sql)) return { rows: [{ is_active: true }] };
  if (/FROM mock_interviews WHERE interview_id = \$1 AND user_id = \$2/.test(sql)) {
    const row = interviews.get(Number(params[0]));
    return { rows: row && String(params[1]) === '7' ? [row] : [] };
  }
  throw new Error(`Unexpected query in test: ${sql}`);
};

const app = express();
app.use(cookieParser());
app.use('/api/preparation', preparationRouter);
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}/api/preparation`;

test.after(() => server.close());

const token = jwt.sign({ id: 7, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1h' });

function post(id, { file, auth = true } = {}) {
  const body = new FormData();
  if (file) body.append('audio', file, 'answer');
  return fetch(`${base}/interviews/${id}/transcribe`, {
    method: 'POST',
    headers: auth ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
}

const recording = () => new Blob([new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 1, 2, 3])], { type: 'audio/webm;codecs=opus' });

test.beforeEach(() => {
  process.env.GROQ_API_KEY = '';
  interviews = new Map([
    [1, { status: 'in_progress', mode: 'live' }],
    [2, { status: 'in_progress', mode: 'written' }],
    [3, { status: 'complete', mode: 'live' }],
  ]);
});

test('requires a signed-in caller', async () => {
  const res = await post(1, { file: recording(), auth: false });
  assert.equal(res.status, 401);
});

test('refuses an interview that is not the caller\'s, without saying it exists', async () => {
  const res = await post(99, { file: recording() });
  assert.equal(res.status, 404);
});

test('refuses a written interview, which has nothing to dictate', async () => {
  const res = await post(2, { file: recording() });
  assert.equal(res.status, 409);
  assert.match((await res.json()).error, /live interview/);
});

test('refuses an interview that has already been assessed', async () => {
  const res = await post(3, { file: recording() });
  assert.equal(res.status, 409);
});

test('refuses an upload that is not audio', async () => {
  const res = await post(1, { file: new Blob(['%PDF-1.4'], { type: 'application/pdf' }) });
  assert.equal(res.status, 415);
  assert.equal((await res.json()).code, 'TRANSCRIBE_BAD_AUDIO');
});

test('refuses a request with no recording in it', async () => {
  const res = await post(1);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).code, 'TRANSCRIBE_BAD_AUDIO');
});

test('refuses a recording over the size cap before sending it anywhere', async () => {
  const oversized = new Blob([new Uint8Array(AUDIO_MAX_BYTES + 1)], { type: 'audio/webm' });
  const res = await post(1, { file: oversized });
  assert.equal(res.status, 413);
  assert.equal((await res.json()).code, 'TRANSCRIBE_TOO_LARGE');
});

test('says plainly when the server has no Groq key', async () => {
  const res = await post(1, { file: recording() });
  assert.equal(res.status, 503);
  assert.equal((await res.json()).code, 'TRANSCRIBE_NOT_CONFIGURED');
});

test('refuses a large upload with its real reason, not a dropped connection', async () => {
  // Refused before the body is read. Answering mid-upload without draining it
  // can reset the socket, and the candidate would be told to check their
  // internet instead of that the interview is already finished.
  const large = new Blob([new Uint8Array(4 * 1024 * 1024)], { type: 'audio/mp4' });
  const res = await post(3, { file: large });
  assert.equal(res.status, 409);
  assert.match((await res.json()).error, /already been assessed/);
});
