/**
 * Tests for the outbound PII mask.
 *
 * Two things are being proven here, and the second matters as much as the
 * first:
 *
 *   1. Contact PII does not reach the provider.
 *   2. Everything the features actually need DOES.
 *
 * A mask that passes (1) by deleting half the document would break the resume
 * review, the interview questions and the gap engine, all of which cite
 * employers, projects, skills, qualifications and dates. So every masking
 * assertion below is paired with a preservation assertion, and there is a
 * dedicated block for the content that must survive.
 *
 * Run: npm test --prefix ai-service
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  maskPii,
  inspectMaskedPii,
  maskPiiDeep,
  maskMessages,
  inferNameFromHeader,
  MASK,
} from '../src/utils/piiMask.js';
import { withOutboundMasking, MissingMaskContextError } from '../src/utils/aiClient.js';

/** Asserts the text no longer contains a value, with a readable failure. */
const assertGone = (text, value, label) =>
  assert.ok(!text.includes(value), `${label} leaked: ${JSON.stringify(value)} still present in ${JSON.stringify(text)}`);

const assertKept = (text, value) =>
  assert.ok(text.includes(value), `${JSON.stringify(value)} should have survived masking, got ${JSON.stringify(text)}`);

/* ── Email ──────────────────────────────────────────────────────────────── */

describe('email masking', () => {
  it('masks a plain address', () => {
    const out = maskPii('Contact: rahim.uddin@gmail.com for details');
    assertGone(out, 'rahim.uddin@gmail.com', 'email');
    assertKept(out, MASK.email);
  });

  it('masks addresses with digits, plus tags and subdomains', () => {
    for (const email of [
      'rahim2019@student.aiub.edu',
      'r.uddin+jobs@outlook.com',
      'tanvir_h@cse.buet.ac.bd',
      'FIRSTNAME.LASTNAME@COMPANY.COM.AU',
    ]) {
      const out = maskPii(`Email: ${email}`);
      assertGone(out, email, 'email');
    }
  });

  it('leaves the word "email" alone when there is no address', () => {
    const out = maskPii('Your contact section is missing an email address.');
    assert.equal(out, 'Your contact section is missing an email address.');
  });
});

/* ── Phone: Bangladesh ──────────────────────────────────────────────────── */

describe('Bangladeshi phone masking', () => {
  it('masks every common written form', () => {
    for (const phone of [
      '01712345678',
      '+8801712345678',
      '+880 1712 345678',
      '+880 1712-345678',
      '8801812345678',
      '01912-345678',
      '01534567890',
    ]) {
      const out = maskPii(`Mobile: ${phone}`);
      assertGone(out, phone, 'BD phone');
      assertKept(out, MASK.phone);
    }
  });

  it('does not match a number with an invalid operator prefix', () => {
    // 012... is not an allocated BD mobile prefix; the rule requires 1[3-9].
    const out = maskPii('Reference number 01212345678 issued 2019');
    assertKept(out, '2019');
  });
});

/* ── Phone: Australia ───────────────────────────────────────────────────── */

describe('Australian phone masking', () => {
  it('masks mobile and landline forms', () => {
    for (const phone of [
      '0412 345 678',
      '0412345678',
      '+61 412 345 678',
      '+61412345678',
      '(02) 9876 5432',
      '+61 2 9876 5432',
      '03 9876 5432',
    ]) {
      const out = maskPii(`Phone: ${phone}`);
      assertGone(out, phone, 'AU phone');
      assertKept(out, MASK.phone);
    }
  });
});

/* ── Phone: international ───────────────────────────────────────────────── */

describe('international phone masking', () => {
  it('masks +CC forms from other countries', () => {
    for (const phone of [
      '+44 7700 900123',
      '+1 415 555 0132',
      '+91 98765 43210',
      '+65 9123 4567',
      '+971 50 123 4567',
    ]) {
      const out = maskPii(`Tel: ${phone}`);
      assertGone(out, phone, 'international phone');
      assertKept(out, MASK.phone);
    }
  });
});

/* ── Numbers that must NOT be mistaken for phones ───────────────────────── */

describe('numeric false positives', () => {
  it('leaves grades, years, date ranges and metrics intact', () => {
    const text = [
      'CGPA: 3.75 out of 4.00',
      'SSC 2016, HSC 2018, BSc 2019-2023',
      'Increased throughput by 45% across 3 teams',
      'Managed a budget of 250000 BDT',
      'Scores: 55 / 35 / 20',
    ].join('\n');

    assert.equal(maskPii(text), text);
  });
});

