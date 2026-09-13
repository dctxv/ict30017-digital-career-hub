-- Optional professional contact details for public alumni profiles.
-- Public alumni are already gated by consent_given and is_published, so these
-- values are exposed only when the graduate has approved the profile.
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS email        TEXT;
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
