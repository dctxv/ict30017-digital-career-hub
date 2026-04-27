-- Module: add_chat_turn_tracking
-- Responsibility: Add daily chatbot turn tracking columns to the users table.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS chat_message_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS chat_count_reset_date DATE DEFAULT CURRENT_DATE;
