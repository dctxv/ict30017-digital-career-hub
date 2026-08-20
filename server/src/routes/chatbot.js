/**
 * Module: chatbot route
 * Responsibility: Limit and stream AI career chatbot responses over SSE.
 */

import crypto from 'crypto';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { streamChatbotResponse } from 'ai-service';
import { getAllowedOrigins } from '../config/origins.js';

const router = express.Router();

const AI_RATE_WINDOW_MS = 15 * 60 * 1000;
const AI_RATE_MAX_REQUESTS = 20;
const FREE_DAILY_CHAT_LIMIT = 10;
const AUTH_COOKIE_NAMES = ['token', 'jwt', 'access_token', 'accessToken', 'auth_token', 'authToken'];
const JWT_SECRET_CANDIDATES = ['JWT_SECRET', 'JWT_ACCESS_SECRET', 'ACCESS_TOKEN_SECRET', 'AUTH_SECRET'];

const chatIpRateLimit = rateLimit({
  windowMs: AI_RATE_WINDOW_MS,
  limit: AI_RATE_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many chatbot requests. Please try again later.' },
});

const inMemoryDailyCounts = new Map();
let pgPool = null;
let pgUnavailable = false;

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, part) => {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (!rawName || rawValue.length === 0) return cookies;

    try {
      cookies[rawName] = decodeURIComponent(rawValue.join('='));
    } catch {
      cookies[rawName] = rawValue.join('=');
    }

    return cookies;
  }, {});
}

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }

  const cookies = parseCookies(req.headers.cookie || '');
  for (const cookieName of AUTH_COOKIE_NAMES) {
    if (cookies[cookieName]) return cookies[cookieName];
  }

  return null;
}

function base64UrlDecode(segment) {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function toBase64Url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function getJwtSecret() {
  for (const key of JWT_SECRET_CANDIDATES) {
    if (process.env[key]) return process.env[key];
  }

  throw new Error(
    'JWT secret is not configured. Set JWT_SECRET (or JWT_ACCESS_SECRET) in your .env file.'
  );
}

function verifyJwt(token) {
  if (!token) return null;

  const segments = token.split('.');
  if (segments.length !== 3) return null;

  let header;
  let payload;
  try {
    header = JSON.parse(base64UrlDecode(segments[0]));
    payload = JSON.parse(base64UrlDecode(segments[1]));
  } catch {
    return null;
  }

  const hmacAlgorithm = {
    HS256: 'sha256',
    HS384: 'sha384',
    HS512: 'sha512',
  }[header.alg];

  if (!hmacAlgorithm) return null;

  const expected = toBase64Url(
    crypto.createHmac(hmacAlgorithm, getJwtSecret()).update(`${segments[0]}.${segments[1]}`).digest()
  );

  const received = Buffer.from(segments[2]);
  const expectedBuffer = Buffer.from(expected);
  if (received.length !== expectedBuffer.length || !crypto.timingSafeEqual(received, expectedBuffer)) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp) return null;
  if (payload.exp < now) return null;
  if (payload.nbf && payload.nbf > now) return null;

  return payload;
}

function normaliseRole(role) {
  if (role === 'premium' || role === 'admin') return role;
  return 'free';
}

function attachOptionalUser(req, res, next) {
  const payload = verifyJwt(getBearerToken(req));
  const userId = payload?.id ?? payload?.userId ?? payload?.sub;

  if (!payload || !userId) {
    req.user = {
      id: 'guest',
      role: 'guest',
    };
    next();
    return;
  }

  req.user = {
    id: String(userId),
    role: normaliseRole(payload.role),
  };

  next();
}

async function getPgPool() {
  if (pgPool || pgUnavailable) return pgPool;

  try {
    const { Pool } = await import('pg');

    if (!process.env.DATABASE_URL && !process.env.PGPASSWORD) {
      console.warn('[chat] Neither DATABASE_URL nor PGPASSWORD is set — falling back to in-memory counters.');
      pgUnavailable = true;
      return null;
    }

    const config = process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL }
      : {
          user: process.env.PGUSER || 'postgres',
          host: process.env.PGHOST || 'localhost',
          database: process.env.PGDATABASE || 'digitalcareerhub',
          password: process.env.PGPASSWORD,
          port: Number(process.env.PGPORT || 5432),
        };

    pgPool = new Pool(config);
    return pgPool;
  } catch (err) {
    pgUnavailable = true;
    console.warn('[chat] PostgreSQL client unavailable; using in-memory free-tier counters for this process.');
    return null;
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function incrementInMemoryChatCount(userId) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[chat] Database unavailable in production — refusing request rather than using in-memory counter.');
    return { allowed: false, dbUnavailable: true };
  }

  const today = todayKey();
  const current = inMemoryDailyCounts.get(userId);

  if (!current || current.date !== today) {
    inMemoryDailyCounts.set(userId, { date: today, count: 1 });
    return { allowed: true, count: 1 };
  }

  if (current.count >= FREE_DAILY_CHAT_LIMIT) {
    return { allowed: false, count: current.count };
  }

  current.count += 1;
  return { allowed: true, count: current.count };
}

