/**
 * Tests for the Whisper transcription service.
 *
 * Nothing here reaches Groq. What is pinned is the part that decides what the
 * candidate gets back: which uploads are accepted and under what name, which
 * segments count as silence (the source of Whisper's "Thank you." on a quiet
 * recording), and which failure each provider response becomes — because each
 * one needs a different fix and used to be easy to confuse.
 *
 * Run: npm test --prefix ai-service
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import OpenAI from 'openai';

import {
  audioExtensionFor,
  isSilentSegment,
  transcriptFromResponse,
  classifyTranscriptionError,
  formatTranscriptionErrorLog,
  isTranscriptionConfigured,
  getTranscriptionModel,
  transcribeAudio,
  DEFAULT_WHISPER_MODEL,
  TRANSCRIPTION_LANGUAGE,
  TRANSCRIPTION_ERROR_CODES,
} from '../src/services/transcription.js';

/** Builds the error the SDK would throw for a given status and body. */
function sdkError(status, body) {
  return OpenAI.APIError.generate(status, body, undefined, new Headers());
}

describe('audioExtensionFor', () => {
  it('names what Chrome, Edge and Firefox record', () => {
    assert.equal(audioExtensionFor('audio/webm;codecs=opus'), 'webm');
    assert.equal(audioExtensionFor('audio/webm'), 'webm');
    assert.equal(audioExtensionFor('audio/ogg; codecs=opus'), 'ogg');
  });

  it('names what Safari records', () => {
    assert.equal(audioExtensionFor('audio/mp4'), 'mp4');
    assert.equal(audioExtensionFor('audio/mp4;codecs=mp4a.40.2'), 'mp4');
  });

  it('accepts a recording labelled with its container\'s video type', () => {
    assert.equal(audioExtensionFor('video/webm;codecs=opus'), 'webm');
  });

  it('ignores case', () => {
    assert.equal(audioExtensionFor('Audio/WebM'), 'webm');
  });

  it('refuses anything that is not audio this service sends on', () => {
    assert.equal(audioExtensionFor('application/pdf'), null);
    assert.equal(audioExtensionFor('text/plain'), null);
    assert.equal(audioExtensionFor(''), null);
    assert.equal(audioExtensionFor(undefined), null);
  });
});

describe('isSilentSegment', () => {
  it('drops a segment Whisper was confident was silence', () => {
    assert.equal(isSilentSegment({ no_speech_prob: 0.92, avg_logprob: -1.4 }), true);
  });

  it('keeps a quiet answer that is only unsure on one measure', () => {
    // Either signal alone happens on real speech. The reference implementation
    // requires both, and so does this.
    assert.equal(isSilentSegment({ no_speech_prob: 0.9, avg_logprob: -0.3 }), false);
    assert.equal(isSilentSegment({ no_speech_prob: 0.1, avg_logprob: -1.5 }), false);
  });

  it('keeps a segment that carries no confidence figures at all', () => {
    assert.equal(isSilentSegment({ text: 'hello' }), false);
    assert.equal(isSilentSegment(null), false);
  });
});

describe('transcriptFromResponse', () => {
  it('joins the spoken segments and drops the hallucinated one', () => {
    const response = {
      text: ' I led the migration. Thank you.',
      segments: [
        { text: ' I led the migration.', no_speech_prob: 0.01, avg_logprob: -0.2 },
        { text: ' Thank you.', no_speech_prob: 0.88, avg_logprob: -1.3 },
      ],
    };
    assert.equal(transcriptFromResponse(response), 'I led the migration.');
  });

  it('is empty when every segment was silence, which means nothing was said', () => {
    const response = {
      text: ' Thanks for watching!',
      segments: [{ text: ' Thanks for watching!', no_speech_prob: 0.95, avg_logprob: -1.1 }],
    };
    assert.equal(transcriptFromResponse(response), '');
  });

  it('falls back to the plain text when there are no segments', () => {
    assert.equal(transcriptFromResponse({ text: '  We shipped   on time. ' }), 'We shipped on time.');
    assert.equal(transcriptFromResponse({ text: 'Done.', segments: [] }), 'Done.');
  });

  it('survives an empty or malformed response', () => {
    assert.equal(transcriptFromResponse({}), '');
    assert.equal(transcriptFromResponse(null), '');
  });
});

