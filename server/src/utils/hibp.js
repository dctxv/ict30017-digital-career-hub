import crypto from 'crypto';

/**
 * Checks if a password has appeared in a known data breach using the
 * Have I Been Pwned k-anonymity API. Only the first 5 chars of the SHA-1
 * hash are sent — the full password never leaves the server.
 *
 * Returns the number of times the password appeared in breaches (0 = safe).
 * Falls back to 0 on network error so a HIBP outage never blocks registration.
 */
export async function isPwned(password) {
  try {
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
    });

    if (!res.ok) return 0;

    const text = await res.text();
    const match = text.split('\r\n').find(line => line.startsWith(suffix));
    if (!match) return 0;

    return parseInt(match.split(':')[1], 10) || 0;
  } catch {
    // Network error or HIBP down — fail open so registration is not blocked.
    return 0;
  }
}
