/**
 * A fake of the P83 API, for the Playwright suite.
 *
 * Why this exists
 * ---------------
 * The e2e suite needs the API on :3000, and the real one needs PostgreSQL, a
 * JWT secret, a Groq key and a reachable model provider. That makes the suite
 * unrunnable on a fresh checkout and non-deterministic when it does run: the
 * live happy path asserts on real model output, and admin-nav.spec.js shells
 * out to psql to promote a user because there is deliberately no API that can
 * mint an admin.
 *
 * This serves the same contract from memory. The assertions in the specs are
 * unchanged and still real — only the dependencies behind them are doubles.
 *
 * What it is NOT
 * --------------
 * Not a second implementation to keep in step with the real server, and not a
 * substitute for running against it. It reproduces the response shapes the
 * browser actually consumes; everything else 404s loudly rather than returning
 * a plausible empty body, so a spec that starts depending on a new endpoint
 * fails here instead of passing against a shrug.
 *
 * Deliberate differences from the real server, all so the suite can steer it:
 *   - Tokens are opaque ids in a Map, not signed JWTs. Nothing here verifies a
 *     signature, so there is no secret to configure. A token the server did not
 *     issue is simply absent from the Map, which is what M7 needs.
 *   - /api/test/* exists (promote, reset). It is the replacement for the psql
 *     call in admin-nav.spec.js. It is namespaced so it is obvious in a request
 *     log that a test, not the application, asked for it.
 *   - Cookies are SameSite=Lax and never Secure, because the suite runs on
 *     plain http over localhost.
 *
 * Run:  node client/e2e/fake-api/server.js
 * Port: 3000, or PORT=3100 node client/e2e/fake-api/server.js
 */

import http from 'node:http';
import { randomUUID } from 'node:crypto';

import { FAKE_FEEDBACK } from './feedback.js';

const PORT = Number(process.env.PORT) || 3000;

/** Matches middleware/reviewQuota.js — the one place the limit is stated. */
const FREE_DAILY_REVIEW_LIMIT = 3;

/* ── State ──────────────────────────────────────────────────────────────── */

/** email (lowercased) → user record */
const usersByEmail = new Map();
/** opaque token → email */
const sessions = new Map();

let nextUserId = 1;

function createUser({ full_name, email, password, plan }) {
  const record = {
    id: nextUserId++,
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: 'student',
    tier: plan === 'premium' ? 'premium' : 'free',
    preferred_language: 'en',
    reviewsUsedToday: 0,
  };
  usersByEmail.set(record.email, record);
  return record;
}

/** The public projection. Never includes the password. */
function publicUser(u) {
  return {
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    role: u.role,
    tier: u.tier,
    preferred_language: u.preferred_language,
  };
}

/* ── Request helpers ────────────────────────────────────────────────────── */

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((part) => {
      const i = part.indexOf('=');
      return i === -1
        ? [part.trim(), '']
        : [part.slice(0, i).trim(), decodeURIComponent(part.slice(i + 1).trim())];
    })
  );
}

/** The signed-in user, or null. The only place a session is resolved. */
function currentUser(req) {
  const token = parseCookies(req).token;
  if (!token) return null;
  const email = sessions.get(token);
  if (!email) return null;
  return usersByEmail.get(email) ?? null;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJson(req) {
  const raw = await readBody(req);
  if (raw.length === 0) return {};
  try {
    return JSON.parse(raw.toString('utf8'));
  } catch {
    return {};
  }
}

function send(res, status, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    ...extraHeaders,
  });
  res.end(body);
}

const SESSION_COOKIE = (token) =>
  `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`;
const CLEARED_COOKIE = 'token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

/* ── Content fixtures ───────────────────────────────────────────────────── */
/*
 * Field names are taken from what the pages actually read, not from the full
 * database columns: Resources reads id/title/desc/type/category/url/discipline,
 * CareerPaths reads id/title/industry, Alumni and the discipline pickers read
 * name/name_bn/label. Anything the UI does not read is left out rather than
 * invented, so this file does not imply a schema it is not reproducing.
 */

const DISCIPLINES = [
  { id: 1, name: 'Computer Science', name_bn: 'কম্পিউটার সায়েন্স', description: 'Software, data and systems.' },
  { id: 2, name: 'Business', name_bn: 'ব্যবসায় শিক্ষা', description: 'Management, finance and marketing.' },
  { id: 3, name: 'Engineering', name_bn: 'প্রকৌশল', description: 'Civil, electrical and mechanical.' },
];

