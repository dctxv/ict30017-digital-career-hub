import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { optionalText, validateAlumniContacts } from './alumniContacts.js';

describe('alumni contact validation', () => {
  it('accepts empty optional contact fields', () => {
    assert.equal(validateAlumniContacts({ email: '', linkedin_url: null }), null);
    assert.equal(optionalText('   '), null);
  });

  it('accepts professional email and LinkedIn profile URLs', () => {
    assert.equal(validateAlumniContacts({
      email: 'graduate@example.com',
      linkedin_url: 'https://www.linkedin.com/in/graduate-name',
    }), null);
  });

  it('rejects malformed email addresses', () => {
    assert.equal(
      validateAlumniContacts({ email: 'not-an-email' }),
      'Email must be a valid email address.'
    );
  });

  it('rejects non-LinkedIn and insecure URLs', () => {
    assert.match(validateAlumniContacts({ linkedin_url: 'https://example.com/profile' }), /LinkedIn URL/);
    assert.match(validateAlumniContacts({ linkedin_url: 'http://linkedin.com/in/name' }), /LinkedIn URL/);
  });
});
