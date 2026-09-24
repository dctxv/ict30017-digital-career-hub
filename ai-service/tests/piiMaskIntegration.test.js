/**
 * End-to-end proof that PII does not reach the wire.
 *
 * The unit tests in piiMask.test.js prove the mask works and that the
 * chokepoint enforces it. They do not prove the four real features are wired
 * through it — and that wiring is the part a future change breaks, by adding a
 * fifth feature or by threading a new argument past the one that carries the
 * identity.
 *
 * So this suite runs the genuine service functions with a stubbed global
 * fetch, and asserts on the JSON body the SDK actually tried to POST. Nothing
 * here is mocked below the HTTP boundary: the prompt composition, the client,
 * the chokepoint and the SDK's own serialisation all really run.
 *
 * Run: npm test --prefix ai-service
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

// The client reads its key and model at call time, so these must be set before
// the service modules are asked for a completion.
process.env.GOOGLE_AI_API_KEY = 'test-key-not-used-against-a-real-endpoint';
process.env.AI_MODEL_FREE = 'gemini-test';
process.env.AI_MODEL_PREMIUM = 'gemini-test';

const { analyzeResume } = await import('../src/services/resumeReviewer.js');
const { generateInterviewQuestions, evaluateInterview } = await import('../src/services/mockInterview.js');
const { extractGapsFromReview } = await import('../src/services/gapEngine.js');
const { streamChatbotResponse } = await import('../src/services/chatbot.js');

/* ── The wire ───────────────────────────────────────────────────────────── */

/** Every request body the SDK tried to send, in order. */
let sentBodies = [];
const realFetch = globalThis.fetch;

/**
 * A reply shaped like a chat completion, carrying whatever JSON the caller's
 * schema needs. The services parse and validate this, so it has to be real
 * enough to get past them — a failure there would make an assertion about the
 * request vacuously pass.
 */
