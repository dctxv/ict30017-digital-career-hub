-- Module: add_resume_review_tracking
-- Responsibility: Track resume analyses per user per day so the free tier
-- allowance can be enforced against an identity rather than an IP address.
--
-- The previous limit was 5 per hour keyed on IP. The target users are
-- Bangladeshi graduates on shared university and NAT broadband, so an entire
-- computer lab shared those five. Counting against the user row fixes that and
-- also makes the number on the review page real rather than static text.
--
-- Mirrors the shape of add_chat_turn_tracking so both quotas read the same way.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS resume_review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS resume_review_reset_date DATE DEFAULT CURRENT_DATE;
