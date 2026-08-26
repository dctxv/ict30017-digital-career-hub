/**
 * Module: reviewContext
 * Responsibility: Validate the optional review context posted with a resume and
 * attach it to the request.
 *
 * The AI service can route its rules by application channel, employer type,
 * candidate stage and target sector, but none of that engages unless the context
 * actually reaches it. Before this existed the route sent resume text alone, so
 * every field resolved to unknown and the routing was inert.
 *
 * Everything here is a closed enum validated with Zod. The values are
 * interpolated into the system prompt, so free text would be an injection route.
 * An invalid value is coerced to 'unknown' rather than rejected: a stale client
 * sending a retired option should still get a review.
 */

import { z } from 'zod';
import {
  APPLICATION_CHANNELS,
  EMPLOYER_TYPES,
  CANDIDATE_STAGES,
  TARGET_SECTORS,
} from 'ai-service';

/** Coerces anything outside the enum to 'unknown' instead of failing the request. */
const enumOrUnknown = (values) =>
  z.preprocess(
    (v) => (typeof v === 'string' && values.includes(v.trim().toLowerCase()) ? v.trim().toLowerCase() : 'unknown'),
    z.enum(values)
  );

export const ReviewContextSchema = z.object({
  applicationChannel: enumOrUnknown(APPLICATION_CHANNELS),
  employerType: enumOrUnknown(EMPLOYER_TYPES),
  candidateStage: enumOrUnknown(CANDIDATE_STAGES),
  targetSector: enumOrUnknown(TARGET_SECTORS),
});

/**
 * Reads context fields from a multipart body and attaches res.locals.reviewContext.
 *
 * Must run after multer, because the fields arrive as form data alongside the
 * file. Never throws: a malformed context degrades to all-unknown, which is the
 * same conservative behaviour as sending none.
 */
export function attachReviewContext(req, res, next) {
  const parsed = ReviewContextSchema.safeParse({
    applicationChannel: req.body?.applicationChannel,
    employerType: req.body?.employerType,
    candidateStage: req.body?.candidateStage,
    targetSector: req.body?.targetSector,
  });

  res.locals.reviewContext = parsed.success
    ? parsed.data
    : {
        applicationChannel: 'unknown',
        employerType: 'unknown',
        candidateStage: 'unknown',
        targetSector: 'unknown',
      };

  return next();
}