function completionResponse(payload) {
  return new Response(
    JSON.stringify({
      id: 'test',
      choices: [{ index: 0, message: { role: 'assistant', content: JSON.stringify(payload) }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 1, completion_tokens: 1 },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
}

before(() => {
  globalThis.fetch = async (url, init) => {
    sentBodies.push(JSON.parse(init.body));
    return completionResponse(RESPONSE_FOR_NEXT_CALL);
  };
});

after(() => {
  globalThis.fetch = realFetch;
});

/** Set per test to whatever the service under test expects back. */
let RESPONSE_FOR_NEXT_CALL = {};

/* ── The candidate ──────────────────────────────────────────────────────── */

const IDENTITY = {
  fullName: 'Rahim Uddin Chowdhury',
  email: 'rahim.uddin@gmail.com',
  phone: '+880 1712-345678',
};

const RESUME = [
  'Rahim Uddin Chowdhury',
  'rahim.uddin@gmail.com | +880 1712-345678 | linkedin.com/in/rahimuddin',
  'House 42, Road 7, Dhanmondi, Dhaka-1209',
  '',
  'EXPERIENCE',
  'Senior Software Engineer, BRAC Bank Limited (2021-2024)',
  '- Led the Nagad payment reconciliation project',
  '',
  'SKILLS',
  'JavaScript, React, PostgreSQL',
].join('\n');

/** Every value that must never appear in a request body. */
const MUST_NOT_LEAK = [
  'Rahim Uddin Chowdhury',
  'rahim.uddin@gmail.com',
  '+880 1712-345678',
  '1712-345678',
  'linkedin.com/in/rahimuddin',
  'House 42, Road 7',
  'Dhaka-1209',
];

/** Everything the features still need to do their job. */
const MUST_SURVIVE = ['BRAC Bank Limited', 'Nagad payment reconciliation', 'JavaScript, React, PostgreSQL', '2021-2024'];

function assertClean(label) {
  assert.ok(sentBodies.length > 0, `${label}: nothing was sent, so nothing was proven`);
  const wire = JSON.stringify(sentBodies);

  for (const secret of MUST_NOT_LEAK) {
    assert.ok(
      !wire.includes(secret),
      `${label}: ${JSON.stringify(secret)} reached the wire`
    );
  }
}

function assertContentSurvived(label) {
  const wire = JSON.stringify(sentBodies);
  for (const value of MUST_SURVIVE) {
    assert.ok(wire.includes(value), `${label}: ${JSON.stringify(value)} was lost before the wire`);
  }
}

/**
 * The mask runs over system prompts too, and a prompt about CVs is full of
 * CV vocabulary: "REFERENCES", "Religion", "Father's name". A placeholder in a
 * system message means the mask rewrote our own instructions.
 */
function assertSystemPromptsIntact(label) {
  for (const body of sentBodies) {
    for (const message of body.messages.filter((m) => m.role === 'system')) {
      const found = String(message.content).match(/\[(?:NAME|EMAIL|PHONE|ADDRESS|URL|ID|DATE OF BIRTH|PERSONAL)\]/);
      assert.ok(!found, `${label}: the system prompt was masked (${found?.[0]})`);
    }
  }
}

/** The SDK must never be handed our own bookkeeping field. */
function assertNoMaskContextOnTheWire(label) {
  for (const body of sentBodies) {
    assert.ok(!Object.hasOwn(body, 'maskContext'), `${label}: maskContext was sent to the provider`);
  }
}

describe('no PII reaches the wire', () => {
  const reset = () => { sentBodies = []; };

  it('resume review', async () => {
    reset();
    // Shaped to ReviewResponseSchema, so the service's own parsing, score
    // recalculation and validation all really run. A reply the service
    // rejected would make the assertions below vacuous.
    RESPONSE_FOR_NEXT_CALL = {
      formatting: { score: 70, feedback: 'ok', issues: [] },
      content_quality: { score: 70, feedback: 'ok', strengths: [], weaknesses: [] },
      language_grammar: { score: 70, feedback: 'ok', issues: [] },
      action_items: ['Quantify impact'],
      ats_analysis: {
        inferred_role: 'Engineer',
        keyword_hits: ['React'],
        keyword_gaps: ['Kubernetes'],
        heading_risks: [],
        ats_tips: [],
      },
      overall_score: 70,
    };

    await analyzeResume(RESUME, { identity: IDENTITY, marketMode: 'bangladesh' });

    assertClean('resume review');
    assertSystemPromptsIntact('resume review');
    assertContentSurvived('resume review');
    assertNoMaskContextOnTheWire('resume review');
  });

  it('mock interview question generation', async () => {
    reset();
    RESPONSE_FOR_NEXT_CALL = {
      inferred_role: 'Engineer',
      focus: 'backend',
      questions: Array.from({ length: 5 }, (_, i) => ({
        index: i + 1,
        kind: 'role_specific',
        question: 'Describe a system you built.',
        why: 'Probes depth.',
        targets_gap_key: null,
      })),
    };

    await generateInterviewQuestions({
      targetRole: 'Backend Engineer',
      resumeText: RESUME,
      identity: IDENTITY,
    });

    assertClean('interview questions');
    assertSystemPromptsIntact('interview questions');
    assertContentSurvived('interview questions');
    assertNoMaskContextOnTheWire('interview questions');
  });

  it('mock interview answer evaluation', async () => {
    reset();
    RESPONSE_FOR_NEXT_CALL = {
      overall_score: 70,
      summary: 'ok',
      per_question: [{ index: 1, score: 70, verdict: 'ok', strengths: [], improvements: [], stronger_answer: '' }],
      gaps: [],
    };

    await evaluateInterview({
      questions: [{ index: 1, kind: 'behavioural', question: 'Tell me about yourself.', targets_gap_key: null }],
      // The candidate introduces themselves, which is what makes the transcript
      // a PII surface in its own right rather than just an echo of the CV.
      answers: [{
        index: 1,
        answer: 'My name is Rahim Uddin Chowdhury, reach me on +880 1712-345678 '
          + 'or rahim.uddin@gmail.com. I work at BRAC Bank Limited.',
      }],
      identity: IDENTITY,
    });

    assertClean('interview evaluation');
    assertSystemPromptsIntact('interview evaluation');
    assert.ok(
      JSON.stringify(sentBodies).includes('BRAC Bank Limited'),
      'interview evaluation: the employer named in the answer must survive'
    );
    assertNoMaskContextOnTheWire('interview evaluation');
  });

  it('My Plan gap analysis', async () => {
    reset();
    RESPONSE_FOR_NEXT_CALL = { gaps: [] };

    await extractGapsFromReview(
      // The shape renderReviewBlock actually reads. The weakness deliberately
      // carries contact details: the review output has already been through
      // the response-side redactor by this point, and this asserts the
      // outbound mask does not rely on that having happened.
      {
        ats_analysis: { inferred_role: 'Engineer', keyword_gaps: ['Kubernetes'] },
        content_quality: {
          weaknesses: ['Contact block lists rahim.uddin@gmail.com and +880 1712-345678'],
        },
        action_items: ['Quantify the BRAC Bank Limited results'],
      },
      { targetRole: 'Backend Engineer', identity: IDENTITY }
    );

    assertClean('gap analysis');
    assertSystemPromptsIntact('gap analysis');
    assert.ok(
      JSON.stringify(sentBodies).includes('BRAC Bank Limited'),
      'gap analysis: the employer in the findings must survive'
    );
    assertNoMaskContextOnTheWire('gap analysis');
  });

  it('chatbot', async () => {
    reset();
    // The chatbot streams, so the stub returns a completed SSE body rather than
    // a JSON completion.
    globalThis.fetch = async (url, init) => {
      sentBodies.push(JSON.parse(init.body));
      return new Response(
        'data: {"choices":[{"delta":{"content":"ok"}}]}\n\ndata: [DONE]\n\n',
        { status: 200, headers: { 'content-type': 'text/event-stream' } }
      );
    };

    const stream = streamChatbotResponse([], `Here is my CV, please review it:\n\n${RESUME}`, {
      userId: 1,
      identity: IDENTITY,
    });
    // Drain it: the request is not sent until the stream is consumed.
    // eslint-disable-next-line no-empty
    for await (const _ of stream) { void _; }

    assertClean('chatbot');
    assertSystemPromptsIntact('chatbot');
    assertNoMaskContextOnTheWire('chatbot');
  });
});

describe('a call site that forgets the mask cannot send anything', () => {
  it('throws instead of sending when identity plumbing is missing entirely', async () => {
    // Not "sends unmasked" and not "sends with weaker masking" — the request
    // does not happen. This is the property that makes the control hard to
    // bypass, so it is asserted against the real client rather than a stub.
    const { getGroqClient } = await import('../src/utils/aiClient.js');
    const sentBefore = sentBodies.length;

    await assert.rejects(
      () => getGroqClient().chat.completions.create({
        model: 'gemini-test',
        messages: [{ role: 'user', content: 'rahim.uddin@gmail.com' }],
      }),
      (err) => err.code === 'MASK_CONTEXT_MISSING'
    );

    assert.equal(sentBodies.length, sentBefore, 'nothing may reach the wire');
  });
});
