/**
 * Module: careerPathsRouter
 * Responsibility: CRUD over career path profiles.
 *
 * Reads are public. Writes require an authenticated admin.
 *
 * The stored column names are snake_case, but the API returns `desc`,
 * `salaryEntry` and `salarySenior` because that is the shape
 * client/src/pages/CareerPaths.jsx already consumes. The mapping is done here
 * rather than renaming columns so the SQL stays idiomatic.
 *
 * Bilingual contract (same shape as resourcesRouter):
 *   description_bn and industry_bn hold the Bangla prose. A read resolves ONE
 *   language into the flat `desc` and `industry` fields the frontend renders,
 *   chosen by ?lang=en|bn (default en), falling back to English per field via
 *   COALESCE so an untranslated row shows English rather than an empty card.
 *
 *   title, skills and progression have no Bangla column by design. They are the
 *   terms a user carries to a job advert — "Financial Analyst", "Excel",
 *   "AutoCAD" — and a Bangladeshi job seeker writes and searches for them in
 *   English. See server/migrations/add_bilingual_content.sql.
 *
 *   Admin writes always read back English, since the dashboard edits the
 *   canonical row rather than a rendering of it. They accept desc_bn and
 *   industry_bn so the dashboard can maintain the translation; an empty string
 *   is stored as NULL, which is what the COALESCE fallback reads as
 *   "not translated yet".
 */

import express from 'express';
import pool from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

const TITLE_MAX = 150;
const TEXT_MAX = 4000;
const LIST_MAX = 50;

const SUPPORTED_LANGUAGES = ['en', 'bn'];

// `lang` is validated against SUPPORTED_LANGUAGES before it reaches here, so
// this is a choice between two fixed literals, never interpolated user input.
function selectFields(lang) {
  const desc = lang === 'bn' ? 'COALESCE(description_bn, description)' : 'description';
  const industry = lang === 'bn' ? 'COALESCE(industry_bn, industry)' : 'industry';
  return `
  id,
  title,
  ${industry} AS industry,
  discipline,
  ${desc}   AS "desc",
  skills,
  progression,
  salary_entry  AS "salaryEntry",
  salary_senior AS "salarySenior",
  description_bn,
  industry_bn
`;
}

/** English unless a supported language is explicitly requested. */
function resolveLang(raw) {
  return SUPPORTED_LANGUAGES.includes(raw) ? raw : 'en';
}

// Admin writes read the row back in English: the dashboard edits the canonical
// content, not a per-language rendering of it.
const SELECT_FIELDS = selectFields('en');

function parseId(raw) {
  const id = Number.parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateCareerPath(body) {
  const {
    title, industry, discipline, desc, skills, progression, salaryEntry, salarySenior,
    desc_bn, industry_bn,
  } = body;

  if (typeof title !== 'string' || title.trim().length < 2) {
    return 'Title must be at least 2 characters.';
  }
  if (title.trim().length > TITLE_MAX) {
    return `Title must be ${TITLE_MAX} characters or fewer.`;
  }
  if (typeof discipline !== 'string' || discipline.trim().length === 0) {
    return 'Discipline is required.';
  }

  // The Bangla fields are optional everywhere: a row with no translation is a
  // valid row, and the API falls back to English for it.
  for (const [label, value] of [
    ['Industry', industry],
    ['Description', desc],
    ['Entry salary', salaryEntry],
    ['Senior salary', salarySenior],
    ['Bangla description', desc_bn],
    ['Bangla industry', industry_bn],
  ]) {
    if (value !== undefined && value !== null) {
      if (typeof value !== 'string') return `${label} must be text.`;
      if (value.length > TEXT_MAX) return `${label} is too long.`;
    }
  }

  if (skills !== undefined && skills !== null) {
    if (!Array.isArray(skills)) return 'Skills must be a list.';
    if (skills.length > LIST_MAX) return `Skills may contain at most ${LIST_MAX} entries.`;
    if (!skills.every((s) => typeof s === 'string')) return 'Each skill must be text.';
  }

  if (progression !== undefined && progression !== null) {
    if (!Array.isArray(progression)) return 'Progression must be a list.';
    if (progression.length > LIST_MAX) return `Progression may contain at most ${LIST_MAX} steps.`;
    const wellFormed = progression.every(
      (p) => p && typeof p === 'object' && !Array.isArray(p) && typeof p.label === 'string'
    );
    if (!wellFormed) return 'Each progression step must have a label.';
  }

  return null;
}

/**
 * An untranslated field is NULL, not ''.
 *
 * COALESCE(description_bn, description) treats an empty string as a present
 * value and would render a blank card in Bangla instead of falling back. So
 * clearing the box in the dashboard has to store NULL for the fallback to
 * resume, which is what an admin means by clearing it.
 */
function nullIfBlank(value) {
  const trimmed = (value ?? '').trim();
  return trimmed === '' ? null : trimmed;
}

// Normalises a validated body into the positional values the queries expect.
function toParams(body) {
  return [
    body.title.trim(),
    (body.industry ?? '').trim(),
    body.discipline.trim(),
    (body.desc ?? '').trim(),
    JSON.stringify(body.skills ?? []),
    JSON.stringify(body.progression ?? []),
    (body.salaryEntry ?? '').trim(),
    (body.salarySenior ?? '').trim(),
    nullIfBlank(body.desc_bn),
    nullIfBlank(body.industry_bn),
  ];
}

// GET /api/career-paths — public. Optional ?discipline= filter.
router.get('/', async (req, res) => {
  const { discipline } = req.query;
  const fields = selectFields(resolveLang(req.query.lang));

  try {
    const hasFilter = typeof discipline === 'string' && discipline.length > 0 && discipline !== 'All';

    const result = hasFilter
      ? await pool.query(
          `SELECT ${fields} FROM career_paths WHERE discipline = $1 ORDER BY id`,
          [discipline]
        )
      : await pool.query(`SELECT ${fields} FROM career_paths ORDER BY id`);

    return res.json(result.rows);
  } catch (err) {
    console.error('[careerPaths] list failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/career-paths/:id — public
router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid career path id.' });
  }

  try {
    const result = await pool.query(
      `SELECT ${selectFields(resolveLang(req.query.lang))} FROM career_paths WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Career path not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('[careerPaths] fetch failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/career-paths — admin only
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const validationError = validateCareerPath(req.body ?? {});
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await pool.query(
      `INSERT INTO career_paths
         (title, industry, discipline, description, skills, progression, salary_entry, salary_senior,
          description_bn, industry_bn)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9, $10)
       RETURNING ${SELECT_FIELDS}`,
      toParams(req.body)
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[careerPaths] create failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/career-paths/:id — admin only
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid career path id.' });
  }

  const validationError = validateCareerPath(req.body ?? {});
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await pool.query(
      `UPDATE career_paths
          SET title = $1, industry = $2, discipline = $3, description = $4,
              skills = $5::jsonb, progression = $6::jsonb,
              salary_entry = $7, salary_senior = $8,
              description_bn = $9, industry_bn = $10
        WHERE id = $11
      RETURNING ${SELECT_FIELDS}`,
      [...toParams(req.body), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Career path not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('[careerPaths] update failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/career-paths/:id — admin only
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid career path id.' });
  }

  try {
    const result = await pool.query('DELETE FROM career_paths WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Career path not found.' });
    }
    return res.json({ message: 'Career path deleted.' });
  } catch (err) {
    console.error('[careerPaths] delete failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