describe('classifyTranscriptionError', () => {
  it('reads a rejected key', () => {
    const out = classifyTranscriptionError(sdkError(401, { error: { message: 'Invalid API Key', type: 'invalid_request_error', code: 'invalid_api_key' } }));
    assert.equal(out.code, 'TRANSCRIBE_AUTH');
    assert.equal(out.status, 401);
    assert.match(out.hint, /GROQ_API_KEY/);
  });

  it('reads a retired model, which Groq reports as a 400 or a 404', () => {
    assert.equal(classifyTranscriptionError(sdkError(404, { error: { message: 'The model `whisper-x` does not exist' } })).code, 'TRANSCRIBE_MODEL');
    assert.equal(
      classifyTranscriptionError(sdkError(400, { error: { message: 'The model `distil-whisper-large-v3-en` has been decommissioned' } })).code,
      'TRANSCRIBE_MODEL',
    );
  });

  it('reads throttling as busy, not as a failure of the recording', () => {
    const out = classifyTranscriptionError(sdkError(429, { error: { message: 'Rate limit reached for model whisper-large-v3-turbo on audio seconds per hour (ASH)' } }));
    assert.equal(out.code, 'TRANSCRIBE_BUSY');
  });

  it('reads an oversized file', () => {
    assert.equal(classifyTranscriptionError(sdkError(413, { error: { message: 'Request Entity Too Large' } })).code, 'TRANSCRIBE_TOO_LARGE');
  });

  it('reads an undecodable recording', () => {
    const out = classifyTranscriptionError(sdkError(400, { error: { message: 'could not process file - is it a valid media file?' } }));
    assert.equal(out.code, 'TRANSCRIBE_BAD_AUDIO');
  });

  it('reads an outage on Groq\'s side', () => {
    assert.equal(classifyTranscriptionError(sdkError(503, { error: { message: 'Service Unavailable' } })).code, 'TRANSCRIBE_UNAVAILABLE');
  });

  it('reads a machine that cannot reach Groq at all', () => {
    const err = new Error('Connection error.');
    err.cause = new Error('getaddrinfo ENOTFOUND api.groq.com');
    assert.equal(classifyTranscriptionError(err).code, 'TRANSCRIBE_UNREACHABLE');
  });

  it('never throws, and always has a sentence for the candidate', () => {
    for (const thrown of [undefined, null, 'a string', new TypeError('boom')]) {
      const out = classifyTranscriptionError(thrown);
      assert.ok(TRANSCRIPTION_ERROR_CODES.includes(out.code));
      assert.equal(typeof out.error, 'string');
    }
  });

  it('logs one grep-able line with the fix beneath it', () => {
    const line = formatTranscriptionErrorLog(classifyTranscriptionError(sdkError(429, { error: { message: 'slow down' } })));
    assert.match(line, /^\[transcribe-upstream\] code=TRANSCRIBE_BUSY status=429/);
    assert.match(line, /free tier/);
  });
});

