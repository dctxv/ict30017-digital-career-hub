/**
 * The resource matcher, pinned against the library it runs over.
 *
 * Every case here is a link that was actually shown on the board and was
 * wrong, or one that must keep working once the wrong ones are gone. The
 * matcher is biased towards showing nothing, and these are the places where
 * "nothing" has to win.
 *
 * Run: npm test --prefix server
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { matchResources } from './gapStore.js';

/** The seeded titles the failures were observed against. */
const LIBRARY = [
  'Interview Prep | Interview preparation guide for fresh graduates',
  'Skill Development | Building technical skills for software engineering roles',
  'Interview Prep | How to ace finance interviews at Bangladeshi banks',
  'Skill Development | Top financial certifications for career growth in Bangladesh',
  'Job Search | Where to find finance jobs in Bangladesh',
  'Resume Writing | How to structure a finance CV for Bangladeshi employers',
  'Interview Prep | Technical interview preparation for software engineers',
  'Skill Development | Essential lab techniques every science graduate should know',
  'Job Search | Engineering job opportunities in government and private sectors',
  'Job Search | Freelancing and remote work opportunities for arts graduates',
  'Job Search | Where to find business jobs in Bangladesh',
  'Skill Development | Digital marketing skills every business graduate needs',
].map((line, index) => {
  const [category, title] = line.split(' | ');
  return {
    id: index + 1, title, category, type: 'Article', url: 'https://example.com/',
    match_title: title.toLowerCase(), match_category: category.toLowerCase(),
  };
});

const titles = (query) => matchResources(query, LIBRARY).map((row) => row.title);

describe('matchResources', () => {
  it('does not match a term inside another word', () => {
    // "unit" is inside "opportunities". This linked a unit-testing gap to two
    // job-search articles.
    assert.deepEqual(titles('jest express unit testing'), []);
  });

  it('still matches the plural and inflected forms of a real term', () => {
    assert.ok(titles('bank credit analysis').includes('How to ace finance interviews at Bangladeshi banks'));
  });

  it('ignores the words every row in the library shares', () => {
    // "bangladesh" and "structure" are what linked a credit-proposal gap to a
    // CV-structure article and a job-search page.
    assert.deepEqual(titles('bangladesh structure'), []);
    assert.deepEqual(titles('techniques skills basics'), []);
  });

  it('never qualifies on a category hit alone', () => {
    // "Skill Development" would otherwise match every skill gap there is.
    assert.deepEqual(titles('skill development'), []);
  });

  it('finds the obvious link and ranks it first', () => {
    const found = titles('financial certifications');
    assert.equal(found[0], 'Top financial certifications for career growth in Bangladesh');
  });

  it('returns at most three', () => {
    assert.ok(titles('finance software interview').length <= 3);
  });

  it('survives an empty or missing query', () => {
    assert.deepEqual(matchResources('', LIBRARY), []);
    assert.deepEqual(matchResources(undefined, LIBRARY), []);
  });
});
