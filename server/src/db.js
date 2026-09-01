import fs from 'fs'
import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

/**
 * Postgres connection pool.
 *
 * Two connection styles are supported, because the project now has two kinds of
 * database behind it:
 *
 *   - A local Postgres, addressed by the discrete DB_* variables. This is what
 *     every developer had, and it keeps working with no .env change.
 *   - A hosted Postgres, which hands out a single connection string. Set
 *     DATABASE_URL and the DB_* variables are ignored.
 *
 * TLS is the part that catches people out. node-postgres defaults to ssl:false,
 * and a managed provider will refuse an unencrypted connection outright — the
 * failure reads as a generic connection error with nothing pointing at TLS, so
 * it is easy to spend an hour on the wrong thing. Hence DB_SSL, and hence the
 * hint in the pool error handler below.
 */

/**
 * @returns {false | { rejectUnauthorized: boolean, ca?: string }}
 */
function resolveSsl() {
  const mode = (process.env.DB_SSL ?? '').trim().toLowerCase()

  if (mode === '' || mode === 'false' || mode === 'disable') return false

  // The correct option when the provider gives you a CA certificate: the
  // connection is encrypted AND the server's identity is verified.
  if (process.env.DB_SSL_CA) {
    return {
      rejectUnauthorized: true,
      ca: fs.readFileSync(process.env.DB_SSL_CA, 'utf8'),
    }
  }

  // Encrypted, but the certificate chain is not verified. This is what most
  // managed Postgres quick-start guides tell you to use, and it is genuinely
  // weaker: it stops passive eavesdropping but not an active machine-in-the
  // -middle. Acceptable for a student project on a private instance; download
  // the provider's CA and set DB_SSL_CA before this goes anywhere real.
  if (mode === 'no-verify') return { rejectUnauthorized: false }

  return { rejectUnauthorized: true }
}

const ssl = resolveSsl()

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl,
      }
)

/**
 * An idle client erroring takes the process down with an unhandled 'error'
 * event unless something is listening. Worth having regardless, but the reason
 * it says what it says is that a TLS refusal from a hosted database surfaces
 * here as an opaque failure, and the fix is one environment variable.
 */
pool.on('error', (err) => {
  console.error('[db] Pool error:', err.message)
  if (!ssl && /SSL|ssl|encryption/.test(err.message)) {
    console.error('[db] The server appears to require TLS. Set DB_SSL=true (or DB_SSL=no-verify) in server/.env.')
  }
})

export default pool
