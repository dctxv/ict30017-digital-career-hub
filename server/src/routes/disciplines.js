/**
 * Module: disciplinesRouter
 * Responsibility: CRUD over the disciplines taxonomy.
 *
 * Reads are public — every content page loads the discipline list to build its
 * filter bar. Writes require an authenticated admin.
 */

import express from 'express';
import pool from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

const NAME_MAX = 100;
const DESCRIPTION_MAX = 500;

function validateDiscipline({ name, description }) {
  if (typeof name !== 'string' || name.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }
  if (name.trim().length > NAME_MAX) {
    return `Name must be ${NAME_MAX} characters or fewer.`;
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
      'SELECT id, name, description FROM disciplines ORDER BY id'
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
      'SELECT id, name, description FROM disciplines WHERE id = $1',
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
      `INSERT INTO disciplines (name, description)
       VALUES ($1, $2)
       RETURNING id, name, description`,
      [name.trim(), (description ?? '').trim()]
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
          SET name = $1, description = $2
        WHERE id = $3
      RETURNING id, name, description`,
      [name.trim(), (description ?? '').trim(), id]
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
