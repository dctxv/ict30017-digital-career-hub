/**
 * Module: services/transcription
 * Responsibility: Turn a recorded interview answer into text, with Whisper.
 *
 * WHY WHISPER AND NOT THE BROWSER
 *
 * The live interview used to dictate through the browser's own Web Speech
 * engine. That only exists in Chrome, Edge and Opera, so a third of visitors
 * could not speak their answers at all, and what it produced changed with the
 * browser. The client asked for one recogniser for everybody: the browser now
 * only RECORDS, which every current browser can do, and the recording is
 * transcribed here by Whisper.
 *
 * WHY GROQ
 *
 * Groq serves Whisper on a free tier behind the same OpenAI wire format this
 * service already speaks, so the `openai` SDK that talks to Google AI Studio
 * talks to Groq too, and nothing new is installed. The free tier is the
 * constraint to know about: roughly two hours of audio an hour and eight a day
 * across the whole server, and 25 MB a file. See the README's live interview
 * section before planning anything bigger than a class demo.
 *
 * Note that `getGroqClient()` in utils/aiClient.js is NOT this. It is the
 * Google AI Studio chat client, named for the provider the project started on.
 * This module has its own client because it has its own key and base URL, and
 * because it must not inherit the outbound masking wrapper — see below.
 *
 * THE ONE PAYLOAD THE PII MASK CANNOT REACH
 *
 * Every chat request goes through withOutboundMasking, which removes names,
 * emails and phone numbers from the text before it leaves. Audio has no text to
 * mask: a candidate who says their own name says it into the recording, and it
 * reaches Groq as sound. That is an accepted consequence of transcribing speech
 * at all, and it is stated to the candidate on the intro card. What this module
 * does guarantee is the rest of the promise: the audio is held in memory for
 * the length of one request and never written to disk, never stored and never
 * logged, and the transcript it returns goes back to the candidate's editable
 * answer box, where it rejoins the masked path when the answers are assessed.
 *
 * ENGLISH ONLY
 *
 * Whisper can transcribe Bengali, but the live mode is English-only by
 * agreement with the client and its Bengali accuracy has not been tested with
 * Bangladeshi speakers. The language is fixed rather than detected: stating it
 * is both faster and more accurate, and it stops a strongly accented English
 * answer being "detected" as something else and transcribed into it.
 */

import OpenAI, { toFile } from 'openai';

/** Groq's OpenAI-compatible base. The SDK appends 'audio/transcriptions'. */
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

/**
 * The model used when WHISPER_MODEL is not set.
 *
 * Turbo rather than full large-v3: it is several times faster for a small loss
 * of accuracy, and a candidate is waiting on it between pressing Stop and
 * seeing their answer. English is the language that loss matters least in.
 */
export const DEFAULT_WHISPER_MODEL = 'whisper-large-v3-turbo';

/** ISO-639-1, which is what Whisper takes. See ENGLISH ONLY above. */
export const TRANSCRIPTION_LANGUAGE = 'en';

/**
 * Largest recording accepted, in bytes.
 *
 * The client stops recording at three minutes, which at the bitrate it asks for
 * is well under 1 MB and at a browser's default bitrate still under 5 MB. Ten
 * leaves room for a browser that ignores the requested bitrate without letting
 * anyone post Groq's whole 25 MB file allowance through this server.
 */
export const AUDIO_MAX_BYTES = 10 * 1024 * 1024;

/**
 * The container types a browser's MediaRecorder produces, and the extension
 * Groq needs to see on the file to read it.
 *
 * Groq decides how to decode an upload from its filename, so a webm recording
 * sent as "answer" with no extension is rejected. Chrome, Edge and Firefox
 * record webm or ogg with Opus; Safari records mp4 with AAC. The video/* forms
 * are there because some browsers label an audio-only recording with the
 * container's video type.
 */
const AUDIO_EXTENSIONS = Object.freeze({
  'audio/webm': 'webm',
  'video/webm': 'webm',
  'audio/ogg': 'ogg',
  'application/ogg': 'ogg',
  'audio/mp4': 'mp4',
  'video/mp4': 'mp4',
  'audio/x-m4a': 'm4a',
  'audio/m4a': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/wave': 'wav',
  'audio/flac': 'flac',
  'audio/x-flac': 'flac',
});

/** The MIME type without its parameters: 'audio/webm;codecs=opus' → 'audio/webm'. */
function baseMimeType(mimeType) {
  return typeof mimeType === 'string' ? mimeType.split(';')[0].trim().toLowerCase() : '';
}

/**
 * The file extension Groq needs for a recording of this type, or null when it
 * is not audio this service accepts.
 *
 * @param {string} mimeType as the browser reported it, parameters and all
 * @returns {string|null}
 */
export function audioExtensionFor(mimeType) {
  return AUDIO_EXTENSIONS[baseMimeType(mimeType)] ?? null;
}

/** The value .env.example ships with, which is not a key. */
const PLACEHOLDER_KEY = 'your_groq_api_key_here';