/* ── Address ────────────────────────────────────────────────────────────── */

describe('address masking', () => {
  it('masks the Bangladeshi house/road form', () => {
    const out = maskPii('House 42, Road 7, Block C, Banani, Dhaka-1213');
    assertGone(out, 'House 42, Road 7', 'BD address');
    assertGone(out, 'Dhaka-1213', 'BD postcode');
    assertKept(out, MASK.address);
  });

  it('masks western street and state/postcode forms', () => {
    const street = maskPii('14 Elizabeth Street, Hawthorn VIC 3122');
    assertGone(street, '14 Elizabeth Street', 'street address');
    assertGone(street, 'Hawthorn VIC 3122', 'AU suburb/postcode');
  });

  it('does not eat a sentence that merely mentions an address field', () => {
    const text = 'Remove your postal address from an international CV.';
    assert.equal(maskPii(text), text);
  });
});

/* ── Profile URLs ───────────────────────────────────────────────────────── */

describe('URL masking', () => {
  it('masks LinkedIn, GitHub and personal sites', () => {
    for (const url of [
      'linkedin.com/in/rahim-uddin-1a2b3c',
      'https://www.linkedin.com/in/rahimuddin',
      'github.com/rahimu',
      'https://rahimu.github.io',
      'https://rahim-portfolio.vercel.app/projects',
    ]) {
      const out = maskPii(`Profile: ${url}`);
      assertGone(out, url, 'profile URL');
      assertKept(out, MASK.url);
    }
  });
});

describe('personal domains built from a known name', () => {
  const identity = { fullName: 'Samin Mahmud' };

  it('masks a portfolio domain named after the candidate', () => {
    const out = maskPii('Website: saminmahmud.com', identity);
    assertGone(out, 'saminmahmud.com', 'personal domain');
    assertKept(out, MASK.url);
  });

  it('masks it with a scheme and a path', () => {
    const out = maskPii('https://www.saminmahmud.com/projects', identity);
    assertGone(out, 'saminmahmud.com', 'personal domain');
  });

  it('leaves employer and job-board domains alone', () => {
    // The whole reason this rule is keyed on a known name rather than on
    // domain shape: these must survive, and a generic rule would eat them.
    const text = 'Applied via Bdjobs.com; previously at brac.net and therapbd.com';
    assert.equal(maskPii(text, identity), text);
  });

  it('does nothing when no name is known', () => {
    const text = 'Website: saminmahmud.com';
    assert.equal(maskPii(text), text);
  });
});

/* ── Known-string names ─────────────────────────────────────────────────── */

describe('known-name masking', () => {
  const identity = { fullName: 'Rahim Uddin Chowdhury' };

  it('masks the full stored name', () => {
    const out = maskPii('Rahim Uddin Chowdhury\nSoftware Engineer', identity);
    assertGone(out, 'Rahim Uddin Chowdhury', 'full name');
    assertKept(out, 'Software Engineer');
  });

  it('masks the name in a different case', () => {
    const out = maskPii('RAHIM UDDIN CHOWDHURY', identity);
    assertGone(out, 'RAHIM UDDIN CHOWDHURY', 'upper-cased name');
  });

  it('masks individual name tokens used elsewhere in the document', () => {
    const out = maskPii('Reference: contact Rahim directly.', identity);
    assertGone(out, 'Rahim', 'first name');
  });

  it('does not mask an employer that shares a name particle', () => {
    // 'Md' is in the non-identifying list precisely so this cannot happen.
    const out = maskPii('Worked at Md Textiles Ltd', { fullName: 'Md Karim' });
    assertKept(out, 'Textiles Ltd');
  });

  it('masks the stored email and phone as known values', () => {
    const out = maskPii(
      'Reach me on 0171-234 5678 or at r.chowdhury@example.org',
      { ...identity, email: 'r.chowdhury@example.org', phone: '0171-234 5678' }
    );
    assertGone(out, 'r.chowdhury@example.org', 'stored email');
    assertGone(out, '0171-234 5678', 'stored phone');
  });

  it('reports which rules fired without revealing the values', () => {
    const { findings } = inspectMaskedPii(
      'Rahim Uddin Chowdhury — rahim@example.com — 01712345678',
      identity
    );
    const serialised = JSON.stringify(findings);
    assertGone(serialised, 'rahim@example.com', 'email in findings');
    assertGone(serialised, '01712345678', 'phone in findings');
    assert.ok(findings.some((f) => f.rule === 'known-name'));
  });
});

