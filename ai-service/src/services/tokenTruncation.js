/**
 * Module: tokenTruncation
 * Responsibility: Estimate token usage and keep chat messages inside a sliding context window.
 */

const AVG_CHARS_PER_TOKEN = 4;

export function estimateTokens(value = '') {
  const text = String(value);
  if (!text.trim()) return 0;

  const wordLikeTokens = text.trim().split(/\s+/).length;
  const charEstimate = Math.ceil(text.length / AVG_CHARS_PER_TOKEN);

  return Math.max(wordLikeTokens, charEstimate);
}

export function countMessageTokens(message) {
  if (!message || typeof message !== 'object') return 0;
  return estimateTokens(message.role) + estimateTokens(message.content) + 4;
}

export function countMessagesTokens(messages = []) {
  return messages.reduce((sum, message) => sum + countMessageTokens(message), 0);
}

export function truncateTextToTokenLimit(text, maxTokens) {
  const cleanText = String(text ?? '');
  if (estimateTokens(cleanText) <= maxTokens) {
    return { text: cleanText, truncated: false };
  }

  const words = cleanText.trim().split(/\s+/);
  let output = '';

  for (const word of words) {
    const candidate = output ? `${output} ${word}` : word;
    if (estimateTokens(candidate) > maxTokens) break;
    output = candidate;
  }

  if (!output) {
    output = cleanText.slice(0, Math.max(1, maxTokens * AVG_CHARS_PER_TOKEN));
  }

  return { text: output.trim(), truncated: true };
}

export function enforceSlidingWindow(messages = [], maxTokens, { preserveLast = 1 } = {}) {
  const normalizedMessages = Array.isArray(messages) ? [...messages] : [];
  const protectedTail = preserveLast > 0 ? normalizedMessages.slice(-preserveLast) : [];
  const slidingMessages = preserveLast > 0 ? normalizedMessages.slice(0, -preserveLast) : normalizedMessages;

  let kept = [...slidingMessages, ...protectedTail];
  while (kept.length > protectedTail.length && countMessagesTokens(kept) > maxTokens) {
    kept = kept.slice(1);
  }

  return kept;
}
