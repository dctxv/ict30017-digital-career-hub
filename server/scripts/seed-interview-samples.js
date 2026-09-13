/**
 * Creates the sample accounts behind docs/samples/mock_interview.
 *
 * The mock interview reads the discipline, institution and graduation year off
 * the profile and pitches its questions at that stage, so a demo account with
 * an empty profile shows less of the feature than one with it filled in. This
 * fills it in, once, for the three personas the sample CVs belong to.
 *
 * Idempotent: an account that already exists has its profile and password
 * reset to the values below rather than being duplicated. Uses the same pool
 * as the app, so it targets whatever database server/.env points at — run it
 * against the shared instance only after coordinating, like a migration.
 *
 * Usage:
 *   node scripts/seed-interview-samples.js               create or refresh the accounts
 *   node scripts/seed-interview-samples.js --reset-quota  also hand back today's interview allowance
 */

import bcrypt from 'bcryptjs';
import pool from '../src/db.js';

const PASSWORD = 'SamplePassword123!';

const ACCOUNTS = [
  {
    email: 'sakib.hasan.sample@example.com',
    full_name: 'Md. Sakib Hasan',
    discipline: 'IT',
    institution: 'BRAC University',
    graduation_year: 2025,
    preferred_language: 'en',
  },
  {
    email: 'nusrat.jahan.sample@example.com',
    full_name: 'Nusrat Jahan',
    discipline: 'Finance',
    institution: 'University of Dhaka',
    graduation_year: 2024,
    preferred_language: 'bn',
  },
  {
    email: 'sharmin.sultana.sample@example.com',
    full_name: 'Sharmin Sultana',
    discipline: 'Business',
    institution: 'Daffodil International University',
    graduation_year: 2020,
    preferred_language: 'en',
  },
];

const resetQuota = process.argv.includes('--reset-quota');

async function upsert(account, passwordHash) {
  const existing = await pool.query('SELECT user_id FROM users WHERE email = $1', [account.email]);

  if (existing.rows.length > 0) {
    const userId = existing.rows[0].user_id;
    await pool.query(
      `UPDATE users
          SET full_name = $2, password_hash = $3, discipline = $4, institution = $5,
              graduation_year = $6, preferred_language = $7, is_active = TRUE,
              deleted_at = NULL, failed_login_attempts = 0, lockout_until = NULL
        WHERE user_id = $1`,
      [
        userId, account.full_name, passwordHash, account.discipline,
        account.institution, account.graduation_year, account.preferred_language,
      ]
    );
    return { userId, created: false };
  }

  const inserted = await pool.query(
    `INSERT INTO users
       (full_name, email, password_hash, role, tier, preferred_language,
        discipline, institution, graduation_year)
     VALUES ($1, $2, $3, 'student', 'free', $4, $5, $6, $7)
     RETURNING user_id`,
    [
      account.full_name, account.email, passwordHash, account.preferred_language,
      account.discipline, account.institution, account.graduation_year,
    ]
  );
  return { userId: inserted.rows[0].user_id, created: true };
}

try {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  for (const account of ACCOUNTS) {
    const { userId, created } = await upsert(account, passwordHash);

    if (resetQuota) {
      await pool.query(
        'UPDATE users SET mock_interview_count = 0, mock_interview_reset_date = NULL WHERE user_id = $1',
        [userId]
      );
    }

    console.log(
      `${created ? 'created' : 'refreshed'}  ${account.email}  (user ${userId})`
      + `  ${account.discipline} · ${account.institution} · ${account.graduation_year}`
      + `${resetQuota ? '  quota reset' : ''}`
    );
  }

  console.log(`\nPassword for all three: ${PASSWORD}`);
} catch (err) {
  console.error(`[seed] Failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