/* ── Bangla ─────────────────────────────────────────────────────────────── */

describe('Bangla CVs', () => {
  // A Bangla-language CV header and one experience bullet. The contact details
  // are the same shapes a Bangla CV really carries: a Latin-script email, a
  // mobile number written in Bengali numerals, and a Bangla postal address.
  const BANGLA_CV = [
    'মোঃ রাহিম উদ্দিন',
    'ইমেইল: rahim.uddin@gmail.com',
    'মোবাইল: ০১৭১২৩৪৫৬৭৮',
    'ঠিকানা: বাসা ৪২, রোড ৭, ধানমন্ডি, ঢাকা-১২০৯',
    '',
    'অভিজ্ঞতা',
    'সফটওয়্যার ইঞ্জিনিয়ার, ব্র্যাক ব্যাংক লিমিটেড (২০২১-২০২৪)',
    'দক্ষতা: JavaScript, React, PostgreSQL',
  ].join('\n');

  const identity = { fullName: 'মোঃ রাহিম উদ্দিন' };

  it('masks an email inside Bangla text', () => {
    const out = maskPii(BANGLA_CV, identity);
    assertGone(out, 'rahim.uddin@gmail.com', 'email in Bangla CV');
    assertKept(out, MASK.email);
  });

  it('masks a mobile number written in Bengali numerals', () => {
    const out = maskPii(BANGLA_CV, identity);
    assertGone(out, '০১৭১২৩৪৫৬৭৮', 'Bengali-numeral phone');
    assertKept(out, MASK.phone);
  });

  it('masks a Bangla-script name stored on the account', () => {
    const out = maskPii(BANGLA_CV, identity);
    assertGone(out, 'মোঃ রাহিম উদ্দিন', 'Bangla name');
    assertKept(out, MASK.name);
  });

  it('masks a Bangla postal address', () => {
    const out = maskPii(BANGLA_CV, identity);
    assertGone(out, 'বাসা ৪২, রোড ৭', 'Bangla address');
  });

  it('keeps the employer, dates and skills a Bangla review needs', () => {
    const out = maskPii(BANGLA_CV, identity);
    assertKept(out, 'ব্র্যাক ব্যাংক লিমিটেড');
    assertKept(out, '২০২১-২০২৪');
    assertKept(out, 'সফটওয়্যার ইঞ্জিনিয়ার');
    assertKept(out, 'JavaScript, React, PostgreSQL');
  });
});

/* ── Substantive content must survive ───────────────────────────────────── */

