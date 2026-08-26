/**
 * Module: alumniRouter
 * Responsibility: CRUD over alumni profiles.
 *
 * Privacy posture: these are real graduates. Public reads return only rows that
 * are BOTH is_published = TRUE AND consent_given = TRUE. The branch this was
 * salvaged from filtered the list endpoint on is_published but let GET /:id
 * return any row, so an unpublished profile was readable by guessing its id.
 * Both flags are now required on every public read, and publishing without
 * consent is rejected at write time.
 *
 * Admins reach the full set, including unpublished drafts, via GET /all.
 */

import express from 'express';
import pool from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

const NAME_MAX = 120;
const SHORT_MAX = 150;
const BIO_MAX = 2000;
const INITIALS_MAX = 4;
const EARLIEST_GRADUATION_YEAR = 1950;

const SUPPORTED_LANGUAGES = ['en', 'bn'];

/**
 * Public read fields for one language.
 *
 * bio_bn and industry_bn hold the Bangla prose; ?lang=bn resolves them into the
 * flat `bio` and `industry` the alumni page renders, falling back to English
 * per field via COALESCE so an untranslated profile still shows its story.
 *
 * full_name, institution and current_role have no Bangla column on purpose. A
 * person's name is not translated, and neither is the employer on their badge
 * or the job title they hold.
 *
 * `lang` is validated before it reaches here, so this picks between two fixed
 * literals rather than interpolating anything a caller supplied.
 */
function publicFields(lang) {
  const bio = lang === 'bn' ? 'COALESCE(bio_bn, bio)' : 'bio';
  const industry = lang === 'bn' ? 'COALESCE(industry_bn, industry)' : 'industry';
  return `
  id, full_name, institution, discipline, graduation_year,
  "current_role", ${industry} AS industry, ${bio} AS bio, image_initials
`;
}

/** English unless a supported language is explicitly requested. */
function resolveLang(raw) {
  return SUPPORTED_LANGUAGES.includes(raw) ? raw : 'en';
}

// Admin writes read the row back in English: the dashboard edits the canonical
// profile, not a per-language rendering of it.
const PUBLIC_FIELDS = publicFields('en');

const ADMIN_FIELDS = `
  id, full_name, institution, discipline, graduation_year,
  "current_role", industry, bio, image_initials,
  bio_bn, industry_bn,
  consent_given, is_published
`;

const PUBLIC_FILTER = 'is_published = TRUE AND consent_given = TRUE';

function parseId(raw) {
  const id = Number.parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateAlumni(body) {
  const {
    full_name, institution, discipline, graduation_year,
    current_role, industry, bio, image_initials,
    bio_bn, industry_bn,
    consent_given, is_published,
  } = body;

  if (typeof full_name !== 'string' || full_name.trim().length < 2) {
    return 'Full name must be at least 2 characters.';
  }
  if (full_name.trim().length > NAME_MAX) {
    return `Full name must be ${NAME_MAX} characters or fewer.`;
  }
  if (typeof discipline !== 'string' || discipline.trim().length === 0) {
    return 'Discipline is required.';
  }

  // Optional everywhere: an untranslated profile is a valid profile, and the
  // public read falls back to English for it.
  for (const [label, value] of [
    ['Institution', institution],
    ['Current role', current_role],
    ['Industry', industry],
    ['Bangla industry', industry_bn],
  ]) {
    if (value !== undefined && value !== null) {
      if (typeof value !== 'string') return `${label} must be text.`;
      if (value.trim().length > SHORT_MAX) {
        return `${label} must be ${SHORT_MAX} characters or fewer.`;
      }
    }
  }

  for (const [label, value] of [['Bio', bio], ['Bangla bio', bio_bn]]) {
    if (value !== undefined && value !== null) {
      if (typeof value !== 'string') return `${label} must be text.`;
      if (value.length > BIO_MAX) return `${label} must be ${BIO_MAX} characters or fewer.`;
    }
  }

  if (image_initials !== undefined && image_initials !== null && image_initials !== '') {
    if (typeof image_initials !== 'string') return 'Initials must be text.';
    if (image_initials.trim().length > INITIALS_MAX) {
      return `Initials must be ${INITIALS_MAX} characters or fewer.`;
    }
  }

  if (graduation_year !== undefined && graduation_year !== null && graduation_year !== '') {
    const year = Number.parseInt(graduation_year, 10);
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(year) || year < EARLIEST_GRADUATION_YEAR || year > currentYear + 10) {
      return `Graduation year must be between ${EARLIEST_GRADUATION_YEAR} and ${currentYear + 10}.`;
    }
  }

  for (const [label, value] of [['Consent', consent_given], ['Published', is_published]]) {
    if (value !== undefined && value !== null && typeof value !== 'boolean') {
      return `${label} must be true or false.`;
    }
  }

  // A profile cannot be published without the graduate's recorded consent.
  if (is_published === true && consent_given !== true) {
    return 'A profile cannot be published without recorded consent.';
  }

  return null;
}

