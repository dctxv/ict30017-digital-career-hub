/**
 * Module: origins
 * Responsibility: Single source of truth for the CORS and CSRF origin allowlist.
 *
 * The default list was previously written out twice, in app.js for CORS and in
 * routes/chatbot.js for the CSRF origin check, and both omitted the 127.0.0.1
 * form. Vite prints http://127.0.0.1:5173 alongside http://localhost:5173 as an
 * equally valid URL, so opening the site that way made every POST /api/chat
 * return 403 while the identical request from localhost passed.
 *
 * The list stays explicit. A wildcard would defeat the CSRF check, which is the
 * only thing standing between a cross-site form post and the chat endpoint.
 */

const DEFAULT_ALLOWED_ORIGINS = Object.freeze([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]);

/**
 * Resolves the allowlist from ALLOWED_ORIGINS, falling back to the local
 * development defaults above.
 *
 * @returns {string[]} trusted origins, never empty
 */
export function getAllowedOrigins() {
  const configured = process.env.ALLOWED_ORIGINS
    ?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return configured?.length ? configured : [...DEFAULT_ALLOWED_ORIGINS];
}

export { DEFAULT_ALLOWED_ORIGINS };