const CAREER_PATHS = [
  { id: 1, title: 'Software Engineer', industry: 'Technology', discipline: 'Computer Science' },
  { id: 2, title: 'Data Analyst', industry: 'Technology', discipline: 'Computer Science' },
  { id: 3, title: 'Financial Analyst', industry: 'Finance', discipline: 'Business' },
];

const RESOURCES = [
  {
    id: 1,
    title: 'Writing a resume for an ATS',
    desc: 'How automated screening reads a resume, and what breaks it.',
    type: 'article',
    category: 'Resume',
    url: 'https://example.com/ats',
    discipline: 'Computer Science',
  },
  {
    id: 2,
    title: 'Interview preparation basics',
    desc: 'Structuring an answer under time pressure.',
    type: 'guide',
    category: 'Interview',
    url: 'https://example.com/interviews',
    discipline: 'Business',
  },
];

const ALUMNI = [
  { id: 1, name: 'Farhana Rahman', discipline: 'Computer Science', role: 'Software Engineer', company: 'Example Ltd', published: true },
  { id: 2, name: 'Tanvir Ahmed', discipline: 'Business', role: 'Financial Analyst', company: 'Example Bank', published: true },
];

/** The admin list includes unpublished drafts that /api/alumni hides. */
const ALUMNI_ALL = [
  ...ALUMNI,
  { id: 3, name: 'Draft Profile', discipline: 'Engineering', role: 'Site Engineer', company: 'Example Co', published: false },
];

/* ── Route handlers ─────────────────────────────────────────────────────── */

async function handleRegister(req, res) {
  const body = await readJson(req);
  const { full_name, email, password } = body;

  if (!full_name || !email || !password) {
    return send(res, 400, { error: 'Full name, email, and password are required.' });
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return send(res, 400, { error: 'Invalid email address.' });
  }
  if (typeof password !== 'string' || password.length < 12) {
    return send(res, 400, { error: 'Password must be at least 12 characters.' });
  }
  if (usersByEmail.has(email.trim().toLowerCase())) {
    return send(res, 409, {
      error: 'An account with this email already exists. Try logging in instead.',
    });
  }

  const user = createUser(body);
  return send(res, 201, { message: 'User registered successfully', user: publicUser(user) });
}

async function handleLogin(req, res) {
  const { email, password } = await readJson(req);
  const generic = { error: 'Invalid email or password.' };

  if (!email || !password) {
    return send(res, 400, { error: 'Email and password are required.' });
  }

  const user = usersByEmail.get(String(email).trim().toLowerCase());
  if (!user || user.password !== password) return send(res, 401, generic);

  const token = randomUUID();
  sessions.set(token, user.email);

  return send(
    res,
    200,
    {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        tier: user.tier,
      },
    },
    { 'Set-Cookie': SESSION_COOKIE(token) }
  );
}

function handleMe(req, res) {
  const user = currentUser(req);
  // The M7 case: a hand-written localStorage entry never reaches this, because
  // the answer depends only on a cookie the server issued.
  if (!user) return send(res, 401, { error: 'Authentication required.' });
  return send(res, 200, { user: publicUser(user) });
}

function handleLogout(req, res) {
  const token = parseCookies(req).token;
  if (token) sessions.delete(token);
  return send(res, 200, { message: 'Logged out successfully.' }, { 'Set-Cookie': CLEARED_COOKIE });
}

function handleQuota(req, res) {
  const user = currentUser(req);

  if (!user) {
    return send(res, 200, {
      authenticated: false,
      limit: FREE_DAILY_REVIEW_LIMIT,
      remaining: null,
      unlimited: false,
    });
  }

  const unlimited = user.tier === 'premium' || user.role === 'admin';
  return send(res, 200, {
    authenticated: true,
    tier: user.tier,
    limit: unlimited ? null : FREE_DAILY_REVIEW_LIMIT,
    used: user.reviewsUsedToday,
    remaining: unlimited ? null : Math.max(0, FREE_DAILY_REVIEW_LIMIT - user.reviewsUsedToday),
    unlimited,
  });
}

/** Claims one review, or reports the allowance spent. Mirrors reviewQuota.js. */
function claimReview(user) {
  if (!user) return { allowed: true }; // guests are bounded by rate limit only
  if (user.tier === 'premium' || user.role === 'admin') return { allowed: true };
  if (user.reviewsUsedToday >= FREE_DAILY_REVIEW_LIMIT) return { allowed: false };
  user.reviewsUsedToday += 1;
  return { allowed: true };
}

const QUOTA_SPENT = {
  error: `You have used all ${FREE_DAILY_REVIEW_LIMIT} of your free resume reviews for today. Your allowance resets tomorrow.`,
  limit: FREE_DAILY_REVIEW_LIMIT,
  used: FREE_DAILY_REVIEW_LIMIT,
  remaining: 0,
};