describe('content preservation', () => {
  const CV = [
    'Rahim Uddin Chowdhury',
    'rahim.uddin@gmail.com | +880 1712-345678 | linkedin.com/in/rahimuddin',
    'House 42, Road 7, Dhanmondi, Dhaka-1209',
    '',
    'EXPERIENCE',
    'Senior Software Engineer, BRAC Bank Limited (2021-2024)',
    '- Led the Nagad payment reconciliation project, cutting settlement time by 38%',
    '- Mentored 4 junior engineers across the Retail Banking squad',
    'Software Engineer, Therap BD Ltd (2019-2021)',
    '',
    'EDUCATION',
    'BSc in Computer Science and Engineering, BUET, 2019, CGPA 3.82/4.00',
    'HSC, Notre Dame College, 2014',
    '',
    'SKILLS',
    'JavaScript, React, Node.js, PostgreSQL, Docker, AWS, Kubernetes',
    '',
    'CERTIFICATIONS',
    'AWS Certified Solutions Architect (2022)',
  ].join('\n');

  const identity = {
    fullName: 'Rahim Uddin Chowdhury',
    email: 'rahim.uddin@gmail.com',
    phone: '+880 1712-345678',
  };

  const masked = maskPii(CV, identity);

  it('removes every piece of contact PII', () => {
    for (const value of [
      'Rahim Uddin Chowdhury',
      'rahim.uddin@gmail.com',
      '+880 1712-345678',
      'linkedin.com/in/rahimuddin',
      'House 42, Road 7',
      'Dhaka-1209',
    ]) {
      assertGone(masked, value, 'contact PII');
    }
  });

  it('keeps every employer', () => {
    assertKept(masked, 'BRAC Bank Limited');
    assertKept(masked, 'Therap BD Ltd');
  });

  it('keeps every role title', () => {
    assertKept(masked, 'Senior Software Engineer');
    assertKept(masked, 'Software Engineer');
  });

  it('keeps project names and achievement metrics', () => {
    assertKept(masked, 'Nagad payment reconciliation project');
    assertKept(masked, '38%');
    assertKept(masked, 'Mentored 4 junior engineers');
    assertKept(masked, 'Retail Banking squad');
  });

  it('keeps education, institutions and grades', () => {
    assertKept(masked, 'BSc in Computer Science and Engineering');
    assertKept(masked, 'BUET');
    assertKept(masked, 'CGPA 3.82/4.00');
    assertKept(masked, 'Notre Dame College');
  });

  it('keeps every date and date range', () => {
    for (const date of ['2021-2024', '2019-2021', '2019', '2014', '2022']) {
      assertKept(masked, date);
    }
  });

  it('keeps the full skills list', () => {
    assertKept(masked, 'JavaScript, React, Node.js, PostgreSQL, Docker, AWS, Kubernetes');
  });

  it('keeps certifications', () => {
    assertKept(masked, 'AWS Certified Solutions Architect');
  });

  it('keeps the section headings that give the document its shape', () => {
    for (const heading of ['EXPERIENCE', 'EDUCATION', 'SKILLS', 'CERTIFICATIONS']) {
      assertKept(masked, heading);
    }
  });
});

/* ── Header name inference ──────────────────────────────────────────────── */

describe('inferNameFromHeader', () => {
  it('reads a name off the first line of a CV', () => {
    assert.equal(
      inferNameFromHeader('Rahim Uddin Chowdhury\nrahim@example.com\nDhaka'),
      'Rahim Uddin Chowdhury'
    );
  });

  it('reads a Bangla name', () => {
    assert.equal(
      inferNameFromHeader('মোঃ রাহিম উদ্দিন\nইমেইল: rahim@example.com'),
      'মোঃ রাহিম উদ্দিন'
    );
  });

  it('skips a section heading and a contact line', () => {
    assert.equal(inferNameFromHeader('CURRICULUM VITAE\nrahim@example.com'), null);
  });

  it('returns null rather than guessing at a line with digits in it', () => {
    assert.equal(inferNameFromHeader('42 Software Projects\nDetails below'), null);
  });

  it('is safe on empty and missing input', () => {
    assert.equal(inferNameFromHeader(''), null);
    assert.equal(inferNameFromHeader(undefined), null);
  });
});

/* ── Structure handling ─────────────────────────────────────────────────── */

describe('maskPiiDeep', () => {
  it('masks string values, never keys, and leaves numbers alone', () => {
    const out = maskPiiDeep(
      {
        email: 'rahim@example.com',
        score: 87,
        nested: { list: ['call 01712345678', 'BRAC Bank Limited'] },
      },
      {}
    );

    assert.ok(Object.hasOwn(out, 'email'), 'keys must not be masked');
    assert.equal(out.email, MASK.email);
    assert.equal(out.score, 87);
    assert.equal(out.nested.list[0], `call ${MASK.phone}`);
    assert.equal(out.nested.list[1], 'BRAC Bank Limited');
  });
});

describe('idempotence', () => {
  it('re-masking masked output changes nothing', () => {
    const identity = { fullName: 'Rahim Uddin', email: 'rahim@example.com' };
    const once = maskPii('Rahim Uddin, rahim@example.com, 01712345678, House 4, Road 2', identity);
    assert.equal(maskPii(once, identity), once);
  });
});

/* ── The chokepoint ─────────────────────────────────────────────────────── */

