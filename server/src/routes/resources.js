/**
 * Module: resourcesRouter
 * Responsibility: CRUD over career resources, stored bilingually.
 *
 * Reads are public. Writes require an authenticated admin.
 *
 * Bilingual contract:
 *   Each row holds title_en/title_bn and description_en/description_bn.
 *   A read resolves ONE language into the flat `title` and `desc` fields the
 *   frontend renders, chosen by ?lang=en|bn (default en). Bangla falls back to
 *   English per-field via COALESCE — an untranslated row shows English text
 *   rather than a blank card, which is the more useful failure.
 *
 *   The raw *_en / *_bn columns are returned alongside so the admin dashboard
 *   can edit both languages without a second endpoint. The content is public
 *   either way, so there is nothing withheld by returning them.
 */

import express from 'express';
import pool from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

const SUPPORTED_LANGUAGES = ['en', 'bn'];
const TITLE_MAX = 200;
const DESCRIPTION_MAX = 2000;
const URL_MAX = 2000;
const SHORT_MAX = 100;

// Builds the SELECT list for a language. `lang` is validated against
// SUPPORTED_LANGUAGES before it reaches here, so it is never attacker-controlled
// string interpolation — but it is still restricted to a fixed pair of literals.
function selectFields(lang) {
  const title = lang === 'bn' ? 'COALESCE(title_bn, title_en)' : 'title_en';
  const desc = lang === 'bn' ? 'COALESCE(description_bn, description_en)' : 'description_en';
  return `
    id,
    ${title} AS title,
    ${desc}  AS "desc",
    title_en,
    title_bn,
    description_en,
    description_bn,
    type,
    discipline,
    category,
    url
  `;
}

function resolveLang(raw) {
  return SUPPORTED_LANGUAGES.includes(raw) ? raw : 'en';
}

function parseId(raw) {
  const id = Number.parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateResource(body) {
  const {
    title_en, title_bn, description_en, description_bn,
    type, discipline, category, url,
  } = body;

  if (typeof title_en !== 'string' || title_en.trim().length < 2) {
    return 'English title must be at least 2 characters.';
  }
  if (title_en.trim().length > TITLE_MAX) {
    return `English title must be ${TITLE_MAX} characters or fewer.`;
  }
  if (title_bn !== undefined && title_bn !== null && title_bn !== '') {
    if (typeof title_bn !== 'string') return 'Bangla title must be text.';
    if (title_bn.trim().length > TITLE_MAX) {
      return `Bangla title must be ${TITLE_MAX} characters or fewer.`;
    }
  }

  for (const [label, value] of [
    ['English description', description_en],
    ['Bangla description', description_bn],
  ]) {
    if (value !== undefined && value !== null) {
      if (typeof value !== 'string') return `${label} must be text.`;
      if (value.length > DESCRIPTION_MAX) return `${label} is too long.`;
    }
  }

  for (const [label, value] of [
    ['Type', type],
    ['Discipline', discipline],
    ['Category', category],
  ]) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return `${label} is required.`;
    }
    if (value.trim().length > SHORT_MAX) {
      return `${label} must be ${SHORT_MAX} characters or fewer.`;
    }
  }

  if (typeof url !== 'string' || url.trim().length === 0) {
    return 'URL is required.';
  }
  if (url.trim().length > URL_MAX) {
    return `URL must be ${URL_MAX} characters or fewer.`;
  }
  // Only http(s) — blocks javascript: and data: URLs, which would otherwise be
  // rendered straight into an href on the resources page.
  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    return 'URL must be a valid absolute URL.';
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return 'URL must start with http:// or https://.';
  }

  return null;
}

// Empty string is stored as NULL for the Bangla columns so COALESCE fallback works.
const nullIfBlank = (v) => {
  const trimmed = (v ?? '').trim();
  return trimmed === '' ? null : trimmed;
};

function toParams(body) {
  return [
    body.title_en.trim(),
    nullIfBlank(body.title_bn),
    (body.description_en ?? '').trim(),
    nullIfBlank(body.description_bn),
    body.type.trim(),
    body.discipline.trim(),
    body.category.trim(),
    body.url.trim(),
  ];
}

// GET /api/resources — public. ?lang=en|bn, optional ?discipline= and ?category=
router.get('/', async (req, res) => {
  const lang = resolveLang(req.query.lang);
  const { discipline, category } = req.query;

  const conditions = [];
  const params = [];

  if (typeof discipline === 'string' && discipline && discipline !== 'All disciplines') {
    params.push(discipline);
    conditions.push(`discipline = $${params.length}`);
  }
  if (typeof category === 'string' && category && category !== 'All') {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT ${selectFields(lang)} FROM resources ${where} ORDER BY id`,
      params
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('[resources] list failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/resources/:id — public
router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid resource id.' });
  }
  const lang = resolveLang(req.query.lang);

  try {
    const result = await pool.query(
      `SELECT ${selectFields(lang)} FROM resources WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('[resources] fetch failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/resources — admin only
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const validationError = validateResource(req.body ?? {});
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await pool.query(
      `INSERT INTO resources
         (title_en, title_bn, description_en, description_bn, type, discipline, category, url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${selectFields('en')}`,
      toParams(req.body)
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[resources] create failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/resources/:id — admin only
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid resource id.' });
  }

  const validationError = validateResource(req.body ?? {});
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await pool.query(
      `UPDATE resources
          SET title_en = $1, title_bn = $2,
              description_en = $3, description_bn = $4,
              type = $5, discipline = $6, category = $7, url = $8
        WHERE id = $9
      RETURNING ${selectFields('en')}`,
      [...toParams(req.body), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('[resources] update failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/resources/:id — admin only
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid resource id.' });
  }

  try {
    const result = await pool.query('DELETE FROM resources WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found.' });
    }
    return res.json({ message: 'Resource deleted.' });
  } catch (err) {
    console.error('[resources] delete failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