/**
 * Whether a Groq key has been configured.
 *
 * Deliberately not a startup failure, unlike the chat models. Dictation is a
 * convenience inside one mode of one feature; a server without a key still
 * runs every interview, and the candidate is told to type instead.
 */
export function isTranscriptionConfigured() {
  const key = process.env.GROQ_API_KEY?.trim();
  return Boolean(key) && key !== PLACEHOLDER_KEY;
}

/** The Whisper model id, from WHISPER_MODEL or the default above. */
export function getTranscriptionModel() {
  return process.env.WHISPER_MODEL?.trim() || DEFAULT_WHISPER_MODEL;
}

let _client = null;

/**
 * The Groq client, built on first use.
 *
 * @throws {Error} when GROQ_API_KEY is not set — callers check
 *   isTranscriptionConfigured() first and answer the user instead
 */
export function getTranscriptionClient() {
  if (!_client) {
    if (!isTranscriptionConfigured()) {
      throw new Error(
        'GROQ_API_KEY is not set. Add it to server/.env. Create a key at '
        + 'https://console.groq.com/keys.'
      );
    }
    _client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY.trim(),
      baseURL: GROQ_BASE_URL,
      // One retry, as the chat client does: the candidate is waiting, and a
      // rejected key should not take three attempts to report.
      maxRetries: 1,
      // A three-minute recording transcribes in a few seconds. Thirty is
      // long enough for a slow upload, and with the one retry keeps the
      // worst case inside the minute the browser is prepared to wait.
      timeout: 30_000,
    });
  }
  return _client;
}

/**
 * Whether Whisper itself judged a segment to be silence.
 *
 * Whisper hallucinates on silence — "Thank you.", "Thanks for watching!" — and
 * a candidate who presses record and then thinks for ten seconds produces
 * exactly that. These are the thresholds the reference implementation uses to
 * discard such a segment: a high probability of no speech AND low confidence in
 * the words. Both, not either, because a quiet but real answer can score high
 * on one of them alone.
 *
 * @param {{no_speech_prob?: number, avg_logprob?: number}} segment
 * @returns {boolean}
 */
export function isSilentSegment(segment) {
  const noSpeech = Number(segment?.no_speech_prob);
  const logprob = Number(segment?.avg_logprob);
  return Number.isFinite(noSpeech) && Number.isFinite(logprob) && noSpeech > 0.6 && logprob < -1;
}

/**
 * The transcript in a Whisper response, with silent segments removed.
 *
 * Reads the verbose form when it is there, because that is the only form that
 * says which parts were silence. Falls back to the plain `text` field for a
 * response without segments, so a provider that ignores verbose_json still
 * works.
 *
 * @param {{text?: string, segments?: Array<object>}} response
 * @returns {string} possibly empty — an empty transcript means nothing was said
 */
export function transcriptFromResponse(response) {
  const segments = Array.isArray(response?.segments) ? response.segments : null;
  const raw = segments && segments.length > 0
    ? segments.filter((segment) => !isSilentSegment(segment)).map((segment) => segment?.text ?? '').join(' ')
    : (typeof response?.text === 'string' ? response.text : '');
  return raw.replace(/\s+/g, ' ').trim();
}

/* ── Failures ────────────────────────────────────────────────────────── */

/**
 * One entry per failure code. `error` is for the candidate; `hint` is for the
 * server log. The client keys its own copy off the code, so `error` is the
 * English fallback and what the Bangla catalogue in server/src/i18n translates.
 */
const CATALOGUE = Object.freeze({
  TRANSCRIBE_NOT_CONFIGURED: {
    error: 'Speech to text is not set up on this server.',
    hint: 'GROQ_API_KEY is not set in server/.env. Create a key at https://console.groq.com/keys, add it, and restart the server.',
  },
  TRANSCRIBE_AUTH: {
    error: 'Speech to text is not set up on this server.',
    hint: 'Groq rejected GROQ_API_KEY. Check it was pasted without quotes and has not been revoked at https://console.groq.com/keys.',
  },
  TRANSCRIBE_MODEL: {
    error: 'Speech to text is not set up on this server.',
    hint: 'Groq does not serve the model in WHISPER_MODEL (or the default, whisper-large-v3-turbo). Groq retires models; check https://console.groq.com/docs/models and set WHISPER_MODEL.',
  },
  TRANSCRIBE_BUSY: {
    error: 'Speech to text is busy right now. Please try again in a moment.',
    hint: 'Groq throttled the request. The free tier limits requests per minute and audio seconds per hour and per day across the whole key. If this persists, the daily audio allowance is spent; it resets within 24 hours, or upgrade the Groq plan.',
  },
  TRANSCRIBE_TOO_LARGE: {
    error: 'That recording is too long to transcribe.',
    hint: 'Groq rejected the file size. The free tier accepts up to 25 MB; this server already caps uploads well below that, so check AUDIO_MAX_BYTES.',
  },
  TRANSCRIBE_BAD_AUDIO: {
    error: 'That recording could not be read.',
    hint: 'Groq could not decode the upload. Usually an empty or truncated recording, or a container type it does not accept.',
  },
  TRANSCRIBE_UNAVAILABLE: {
    error: 'Speech to text is temporarily unavailable. Please try again.',
    hint: 'Groq returned a 5xx. This is on their side; retry later.',
  },
  TRANSCRIBE_UNREACHABLE: {
    error: 'Speech to text could not be reached. Please try again.',
    hint: 'The server could not connect to api.groq.com. Check this machine\'s internet access, proxy and firewall.',
  },
  TRANSCRIBE_ERROR: {
    error: 'That recording could not be transcribed. Please try again.',
    hint: 'Unclassified transcription failure; see the detail in this log line.',
  },
});

