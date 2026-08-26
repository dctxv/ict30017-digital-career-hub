import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveLanguage, translateMessage, localiseResponses } from './index.js';

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
