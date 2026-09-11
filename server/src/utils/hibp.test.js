import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

import {
  pwnedCount,
  checkPasswordBreach,
  isBreachCheckEnabled,
  BREACHED_PASSWORD_MESSAGE,
} from './hibp.js';

/**
 * The suffix HIBP would return for a given password, so a stubbed response can
 * be built the way the real API would build it rather than hardcoding a hash
 * that nothing verifies.
 */
function suffixFor(password) {
  return crypto.createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase().slice(5);
}

/**
 * Replaces global fetch for the duration of one test and restores it after,
 * including when the test throws. Nothing here touches the network: a test that
 * did would fail on an offline marker's machine, which is the same failure mode
 * the feature flag exists to avoid.
 */
async function withFetch(handler, run) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return handler(url, options);
  };
  try {
    return await run(calls);
  } finally {
    globalThis.fetch = original;
  }
}

function textResponse(body, { ok = true, status = 200 } = {}) {
  return { ok, status, text: async () => body };
}

/** Restores HIBP_ENABLED after a test that changes it. */
async function withFlag(value, run) {
  const original = process.env.HIBP_ENABLED;
  if (value === undefined) delete process.env.HIBP_ENABLED;
  else process.env.HIBP_ENABLED = value;
  try {
    return await run();
  } finally {
    if (original === undefined) delete process.env.HIBP_ENABLED;
    else process.env.HIBP_ENABLED = original;
  }
}

test('isBreachCheckEnabled', async (t) => {
  await t.test('is off when the variable is unset', async () => {
    await withFlag(undefined, () => assert.equal(isBreachCheckEnabled(), false));
  });

  await t.test('is on for "true", whatever the case and spacing', async () => {
    for (const value of ['true', 'TRUE', ' True ']) {
      await withFlag(value, () => assert.equal(isBreachCheckEnabled(), true, value));
    }
  });

  await t.test('is off for anything else, rather than for anything falsy', async () => {
    // "1" and "yes" read as on to a human, so treating them as off would be a
    // trap. They are rejected on purpose: one spelling, documented in
    // .env.example, is easier to get right than a list.
    for (const value of ['', 'false', '1', 'yes', 'on']) {
      await withFlag(value, () => assert.equal(isBreachCheckEnabled(), false, value));
    }
  });
});

test('pwnedCount — k-anonymity', async (t) => {
  await t.test('sends only the first five hash characters, never the password', async () => {
    const password = 'Str0ngPassw0rd!';
    const sha1 = crypto.createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase();

    await withFetch(() => textResponse(''), async (calls) => {
      await pwnedCount(password);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].url, `https://api.pwnedpasswords.com/range/${sha1.slice(0, 5)}`);
      assert.ok(!calls[0].url.includes(sha1.slice(5)), 'the hash suffix must not be sent');
      assert.ok(!calls[0].url.includes(password), 'the password must not be sent');
    });
  });

  await t.test('asks for padding so the result count cannot be inferred', async () => {
    await withFetch(() => textResponse(''), async (calls) => {
      await pwnedCount('Str0ngPassw0rd!');
      assert.equal(calls[0].options.headers['Add-Padding'], 'true');
    });
  });
});

test('pwnedCount — reading the response', async (t) => {
  const password = 'Str0ngPassw0rd!';

  await t.test('returns the count for a matching suffix', async () => {
    const body = [`0000000000000000000000000000000000A:3`, `${suffixFor(password)}:4211`].join('\r\n');
    await withFetch(() => textResponse(body), async () => {
      assert.equal(await pwnedCount(password), 4211);
    });
  });

  await t.test('returns 0 when no suffix matches', async () => {
    const body = ['0000000000000000000000000000000000A:3'].join('\r\n');
    await withFetch(() => textResponse(body), async () => {
      assert.equal(await pwnedCount(password), 0);
    });
  });

  await t.test('tolerates LF line endings, not just the documented CRLF', async () => {
    const body = `0000000000000000000000000000000000A:3\n${suffixFor(password)}:7`;
    await withFetch(() => textResponse(body), async () => {
      assert.equal(await pwnedCount(password), 7);
    });
  });

  await t.test('treats a padded zero-count entry as unseen rather than as a hit', async () => {
    const body = `${suffixFor(password)}:0`;
    await withFetch(() => textResponse(body), async () => {
      assert.equal(await pwnedCount(password), 0);
    });
  });

  await t.test('ignores a malformed line instead of throwing', async () => {
    const body = `not-a-line\r\n\r\n${suffixFor(password)}:2`;
    await withFetch(() => textResponse(body), async () => {
      assert.equal(await pwnedCount(password), 2);
    });
  });
});

test('pwnedCount — fails open', async (t) => {
  await t.test('returns 0 when the API answers with an error status', async () => {
    await withFetch(() => textResponse('', { ok: false, status: 503 }), async () => {
      assert.equal(await pwnedCount('Str0ngPassw0rd!'), 0);
    });
  });

  await t.test('returns 0 when the request throws', async () => {
    await withFetch(() => { throw new Error('getaddrinfo ENOTFOUND'); }, async () => {
      assert.equal(await pwnedCount('Str0ngPassw0rd!'), 0);
    });
  });

  await t.test('returns 0 when the request is aborted', async () => {
    const aborted = Object.assign(new Error('aborted'), { name: 'AbortError' });
    await withFetch(() => { throw aborted; }, async () => {
      assert.equal(await pwnedCount('Str0ngPassw0rd!'), 0);
    });
  });

  await t.test('does not call the API at all for an empty or non-string password', async () => {
    await withFetch(() => textResponse(''), async (calls) => {
      assert.equal(await pwnedCount(''), 0);
      assert.equal(await pwnedCount(undefined), 0);
      assert.equal(calls.length, 0);
    });
  });
});

test('checkPasswordBreach — honours the feature flag', async (t) => {
  const password = 'Str0ngPassw0rd!';

  await t.test('makes no request while the flag is off', async () => {
    await withFlag(undefined, () =>
      withFetch(() => textResponse(`${suffixFor(password)}:9999`), async (calls) => {
        assert.deepEqual(await checkPasswordBreach(password), { breached: false, count: 0 });
        assert.equal(calls.length, 0, 'the flag being off must mean no network call');
      }));
  });

  await t.test('reports a breach while the flag is on', async () => {
    await withFlag('true', () =>
      withFetch(() => textResponse(`${suffixFor(password)}:9999`), async () => {
        assert.deepEqual(await checkPasswordBreach(password), { breached: true, count: 9999 });
      }));
  });

  await t.test('reports no breach for an unlisted password while the flag is on', async () => {
    await withFlag('true', () =>
      withFetch(() => textResponse('0000000000000000000000000000000000A:3'), async () => {
        assert.deepEqual(await checkPasswordBreach(password), { breached: false, count: 0 });
      }));
  });

  await t.test('does not leak the occurrence count into the user-facing message', async () => {
    assert.ok(!/\d/.test(BREACHED_PASSWORD_MESSAGE), BREACHED_PASSWORD_MESSAGE);
  });
});
