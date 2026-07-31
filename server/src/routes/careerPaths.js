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
 */

import express from 'express';
import pool from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

const TITLE_MAX = 150;
const TEXT_MAX = 4000;
const LIST_MAX = 50;

const SELECT_FIELDS = `
  id,
  title,
  industry,
  discipline,
  description   AS "desc",
  skills,
  progression,
  salary_entry  AS "salaryEntry",
  salary_senior AS "salarySenior"
`;

function parseId(raw) {
  const id = Number.parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateCareerPath(body) {
  const { title, industry, discipline, desc, skills, progression, salaryEntry, salarySenior } = body;

  if (typeof title !== 'string' || title.trim().length < 2) {
    return 'Title must be at least 2 characters.';
  }
  if (title.trim().length > TITLE_MAX) {
    return `Title must be ${TITLE_MAX} characters or fewer.`;
  }
  if (typeof discipline !== 'string' || discipline.trim().length === 0) {
    return 'Discipline is required.';
  }

  for (const [label, value] of [
    ['Industry', industry],
    ['Description', desc],
    ['Entry salary', salaryEntry],
    ['Senior salary', salarySenior],
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
  ];
}

// GET /api/career-paths — public. Optional ?discipline= filter.
router.get('/', async (req, res) => {
  const { discipline } = req.query;

  try {
    const hasFilter = typeof discipline === 'string' && discipline.length > 0 && discipline !== 'All';

    const result = hasFilter
      ? await pool.query(
          `SELECT ${SELECT_FIELDS} FROM career_paths WHERE discipline = $1 ORDER BY id`,
          [discipline]
        )
      : await pool.query(`SELECT ${SELECT_FIELDS} FROM career_paths ORDER BY id`);

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
      `SELECT ${SELECT_FIELDS} FROM career_paths WHERE id = $1`,
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
         (title, industry, discipline, description, skills, progression, salary_entry, salary_senior)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8)
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
              salary_entry = $7, salary_senior = $8
        WHERE id = $9
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