async function handleAnalyze(req, res) {
  await readBody(req); // drain the multipart upload; its contents are not needed
  const user = currentUser(req);
  if (!claimReview(user).allowed) return send(res, 429, QUOTA_SPENT);

  return send(res, 200, {
    success: true,
    filename: 'resume.pdf',
    feedback: FAKE_FEEDBACK,
    reviewId: 1,
  });
}

/**
 * The SSE half. Emits the serialised feedback in chunks the way the real
 * handler emits model tokens, then the terminal done frame.
 *
 * Chunked rather than sent whole because the client tolerant-parses the
 * accumulated text as it arrives (api/reviewResume.js), and a single frame
 * would never exercise that path.
 */
async function handleAnalyzeStream(req, res) {
  await readBody(req);
  const user = currentUser(req);

  if (!claimReview(user).allowed) return send(res, 429, QUOTA_SPENT);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const writeFrame = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  const serialised = JSON.stringify(FAKE_FEEDBACK);
  const CHUNK = 96;
  for (let i = 0; i < serialised.length; i += CHUNK) {
    writeFrame({ t: serialised.slice(i, i + CHUNK) });
  }

  writeFrame({ done: true, filename: 'resume.pdf', feedback: FAKE_FEEDBACK, reviewId: 1 });
  res.end();
}

/**
 * Test-only: promote an account to admin.
 *
 * This is the replacement for the psql call in admin-nav.spec.js. The real
 * server has no such endpoint by design — a role is not something a client may
 * ask for — so this exists only here, and only because the fake has no database
 * for a test to reach around it and update.
 */
async function handlePromote(req, res) {
  const { email, role } = await readJson(req);
  const user = usersByEmail.get(String(email ?? '').trim().toLowerCase());
  if (!user) return send(res, 404, { error: 'No such user.' });

  user.role = role === 'student' ? 'student' : 'admin';
  return send(res, 200, { email: user.email, role: user.role });
}

/** Test-only: drop every user and session, so a spec can start from empty. */
function handleReset(req, res) {
  usersByEmail.clear();
  sessions.clear();
  nextUserId = 1;
  return send(res, 200, { ok: true });
}

/* ── Routing ────────────────────────────────────────────────────────────── */

const ROUTES = [
  ['POST', '/api/auth/register', handleRegister],
  ['POST', '/api/auth/login', handleLogin],
  ['GET', '/api/auth/me', handleMe],
  ['POST', '/api/auth/logout', handleLogout],

  ['GET', '/api/resume/quota', handleQuota],
  ['POST', '/api/resume/analyze', handleAnalyze],
  ['POST', '/api/resume/analyze-stream', handleAnalyzeStream],
  ['GET', '/api/resume/history', (req, res) =>
    currentUser(req)
      ? send(res, 200, [])
      : send(res, 401, { error: 'Authentication required.' })],

  ['GET', '/api/disciplines', (req, res) => send(res, 200, DISCIPLINES)],
  ['GET', '/api/career-paths', (req, res) => send(res, 200, CAREER_PATHS)],
  ['GET', '/api/resources', (req, res) => send(res, 200, RESOURCES)],
  ['GET', '/api/alumni', (req, res) => send(res, 200, ALUMNI)],
  ['GET', '/api/alumni/all', (req, res) =>
    currentUser(req)?.role === 'admin'
      ? send(res, 200, ALUMNI_ALL)
      : send(res, 403, { error: 'Access denied.' })],

  ['GET', '/api/health', (req, res) => send(res, 200, { ok: true })],

  ['POST', '/api/test/promote', handlePromote],
  ['POST', '/api/test/reset', handleReset],
];

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);

  // The browser reaches this through the Vite proxy, so it is same-origin and
  // needs no CORS. These headers are for page.request.* calling :3000 directly.
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  }
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const route = ROUTES.find(([method, path]) => method === req.method && path === pathname);

  if (!route) {
    // Loud on purpose. A spec that grows a dependency on an endpoint this fake
    // does not serve should fail here, not receive a plausible empty body.
    console.warn(`[fake-api] unhandled ${req.method} ${pathname}`);
    return send(res, 404, { error: `No fake for ${req.method} ${pathname}` });
  }

  try {
    await route[2](req, res);
  } catch (err) {
    console.error(`[fake-api] ${req.method} ${pathname} failed:`, err);
    if (!res.headersSent) send(res, 500, { error: 'Fake API error.' });
  }
});

server.listen(PORT, () => {
  console.log(`[fake-api] listening on http://localhost:${PORT}`);
});
