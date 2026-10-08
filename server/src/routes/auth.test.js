import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

/**
 * Sign-in through the real /api/auth router: captcha, the emailed login code,
 * email verification and session revocation.
 *
 * The database is an in-memory stand-in on the shared pool, the breach check's
 * fetch is stubbed, and email goes to the console transport (or nowhere), so
 * nothing here needs PostgreSQL, SMTP or the network.
 *
 * The case this exists for: two-step login shipped with a server that answered
 * every password with "check your email" while the login page had no step to
 * enter a code and the deployment had no way to send one, so nobody could sign
 * in. Both halves of that contract are pinned here.
 */

process.env.JWT_SECRET = 'test-secret-that-is-long-enough-to-pass-the-check';
delete process.env.SMTP_HOST;

const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  // Have I Been Pwned: no match for any password.
  if (String(url).startsWith('https://api.pwnedpasswords.com/')) {
    return new Response('', { status: 200 });
  }
  return realFetch(url, init);
};

const { default: pool } = await import('../db.js');
const { default: authRouter } = await import('./auth.js');
const { hashSessionId } = await import('../middleware/auth.js');

// ── In-memory tables ───────────────────────────────────────────────────────
let users;
let sessions;
let nextUserId;

function resetDb() {
  users = new Map();
  sessions = new Map();
  nextUserId = 1;
}

const byEmail = (email) => [...users.values()].find((u) => u.email === email);

pool.query = async (sql, params = []) => {
  const q = sql.replace(/\s+/g, ' ').trim();

  if (q.startsWith('INSERT INTO users')) {
    if (byEmail(params[1])) throw Object.assign(new Error('duplicate'), { code: '23505' });
    const row = {
      user_id: nextUserId++, full_name: params[0], email: params[1], password_hash: params[2],
      role: params[3], tier: params[4], preferred_language: params[5], is_active: true,
      email_verified: false, failed_login_attempts: 0, lockout_until: null, otp_attempts: 0,
    };
    users.set(row.user_id, row);
    return { rows: [row] };
  }
  if (q.startsWith('INSERT INTO subscriptions') || q.startsWith('INSERT INTO audit_log')
    || q.startsWith('INSERT INTO login_events')) {
    return { rows: [] };
  }
  if (q.startsWith('INSERT INTO user_sessions')) {
    sessions.set(params[0], { user_id: params[1], revoked_at: null });
    return { rows: [] };
  }
  if (q.startsWith('UPDATE users SET verification_token_hash')) {
    Object.assign(users.get(params[2]), { verification_token_hash: params[0], verification_token_expiry: params[1] });
    return { rows: [] };
  }
  if (q.startsWith('UPDATE users SET last_login_at')) {
    users.get(params[0]).last_login_at = new Date();
    return { rows: [] };
  }
  if (q.startsWith('UPDATE users SET failed_login_attempts = $1')) {
    Object.assign(users.get(params[2]), { failed_login_attempts: params[0], lockout_until: params[1] });
    return { rows: [] };
  }
  if (q.startsWith('UPDATE users SET failed_login_attempts = 0')) {
    Object.assign(users.get(params[0]), { failed_login_attempts: 0, lockout_until: null });
    return { rows: [] };
  }
  if (q.startsWith('UPDATE users SET otp_code_hash = $1')) {
    Object.assign(users.get(params[2]), { otp_code_hash: params[0], otp_expiry: params[1], otp_attempts: 0 });
    return { rows: [] };
  }
  if (q.startsWith('UPDATE users SET otp_attempts = otp_attempts + 1')) {
    users.get(params[0]).otp_attempts += 1;
    return { rows: [] };
  }
  if (q.startsWith('UPDATE users SET otp_code_hash = NULL')) {
    Object.assign(users.get(params[0]), { otp_code_hash: null, otp_expiry: null, otp_attempts: 0 });
    return { rows: [] };
  }
  if (q.startsWith('UPDATE users SET email_verified = TRUE')) {
    Object.assign(users.get(params[0]), { email_verified: true, verification_token_hash: null });
    return { rows: [] };
  }
  if (/^SELECT .* FROM users WHERE email = \$1$/.test(q)) {
    const row = byEmail(params[0]);
    return { rows: row ? [row] : [] };
  }
  if (/^SELECT .* FROM users WHERE user_id = \$1$/.test(q)) {
    const row = users.get(Number(params[0]));
    return { rows: row ? [row] : [] };
  }
  if (q.startsWith('SELECT revoked_at FROM user_sessions')) {
    const row = sessions.get(params[0]);
    return { rows: row && String(row.user_id) === String(params[1]) ? [row] : [] };
  }
  if (q.startsWith('SELECT session_id_hash AS id')) {
    const rows = [...sessions.entries()]
      .filter(([, s]) => String(s.user_id) === String(params[0]) && !s.revoked_at)
      .map(([id]) => ({ id }));
    return { rows };
  }
  if (q.startsWith('UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = $1')) {
    for (const [id, s] of sessions) {
      if (String(s.user_id) === String(params[0]) && !s.revoked_at && id !== params[1]) s.revoked_at = new Date();
    }
    return { rows: [] };
  }
  if (q.startsWith('UPDATE user_sessions SET revoked_at = NOW() WHERE session_id_hash = $1')) {
    const s = sessions.get(params[0]);
    if (s && String(s.user_id) === String(params[1])) s.revoked_at = new Date();
    return { rows: [] };
  }
  throw new Error(`Unexpected query in test: ${q}`);
};

