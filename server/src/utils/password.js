/**
 * The password policy, in one place.
 *
 * The rules themselves were already here in spirit — a 12 to 128 character
 * bound — but written out three times: in register and reset-password in
 * routes/auth.js, and in the change-password handler in routes/users.js. Two of
 * those spelled the bounds as named constants and the third had 12 and 128 as
 * bare literals, so the three could drift apart without anything failing. They
 * had in fact already drifted in wording, and a policy that is enforced
 * differently depending on which door the password comes through is not a
 * policy. This module is the single definition all three now call.
 *
 * The bounds are unchanged, so nothing that was accepted for its length before
 * is refused now. What is new is the composition, reuse and guessability
 * checks, which the previous length-only rule let straight through: `aaaaaaaaaaaa`
 * is twelve characters and satisfied every check the API made.
 *
 * The shape of the rules follows NIST 800-63B where it is sensible — length
 * carries most of the weight, and there is no forced rotation — but keeps the
 * explicit composition requirements too, which that guidance would rather drop.
 * That is a deliberate concession: this is a student project whose marking
 * criteria ask to see complexity enforcement, and the cost of keeping it is a
 * little user friction rather than a weakness.
 *
 * Errors come back as a list of whole, standalone sentences, and callers send
 * the first. That is not arbitrary: i18n/index.js localises the `error` field
 * by exact string match, so a message assembled by joining several sentences
 * would match no entry in the Bangla table and would reach a Bangla reader in
 * English. One sentence per response keeps every message translatable, which is
 * why the checks below are ordered — the first failure a user sees should be
 * the most fundamental one.
 */

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

/**
 * Passwords common enough to be tried early in any credential-stuffing run,
 * restricted to those that would otherwise satisfy every rule above — there is
 * no point listing `password`, which the length check already rejects.
 *
 * A real deployment would check the password against a breach corpus instead of
 * a list this size; utils/hibp.js does exactly that and is the intended answer.
 * This list is the offline floor that still applies when that check is switched
 * off, so the two are complements rather than alternatives.
 */
const COMMON_PASSWORDS = new Set([
  'password1234',
  'password123!',
  'passw0rd1234',
  '123456789012',
  'qwertyuiop12',
  'qwerty123456',
  'letmein12345',
  'admin1234567',
  'administrator',
  'welcome12345',
  'iloveyou1234',
  'changeme1234',
  'trustno12345',
  'monkey123456',
  'football1234',
  'dragon123456',
  'baseball1234',
  'sunshine1234',
  'princess1234',
  'superman1234',
]);

/**
 * The shortest run of the user's own details worth rejecting inside a password.
 *
 * Four is a compromise. Lower, and ordinary words collide with short names —
 * a user called Ali cannot be told that `Californial1!` contains their name.
 * Higher, and `sineth` in `sineth1234!A` slips through, which is the case the
 * check exists for.
 */
const MIN_PERSONAL_FRAGMENT = 4;

/**
 * Checks a candidate password against the policy.
 *
 * The personal-details checks are skipped when the caller does not have that
 * information — the change-password handler knows the user's id but has not
 * loaded their name — rather than being treated as a failure. A check that
 * cannot run is not a rule the password broke.
 *
 * @param {unknown} password The candidate, straight from the request body and
 *   therefore not necessarily a string.
 * @param {{ email?: string, fullName?: string }} [details] The user's own
 *   details, where the caller has them, so the password can be rejected for
 *   containing them.
 * @returns {{ valid: boolean, errors: string[] }} `errors` is empty when valid;
 *   callers send `errors[0]`.
 */
export function validatePasswordPolicy(password, details = {}) {
  if (typeof password !== 'string') {
    return { valid: false, errors: ['Password is required.'] };
  }

  const errors = [];

  // Length first, and worded exactly as the three handlers worded it before, so
  // the Bangla pattern in i18n/messages.js keeps matching it.
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push('Password is too long.');
  }

  if (!/[a-z]/.test(password)) errors.push('Password must include a lowercase letter.');
  if (!/[A-Z]/.test(password)) errors.push('Password must include an uppercase letter.');
  if (!/[0-9]/.test(password)) errors.push('Password must include a number.');
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must include a symbol.');
  }

  const lowered = password.toLowerCase();

  if (COMMON_PASSWORDS.has(lowered)) {
    errors.push('This password is too common. Please choose a less predictable one.');
  }

  const { email = '', fullName = '' } = details;

  // The local part only. Rejecting a password for containing `gmail.com` would
  // be noise, and the domain is not personal to the user in any case.
  const emailLocal = String(email).split('@')[0].trim().toLowerCase();
  if (emailLocal.length >= MIN_PERSONAL_FRAGMENT && lowered.includes(emailLocal)) {
    errors.push('Password must not contain your email address.');
  }

  const nameParts = String(fullName)
    .toLowerCase()
    .split(/\s+/)
    .filter((part) => part.length >= MIN_PERSONAL_FRAGMENT);
  if (nameParts.some((part) => lowered.includes(part))) {
    errors.push('Password must not contain your name.');
  }

  return { valid: errors.length === 0, errors };
}
