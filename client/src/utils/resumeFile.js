/**
 * Client side resume file checks.
 *
 * The picker previously carried accept=".pdf,.docx", which only filters the
 * file dialog. A .txt dropped onto the drop zone was accepted, shown in a file
 * card and offered an Analyse button, then failed with 415 after a full upload
 * round trip. A 3.1 MB PDF behaved the same way and failed with 413.
 *
 * These checks are an addition, not a replacement. The server still validates
 * magic bytes and enforces its own size limit, and it remains the authority.
 * Everything here exists to fail fast and explain, before any bytes are sent.
 */

/** Matches the server's multer limit. */
export const MAX_RESUME_BYTES = 3 * 1024 * 1024

export const ACCEPTED_EXTENSIONS = ['.pdf', '.docx']

/**
 * Browsers are inconsistent about DOCX. Chrome usually reports the full
 * OOXML type, some systems report application/octet-stream, and a few report
 * nothing at all. An empty type is therefore not treated as a failure: the
 * extension check has already run, and the server verifies the magic bytes.
 */
export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const TOLERATED_EMPTY_MIME = ['', 'application/octet-stream']

function extensionOf(name) {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot).toLowerCase()
}

function formatSize(bytes) {
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/**
 * @param {File} file
 * @returns {{ ok: true } | { ok: false, reason: 'type'|'size'|'empty', message: string }}
 */
export function validateResumeFile(file) {
  if (!file) {
    return { ok: false, reason: 'empty', message: 'No file selected. Choose a PDF or DOCX resume.' }
  }

  const extension = extensionOf(file.name)

  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return {
      ok: false,
      reason: 'type',
      message: 'That file type is not supported. Upload a PDF or DOCX file.',
    }
  }

  const type = (file.type || '').toLowerCase()
  if (!ACCEPTED_MIME_TYPES.includes(type) && !TOLERATED_EMPTY_MIME.includes(type)) {
    return {
      ok: false,
      reason: 'type',
      message: 'That file type is not supported. Upload a PDF or DOCX file.',
    }
  }

  if (file.size === 0) {
    return {
      ok: false,
      reason: 'empty',
      message: 'That file is empty. Choose a resume with content in it.',
    }
  }

  if (file.size > MAX_RESUME_BYTES) {
    return {
      ok: false,
      reason: 'size',
      message: `That file is ${formatSize(file.size)}. Resumes must be 3 MB or smaller.`,
    }
  }

  return { ok: true }
}
