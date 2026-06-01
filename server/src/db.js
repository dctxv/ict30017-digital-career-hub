/**
 * Module: db
 * Responsibility: Single shared PostgreSQL connection pool.
 *
 * Security:
 *  - SSL required in production (rejectUnauthorized: true)
 *  - Credentials read from environment variables only — never hardcoded
 *  - Connection errors logged but do not crash the process; each query
 *    will throw and be caught by route error handlers
 */

import pkg    from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === 'production';

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: true } : false,
    }
  : {
      user:     process.env.DB_USER,
      host:     process.env.DB_HOST     || 'localhost',
      database: process.env.DB_NAME     || 'digitalcareerhub',
      password: process.env.DB_PASSWORD,
      port:     Number(process.env.DB_PORT || 5432),
      ssl: isProduction ? { rejectUnauthorized: true } : false,
    };

const pool = new Pool({
  ...poolConfig,
  max:             10,   // max concurrent connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[db] Idle client error:', err.message);
});

export default pool;
