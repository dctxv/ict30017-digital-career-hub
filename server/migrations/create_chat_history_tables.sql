-- Chatbot conversation history.
--
-- routes/chatbot.js increments chat_message_count and streams the reply, then
-- forgets both sides of the exchange. The transcript lives only in React state,
-- so closing the tab destroys it. A user cannot return to advice they were
-- given yesterday, and the team has no way to see what people actually ask —
-- which is the single most useful signal for improving the prompt.
--
-- PRIVACY, AND WHY IT IS NOT AN AFTERTHOUGHT
--
-- This table stores what people disclose about their own job situation:
-- rejections, salary, why they left a role. That is more sensitive than
-- anything else the project holds, and it arrives in free text, so it cannot
-- be validated into a safe shape at write time.
--
-- Three consequences, all enforced here rather than left to intentions:
--
--   1. Guests are never stored. Nothing identifies them, so a row would be an
--      orphaned transcript with no one able to request its deletion. The
--      column is NOT NULL for that reason.
--   2. Deleting a user destroys their conversations — ON DELETE CASCADE, not
--      SET NULL. An anonymised transcript of a career crisis is still a
--      transcript of a career crisis.
--   3. Retention is a decision the team has to make, and this migration cannot
--      make it. There is deliberately no cleanup job here: an unadvertised one
--      would quietly delete history someone is relying on. Agree a period,
--      tell users, then add it.
--
-- Assistant replies are stored alongside user messages because a transcript of
-- only one half is not a transcript.

BEGIN;

-- ── chat_conversations ─────────────────────────────────────────────────────
-- A conversation groups the messages of one sitting. `title` is for a future
-- history list; nothing writes it yet, so it stays nullable rather than being
-- filled with a placeholder nobody chose.
CREATE TABLE IF NOT EXISTS chat_conversations (
  conversation_id SERIAL PRIMARY KEY,
  user_id         INTEGER     NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title           TEXT,
  language        VARCHAR(10) NOT NULL DEFAULT 'en',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user
  ON chat_conversations (user_id, last_message_at DESC);

-- ── chat_messages ──────────────────────────────────────────────────────────
-- `position` orders the turns within a conversation. Ordering on created_at
-- alone is unsafe: a user message and the reply it triggers can land in the
-- same millisecond, and the pair would then sort arbitrarily.
CREATE TABLE IF NOT EXISTS chat_messages (
  message_id      SERIAL PRIMARY KEY,
  conversation_id INTEGER     NOT NULL REFERENCES chat_conversations(conversation_id) ON DELETE CASCADE,
  role            VARCHAR(16) NOT NULL,
  content         TEXT        NOT NULL,
  position        INTEGER     NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chat_messages_role_check CHECK (role IN ('user', 'assistant'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_messages_order
  ON chat_messages (conversation_id, position);

COMMIT;
