export { analyzeResume, analyzeResumeStream } from './src/services/resumeReviewer.js';
export { streamChatbotResponse } from './src/services/chatbot.js';
export { assertModelConfig, getModel, TIERS } from './src/utils/aiClient.js';

// Review context vocabulary. The server validates incoming context against
// these before it reaches the prompt composer.
export {
  APPLICATION_CHANNELS,
  EMPLOYER_TYPES,
  CANDIDATE_STAGES,
  TARGET_SECTORS,
  normaliseContext,
} from './src/prompt/context.js';

// Preparation: the mock interview, and the gap engine both it and the resume
// review feed. Two entry points rather than three, because preparation is the
// shared output layer of the other two features and not a third one.
export { generateInterviewQuestions, evaluateInterview, resolveTier as resolveInterviewTier }
  from './src/services/mockInterview.js';
export { extractGapsFromReview, normaliseGapList } from './src/services/gapEngine.js';

// Gap vocabulary. The server validates stored gaps against these, and the
// migration's CHECK constraints are written from the same lists.
export {
  GAP_SOURCES,
  GAP_CATEGORIES,
  GAP_SEVERITIES,
  GAP_CLOSEABLE,
  GAP_STATUSES,
  GAP_SEVERITY_WEIGHT,
  GAP_CAP,
  INTERVIEW_QUESTION_COUNT,
  JOB_AD_MAX_CHARS,
  ANSWER_MAX_CHARS,
  ROLE_MAX_CHARS,
  normaliseGapKey,
  categoryOfGapKey,
  summariseGapProgress,
} from './src/config/preparationConstants.js';
