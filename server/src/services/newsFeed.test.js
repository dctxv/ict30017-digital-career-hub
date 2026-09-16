import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewsFeed, normaliseArticles } from './newsFeed.js';

const sample = {
  news: [{
    id: 'one',
    title: '  Graduate technology roles open  ',
    description: ' New opportunities ',
    url: 'https://example.com/jobs/one',
    published: '2026-09-16T10:00:00Z',
  }],
};

test('normaliseArticles keeps only safe, usable articles', () => {
  const result = normaliseArticles([
    ...sample.news,
    { title: 'Unsafe', url: 'javascript:alert(1)' },
    { title: '', url: 'https://example.com/empty' },
  ]);

  assert.equal(result.length, 1);
  assert.equal(result[0].title, 'Graduate technology roles open');
  assert.equal(result[0].source, 'example.com');
  assert.equal(result[0].published, '2026-09-16T10:00:00.000Z');
});

test('news feed caches provider responses for one hour', async () => {
  let requests = 0;
  let clock = 1_000;
  const feed = createNewsFeed({
    getApiKey: () => 'test-key',
    now: () => clock,
    fetchImpl: async () => {
      requests += 1;
      return { ok: true, json: async () => sample };
    },
  });

  const first = await feed.getArticles();
  const second = await feed.getArticles();

  assert.equal(requests, 1);
  assert.equal(first.cached, false);
  assert.equal(second.cached, true);
});

test('news feed serves stale cached articles when refresh fails', async () => {
  let requests = 0;
  let clock = 1_000;
  const feed = createNewsFeed({
    getApiKey: () => 'test-key',
    now: () => clock,
    fetchImpl: async () => {
      requests += 1;
      if (requests === 1) return { ok: true, json: async () => sample };
      throw new Error('network unavailable');
    },
  });

  await feed.getArticles();
  clock += 60 * 60 * 1000 + 1;
  const stale = await feed.getArticles();

  assert.equal(stale.stale, true);
  assert.equal(stale.articles.length, 1);
});

test('news feed refuses to call provider without a configured key', async () => {
  const feed = createNewsFeed({ getApiKey: () => '' });
  await assert.rejects(feed.getArticles(), /not configured/);
});
