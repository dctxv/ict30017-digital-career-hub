/**
 * Module: chatbot route
 * Responsibility: Stream AI career chatbot responses over SSE.
 *
 * Security highlights:
 *  - IP-level rate limit: 20 req / 15 min
 *  - Origin validation (CSRF defence)
 *  - optionalAuth: enriches req.user without blocking guests
 *  - Daily turn limit for free/guest users (DB-backed in prod)
 *  - Input validation before any processing
 *  - No hand-rolled JWT crypto — uses shared middleware
 */

import express      from 'express';
import rateLimit    from 'express-rate-limit';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const AI_RATE_WINDOW_MS   = 15 * 60 * 1000;
const AI_RATE_MAX_REQUESTS = 20;
const FREE_DAILY_CHAT_LIMIT = 10;

const chatIpRateLimit = rateLimit({
  windowMs: AI_RATE_WINDOW_MS,
  limit: AI_RATE_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many chatbot requests. Please try again later.' },
});

// ── In-memory daily counter (dev-only fallback) ───────────────────
const inMemoryDailyCounts = new Map();
let pgPool = null;
let pgUnavailable = false;

async function getPgPool() {
  if (pgPool || pgUnavailable) return pgPool;
  try {
    const { Pool } = await import('pg');
    if (!process.env.DATABASE_URL && !process.env.PGPASSWORD) {
      console.warn('[chat] DB not configured — using in-memory counters (dev only).');
      pgUnavailable = true;
      return null;
    }
    const config = process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL }
      : {
          user:     process.env.PGUSER     || 'postgres',
          host:     process.env.PGHOST     || 'localhost',
          database: process.env.PGDATABASE || 'digitalcareerhub',
          password: process.env.PGPASSWORD,
          port:     Number(process.env.PGPORT || 5432),
        };
    pgPool = new Pool(config);
    return pgPool;
  } catch {
    pgUnavailable = true;
    console.warn('[chat] PostgreSQL unavailable; using in-memory counters (dev only).');
    return null;
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function incrementInMemoryChatCount(userId) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[chat] DB unavailable in production — refusing.');
    return { allowed: false, dbUnavailable: true };
  }
  const today   = todayKey();
  const current = inMemoryDailyCounts.get(userId);
  if (!current || current.date !== today) {
    inMemoryDailyCounts.set(userId, { date: today, count: 1 });
    return { allowed: true, count: 1 };
  }
  if (current.count >= FREE_DAILY_CHAT_LIMIT) return { allowed: false, count: current.count };
  current.count += 1;
  return { allowed: true, count: current.count };
}

async function incrementPostgresChatCount(userId) {
  const pool = await getPgPool();
  if (!pool) return incrementInMemoryChatCount(userId);

  const result = await pool.query(
    `UPDATE users
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
     RETURNING chat_message_count`,
    [userId, FREE_DAILY_CHAT_LIMIT]
  );

  if (result.rows.length > 0) return { allowed: true, count: result.rows[0].chat_message_count };

  const userCheck = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [userId]);
  if (userCheck.rows.length === 0) return { allowed: false, missingUser: true };
  return { allowed: false, count: FREE_DAILY_CHAT_LIMIT };
}

async function enforceDailyTurnLimit(req, res, next) {
  if (req.user.role === 'premium' || req.user.role === 'admin') {
    return next();
  }

  try {
    const limit = await incrementPostgresChatCount(req.user.id);

    if (limit.dbUnavailable) return res.status(503).json({ error: 'Service temporarily unavailable.' });
    if (limit.missingUser)   return res.status(401).json({ error: 'Authentication required.' });
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

// ── CSRF: validate Origin header ──────────────────────────────────
function validateCsrfOrigin(req, res, next) {
  const origin = req.headers.origin;
  if (!origin) { next(); return; } // server-to-server is fine

  const allowed = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:5174'];

  if (!allowed.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  next();
}

// ── Input validation ──────────────────────────────────────────────
function validateChatBody(req, res, next) {
  const { message, conversationHistory } = req.body || {};

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  // Clamp message length — prevent token-flooding attacks
  if (message.length > 4000) {
    return res.status(400).json({ error: 'Message is too long (max 4000 characters).' });
  }

  if (!Array.isArray(conversationHistory)) {
    return res.status(400).json({ error: 'conversationHistory must be an array.' });
  }

  // Clamp history depth to prevent bloated payloads
  if (conversationHistory.length > 100) {
    return res.status(400).json({ error: 'Conversation history is too long.' });
  }

  next();
}

function writeSse(res, payload) {
  const text  = String(payload).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const frame = text.split('\n').map((line) => `data: ${line}`).join('\n');
  res.write(`${frame}\n\n`);
}

// ── POST /api/chat ─────────────────────────────────────────────────
router.post(
  '/',
  chatIpRateLimit,
  validateCsrfOrigin,
  optionalAuth,        // enriches req.user; guests get role='guest'
  enforceDailyTurnLimit,
  validateChatBody,
  async (req, res) => {
    const { streamChatbotResponse } = await import('../../../ai-service/index.js');
    const { message, conversationHistory } = req.body;
    const language = req.body.language === 'bn' ? 'bn' : 'en';

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    try {
      console.log(`[chat] Streaming for user ${req.user.id}; role=${req.user.role}; lang=${language}`);
      const tokenStream = streamChatbotResponse(conversationHistory, message, {
        userId: req.user.id,
        language,
      });

      for await (const token of tokenStream) {
        writeSse(res, token);
      }

      writeSse(res, '[DONE]');
    } catch (err) {
      console.error('[chat] Stream failed:', err.message);
      writeSse(res, '[ERROR]');
    } finally {
      res.end();
    }
  }
);

export default router;
