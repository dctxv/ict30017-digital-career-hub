import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveLanguage, translateMessage, localiseResponses } from './index.js';
import { validatePasswordPolicy, PASSWORD_MAX_LENGTH } from '../utils/password.js';

/**
 * Fake response that records what actually reached res.json, so the tests
 * assert on the payload the browser would receive rather than on the object the
 * route handed over.
 */
function fakeRes() {
  const res = { locals: {}, sent: undefined };
  res.json = (body) => { res.sent = body; return res; };
  return res;
}

function run(req, body) {
  const res = fakeRes();
  localiseResponses(req, res, () => {});
  res.json(body);
  return res.sent;
}

test('resolveLanguage', async (t) => {
  await t.test('defaults to English when nothing is supplied', () => {
    assert.equal(resolveLanguage({}), 'en');
  });

  await t.test('reads the cookie the client sets', () => {
    assert.equal(resolveLanguage({ cookies: { lang: 'bn' } }), 'bn');
  });

  await t.test('lets an explicit query parameter override the cookie', () => {
    assert.equal(resolveLanguage({ query: { lang: 'en' }, cookies: { lang: 'bn' } }), 'en');
  });

  await t.test('falls back to Accept-Language', () => {
    assert.equal(resolveLanguage({ headers: { 'accept-language': 'bn-BD,bn;q=0.9' } }), 'bn');
  });

  await t.test('ignores a language it does not support', () => {
    assert.equal(resolveLanguage({ cookies: { lang: 'fr' } }), 'en');
  });
});

test('translateMessage', async (t) => {
  await t.test('translates a known message', () => {
    assert.equal(translateMessage('Internal server error.', 'bn'), 'সার্ভারে সমস্যা হয়েছে।');
  });

  await t.test('leaves English requests untouched', () => {
    assert.equal(translateMessage('Internal server error.', 'en'), 'Internal server error.');
  });

  await t.test('passes an untranslated message through rather than blanking it', () => {
    assert.equal(translateMessage('Some message nobody has translated', 'bn'), 'Some message nobody has translated');
  });

  await t.test('handles interpolated messages and renders their digits in Bengali', () => {
    assert.equal(
      translateMessage('Password must be at least 12 characters.', 'bn'),
      'পাসওয়ার্ড অন্তত ১২ অক্ষরের হতে হবে।',
    );
  });
});

test('localiseResponses', async (t) => {
  await t.test('translates error and message', () => {
    const sent = run({ cookies: { lang: 'bn' } }, { error: 'Resource not found.' });
    assert.equal(sent.error, 'রিসোর্সটি পাওয়া যায়নি।');
  });

  await t.test('leaves every other field alone', () => {
    const sent = run({ cookies: { lang: 'bn' } }, { error: 'Resource not found.', limit: 3, id: 'Resource not found.' });
    assert.equal(sent.limit, 3);
    assert.equal(sent.id, 'Resource not found.');
  });

  await t.test('does not touch an English response', () => {
    const body = { error: 'Resource not found.' };
    assert.equal(run({}, body), body);
  });

  await t.test('passes arrays through untouched, so list endpoints are unaffected', () => {
    const body = [{ error: 'Resource not found.' }];
    assert.equal(run({ cookies: { lang: 'bn' } }, body), body);
  });

  await t.test('does not mutate the object the route built', () => {
    const body = { error: 'Resource not found.' };
    run({ cookies: { lang: 'bn' } }, body);
    assert.equal(body.error, 'Resource not found.');
  });

  await t.test('leaves an error code alone, since codes are not prose', () => {
    const sent = run({ cookies: { lang: 'bn' } }, { error: 'RATE_LIMIT', message: 'Analysis failed.' });
    assert.equal(sent.error, 'RATE_LIMIT');
    assert.equal(sent.message, 'বিশ্লেষণ সম্পন্ন করা যায়নি।');
  });
});

/**
 * The password policy produces sentences that no route holds a copy of, so
 * nothing else would notice if one were added without a Bangla counterpart.
 * The failure is invisible in English — the message still reaches the user,
 * just in the wrong language — so it is pinned here.
 *
 * The candidates below are chosen to trip one rule each; between them they
 * produce every message the policy can emit.
 */
test('every password policy message has a Bangla translation', async (t) => {
  const candidates = [
    [undefined, {}],
    ['Ab1!', {}],
    [`Ab1!${'e'.repeat(PASSWORD_MAX_LENGTH)}`, {}],
    ['STR0NGPASSW0RD!', {}],
    ['str0ngpassw0rd!', {}],
    ['StrongPassword!', {}],
    ['Str0ngPassw0rd1', {}],
    ['Password1234', {}],
    ['Sineth!12345', { email: 'sineth@example.com' }],
    ['Rahman!12345', { fullName: 'Ian Rahman' }],
  ];

  const messages = new Set();
  for (const [password, details] of candidates) {
    for (const message of validatePasswordPolicy(password, details).errors) {
      messages.add(message);
    }
  }

  // A guard on the guard: if the policy stopped rejecting these the loop below
  // would pass by having nothing to check.
  assert.ok(messages.size >= 10, `expected the candidates to trip most rules, got ${messages.size}`);

  for (const message of messages) {
    await t.test(message, () => {
      assert.notEqual(
        translateMessage(message, 'bn'),
        message,
        `"${message}" has no entry in BANGLA_MESSAGES or BANGLA_PATTERNS`,
      );
    });
  }
});
