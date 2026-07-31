-- Module: create_users_table
-- Baseline schema for the `users` table.
--
-- Why this file exists: the users table was created by hand during Sprint 2 and
-- never committed, so server/migrations/ contained only ALTER TABLE add_* files
-- that assumed a base table absent from version control. A fresh clone could not
-- stand the database up. This migration was reconstructed from the live dev
-- database and matches what server/src/routes/auth.js actually queries.
--
-- Run this FIRST, before the add_* migrations.
--
-- Note: server/src/middleware/Fullyfunctionalregister.js contains a second,
-- incompatible users definition (id/username/password). It is dead code — never
-- imported by app.js — and is NOT the schema in use. See the Phase 0 notes.

CREATE TABLE IF NOT EXISTS users (
  user_id            SERIAL PRIMARY KEY,
  full_name          VARCHAR(100) NOT NULL,
  email              VARCHAR(255) NOT NULL UNIQUE,
  password_hash      TEXT         NOT NULL,
  role               VARCHAR(20)  NOT NULL DEFAULT 'student',
  preferred_language VARCHAR(10)           DEFAULT 'en',
  created_at         TIMESTAMPTZ           DEFAULT NOW()
);
