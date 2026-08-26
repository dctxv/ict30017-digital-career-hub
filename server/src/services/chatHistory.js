/**
 * Persistence for chatbot conversations.
 *
 * Kept out of the route because the route streams: it must not await a database
 * write between tokens, and a storage failure must never interrupt a reply the
 * user is already reading. Every function here therefore swallows its own
 * errors and returns null. Losing a transcript is a nuisance; dropping a
 * half-streamed answer is a broken product.
 *
 * Guests are never stored — see the privacy note in
 * server/migrations/create_chat_history_tables.sql for why that is a rule
 * rather than an optimisation.
 */

import pool from '../db.js';

function isGuest(userId) {
  return !userId || userId === 'guest';
}

/**
 * Starts a conversation, or continues the caller's most recent one.
 *
 * "Most recent within the last hour" is the continuation rule. The client sends
 * its whole history on every turn but holds no conversation id, so the server
 * has to decide what counts as the same sitting. An hour is long enough to
 * survive a coffee break and short enough that tomorrow's questions do not get
 * appended to today's thread.
 *
 * @returns {Promise<number|null>} conversation id, or null if nothing was stored
 */
export async function resolveConversation(userId, language) {
  if (isGuest(userId)) return null;

  try {
    const existing = await pool.query(
      `SELECT conversation_id FROM chat_conversations
        WHERE user_id = $1 AND last_message_at > NOW() - INTERVAL '1 hour'
        ORDER BY last_message_at DESC
        LIMIT 1`,
      [userId]
    );
    if (existing.rows.length > 0) return existing.rows[0].conversation_id;

    const created = await pool.query(
      `INSERT INTO chat_conversations (user_id, language)
       VALUES ($1, $2)
       RETURNING conversation_id`,
      [userId, language]
    );
    return created.rows[0].conversation_id;
  } catch (err) {
    console.error('[chat] Could not resolve conversation:', err.message);
    return null;
  }
}

/**
 * Appends one turn.
 *
 * `position` is derived inside the INSERT rather than counted first, so two
 * turns racing cannot both claim the same slot — the unique index on
 * (conversation_id, position) would reject the second, and a lost transcript
 * line is not worth a failed request.
 */
export async function appendMessage(conversationId, role, content) {
  if (!conversationId || !content) return null;

  try {
    const result = await pool.query(
      `INSERT INTO chat_messages (conversation_id, role, content, position)
       VALUES ($1, $2, $3,
               COALESCE((SELECT MAX(position) + 1 FROM chat_messages WHERE conversation_id = $1), 1))
       RETURNING message_id`,
      [conversationId, role, content]
    );

    await pool.query(
      'UPDATE chat_conversations SET last_message_at = NOW() WHERE conversation_id = $1',
      [conversationId]
    );

    return result.rows[0].message_id;
  } catch (err) {
    console.error('[chat] Could not store message:', err.message);
    return null;
  }
}
