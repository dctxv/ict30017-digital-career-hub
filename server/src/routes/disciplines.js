/**
 * Module: disciplinesRouter
 * Responsibility: CRUD over the disciplines taxonomy.
 *
 * Reads are public — every content page loads the discipline list to build its
 * filter bar. Writes require an authenticated admin.
 *
 * Bilingual contract, and it differs from the other content routes for one
 * reason worth stating plainly:
 *
 *   `name` is NOT translated in place. It is the join key — career_paths,
 *   resources and alumni all store the English discipline name, and the
 *   frontend filters by string equality against it. Resolving it to Bangla for
 *   a bn request would hand the client a filter value that matches no row, and
 *   every discipline filter on the site would silently return nothing.
 *
 *   So `name` always comes back in English and `name_bn` travels beside it.
 *   The client renders name_bn and keeps filtering on name. Only `description`,
 *   which nothing joins on, resolves per language with a COALESCE fallback.
 */

import express from 'express';
import pool from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

const SUPPORTED_LANGUAGES = ['en', 'bn'];

/** English unless a supported language is explicitly requested. */
function resolveLang(raw) {
  return SUPPORTED_LANGUAGES.includes(raw) ? raw : 'en';
}

// Validated above, so this selects between two fixed literals.
/**
 * An untranslated field is NULL, not ''. COALESCE treats '' as present and
 * would render a blank label in Bangla instead of falling back to English.
 */
function nullIfBlank(value) {
  const trimmed = (value ?? '').trim();
  return trimmed === '' ? null : trimmed;
}

// Validated above, so this selects between two fixed literals.
function descField(lang) {
  return lang === 'bn' ? 'COALESCE(description_bn, description)' : 'description';
}

const NAME_MAX = 100;
const DESCRIPTION_MAX = 500;

function validateDiscipline({ name, description, name_bn, description_bn }) {
  if (typeof name !== 'string' || name.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }
  if (name.trim().length > NAME_MAX) {
    return `Name must be ${NAME_MAX} characters or fewer.`;
  }
  // Optional: an untranslated discipline is valid and falls back to English.
  if (name_bn !== undefined && name_bn !== null && name_bn !== '') {
    if (typeof name_bn !== 'string') return 'Bangla name must be text.';
    if (name_bn.trim().length > NAME_MAX) {
      return `Bangla name must be ${NAME_MAX} characters or fewer.`;
    }
  }

  if (description_bn !== undefined && description_bn !== null) {
    if (typeof description_bn !== 'string') return 'Bangla description must be text.';
    if (description_bn.length > DESCRIPTION_MAX) {
      return `Bangla description must be ${DESCRIPTION_MAX} characters or fewer.`;
    }
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      return 'Description must be text.';
    }
    if (description.length > DESCRIPTION_MAX) {
      return `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
    }
  }
  return null;
}

function parseId(raw) {
  const id = Number.parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /api/disciplines — public
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, name_bn, ${descField(resolveLang(req.query.lang))} AS description,
              description AS description_en, description_bn
         FROM disciplines ORDER BY id`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('[disciplines] list failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/disciplines/:id — public
router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid discipline id.' });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, name_bn, ${descField(resolveLang(req.query.lang))} AS description,
              description AS description_en, description_bn
         FROM disciplines WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Discipline not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('[disciplines] fetch failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/disciplines — admin only
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const validationError = validateDiscipline(req.body ?? {});
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { name, description } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO disciplines (name, description, name_bn, description_bn)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, name_bn, description, description_bn`,
      [name.trim(), (description ?? '').trim(),
       nullIfBlank(req.body?.name_bn), nullIfBlank(req.body?.description_bn)]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A discipline with that name already exists.' });
    }
    console.error('[disciplines] create failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/disciplines/:id — admin only
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid discipline id.' });
  }

  const validationError = validateDiscipline(req.body ?? {});
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { name, description } = req.body;

  try {
    const result = await pool.query(
      `UPDATE disciplines
          SET name = $1, description = $2, name_bn = $3, description_bn = $4
        WHERE id = $5
      RETURNING id, name, name_bn, description, description_bn`,
      [name.trim(), (description ?? '').trim(),
       nullIfBlank(req.body?.name_bn), nullIfBlank(req.body?.description_bn), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Discipline not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A discipline with that name already exists.' });
    }
    console.error('[disciplines] update failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/disciplines/:id — admin only
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid discipline id.' });
  }

  try {
    const result = await pool.query('DELETE FROM disciplines WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Discipline not found.' });
    }
    return res.json({ message: 'Discipline deleted.' });
  } catch (err) {
    console.error('[disciplines] delete failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
