import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from './db.js';
import { getAllowedOrigins } from './config/origins.js';
import { assertModelConfig, getModel } from 'ai-service';
import { localiseResponses } from './i18n/index.js';
import { checkContentSchema } from './schemaCheck.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '../.env') });

// Fail on boot rather than on the first user request if the AI model config is
// missing or names a banned model. getModel() re-validates on every call, so
// this is the early warning, not the only guard.
try {
  assertModelConfig();
} catch (err) {
  console.error(`[startup] ${err.message}`);
  process.exit(1);
}

const allowedOrigins = getAllowedOrigins();

const app = express();
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
// routes/auth.js issues the JWT as an httpOnly cookie; without this the auth
// middleware cannot read it and every guarded endpoint would reject.
app.use(cookieParser());
// Translates the `error` and `message` fields of every JSON response into the
// caller's language. Registered after cookieParser, because that is where the
// language preference arrives, and before the routers and the error handler so
// that both are covered without either knowing about it.
app.use(localiseResponses);

// Ensure uploads/ exists at startup
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Health check — returns no user data.
//
// `ok` is the database, because that is the only dependency a request can
// check without spending anything. The AI block reports what the server is
// configured to call, not whether the call works: a real completion costs a
// request against the daily allowance, so that check lives in
// `npm run check` (scripts/check-setup.js) rather than on an endpoint the
// frontend could hit on every load. The key itself is never returned; only
// whether one is set.
app.get('/api/health', async (req, res) => {
  const ai = {
    keyConfigured: Boolean(process.env.GOOGLE_AI_API_KEY),
    models: { free: getModel('free'), premium: getModel('premium') },
  };
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'connected', ai });
  } catch (err) {
    res.status(503).json({ ok: false, database: 'unreachable', error: err.message, ai });
  }
});

// Routes
import resumeRouter from './routes/resume.js';
import authRouter from './routes/auth.js';
import chatbotRouter from './routes/chatbot.js';
import disciplineRoutes from './routes/disciplines.js';
import careerPathsRoutes from './routes/careerPaths.js';
import resourcesRoutes from './routes/resources.js';
import alumniRoutes from './routes/alumni.js';
import usersRouter from './routes/users.js';
import preparationRouter from './routes/preparation.js';

app.use('/api/resume', resumeRouter);
app.use('/api/auth', authRouter);
app.use('/api/chat', chatbotRouter);
app.use('/api/disciplines', disciplineRoutes);
app.use('/api/career-paths', careerPathsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/alumni', alumniRoutes);
// Everything an account holder can do to their own account. Scoped to the
// session throughout: no route here takes a user id from the caller.
app.use('/api/users', usersRouter);
// The gap board and the mock interview. Signed-in only throughout: a gap
// belongs to a person across analyses, and a guest has nothing to attach one to.
app.use('/api/preparation', preparationRouter);

// Error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 3 MB.' });
  }
  if (err.message?.startsWith('Invalid file type')) {
    return res.status(415).json({ error: err.message });
  }
  console.error('[app] Unhandled error:', err.message);
  return res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // Reported after the port is up, so a schema warning cannot stop the server
  // from starting. It names the migration to run rather than leaving the cause
  // to be inferred from a per-request column error.
  checkContentSchema(pool).catch(() => { /* already reported */ });
});

export default app;