export const TRANSCRIPTION_ERROR_CODES = Object.freeze(Object.keys(CATALOGUE));

const NETWORK_FAILURE = /ECONNREFUSED|ECONNRESET|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|EHOSTUNREACH|ENETUNREACH|fetch failed|connection error|socket hang up|timed? ?out/i;

/**
 * @typedef {{code: string, error: string, hint: string, status: number|null, detail: string}} ClassifiedTranscriptionError
 */

/**
 * Classifies a failure thrown by the transcription client. Never throws.
 *
 * @param {unknown} err
 * @returns {ClassifiedTranscriptionError}
 */
export function classifyTranscriptionError(err) {
  const rawStatus = err?.status ?? err?.statusCode ?? null;
  const status = Number.isInteger(rawStatus) ? rawStatus : null;
  const detail = [err?.message, err?.error ? JSON.stringify(err.error) : null, err?.cause?.message]
    .filter(Boolean)
    .join(' | ');

  let code;
  if (status === 401 || status === 403) code = 'TRANSCRIBE_AUTH';
  else if (status === 404 || (status === 400 && /model/i.test(detail) && /not (found|exist|supported)|decommissioned/i.test(detail))) code = 'TRANSCRIBE_MODEL';
  else if (status === 413) code = 'TRANSCRIBE_TOO_LARGE';
  else if (status === 429) code = 'TRANSCRIBE_BUSY';
  else if (status === 400 || status === 415 || status === 422) code = 'TRANSCRIBE_BAD_AUDIO';
  else if (status !== null && status >= 500) code = 'TRANSCRIBE_UNAVAILABLE';
  else if (status === null && NETWORK_FAILURE.test(`${detail} ${err?.code ?? ''} ${err?.name ?? ''}`)) code = 'TRANSCRIBE_UNREACHABLE';
  else code = 'TRANSCRIBE_ERROR';

  return { code, ...CATALOGUE[code], status, detail: detail.slice(0, 600) };
}

/**
 * The failure for a code this module decided on itself, without a thrown error.
 *
 * @param {string} code one of TRANSCRIPTION_ERROR_CODES
 * @returns {ClassifiedTranscriptionError}
 */
function failure(code) {
  return { code, ...CATALOGUE[code], status: null, detail: '' };
}

/**
 * The single log line for a failed transcription. Rule names and the
 * provider's message only — never the audio, and never a transcript.
 *
 * @param {ClassifiedTranscriptionError} classified
 * @returns {string}
 */
export function formatTranscriptionErrorLog(classified) {
  const status = classified.status === null ? 'none' : classified.status;
  return `[transcribe-upstream] code=${classified.code} status=${status} detail=${JSON.stringify(classified.detail)}\n[transcribe-upstream] ${classified.hint}`;
}

/* ── The call ────────────────────────────────────────────────────────── */

/**
 * Transcribes one recorded answer.
 *
 * Never throws. A failure comes back classified so the route can pick a status
 * and the client can pick a sentence, and the caller always has something to
 * log in one line.
 *
 * @param {{audio: Buffer, mimeType: string}} input the recording, in memory
 * @param {{client?: object}} [deps] a stand-in client, for the tests
 * @returns {Promise<{ok: true, text: string, model: string}
 *   | ({ok: false} & ClassifiedTranscriptionError)>}
 */
export async function transcribeAudio({ audio, mimeType }, { client = null } = {}) {
  if (!isTranscriptionConfigured()) return { ok: false, ...failure('TRANSCRIBE_NOT_CONFIGURED') };

  const extension = audioExtensionFor(mimeType);
  if (!extension || !Buffer.isBuffer(audio) || audio.length === 0) {
    return { ok: false, ...failure('TRANSCRIBE_BAD_AUDIO') };
  }

  const model = getTranscriptionModel();
  try {
    const file = await toFile(audio, `answer.${extension}`, { type: baseMimeType(mimeType) });
    const response = await (client ?? getTranscriptionClient()).audio.transcriptions.create({
      file,
      model,
      language: TRANSCRIPTION_LANGUAGE,
      // Verbose, because it is the only form that marks which segments were
      // silence. See transcriptFromResponse.
      response_format: 'verbose_json',
      temperature: 0,
    });
    return { ok: true, text: transcriptFromResponse(response), model };
  } catch (err) {
    return { ok: false, ...classifyTranscriptionError(err) };
  }
}
