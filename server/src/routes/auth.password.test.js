import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';

/**
 * End-to-end cover for the password policy as the registration endpoint
 * actually applies it.
 *
 * utils/password.test.js proves the rules; this proves they are wired in. The
 * two failures that file cannot see are a handler that never calls the
 * validator and a handler that calls it but ignores the result, and both would
 * ship a registration form that accepts "aaaaaaaaaaaa" while every unit test
 * stays green.
 *
 * Every request below is refused before the handler reaches bcrypt or the
 * database, which is what lets this run with no Postgres — a rejected password
 * never gets that far. A regression that let one of these through would fail
 * here as a connection error rather than a 201, so the test still fails; it
 * just fails for a second reason as well.
 */

process.env.JWT_SECRET ??= 'test-only-secret';

const { default: authRouter } = await import('./auth.js');
const { localiseResponses } = await import('../i18n/index.js');

/** Starts the router on an ephemeral port for the duration of one suite. */
async function withServer(run) {
  const app = express();
  app.use(express.json());
  // Registered before the router, as app.js does, so the responses these tests
  // read are the ones a browser would receive rather than the raw route output.
  app.use(localiseResponses);
  app.use('/api/auth', authRouter);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  const register = async (body, lang) => {
    const query = lang ? `?lang=${lang}` : '';
    const response = await fetch(`http://127.0.0.1:${port}/api/auth/register${query}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { status: response.status, body: await response.json().catch(() => ({})) };
  };

  try {
    return await run(register);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

const VALID = {
  full_name: 'Test Person',
  email: 'test.person@example.com',
  password: 'Str0ngPassw0rd!',
};

test('POST /register applies the password policy', async (t) => {
  await withServer(async (register) => {
    await t.test('rejects a password that is too short', async () => {
      const { status, body } = await register({ ...VALID, password: 'Ab1!efghijk' });
      assert.equal(status, 400);
      assert.equal(body.error, 'Password must be at least 12 characters.');
    });

    /*
     * The case the length-only rule let through. Twelve characters, so the
     * previous check passed it; no uppercase, digit or symbol, so it is a
     * password nobody should be allowed to register.
     */
    await t.test('rejects a long password with no composition at all', async () => {
      const { status, body } = await register({ ...VALID, password: 'aaaaaaaaaaaa' });
      assert.equal(status, 400);
      assert.equal(body.error, 'Password must include an uppercase letter.');
    });

    await t.test('rejects a password missing only a symbol', async () => {
      const { status, body } = await register({ ...VALID, password: 'Str0ngPassw0rd1' });
      assert.equal(status, 400);
      assert.equal(body.error, 'Password must include a symbol.');
    });

    await t.test('rejects a password built from the user\'s own name', async () => {
      const { status, body } = await register({ ...VALID, password: 'TestPerson!1' });
      assert.equal(status, 400);
      assert.equal(body.error, 'Password must not contain your name.');
    });

    await t.test('rejects a password built from the user\'s own email', async () => {
      const { status, body } = await register({
        ...VALID,
        full_name: 'Someone Else',
        password: 'Test.person!1',
      });
      assert.equal(status, 400);
      assert.equal(body.error, 'Password must not contain your email address.');
    });

    /*
     * The name is validated before the password so that a bad name is reported
     * as a name problem. Pinned because the two checks were the other way round
     * before the policy was centralised, and swapping them back would produce a
     * form that complains about the password when the name is what is wrong.
     */
    await t.test('reports a bad name as a name problem, not a password one', async () => {
      const { status, body } = await register({ ...VALID, full_name: 'X', password: 'short' });
      assert.equal(status, 400);
      assert.equal(body.error, 'Full name must be between 2 and 100 characters.');
    });

    /*
     * The real check that the policy and the translation table agree. Each
     * knows the sentence only as a literal, nothing links them, and a rewording
     * on either side silently sends English to a Bangla reader. That is
     * invisible in every other test here, all of which read English.
     */
    await t.test('answers a Bangla request in Bangla', async () => {
      const { status, body } = await register({ ...VALID, password: 'aaaaaaaaaaaa' }, 'bn');
      assert.equal(status, 400);
      assert.equal(body.error, 'পাসওয়ার্ডে অন্তত একটি বড় হাতের ইংরেজি অক্ষর থাকতে হবে।');
    });
  });
});
