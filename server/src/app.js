import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '../.env') });

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

const app = express();
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
// routes/auth.js issues the JWT as an httpOnly cookie; without this the auth
// middleware cannot read it and every guarded endpoint would reject.
app.use(cookieParser());

// Ensure uploads/ exists at startup
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Basic health check — returns no user data
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
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

app.use('/api/resume', resumeRouter);
app.use('/api/auth', authRouter);
app.use('/api/chat', chatbotRouter);
app.use('/api/disciplines', disciplineRoutes);
app.use('/api/career-paths', careerPathsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/alumni', alumniRoutes);

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
});

export default app;