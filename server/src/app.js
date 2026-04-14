import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(express.json());

// Ensure uploads/ exists at startup so Multer never writes to a missing directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
import resumeRouter from './routes/resume.js';
app.use('/api/resume', resumeRouter);

// Multer error handler — must be a 4-argument Express error middleware
// Catches file size (413) and file type (415) rejections from upload.js
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