describe('outbound masking chokepoint', () => {
  /** A minimal stub with the shape the wrapper expects. */
  const stubClient = (record) => ({
    chat: {
      completions: {
        create: async (body) => {
          record.push(body);
          return { choices: [{ message: { content: '{}' } }] };
        },
      },
    },
  });

  it('masks messages before they reach the provider', async () => {
    const sent = [];
    const client = withOutboundMasking(stubClient(sent));

    await client.chat.completions.create({
      model: 'test',
      maskContext: { label: 'test', fullName: 'Rahim Uddin' },
      messages: [
        { role: 'system', content: 'You are a reviewer.' },
        { role: 'user', content: 'Rahim Uddin, rahim@example.com, 01712345678' },
      ],
    });

    const payload = sent[0].messages[1].content;
    assertGone(payload, 'Rahim Uddin', 'name at the chokepoint');
    assertGone(payload, 'rahim@example.com', 'email at the chokepoint');
    assertGone(payload, '01712345678', 'phone at the chokepoint');
  });

  it('throws rather than sending anything when no masking context is given', async () => {
    const sent = [];
    const client = withOutboundMasking(stubClient(sent));

    await assert.rejects(
      () => client.chat.completions.create({
        model: 'test',
        messages: [{ role: 'user', content: 'rahim@example.com' }],
      }),
      MissingMaskContextError
    );

    assert.equal(sent.length, 0, 'nothing may be sent when the context is missing');
  });

  it('strips maskContext from the body so the provider never receives it', async () => {
    const sent = [];
    const client = withOutboundMasking(stubClient(sent));

    await client.chat.completions.create({
      model: 'test',
      maskContext: { label: 'test' },
      messages: [{ role: 'user', content: 'hello' }],
    });

    assert.ok(!Object.hasOwn(sent[0], 'maskContext'), 'maskContext must not travel to the provider');
  });

  it('allows an explicit opt-out for a payload with no user content', async () => {
    const sent = [];
    const client = withOutboundMasking(stubClient(sent));

    await client.chat.completions.create({
      model: 'test',
      maskContext: 'none',
      messages: [{ role: 'user', content: 'Reply with the single word OK.' }],
    });

    assert.equal(sent[0].messages[0].content, 'Reply with the single word OK.');
  });

  it('leaves the rest of the client surface reachable', async () => {
    // The wrapper proxies rather than copying, so anything else the SDK
    // exposes still works. A future call site reaching for client.models or
    // an APIPromise helper must not find it missing.
    const stub = stubClient([]);
    stub.baseURL = 'https://example.invalid/v1';
    stub.models = { list: async () => ['a'] };
    stub.chat.somethingElse = 'kept';

    const client = withOutboundMasking(stub);

    assert.equal(client.baseURL, 'https://example.invalid/v1');
    assert.deepEqual(await client.models.list(), ['a']);
    assert.equal(client.chat.somethingElse, 'kept');
  });

  it('passes a body with no messages array through untouched', async () => {
    // Malformed for this endpoint. The SDK should raise its own error about
    // that, rather than this layer replacing it with an empty conversation
    // and turning a clear failure into a confusing one.
    const sent = [];
    const client = withOutboundMasking(stubClient(sent));

    await client.chat.completions.create({ model: 'test', maskContext: { label: 'test' } });

    assert.ok(!Object.hasOwn(sent[0], 'messages'));
  });

  it('preserves streaming and other completion parameters', async () => {
    const sent = [];
    const client = withOutboundMasking(stubClient(sent));

    await client.chat.completions.create({
      model: 'test',
      stream: true,
      temperature: 0.4,
      max_tokens: 900,
      maskContext: { label: 'test' },
      messages: [{ role: 'user', content: 'hi' }],
    });

    assert.equal(sent[0].stream, true);
    assert.equal(sent[0].temperature, 0.4);
    assert.equal(sent[0].max_tokens, 900);
  });
});

/* ── maskMessages ───────────────────────────────────────────────────────── */

describe('maskMessages', () => {
  it('masks a system prompt as well as a user message', () => {
    const { messages } = maskMessages(
      [
        { role: 'system', content: 'Write feedback for Rahim Uddin.' },
        { role: 'user', content: 'rahim@example.com' },
      ],
      { fullName: 'Rahim Uddin' }
    );

    assertGone(messages[0].content, 'Rahim Uddin', 'name in a system prompt');
    assertGone(messages[1].content, 'rahim@example.com', 'email in a user message');
  });

  it('leaves roles untouched', () => {
    const { messages } = maskMessages(
      [{ role: 'assistant', content: 'ok' }, { role: 'user', content: 'ok' }],
      {}
    );
    assert.deepEqual(messages.map((m) => m.role), ['assistant', 'user']);
  });
});
