import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.set('json spaces', 2);
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());

// Ensure uploads/ exists at startup
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Test route for PostgreSQL connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json({
      message: 'PostgreSQL connected successfully',
      users: result.rows,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// Routes
import resumeRouter from './routes/resume.js';
import authRouter from './routes/auth.js';
app.use('/api/resume', resumeRouter);
app.use('/api/auth', authRouter);
import chatbotRouter from './routes/chatbot.js';
app.use('/api/resume', resumeRouter);
app.use('/api/chat', chatbotRouter);

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