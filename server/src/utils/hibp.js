/**
 * Breach lookup against Have I Been Pwned's Pwned Passwords range API.
 *
 * A password can satisfy every rule in utils/password.js and still be worthless
 * because it is already in a public breach corpus — `Str0ngPassw0rd!` passes the
 * composition checks and has been leaked millions of times. Length and
 * composition rules cannot see that; only a corpus can.
 *
 * Privacy (k-anonymity): only the first five hex characters of the password's
 * SHA-1 are sent. The API answers with every suffix sharing that prefix —
 * several hundred of them — and the comparison happens here. The password and
 * its full hash never leave this server, which is what makes it acceptable to
 * send a user's chosen password anywhere near a third party at all.
 *
 * Two deliberate choices about failure:
 *
 *   - The check is OFF by default, behind HIBP_ENABLED. It puts a call to a
 *     third party on the registration path, and this project is marked and
 *     demonstrated on machines whose network access nobody can promise. A
 *     registration form that pauses for five seconds because a marker's network
 *     blocks api.pwnedpasswords.com is a worse outcome than a missing check, so
 *     switching it on is a decision for whoever runs the deployment.
 *   - When it is on, it fails open: a timeout, a non-200 or a parse failure
 *     returns "not breached" rather than rejecting. HIBP being unreachable is
 *     not evidence against the user's password, and locking everyone out of
 *     registration because someone else's API is down trades a small security
 *     gain for a total availability loss.
 */

import crypto from 'crypto';

const HIBP_RANGE_URL = 'https://api.pwnedpasswords.com/range/';

/**
 * Short enough that a user waiting on the registration form does not notice it,
 * and the fail-open path makes a miss cheap.
 */
const TIMEOUT_MS = 3000;

/**
 * Read per call rather than captured at import, so a test can toggle it and so
 * the value cannot be baked in before dotenv has populated the environment.
 */
export function isBreachCheckEnabled() {
  return String(process.env.HIBP_ENABLED ?? '').trim().toLowerCase() === 'true';
}

/**
 * How many times the password appears in HIBP's corpus.
 *
 * Always performs the lookup — the enabled check belongs to the caller, and
 * keeping it out of here is what lets the tests exercise the real logic with
 * the flag off.
 *
 * @param {string} password
 * @returns {Promise<number>} occurrences, or 0 if the lookup could not be made.
 */
export async function pwnedCount(password) {
  if (typeof password !== 'string' || password === '') return 0;

  const sha1 = crypto.createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${HIBP_RANGE_URL}${prefix}`, {
      // Padding makes every response a similar size, so the number of results
      // cannot be inferred from the response length by anyone watching.
      headers: { 'Add-Padding': 'true' },
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(`[hibp] Range API answered ${response.status}; treating the password as unseen.`);
      return 0;
    }

    const body = await response.text();

    // The API separates lines with CRLF, but split on either so a proxy that
    // rewrites line endings does not silently turn every lookup into a miss.
    for (const line of body.split(/\r?\n/)) {
      const separator = line.indexOf(':');
      if (separator === -1) continue;
      if (line.slice(0, separator).trim().toUpperCase() !== suffix) continue;

      // A padded response includes synthetic entries with a count of 0. Those
      // are noise, not matches, so they read as unseen.
      const count = Number.parseInt(line.slice(separator + 1).trim(), 10);
      return Number.isFinite(count) && count > 0 ? count : 0;
    }

    return 0;
  } catch (err) {
    const reason = err?.name === 'AbortError' ? `timed out after ${TIMEOUT_MS}ms` : err?.message;
    console.warn(`[hibp] Breach check failed (${reason}); treating the password as unseen.`);
    return 0;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The call sites' entry point: honours the feature flag and reports the result
 * in the shape a route wants.
 *
 * @param {string} password
 * @returns {Promise<{ breached: boolean, count: number }>}
 */
export async function checkPasswordBreach(password) {
  if (!isBreachCheckEnabled()) return { breached: false, count: 0 };

  const count = await pwnedCount(password);
  return { breached: count > 0, count };
}

/**
 * The rejection sentence, kept here so the three call sites cannot word it
 * differently and so i18n/messages.js has one string to translate.
 *
 * It deliberately does not say how many times the password was seen. The number
 * is interesting to an engineer and useless to the user, and repeating it back
 * confirms to anyone reading over their shoulder that the password they just
 * typed is a known one.
 */
export const BREACHED_PASSWORD_MESSAGE =
  'This password has appeared in a known data breach. Please choose a different one.';