describe('configuration', () => {
  const saved = {};
  beforeEach(() => {
    saved.key = process.env.GROQ_API_KEY;
    saved.model = process.env.WHISPER_MODEL;
  });
  afterEach(() => {
    for (const [name, value] of [['GROQ_API_KEY', saved.key], ['WHISPER_MODEL', saved.model]]) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it('is not configured without a key, or with the placeholder from .env.example', () => {
    delete process.env.GROQ_API_KEY;
    assert.equal(isTranscriptionConfigured(), false);
    process.env.GROQ_API_KEY = 'your_groq_api_key_here';
    assert.equal(isTranscriptionConfigured(), false);
    process.env.GROQ_API_KEY = '   ';
    assert.equal(isTranscriptionConfigured(), false);
  });

  it('is configured with a real-looking key', () => {
    process.env.GROQ_API_KEY = 'gsk_test_value';
    assert.equal(isTranscriptionConfigured(), true);
  });

  it('uses the default model unless WHISPER_MODEL says otherwise', () => {
    delete process.env.WHISPER_MODEL;
    assert.equal(getTranscriptionModel(), DEFAULT_WHISPER_MODEL);
    process.env.WHISPER_MODEL = ' whisper-large-v3 ';
    assert.equal(getTranscriptionModel(), 'whisper-large-v3');
  });

  it('answers without a network call when no key is set', async () => {
    delete process.env.GROQ_API_KEY;
    const out = await transcribeAudio({ audio: Buffer.from('audio'), mimeType: 'audio/webm' });
    assert.equal(out.ok, false);
    assert.equal(out.code, 'TRANSCRIBE_NOT_CONFIGURED');
  });

  it('refuses an upload that is not audio before spending anything on it', async () => {
    process.env.GROQ_API_KEY = 'gsk_test_value';
    const notAudio = await transcribeAudio({ audio: Buffer.from('%PDF-1.4'), mimeType: 'application/pdf' });
    assert.equal(notAudio.code, 'TRANSCRIBE_BAD_AUDIO');
    const empty = await transcribeAudio({ audio: Buffer.alloc(0), mimeType: 'audio/webm' });
    assert.equal(empty.code, 'TRANSCRIBE_BAD_AUDIO');
  });
});

describe('language', () => {
  it('is English, as agreed with the client', () => {
    assert.equal(TRANSCRIPTION_LANGUAGE, 'en');
  });
});

describe('transcribeAudio', () => {
  let savedKey;
  beforeEach(() => {
    savedKey = process.env.GROQ_API_KEY;
    process.env.GROQ_API_KEY = 'gsk_test_value';
  });
  afterEach(() => {
    if (savedKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = savedKey;
  });

  /** A client that records what it was asked and answers with `reply`. */
  function fakeClient(reply) {
    const calls = [];
    return {
      calls,
      audio: {
        transcriptions: {
          create: async (body) => {
            calls.push(body);
            if (reply instanceof Error) throw reply;
            return reply;
          },
        },
      },
    };
  }

  it('sends English, verbose output and a filename Groq can decode', async () => {
    const client = fakeClient({
      text: ' I led the migration.',
      segments: [{ text: ' I led the migration.', no_speech_prob: 0.02, avg_logprob: -0.2 }],
    });
    const out = await transcribeAudio({ audio: Buffer.from('fake-webm'), mimeType: 'audio/webm;codecs=opus' }, { client });

    assert.deepEqual(out, { ok: true, text: 'I led the migration.', model: getTranscriptionModel() });
    assert.equal(client.calls.length, 1);
    const [body] = client.calls;
    assert.equal(body.language, 'en');
    assert.equal(body.response_format, 'verbose_json');
    assert.equal(body.temperature, 0);
    assert.equal(body.model, getTranscriptionModel());
    // Groq picks the decoder from the extension; parameters stay off the type.
    assert.equal(body.file.name, 'answer.webm');
    assert.equal(body.file.type, 'audio/webm');
  });

  it('turns a provider failure into a classified answer rather than a throw', async () => {
    const client = fakeClient(sdkError(429, { error: { message: 'Rate limit reached' } }));
    const out = await transcribeAudio({ audio: Buffer.from('fake-mp4'), mimeType: 'audio/mp4' }, { client });
    assert.equal(out.ok, false);
    assert.equal(out.code, 'TRANSCRIBE_BUSY');
    assert.equal(out.status, 429);
  });
});
