import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validatePasswordPolicy,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from './password.js';

/** A password that satisfies every rule, so each test can break exactly one. */
const GOOD = 'Str0ngPassw0rd!';

test('validatePasswordPolicy — a compliant password', async (t) => {
  await t.test('accepts one that meets every rule', () => {
    assert.deepEqual(validatePasswordPolicy(GOOD), { valid: true, errors: [] });
  });

  await t.test('accepts one exactly at the minimum length', () => {
    const atMinimum = 'Ab1!efghijkl';
    assert.equal(atMinimum.length, PASSWORD_MIN_LENGTH);
    assert.equal(validatePasswordPolicy(atMinimum).valid, true);
  });

  await t.test('accepts one exactly at the maximum length', () => {
    const atMaximum = `Ab1!${'e'.repeat(PASSWORD_MAX_LENGTH - 4)}`;
    assert.equal(atMaximum.length, PASSWORD_MAX_LENGTH);
    assert.equal(validatePasswordPolicy(atMaximum).valid, true);
  });
});

test('validatePasswordPolicy — length', async (t) => {
  await t.test('rejects one character below the minimum', () => {
    const short = 'Ab1!efghijk';
    assert.equal(short.length, PASSWORD_MIN_LENGTH - 1);
    const { valid, errors } = validatePasswordPolicy(short);
    assert.equal(valid, false);
    assert.equal(errors[0], `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  });

  await t.test('rejects one character above the maximum', () => {
    const long = `Ab1!${'e'.repeat(PASSWORD_MAX_LENGTH - 3)}`;
    assert.equal(long.length, PASSWORD_MAX_LENGTH + 1);
    assert.ok(validatePasswordPolicy(long).errors.includes('Password is too long.'));
  });

  /*
   * The length sentence is worded to match the pattern in i18n/messages.js. If
   * that wording drifts the message silently stops being translated, which is
   * invisible in English, so it is pinned here rather than left to review.
   */
  await t.test('words the length failure exactly as the Bangla pattern expects', () => {
    const [first] = validatePasswordPolicy('Ab1!').errors;
    assert.match(first, /^Password must be at least \d+ characters\.$/);
  });
});

test('validatePasswordPolicy — composition', async (t) => {
  const cases = [
    ['STR0NGPASSW0RD!', 'Password must include a lowercase letter.'],
    ['str0ngpassw0rd!', 'Password must include an uppercase letter.'],
    ['StrongPassword!', 'Password must include a number.'],
    ['Str0ngPassw0rd1', 'Password must include a symbol.'],
  ];

  for (const [candidate, expected] of cases) {
    await t.test(expected, () => {
      const { valid, errors } = validatePasswordPolicy(candidate);
      assert.equal(valid, false);
      assert.deepEqual(errors, [expected]);
    });
  }

  await t.test('treats a space as a symbol, so a passphrase is not refused', () => {
    assert.equal(validatePasswordPolicy('Correct Horse 7').valid, true);
  });

  await t.test('counts a non-ASCII letter as a symbol rather than ignoring it', () => {
    // Bengali text carries no case, so a Bangla-speaking user still needs the
    // Latin upper and lower case — but it must at least satisfy the symbol rule
    // instead of being treated as alphanumeric.
    assert.ok(!validatePasswordPolicy('Abcdefghij1ক').errors.includes('Password must include a symbol.'));
  });
});

test('validatePasswordPolicy — guessability', async (t) => {
  await t.test('rejects a password from the common list', () => {
    const { valid, errors } = validatePasswordPolicy('Password1234');
    assert.equal(valid, false);
    assert.ok(errors.includes('This password is too common. Please choose a less predictable one.'));
  });

  await t.test('matches the common list regardless of case', () => {
    assert.ok(
      validatePasswordPolicy('PASSWORD1234').errors
        .includes('This password is too common. Please choose a less predictable one.')
    );
  });

  await t.test('rejects a password containing the email local part', () => {
    const { errors } = validatePasswordPolicy('Sineth!12345', { email: 'sineth@example.com' });
    assert.ok(errors.includes('Password must not contain your email address.'));
  });

  await t.test('ignores the email domain, which is not personal to the user', () => {
    const { errors } = validatePasswordPolicy('Example!1234', { email: 'ab@example.com' });
    assert.ok(!errors.includes('Password must not contain your email address.'));
  });

  await t.test('rejects a password containing a part of the full name', () => {
    const { errors } = validatePasswordPolicy('Rahman!12345', { email: '', fullName: 'Ian Rahman' });
    assert.ok(errors.includes('Password must not contain your name.'));
  });

  await t.test('does not reject on a name fragment too short to be meaningful', () => {
    // "Ian" is three characters; refusing every password containing "ian" would
    // reject "Guardian!123" and teach the user nothing.
    const { errors } = validatePasswordPolicy('Guardian!123', { fullName: 'Ian Rahman' });
    assert.ok(!errors.includes('Password must not contain your name.'));
  });

  await t.test('skips the personal checks when no details are supplied', () => {
    assert.equal(validatePasswordPolicy(GOOD).valid, true);
    assert.equal(validatePasswordPolicy(GOOD, {}).valid, true);
  });
});

test('validatePasswordPolicy — input that is not a string', async (t) => {
  for (const value of [undefined, null, 12345678901234, {}, []]) {
    await t.test(`rejects ${JSON.stringify(value) ?? String(value)} without throwing`, () => {
      const { valid, errors } = validatePasswordPolicy(value);
      assert.equal(valid, false);
      assert.deepEqual(errors, ['Password is required.']);
    });
  }
});