// ── Captured email (console transport) ─────────────────────────────────────
let outbox = [];
const realLog = console.log;
console.log = (...args) => {
  const line = args.join(' ');
  if (line.startsWith('[email]')) outbox.push(line);
  else realLog(...args);
};

const lastCode = () => outbox.at(-1)?.match(/login code is: (\d{6})/)?.[1];
const lastVerifyLink = () => outbox.at(-1)?.match(/(http\S+\/verify-email\?\S+)/)?.[1];

// ── Server ─────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}/api/auth`;

test.after(() => {
  server.close();
  console.log = realLog;
  globalThis.fetch = realFetch;
});

const PASSWORD = 'CorrectHorseBattery1';
const captcha = () => `local-captcha-${Date.now() - 2000}-abc123`;

function post(path, body, cookie) {
  return realFetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  });
}

function sessionCookie(res) {
  const header = res.headers.get('set-cookie') ?? '';
  const match = header.match(/(?:^|,\s*)token=([^;]+)/);
  return match ? `token=${match[1]}` : null;
}

async function register(email = 'student@example.com') {
  return post('/register', { full_name: 'Test Student', email, password: PASSWORD });
}

function emailOff() {
  delete process.env.EMAIL_TRANSPORT;
}
function emailToConsole() {
  process.env.EMAIL_TRANSPORT = 'console';
}

test.beforeEach(() => {
  resetDb();
  outbox = [];
  emailOff();
});

// ── Captcha ────────────────────────────────────────────────────────────────

test('login refuses a request without a captcha token', async () => {
  await register();
  const res = await post('/login', { email: 'student@example.com', password: PASSWORD });
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /CAPTCHA/);
});

test('login refuses a captcha submitted the instant it was ticked', async () => {
  await register();
  const res = await post('/login', {
    email: 'student@example.com', password: PASSWORD,
    captchaToken: `local-captcha-${Date.now()}-x`, captchaElapsedMs: 40,
  });
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /too fast/);
});

test('login accepts a captcha ticked on a device whose clock runs ahead of the server', async () => {
  // The browser stamped the token a minute "in the future". Comparing that
  // against the server clock used to refuse every attempt as too fast.
  await register();
  const res = await post('/login', {
    email: 'student@example.com', password: PASSWORD,
    captchaToken: `local-captcha-${Date.now() + 60_000}-x`, captchaElapsedMs: 1500,
  });
  assert.equal(res.status, 200);
});

test('login refuses a captcha ticked more than five minutes ago', async () => {
  await register();
  const res = await post('/login', {
    email: 'student@example.com', password: PASSWORD,
    captchaToken: `local-captcha-${Date.now()}-x`, captchaElapsedMs: 6 * 60 * 1000,
  });
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /expired/);
});

// ── No email delivery: password alone ─────────────────────────────────────

test('without email delivery, registration signs the new account in', async () => {
  const res = await register();
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.verificationRequired, false);
  assert.equal(body.user.email, 'student@example.com');
  assert.ok(body.user.id, 'the client needs id to record the session');
  assert.ok(sessionCookie(res), 'session cookie is set');
});

test('without email delivery, a correct password signs in directly', async () => {
  await register();
  const res = await post('/login', { email: 'student@example.com', password: PASSWORD, captchaToken: captcha() });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.twoFactorRequired, undefined);
  assert.equal(body.user.email, 'student@example.com');

  const cookie = sessionCookie(res);
  assert.ok(cookie);
  const payload = jwt.decode(cookie.slice('token='.length));
  assert.equal(typeof payload.sid, 'string', 'token carries its session id');
  assert.ok(sessions.has(hashSessionId(payload.sid)), 'session row stores only the hash');
});

test('a wrong password is refused with the generic message', async () => {
  await register();
  const res = await post('/login', { email: 'student@example.com', password: 'WrongPassword99', captchaToken: captcha() });
  assert.equal(res.status, 401);
  assert.equal((await res.json()).error, 'Invalid email or password.');
});

// ── Email delivery on: verification, then the emailed code ────────────────

