const CURRENTS_ENDPOINT = 'https://api.currentsapi.services/v1/search';
const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_ARTICLES = 6;
const SEARCH_TERMS = ['career', 'education', 'technology'];

export const FALLBACK_ARTICLES = Object.freeze([
  {
    id: 'fallback-wef-jobs-skills',
    title: 'Explore global jobs and skills insights',
    description: 'Read current analysis about changing careers, workplace skills and the future of employment.',
    url: 'https://www.weforum.org/stories/jobs-and-skills/',
    source: 'weforum.org',
    published: null,
  },
  {
    id: 'fallback-ilo-skills',
    title: 'Develop skills for lifelong employment',
    description: 'Explore practical guidance on skills development, employability and lifelong learning.',
    url: 'https://www.ilo.org/topics-and-sectors/skills-and-lifelong-learning',
    source: 'ilo.org',
    published: null,
  },
  {
    id: 'fallback-microsoft-learn',
    title: 'Build digital skills for your career',
    description: 'Use free learning paths to strengthen technical and professional skills for modern roles.',
    url: 'https://learn.microsoft.com/training/',
    source: 'learn.microsoft.com',
    published: null,
  },
]);

function safeHttpUrl(raw) {
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function normaliseArticles(news) {
  if (!Array.isArray(news)) return [];

  const seenUrls = new Set();

  return news
    .map((item) => {
      const url = safeHttpUrl(item?.url);
      const title = typeof item?.title === 'string' ? item.title.trim() : '';
      if (!url || !title) return null;

      const publishedDate = new Date(item.published);
      const published = Number.isNaN(publishedDate.getTime()) ? null : publishedDate.toISOString();

      return {
        id: typeof item.id === 'string' && item.id ? item.id : url,
        title: title.slice(0, 240),
        description: typeof item.description === 'string'
          ? item.description.trim().slice(0, 500)
          : '',
        url,
        source: new URL(url).hostname.replace(/^www\./, ''),
        published,
      };
    })
    .filter((article) => {
      if (!article || seenUrls.has(article.url)) return false;
      seenUrls.add(article.url);
      return true;
    })
    .slice(0, MAX_ARTICLES);
}

export function createNewsFeed({
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
  getApiKey = () => process.env.CURRENTS_API_KEY,
} = {}) {
  let cache = null;
  let inFlight = null;

  async function fetchLatest() {
    const apiKey = getApiKey()?.trim();
    if (!apiKey || apiKey === 'your_currents_api_key_here') {
      throw new Error('CURRENTS_API_KEY is not configured.');
    }

    // Separate broad searches are more reliable than one restrictive
    // multi-keyword/country query. Three requests per cache refresh is still
    // only 72 requests/day at most, below the 250-request free allowance.
    const results = await Promise.allSettled(SEARCH_TERMS.map(async (keywords) => {
      const params = new URLSearchParams({ keywords, language: 'en' });
      const response = await fetchImpl(`${CURRENTS_ENDPOINT}?${params}`, {
        headers: { Authorization: apiKey },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        throw new Error(`Currents API returned ${response.status}.`);
      }

      const body = await response.json();
      if (!Array.isArray(body.news)) {
        throw new Error('Currents API returned an invalid response.');
      }
      return body.news;
    }));

    const successful = results
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => result.value);

    if (successful.length === 0 && results.every((result) => result.status === 'rejected')) {
      throw new Error('All Currents API searches failed.');
    }

    const articles = normaliseArticles(successful);
    return articles.length > 0 ? articles : FALLBACK_ARTICLES;
  }

  async function getArticles() {
    const currentTime = now();
    if (cache && currentTime - cache.fetchedAt < CACHE_TTL_MS) {
      return { articles: cache.articles, cached: true, stale: false };
    }

    if (!inFlight) {
      inFlight = fetchLatest()
        .then((articles) => {
          cache = { articles, fetchedAt: now() };
          return { articles, cached: false, stale: false };
        })
        .catch(() => {
          if (cache) return { articles: cache.articles, cached: true, stale: true };
          return { articles: FALLBACK_ARTICLES, cached: true, stale: true };
        })
        .finally(() => {
          inFlight = null;
        });
    }

    return inFlight;
  }

  return { getArticles };
}

export const newsFeed = createNewsFeed();