/**
 * An untranslated field is NULL, not ''.
 *
 * COALESCE(bio_bn, bio) treats an empty string as a present value and would
 * render an empty bio in Bangla rather than falling back to English. Clearing
 * the box in the dashboard therefore has to store NULL, which is what an admin
 * means by clearing it.
 */
function nullIfBlank(value) {
  const trimmed = (value ?? '').trim();
  return trimmed === '' ? null : trimmed;
}

function toParams(body) {
  const year =
    body.graduation_year === undefined || body.graduation_year === null || body.graduation_year === ''
      ? null
      : Number.parseInt(body.graduation_year, 10);

  const initials = (body.image_initials ?? '').trim();

  return [
    body.full_name.trim(),
    (body.institution ?? '').trim(),
    body.discipline.trim(),
    year,
    (body.current_role ?? '').trim(),
    (body.industry ?? '').trim(),
    (body.bio ?? '').trim(),
    initials === '' ? null : initials,
    nullIfBlank(body.bio_bn),
    nullIfBlank(body.industry_bn),
    body.consent_given === true,
    body.is_published === true,
  ];
}

// GET /api/alumni — public, published and consented only
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${publicFields(resolveLang(req.query.lang))} FROM alumni WHERE ${PUBLIC_FILTER} ORDER BY id`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('[alumni] list failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/alumni/all — admin only, includes unpublished drafts.
// Declared before /:id so the literal path is not captured by the id param.
router.get('/all', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`SELECT ${ADMIN_FIELDS} FROM alumni ORDER BY id`);
    return res.json(result.rows);
  } catch (err) {
    console.error('[alumni] admin list failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/alumni/discipline/:discipline — public, published and consented only
router.get('/discipline/:discipline', async (req, res) => {
  const { discipline } = req.params;
  if (typeof discipline !== 'string' || discipline.trim().length === 0) {
    return res.status(400).json({ error: 'Discipline is required.' });
  }

  try {
    const result = await pool.query(
      `SELECT ${publicFields(resolveLang(req.query.lang))} FROM alumni
        WHERE ${PUBLIC_FILTER} AND discipline = $1
        ORDER BY id`,
      [discipline]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('[alumni] discipline filter failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/alumni/:id — public, published and consented only
router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid alumni id.' });
  }

  try {
    const result = await pool.query(
      `SELECT ${publicFields(resolveLang(req.query.lang))} FROM alumni WHERE id = $1 AND ${PUBLIC_FILTER}`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alumni profile not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('[alumni] fetch failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/alumni — admin only
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const validationError = validateAlumni(req.body ?? {});
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await pool.query(
      `INSERT INTO alumni
         (full_name, institution, discipline, graduation_year, "current_role",
          industry, bio, image_initials, bio_bn, industry_bn,
          consent_given, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING ${ADMIN_FIELDS}`,
      toParams(req.body)
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[alumni] create failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/alumni/:id — admin only
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid alumni id.' });
  }

  const validationError = validateAlumni(req.body ?? {});
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await pool.query(
      `UPDATE alumni
          SET full_name = $1, institution = $2, discipline = $3, graduation_year = $4,
              "current_role" = $5, industry = $6, bio = $7, image_initials = $8,
              bio_bn = $9, industry_bn = $10,
              consent_given = $11, is_published = $12
        WHERE id = $13
      RETURNING ${ADMIN_FIELDS}`,
      [...toParams(req.body), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alumni profile not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('[alumni] update failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/alumni/:id — admin only
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid alumni id.' });
  }

  try {
    const result = await pool.query('DELETE FROM alumni WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alumni profile not found.' });
    }
    return res.json({ message: 'Alumni profile deleted.' });
  } catch (err) {
    console.error('[alumni] delete failed:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
