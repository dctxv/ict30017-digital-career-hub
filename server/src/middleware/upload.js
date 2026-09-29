import multer from 'multer';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Where resumes wait between upload and extraction. Locally that is server/uploads/.
// On Vercel the deployment filesystem is read-only and only the OS temp directory
// is writable, so the same files go there instead. Every route deletes its file
// once extracted, so nothing here is expected to outlive a request.
export const UPLOADS_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads')
  : path.join(__dirname, '../../uploads');

// Store files temporarily on disk in UPLOADS_DIR
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Use a random hex name + original extension only.
    // Never use file.originalname directly — it can contain path traversal characters.
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, safeName);
  },
});

// Extension is the primary gate. MIME type is unreliable — clients (including curl)
// often send application/octet-stream for DOCX files regardless of actual content.
// The real content check happens downstream: pdf-parse and mammoth both throw on
// invalid files, so a renamed non-PDF/DOCX will still be rejected at extraction.
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx']);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only PDF and DOCX files are accepted.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB — confirmed by client in Week 4 meeting
  },
});

export default upload;
