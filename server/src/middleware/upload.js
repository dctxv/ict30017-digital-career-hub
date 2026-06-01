/**
 * Module: upload middleware
 * Responsibility: Accept single PDF/DOCX resume uploads.
 *
 * Security:
 *  - Random hex filename — no path traversal from originalname
 *  - Extension allow-list: .pdf and .docx only
 *  - Magic-byte check happens downstream in fileParser.js before any parsing
 *  - 3 MB file size limit
 *  - Single-file upload only (files field limit)
 */

import multer from 'multer';
import path   from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Never use file.originalname — can contain path traversal characters.
    const ext      = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, safeName);
  },
});

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx']);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX files are accepted.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB
    files: 1,                   // only one file per request
    fields: 5,                  // limit non-file form fields
  },
});

export default upload;
