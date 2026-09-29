/**
 * Receives one recorded interview answer, in memory.
 *
 * Deliberately not middleware/upload.js. That one writes resumes to uploads/ on
 * disk and has a finally block in every route to delete them again; a recording
 * never touches the disk at all. It arrives as a Buffer, is handed to Whisper,
 * and is gone when the request ends — there is no file to forget to delete, so
 * the promise that audio is never stored does not depend on a cleanup path.
 *
 * Errors are answered here rather than falling through to the app's error
 * handler, because that handler's size message is about resumes ("Maximum size
 * is 3 MB") and would be wrong for a recording.
 */

import multer from 'multer';
import { AUDIO_MAX_BYTES, audioExtensionFor } from 'ai-service';

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AUDIO_MAX_BYTES, files: 1, fields: 5 },
  fileFilter: (req, file, cb) => {
    if (audioExtensionFor(file.mimetype)) return cb(null, true);
    const refused = new Error('Unsupported audio type');
    refused.code = 'AUDIO_TYPE';
    return cb(refused, false);
  },
});

/** Parses the `audio` field into req.file, or answers the request itself. */
export function receiveAudio(req, res, next) {
  audioUpload.single('audio')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'That recording is too long to transcribe.', code: 'TRANSCRIBE_TOO_LARGE' });
    }
    if (err.code === 'AUDIO_TYPE') {
      return res.status(415).json({ error: 'That recording is not in an audio format this server accepts.', code: 'TRANSCRIBE_BAD_AUDIO' });
    }
    console.error('[transcribe] Upload could not be parsed:', err.message);
    return res.status(400).json({ error: 'That recording could not be read.', code: 'TRANSCRIBE_BAD_AUDIO' });
  });
}
