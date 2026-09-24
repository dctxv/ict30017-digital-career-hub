/**
 * Shows exactly what the model provider would receive for a resume file.
 *
 * Runs any PDF or DOCX through the real upload path — extractResume,
 * sanitiseResumeText, the identity the routes build, analyzeResume — with
 * fetch stubbed, and prints the user message the SDK tried to send. Nothing
 * leaves the machine and no API key is needed.
 *
 * Run:
 *   npm run pii-preview --prefix server -- path/to/cv.pdf
 *   npm run pii-preview --prefix server -- path/to/cv.docx --name "Account Name" --email a@b.com --phone 01712345678
 *   npm run pii-preview --prefix server -- path/to/cv.pdf --html check.html
 *
 * --name/--email/--phone simulate a logged-in account; leave them out to see
 * what a guest upload sends. --html also writes a side-by-side page (the CV
 * next to what the AI receives, every change highlighted) to open in a
 * browser — the one to show someone who does not read code.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { renderDemoDocument } from './demo-page.js';

process.env.GOOGLE_AI_API_KEY ??= 'preview-key-never-sent';
process.env.AI_MODEL_FREE ??= 'preview-model';
process.env.AI_MODEL_PREMIUM ??= 'preview-model';

const { extractResume } = await import('../../src/utils/fileParser.js');
const { sanitiseResumeText } = await import('../../src/utils/sanitise.js');
const { withNameHint } = await import('../../src/utils/maskIdentity.js');
const { analyzeResume } = await import('ai-service');

function parseArgs(argv) {
  const args = { file: null, account: {}, html: null };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--name') args.account.fullName = argv[++i];
    else if (flag === '--email') args.account.email = argv[++i];
    else if (flag === '--phone') args.account.phone = argv[++i];
    else if (flag === '--html') args.html = argv[++i];
    else if (!args.file) args.file = flag;
  }
  return args;
}

async function main() {
  const { file, account, html } = parseArgs(process.argv.slice(2));
  if (!file) {
    console.error('Usage: npm run pii-preview --prefix server -- <cv.pdf|cv.docx> [--name "..."] [--email ...] [--phone ...] [--html out.html]');
    process.exitCode = 1;
    return;
  }

  // npm runs the script from server/; INIT_CWD is where the command was typed.
  const typedFrom = process.env.INIT_CWD ?? process.cwd();
  const { text, nameHint } = await extractResume(path.resolve(typedFrom, file));
  const cleanText = sanitiseResumeText(text);
  const loggedIn = Object.keys(account).length > 0;
  const identity = withNameHint(loggedIn ? account : null, nameHint);

  // Capture the request instead of sending it; keep the mask's own log line.
  const sent = [];
  const maskLog = [];
  const realLog = console.log;
  const realWarn = console.warn;
  const realError = console.error;
  const realFetch = globalThis.fetch;
  console.log = (...parts) => {
    const line = parts.join(' ');
    if (line.startsWith('[pii-mask]')) maskLog.push(line);
  };
  console.warn = () => {};
  console.error = () => {};
  globalThis.fetch = async (_url, init) => {
    sent.push(JSON.parse(init.body));
    return new Response(JSON.stringify({
      id: 'preview', choices: [{ index: 0, message: { role: 'assistant', content: '{}' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 1, completion_tokens: 1 },
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  try {
    await analyzeResume(cleanText, { identity }).catch(() => {});
  } finally {
    console.log = realLog;
    console.warn = realWarn;
    console.error = realError;
    globalThis.fetch = realFetch;
  }

  const user = sent.flatMap((body) => body.messages).find((m) => m.role === 'user')?.content ?? '';
  const resume = (user.split('<RESUME>')[1] ?? user).split('</RESUME>')[0].trim();

  console.log(`File:            ${file}`);
  console.log(`Uploaded as:     ${loggedIn ? `logged in (${account.fullName ?? 'no name'})` : 'guest'}`);
  console.log(`Name from layout: ${nameHint ?? '(none found)'}`);
  console.log(`Mask log:        ${maskLog.join(' ; ') || '(nothing sent)'}`);
  console.log('\n──── What the model provider receives ────\n');
  console.log(resume);

  if (html) {
    const out = path.resolve(typedFrom, html);
    await fs.writeFile(out, renderDemoDocument({
      file: path.basename(file),
      uploadedAs: loggedIn ? `a logged-in account (${account.fullName ?? 'no name'})` : 'a guest',
      nameHint,
      original: cleanText,
      masked: resume,
      command: `npm run pii-preview --prefix server -- ${file} --html ${html}`,
    }));
    console.log(`\nSide-by-side page written to ${out}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