async function incrementPostgresChatCount(userId) {
  const pool = await getPgPool();
  if (!pool) return incrementInMemoryChatCount(userId);

  const result = await pool.query(
    `
      UPDATE users
      SET
        chat_message_count = CASE
          WHEN chat_count_reset_date IS NULL OR chat_count_reset_date < CURRENT_DATE THEN 1
          ELSE COALESCE(chat_message_count, 0) + 1
        END,
        chat_count_reset_date = CURRENT_DATE
      WHERE user_id = $1
        AND (
          chat_count_reset_date IS NULL
          OR chat_count_reset_date < CURRENT_DATE
          OR COALESCE(chat_message_count, 0) < $2
        )
      RETURNING chat_message_count
    `,
    [userId, FREE_DAILY_CHAT_LIMIT]
  );

  if (result.rows.length > 0) {
    return { allowed: true, count: result.rows[0].chat_message_count };
  }

  const userCheck = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [userId]);
  if (userCheck.rows.length === 0) {
    return { allowed: false, missingUser: true };
  }

  return { allowed: false, count: FREE_DAILY_CHAT_LIMIT };
}

async function enforceDailyTurnLimit(req, res, next) {
  // Guests are not in the users table, so there is no row to count against.
  // They are held back by the IP limiter that runs earlier in the chain.
  if (req.user.role === 'guest' || req.user.id === 'guest') {
    next();
    return;
  }

  if (req.user.role === 'premium' || req.user.role === 'admin') {
    next();
    return;
  }

  try {
    const limit = await incrementPostgresChatCount(req.user.id);

    if (limit.dbUnavailable) {
      return res.status(503).json({ error: 'Service temporarily unavailable.' });
    }

    if (limit.missingUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!limit.allowed) {
      return res.status(429).json({
        error: "You've reached your daily chat limit. Upgrade to Premium for unlimited access.",
      });
    }

    next();
  } catch (err) {
    console.error('[chat] Failed to update chat turn counter:', err.message);
    return res.status(500).json({ error: 'Could not process chatbot request.' });
  }
}

function validateCsrfOrigin(req, res, next) {
  const origin = req.headers.origin;
  if (!origin) { next(); return; }

  const allowed = getAllowedOrigins();

  if (!allowed.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  next();
}

function validateChatBody(req, res, next) {
  const { message, conversationHistory } = req.body || {};

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  if (!Array.isArray(conversationHistory)) {
    return res.status(400).json({ error: 'conversationHistory must be an array.' });
  }

  next();
}

function writeSse(res, payload) {
  const text = String(payload).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const frame = text
    .split('\n')
    .map((line) => `data: ${line}`)
    .join('\n');

  res.write(`${frame}\n\n`);
}

/*
 * enforceDailyTurnLimit runs after attachOptionalUser so the user is known, and
 * before validateChatBody so a malformed body from someone already over quota
 * still reports the quota. It was fully written but never added to this chain,
 * which left FREE_DAILY_CHAT_LIMIT and both chat_message_count columns unused.
 * Guests fall through it and are bounded by chatIpRateLimit instead.
 */
router.post('/', chatIpRateLimit, validateCsrfOrigin, attachOptionalUser, enforceDailyTurnLimit, validateChatBody, async (req, res) => {
  const { message, conversationHistory } = req.body;
  const language = req.body.language === 'bn' ? 'bn' : 'en';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  try {
    console.log(`[chat] Streaming response for user ${req.user.id}; language=${language}`);
    const tokenStream = streamChatbotResponse(conversationHistory, message, {
      userId: req.user.id,
      language,
    });

    for await (const token of tokenStream) {
      writeSse(res, token);
    }

    writeSse(res, '[DONE]');
  } catch (err) {
    console.error('[chat] Chatbot stream failed:', err.message);
    writeSse(res, '[ERROR]');
  } finally {
    res.end();
  }
});

export default router;
