/**
 * Response localisation.
 *
 * The client already switches its own interface between English and Bangla, but
 * every sentence the API produced stayed English — so a user reading a Bangla
 * page hit English the moment anything went wrong, which is exactly when
 * wording matters most. This module translates the two user-facing fields the
 * API sends, `error` and `message`, on the way out.
 *
 * The language is read from a plain `lang` cookie the browser sets alongside
 * its stored preference. A cookie rather than a header because every existing
 * fetch in the client already sends cookies automatically, and a header would
 * have meant editing every call site and remembering to do so in every future
 * one. A `?lang=` query parameter overrides it, matching what /api/resources
 * already accepts.
 *
 * Untranslated strings pass through in English. That is the intended failure
 * mode: a message nobody has translated yet still reaches the user intact.
 */

import { BANGLA_MESSAGES, BANGLA_PATTERNS } from './messages.js';

export const SUPPORTED_LANGUAGES = ['en', 'bn'];
export const DEFAULT_LANGUAGE = 'en';

/** Fields translated on the way out. Nothing else in a response is touched. */
const TRANSLATABLE_FIELDS = ['error', 'message'];

function normalise(value) {
  if (typeof value !== 'string') return null;
  const code = value.trim().toLowerCase().slice(0, 2);
  return SUPPORTED_LANGUAGES.includes(code) ? code : null;
}

/**
 * Query parameter, then cookie, then Accept-Language, then English.
 *
 * @param {import('express').Request} req
 * @returns {'en'|'bn'}
 */
export function resolveLanguage(req) {
  return (
    normalise(req?.query?.lang) ??
    normalise(req?.cookies?.lang) ??
    normalise(req?.headers?.['accept-language']) ??
    DEFAULT_LANGUAGE
  );
}

/**
 * Translates one message. Exact matches first, then the interpolated patterns.
 *
 * @param {string} text
 * @param {'en'|'bn'} lang
 * @returns {string} the translation, or `text` unchanged
 */
export function translateMessage(text, lang) {
  if (lang !== 'bn' || typeof text !== 'string' || !text) return text;

  const exact = BANGLA_MESSAGES[text];
  if (exact) return exact;

  for (const { match, build } of BANGLA_PATTERNS) {
    const found = text.match(match);
    if (found) return build(found);
  }

  return text;
}

/**
 * Wraps res.json so every route's `error` and `message` are translated without
 * the route knowing. Must be registered before the routers, and before the
 * error handler, so both are covered.
 *
 * Only plain objects are rewritten, and only those two keys: a response body
 * that happens to be an array, a string or a number is passed straight through.
 */
export function localiseResponses(req, res, next) {
  const lang = resolveLanguage(req);
  res.locals.lang = lang;

  if (lang === DEFAULT_LANGUAGE) return next();

  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return originalJson(body);
    }

    let translated = body;
    for (const field of TRANSLATABLE_FIELDS) {
      if (typeof body[field] !== 'string') continue;
      const next = translateMessage(body[field], lang);
      if (next === body[field]) continue;
      // Copied on first change only, so a response with nothing to translate is
      // sent as the exact object the route built.
      if (translated === body) translated = { ...body };
      translated[field] = next;
    }

    return originalJson(translated);
  };

  next();
}
