-- Module: create_content_tables
-- Creates the four content tables backing the public content API:
-- disciplines, career_paths, resources and alumni.
--
-- Design notes:
--   * `discipline` is stored as TEXT rather than a foreign key to `disciplines`.
--     The resources dataset uses the sentinel value 'All disciplines', which has
--     no corresponding row, and every frontend page filters by name string.
--     A FK would break both without changing the API contract.
--   * `resources` carries separate English and Bangla columns. The API returns
--     one language pair per request, selected by the `lang` query parameter.
--     Bangla columns are nullable: the seed content is English-only and is
--     translated incrementally through the admin dashboard.
--   * "current_role" is quoted throughout because CURRENT_ROLE is a reserved
--     keyword in PostgreSQL. The column name is kept to match the API contract
--     already consumed by client/src/pages/Alumni.jsx.

CREATE TABLE IF NOT EXISTS disciplines (
  id          SERIAL PRIMARY KEY,
  name        TEXT        NOT NULL UNIQUE,
  description TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS career_paths (
  id            SERIAL PRIMARY KEY,
  title         TEXT        NOT NULL,
  industry      TEXT        NOT NULL DEFAULT '',
  discipline    TEXT        NOT NULL,
  description   TEXT        NOT NULL DEFAULT '',
  skills        JSONB       NOT NULL DEFAULT '[]'::jsonb,
  progression   JSONB       NOT NULL DEFAULT '[]'::jsonb,
  salary_entry  TEXT        NOT NULL DEFAULT '',
  salary_senior TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
  id             SERIAL PRIMARY KEY,
  title_en       TEXT        NOT NULL,
  title_bn       TEXT,
  description_en TEXT        NOT NULL DEFAULT '',
  description_bn TEXT,
  type           TEXT        NOT NULL,
  discipline     TEXT        NOT NULL,
  category       TEXT        NOT NULL,
  url            TEXT        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alumni (
  id              SERIAL PRIMARY KEY,
  full_name       TEXT        NOT NULL,
  institution     TEXT        NOT NULL DEFAULT '',
  discipline      TEXT        NOT NULL,
  graduation_year INTEGER,
  "current_role"  TEXT        NOT NULL DEFAULT '',
  industry        TEXT        NOT NULL DEFAULT '',
  bio             TEXT        NOT NULL DEFAULT '',
  image_initials  TEXT,
  consent_given   BOOLEAN     NOT NULL DEFAULT FALSE,
  is_published    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_paths_discipline ON career_paths (discipline);
CREATE INDEX IF NOT EXISTS idx_resources_discipline    ON resources (discipline);
CREATE INDEX IF NOT EXISTS idx_resources_category      ON resources (category);
CREATE INDEX IF NOT EXISTS idx_alumni_discipline       ON alumni (discipline);
CREATE INDEX IF NOT EXISTS idx_alumni_published        ON alumni (is_published);
