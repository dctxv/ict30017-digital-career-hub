/**
 * Tests for the live interview mode.
 *
 * The thing under test is not "does live mode work" — that needs a browser, a
 * microphone and a person, and lives in docs/qa. What is pinned here is the
 * promise the mode was built on: that a live interview and a written one are
 * the SAME interview, marked the same way, and that adding the second mode did
 * not quietly change the first.
 *
 * Four ways that could fail silently:
 *
 *  - The written mode's prompt or transcript drifting. Nothing throws; scores
 *    simply stop being comparable with every score already in the database.
 *  - Follow-ups ordered by index rather than by when they were asked, which
 *    hands the evaluator a conversation that never happened in that order.
 *  - The tier-1 evidence guarantee not reaching the follow-up call, where it
 *    matters most — an invented "your time at" mid-interview reads as the
 *    interviewer having read something it was never given.
 *  - Durations rendered as raw seconds, which the evaluation prompt asks the
 *    model to reason about as pacing.
 *
 * Run: npm test --prefix ai-service
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { orderQuestions, formatDuration, buildTranscript } from '../src/services/mockInterview.js';
import {
  buildQuestionPrompt,
  buildEvaluationPrompt,
  buildFollowUpPrompt,
  TIER_1_CONSTRAINT,
  PROFILE_BLOCK,
  SPOKEN_ANSWER_BLOCK,
} from '../src/prompt/interview.js';
import { InterviewFollowUpSchema } from '../src/schemas/preparationSchema.js';
import {
  INTERVIEW_MODES,
  INTERVIEW_QUESTION_KINDS,
  INTERVIEW_LIVE_QUESTION_KINDS,
  LIVE_FOLLOW_UP_CAP,
} from '../src/config/preparationConstants.js';

const q = (index, kind = 'behavioural', extra = {}) => ({
  index, kind, question: `Q${index}`, why: '', targets_gap_key: null, ...extra,
});

describe('the written mode is not disturbed by the live one', () => {
  it('leaves the evaluation prompt byte-identical when no mode is passed', () => {
    // The default is what every existing caller gets. If this drifts, every
    // score already in the database stops being comparable with every score
    // taken after it, and nothing anywhere will complain.
    const written = buildEvaluationPrompt({ tier: 3, hasProfile: true });
    const explicit = buildEvaluationPrompt({ tier: 3, hasProfile: true, spoken: false });
    assert.equal(written, explicit);
    assert.ok(!written.includes(SPOKEN_ANSWER_BLOCK));
  });

  it('keeps follow_up out of the vocabulary the question generator is held to', () => {
    // The upfront call writes five questions before a single answer exists, so
    // it cannot produce a reaction to one. Letting this value into that enum
    // would make an impossible response schema-valid.
    assert.ok(!INTERVIEW_QUESTION_KINDS.includes('follow_up'));
    assert.ok(INTERVIEW_LIVE_QUESTION_KINDS.includes('follow_up'));
    for (const kind of INTERVIEW_QUESTION_KINDS) {
      assert.ok(INTERVIEW_LIVE_QUESTION_KINDS.includes(kind), `${kind} missing from the live list`);
    }
  });

  it('does not change the question prompt at all', () => {
    // Live mode reuses the generator untouched. Nothing about the spoken
    // delivery belongs in the call that writes the questions.
    const prompt = buildQuestionPrompt({ tier: 3, hasJobAd: true, hasGaps: true });
    assert.ok(!prompt.includes(SPOKEN_ANSWER_BLOCK));
    assert.doesNotMatch(prompt, /spoken|dictat|transcript/i);
  });

  it('offers exactly two modes', () => {
    assert.deepEqual([...INTERVIEW_MODES], ['written', 'live']);
  });
});

describe('the spoken-answer block', () => {
  const spoken = buildEvaluationPrompt({ tier: 3, spoken: true });

  it('is added, and only when asked for', () => {
    assert.ok(spoken.includes(SPOKEN_ANSWER_BLOCK));
  });

  it('tells the model not to mark transcription noise', () => {
    // Without this a live interview scores lower than a written one for the
    // same substance, and the candidate is told their answer was unclear when
    // what was unclear was the transcript.
    assert.match(spoken, /homophones/i);
    assert.match(spoken, /punctuation/i);
    assert.match(spoken, /NOT the\ncandidate's/);
  });

  it('does not soften the rubric it is marking against', () => {
    // Leniency about the transcript must not become leniency about the answer.
    assert.match(spoken, /A rambling answer is still\nrambling/);
    // The bands are the written mode's bands, still present word for word.
    assert.match(spoken, /90-100 specific, structured, evidenced/);
  });

  it('treats the timing as context rather than as a criterion', () => {
    assert.match(spoken, /It is context, never a\ncriterion/);
    assert.match(spoken, /do not tell anyone to answer faster/i);
  });

  it('keeps the tier-1 constraint alongside it', () => {
    assert.ok(buildEvaluationPrompt({ tier: 1, spoken: true }).includes(TIER_1_CONSTRAINT));
  });
});

describe('the follow-up prompt', () => {
  it('carries the tier-1 evidence constraint', () => {
    // It bites harder here than anywhere: this question arrives mid
    // conversation, where an invented claim reads as the interviewer having
    // read something about the candidate.
    assert.ok(buildFollowUpPrompt({ tier: 1 }).includes(TIER_1_CONSTRAINT));
  });

  it('tells a tier-2 follow-up the resume is gone, not available', () => {
    // The CV was parsed in memory and deleted. A prompt that implied otherwise
    // would invite the model to quote a document it cannot see.
    const prompt = buildFollowUpPrompt({ tier: 2 });
    assert.ok(!prompt.includes(TIER_1_CONSTRAINT));
    assert.match(prompt, /is NOT available\nto you now/);
  });

  it('spends more of its length on declining than on asking', () => {
    // The failure mode is the interviewer that always has one more question.
    const prompt = buildFollowUpPrompt({ tier: 3, hasJobAd: true });
    assert.match(prompt, /DO NOT ask a follow-up when/);
    assert.match(prompt, /tell me more/);
    assert.match(prompt, /already in <QUESTIONS_STILL_TO_COME>/);
  });

  it('mentions the advertisement and the profile only when supplied', () => {
    const bare = buildFollowUpPrompt({ tier: 1 });
    assert.doesNotMatch(bare, /JOB ADVERTISEMENT WAS SUPPLIED/);
    assert.ok(!bare.includes(PROFILE_BLOCK));

    const full = buildFollowUpPrompt({ tier: 3, hasJobAd: true, hasProfile: true });
    assert.match(full, /JOB ADVERTISEMENT WAS SUPPLIED/);
    assert.ok(full.includes(PROFILE_BLOCK));
  });

  it('forbids probing anything the candidate did not say', () => {
    assert.match(
      buildFollowUpPrompt({ tier: 3 }),
      /Never introduce an employer, project, tool, date or\nachievement they did not mention/,
    );
  });
});

describe('the follow-up schema lets the model decline', () => {
  it('defaults to not asking', () => {
    const parsed = InterviewFollowUpSchema.parse({});
    assert.equal(parsed.ask_follow_up, false);
    assert.equal(parsed.question, '');
  });

  it('accepts a real follow-up', () => {
    const parsed = InterviewFollowUpSchema.parse({
      ask_follow_up: true,
      question: 'You said the rollout slipped — what did you change?',
      why: 'A strong answer names the decision you made.',
    });
    assert.equal(parsed.ask_follow_up, true);
    assert.match(parsed.question, /what did you change/);
  });

  it('does not reject a flag set with nothing behind it', () => {
    // The caller treats this as a decline. Rejecting the response instead
    // would surface a provider error to somebody mid-interview over a question
    // that was optional in the first place.
    const parsed = InterviewFollowUpSchema.parse({ ask_follow_up: true });
    assert.equal(parsed.question, '');
  });
});

describe('orderQuestions', () => {
  it('sorts a written interview by index, as it always did', () => {
    const shuffled = [q(3), q(1), q(5), q(2), q(4)];
    assert.deepEqual(orderQuestions(shuffled).map(item => item.index), [1, 2, 3, 4, 5]);
  });

  it('keeps a live interview in the order the questions were asked', () => {
    // Question 6 followed question 2. Sorting numerically would put the probe
    // at the end of the transcript, detached from the answer it was probing.
    const asked = [
      q(1), q(2), q(6, 'follow_up', { after_index: 2 }), q(3), q(4), q(5),
    ];
    assert.deepEqual(orderQuestions(asked).map(item => item.index), [1, 2, 6, 3, 4, 5]);
  });

  it('does not mutate what it was given', () => {
    const original = [q(2), q(1)];
    orderQuestions(original);
    assert.deepEqual(original.map(item => item.index), [2, 1]);
  });

  it('survives an empty or missing set', () => {
    assert.deepEqual(orderQuestions([]), []);
    assert.deepEqual(orderQuestions(undefined), []);
  });
});

describe('formatDuration', () => {
  it('reads as seconds below a minute', () => {
    assert.equal(formatDuration(0), '0s');
    assert.equal(formatDuration(45), '45s');
    assert.equal(formatDuration(59), '59s');
  });

  it('reads as minutes and seconds above one', () => {
    assert.equal(formatDuration(60), '1m 00s');
    assert.equal(formatDuration(102), '1m 42s');
    assert.equal(formatDuration(3600), '60m 00s');
  });

  it('pads the seconds, so "3m 4s" cannot be read as a decimal', () => {
    assert.equal(formatDuration(184), '3m 04s');
  });

  it('returns null for a duration that was never recorded', () => {
    // A written interview times nothing. The transcript must then carry no
    // annotation at all rather than a fabricated zero.
    assert.equal(formatDuration(undefined), null);
    assert.equal(formatDuration(null), null);
    assert.equal(formatDuration('not a number'), null);
    assert.equal(formatDuration(-5), null);
  });
});

describe('buildTranscript', () => {
  const questions = [q(1, 'behavioural'), q(2, 'role_specific')];

  it('renders a written interview exactly as it did before live mode existed', () => {
    // This string is the input every score in the database was produced from.
    // Pinned literally rather than by a property, because a property test
    // would let a space or a bracket move without noticing.
    const transcript = buildTranscript({
      questions,
      answers: [
        { index: 1, answer: 'I led the migration.' },
        { index: 2, answer: 'I use SQL daily.' },
      ],
    });

    assert.equal(
      transcript,
      'Q1 [behavioural]: Q1\nA1: I led the migration.\n\n'
      + 'Q2 [role_specific]: Q2\nA2: I use SQL daily.',
    );
  });

  it('ignores timings on a written interview even if some arrived', () => {
    // Belt and braces. The mode decides, not the presence of a field, so a
    // stray value on a written row cannot change what the model is shown.
    const withMeta = buildTranscript({
      questions,
      answers: [
        { index: 1, answer: 'Yes.', seconds: 90, source: 'speech' },
        { index: 2, answer: 'No.' },
      ],
    });
    const without = buildTranscript({
      questions,
      answers: [{ index: 1, answer: 'Yes.' }, { index: 2, answer: 'No.' }],
    });
    assert.equal(withMeta, without);
  });

  it('annotates a live interview with how it was answered and how long it took', () => {
    const transcript = buildTranscript({
      mode: 'live',
      questions,
      answers: [
        { index: 1, answer: 'I led the migration.', seconds: 102, source: 'speech' },
        { index: 2, answer: 'I use SQL daily.', seconds: 30, source: 'typed' },
      ],
    });

    assert.match(transcript, /A1 \(spoken, took 1m 42s\): I led the migration\./);
    assert.match(transcript, /A2 \(typed, took 30s\): I use SQL daily\./);
  });

  it('leaves out the annotation where nothing was recorded', () => {
    // A live interview resumed from an older row may have answers with no
    // timing. An empty parenthesis would be noise, and "took 0s" a lie.
    const transcript = buildTranscript({
      mode: 'live',
      questions,
      answers: [{ index: 1, answer: 'Said something.' }, { index: 2, answer: 'And more.' }],
    });
    assert.match(transcript, /A1: Said something\./);
    assert.ok(!transcript.includes('()'));
  });

  it('says a blank answer was blank rather than leaving an empty line', () => {
    // A blank answer and a missing one look identical otherwise, and the
    // prompt has a different rule for each.
    const transcript = buildTranscript({ questions, answers: [{ index: 1, answer: '  ' }] });
    assert.match(transcript, /A1: \(the candidate left this blank\)/);
    assert.match(transcript, /A2: \(the candidate left this blank\)/);
  });

  it('places a follow-up where it was asked and says what it followed', () => {
    const transcript = buildTranscript({
      mode: 'live',
      questions: [
        q(1), q(6, 'follow_up', { after_index: 1 }), q(2, 'role_specific'),
      ],
      answers: [
        { index: 1, answer: 'The rollout slipped.', seconds: 40, source: 'speech' },
        { index: 6, answer: 'I rescoped it.', seconds: 25, source: 'speech' },
        { index: 2, answer: 'Daily.', seconds: 10, source: 'speech' },
      ],
    });

    const order = [...transcript.matchAll(/^Q(\d+) \[/gm)].map(m => m[1]);
    assert.deepEqual(order, ['1', '6', '2'], 'the probe must sit next to the answer it probed');
    assert.match(transcript, /Q6 \[follow_up to Q1\]/);
  });

  it('caps an answer at the length the server accepts', () => {
    const transcript = buildTranscript({
      questions: [q(1)],
      answers: [{ index: 1, answer: 'x'.repeat(5000) }],
    });
    assert.ok(transcript.length < 3000);
  });
});

describe('the follow-up cap', () => {
  it('is bounded, so the interview ends', () => {
    // The client asked for questions that react to what was said. Unbounded,
    // that is the twelve-call turn-by-turn design this feature exists to avoid.
    assert.ok(Number.isInteger(LIVE_FOLLOW_UP_CAP));
    assert.ok(LIVE_FOLLOW_UP_CAP >= 1 && LIVE_FOLLOW_UP_CAP <= 3);
  });
});