test('with email delivery, registration asks for verification and issues no session', async () => {
  emailToConsole();
  const res = await register();
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.verificationRequired, true);
  assert.equal(sessionCookie(res), null);

  const link = lastVerifyLink();
  assert.ok(link, 'verification email was produced');
  const url = new URL(link);
  assert.equal(url.searchParams.get('email'), 'student@example.com', 'link carries the email');
  assert.equal(url.searchParams.get('token').length, 64, 'link carries the raw token, not a name');
});

test('an unverified account cannot sign in until the link is used', async () => {
  emailToConsole();
  await register();
  const link = new URL(lastVerifyLink());

  const blocked = await post('/login', { email: 'student@example.com', password: PASSWORD, captchaToken: captcha() });
  assert.equal(blocked.status, 403);
  assert.equal((await blocked.json()).code, 'EMAIL_NOT_VERIFIED');

  const verified = await post('/verify-email', {
    token: link.searchParams.get('token'), email: link.searchParams.get('email'),
  });
  assert.equal(verified.status, 200);

  const allowed = await post('/login', { email: 'student@example.com', password: PASSWORD, captchaToken: captcha() });
  assert.equal(allowed.status, 200);
  assert.equal((await allowed.json()).twoFactorRequired, true);
});

test('the emailed code completes sign-in, once', async () => {
  emailToConsole();
  await register();
  users.get(1).email_verified = true;

  const first = await post('/login', { email: 'student@example.com', password: PASSWORD, captchaToken: captcha() });
  assert.equal(first.status, 200);
  const step = await first.json();
  assert.deepEqual(step, { twoFactorRequired: true, email: 'student@example.com' });
  assert.equal(sessionCookie(first), null, 'no session before the code');

  const code = lastCode();
  assert.match(code, /^\d{6}$/);

  const wrong = await post('/verify-otp', { email: 'student@example.com', otp: code === '000000' ? '111111' : '000000' });
  assert.equal(wrong.status, 401);

  const ok = await post('/verify-otp', { email: 'student@example.com', otp: code });
  assert.equal(ok.status, 200);
  assert.equal((await ok.json()).user.email, 'student@example.com');
  assert.ok(sessionCookie(ok));

  const replay = await post('/verify-otp', { email: 'student@example.com', otp: code });
  assert.equal(replay.status, 401, 'a used code cannot be used again');
});

test('the code step locks after five wrong codes', async () => {
  emailToConsole();
  await register();
  users.get(1).email_verified = true;
  await post('/login', { email: 'student@example.com', password: PASSWORD, captchaToken: captcha() });
  const code = lastCode();
  const wrong = code === '000000' ? '111111' : '000000';

  for (let i = 0; i < 5; i += 1) {
    await post('/verify-otp', { email: 'student@example.com', otp: wrong });
  }
  const locked = await post('/verify-otp', { email: 'student@example.com', otp: code });
  assert.equal(locked.status, 429);
});

test('EMAIL_TRANSPORT=console is ignored in production', async () => {
  emailToConsole();
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const res = await register();
    assert.equal((await res.json()).verificationRequired, false);
    assert.equal(outbox.some((line) => line.includes('console transport')), false, 'nothing printed');
  } finally {
    process.env.NODE_ENV = previous;
  }
});

// ── Sessions ───────────────────────────────────────────────────────────────

async function signIn() {
  const res = await register();
  return sessionCookie(res);
}

test('GET /me answers for a live session and refuses a revoked one', async () => {
  const cookie = await signIn();
  const me = await realFetch(`${base}/me`, { headers: { Cookie: cookie } });
  assert.equal(me.status, 200);

  for (const s of sessions.values()) s.revoked_at = new Date();
  const after = await realFetch(`${base}/me`, { headers: { Cookie: cookie } });
  assert.equal(after.status, 401);
});

test('the session list marks the current session, and revoke-all keeps it', async () => {
  const cookie = await signIn();
  // A second session for the same account, as from another device.
  sessions.set('other-device-hash', { user_id: 1, revoked_at: null });

  const list = await realFetch(`${base}/sessions`, { headers: { Cookie: cookie } });
  const { sessions: rows } = await list.json();
  assert.equal(rows.length, 2);
  assert.equal(rows.filter((r) => r.current).length, 1);

  const revoke = await post('/sessions/revoke-all', {}, cookie);
  assert.equal(revoke.status, 200);
  assert.ok(sessions.get('other-device-hash').revoked_at, 'the other device is signed out');

  const me = await realFetch(`${base}/me`, { headers: { Cookie: cookie } });
  assert.equal(me.status, 200, 'this device stays signed in');
});

test('logout closes the session row', async () => {
  const cookie = await signIn();
  const res = await post('/logout', {}, cookie);
  assert.equal(res.status, 200);
  assert.ok([...sessions.values()].every((s) => s.revoked_at));
});
