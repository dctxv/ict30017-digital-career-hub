/**
 * Tests for combining the account identity with the CV's own name.
 *
 * Run: npm test --prefix server
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { withNameHint } from './maskIdentity.js';

describe('withNameHint', () => {
  it('gives a guest an identity of just the CV name', () => {
    assert.deepEqual(withNameHint(null, 'Daniel Cook'), { extraNames: ['Daniel Cook'] });
  });

  it('adds the CV name to an account without dropping anything', () => {
    const account = { fullName: 'Jess Tran', email: 'j@example.com', phone: '0491 570 313', extraNames: ['Jessie'] };
    assert.deepEqual(withNameHint(account, 'Jessica Tran'), { ...account, extraNames: ['Jessie', 'Jessica Tran'] });
  });

  it('changes nothing when there is no hint', () => {
    const account = { fullName: 'Jess Tran' };
    assert.equal(withNameHint(account, null), account);
    assert.equal(withNameHint(null, null), null);
  });
});
