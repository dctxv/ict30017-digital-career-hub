import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '../.env') });

// ── Allowed origins ───────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

const app = express();

// ── Security headers (Helmet) ─────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:     ["'self'"],
        scriptSrc:      ["'self'"],
        styleSrc:       ["'self'", "'unsafe-inline'"],  // allow inline CSS used by Vite
        imgSrc:         ["'self'", 'data:'],
        connectSrc:     ["'self'", 'https://inference.do-ai.run'],
        fontSrc:        ["'self'"],
        objectSrc:      ["'none'"],
        frameSrc:       ["'none'"],
        
      },
    },
    crossOriginEmbedderPolicy: false, // allow SSE in some browsers
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

app.disable('x-powered-by'); // belt-and-suspenders (helmet already removes it)

// ── CORS ──────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server (no origin) only in dev
    if (!origin) {
      if (process.env.NODE_ENV === 'production') return cb(new Error('Forbidden'));
      return cb(null, true);
    }
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
}));

// ── Body size limits ──────────────────────────────────────────────
// Default Express limit is 100 kb; 50 kb is plenty for JSON payloads.
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

// ── Global IP rate limit (generous, per-route limits are stricter) ─
const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
  skip: (req) => req.path === '/api/health',
});
app.use(globalRateLimit);

// ── Ensure uploads/ exists at startup ────────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Health check — no user data returned ─────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

// ── Routes ────────────────────────────────────────────────────────
import resumeRouter      from './routes/resume.js';
import authRouter        from './routes/auth.js';
import chatbotRouter     from './routes/chatbot.js';
import disciplineRoutes  from './routes/disciplines.js';
import careerPathsRoutes from './routes/careerPaths.js';
import resourcesRoutes   from './routes/resources.js';
import alumniRoutes      from './routes/alumni.js';

app.use('/api/resume',       resumeRouter);
app.use('/api/auth',         authRouter);
app.use('/api/chat',         chatbotRouter);
app.use('/api/disciplines',  disciplineRoutes);
app.use('/api/career-paths', careerPathsRoutes);
app.use('/api/resources',    resourcesRoutes);
app.use('/api/alumni',       alumniRoutes);

// ── 404 handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// ── Error handler ─────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 3 MB.' });
  }
  if (err.message?.startsWith('Invalid file type')) {
    return res.status(415).json({ error: err.message });
  }
  if (err.message?.startsWith('CORS')) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  // Log full error server-side; never expose internals to client
  console.error('[app] Unhandled error:', err.message);
  return res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
