/**
 * Tests for the mask's personal-detail, identifier, contact and referee rules,
 * and for the over-masking each one must not cause.
 *
 * The cases come from the resume audit (docs/qa/PII_MASK_AUDIT.md): every
 * format here was seen leaking, or being over-masked, in a real extracted CV.
 * Bangladeshi formats first, because that is the market.
 *
 * Run: npm test --prefix ai-service
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { maskPii, inspectMaskedPii, maskMessages, inferNameFromHeader, MASK } from '../src/utils/piiMask.js';

const assertGone = (text, value) =>
  assert.ok(!text.includes(value), `${JSON.stringify(value)} leaked: ${JSON.stringify(text)}`);
const assertKept = (text, value) =>
  assert.ok(text.includes(value), `${JSON.stringify(value)} was lost: ${JSON.stringify(text)}`);

/* ── The Bangladeshi personal-information block ─────────────────────────── */

describe('a Bangladeshi Personal Information block', () => {
  const block = [
    'Personal Information',
    "Father's Name : Md. Abdul Jalil Sheikh",
    "Mother's Name : Mst. Rokeya Begum",
    "Spouse's Name : Mitu Rani Saha",
    'Date of Birth : 15-03-1990',
    'National ID No : 19902692512345678',
    'Permanent Address : Village: Char Bhadrasan, Post: Char Bhadrasan, Upazila: Char Bhadrasan, District:',
    'Faridpur',
    'Religion : Islam',
    'Marital Status : Married',
    'Blood Group : B+',
    'Nationality : Bangladeshi',
  ].join('\n');
  const out = maskPii(block);

  it('masks every value', () => {
    for (const value of ['Abdul Jalil Sheikh', 'Rokeya Begum', 'Mitu Rani Saha', '15-03-1990', '19902692512345678',
      'Char Bhadrasan', 'Faridpur', 'Islam', 'Married', 'B+']) assertGone(out, value);
  });

  it('keeps every label, so the reviewer can still advise on the field', () => {
    for (const label of ["Father's Name :", "Mother's Name :", 'Date of Birth :', 'National ID No :', 'Religion :',
      'Marital Status :', 'Blood Group :', 'Permanent Address :']) assertKept(out, label);
  });

  it('uses a placeholder that says what kind of value it was', () => {
    assertKept(out, `Father's Name : ${MASK.name}`);
    assertKept(out, `Date of Birth : ${MASK.dob}`);
    assertKept(out, `Religion : ${MASK.personal}`);
    assertKept(out, `National ID No : ${MASK.id}`);
  });

  it('leaves nationality alone — it is not identifying and the review uses it', () => {
    assertKept(out, 'Nationality : Bangladeshi');
  });

  it('reads labels written without the possessive', () => {
    assertGone(maskPii('Father Name : Tariq Mehmood'), 'Tariq Mehmood');
    assertGone(maskPii('Fathers Name: Abul Kashem'), 'Abul Kashem');
  });

  it('stops a value at the next label when a table has been flattened', () => {
    const flat = maskPii('Religion : Islam Marital Status : Married Nationality : Bangladeshi');
    assertGone(flat, 'Islam');
    assertGone(flat, 'Married');
    assertKept(flat, 'Nationality : Bangladeshi');
  });

  it('reads a label on its own line with the value below it, as in a sidebar', () => {
    const out2 = maskPii('Blood Group\nO+\nMarital Status\nMarried\nSKILLS');
    assertGone(out2, 'O+');
    assertGone(out2, 'Married');
    assertKept(out2, 'SKILLS');
  });

  it('does not take the next line for a label word that merely ends a line of prose', () => {
    const prose = 'Please make sure the reviewer can see your current home address\nExperience at BRAC Bank';
    assert.equal(maskPii(prose), prose);
  });

  it('masks a passport block for overseas employment', () => {
    const out3 = maskPii('Passport No : A01234567\nDate of Issue : 10-01-2022\nDate of Expiry : 09-01-2032');
    for (const value of ['A01234567', '10-01-2022', '09-01-2032']) assertGone(out3, value);
  });

  it('masks S/O and D/O written without a colon', () => {
    assertGone(maskPii('Rohan Mehta S/O Suresh Mehta'), 'Suresh');
  });
});

describe('Bangla labels, including the damage PDF extraction does to them', () => {
  it('masks values after intact Bangla labels', () => {
    const out = maskPii('পিতার নাম : মোঃ আব্দুল হাকিম\nমাতার নাম : রাশিদা বেগম\nধর্ম : ইসলাম');
    for (const value of ['আব্দুল হাকিম', 'রাশিদা বেগম', 'ইসলাম']) assertGone(out, value);
    assertKept(out, 'পিতার নাম :');
  });

  it('masks after labels that lost a conjunct or reph in extraction', () => {
    // As a PDF text layer really returns them: জন্ম → জ, ধর্ম → ধম,
    // স্বামীর → ামীর, বৈবাহিক অবস্থা → বেবাহিক অব া.
    const out = maskPii('জ তারিখ : ১২ জানুয়ারি ১৯৯৪\nধম : ইসলাম\nামীর নাম : জাহিদ হাসান\nবেবাহিক অব া : বিবাহিত');
    for (const value of ['১২ জানুয়ারি ১৯৯৪', 'ইসলাম', 'জাহিদ হাসান', 'বিবাহিত']) assertGone(out, value);
  });

  it('does not let a damaged single-word label match inside another word', () => {
    // 'গ্রাম' must not match the 'াম' in 'গাম' mid-value and cut the value short.
    const out = maskPii('ঠিকানা: গাম: চরপাড়া, ডাকঘর: কালিহাতী');
    assertGone(out, 'চরপাড়া');
    assertGone(out, 'কালিহাতী');
  });

  it('masks a Bangla NID written in Bengali numerals', () => {
    assertGone(maskPii('জাতীয় পরিচয়পত্র নং : ১৯৯৪২৬৯২৫১২৩৪৫৬৭৮'), '১৯৯৪২৬৯২৫১২৩৪৫৬৭৮');
  });
});

/* ── Identifiers ────────────────────────────────────────────────────────── */

describe('identifiers', () => {
  it('masks bare Bangladeshi NIDs of 10, 13 and 17 digits', () => {
    for (const nid of ['5102938475', '8234567890123', '19902692512345678']) assertGone(maskPii(`NID ${nid}`), nid);
  });

  it('masks register numbers after their keyword, keeping the keyword', () => {
    const cases = [
      ['BMDC Reg.: A-65432', 'A-65432', 'BMDC Reg.:'],
      ['Pharmacy Council of Bangladesh Reg. No. A-12345', 'A-12345', 'Pharmacy Council of Bangladesh Reg. No.'],
      ['PID accreditation card no. 4417', '4417', 'PID accreditation card no.'],
      ['NSW Driver Licence 12345678 (C, MR)', '12345678', 'NSW Driver Licence'],
      ['NDIS Worker Screening\nCheck 1234567 (valid to 2028)', '1234567', 'Check'],
      ['AHPRA registration: NMW0001234567', 'NMW0001234567', 'AHPRA registration:'],
    ];
    for (const [input, value, kept] of cases) {
      const out = maskPii(input);
      assertGone(out, value);
      assertKept(out, kept);
    }
  });

  it('never takes a word as an identifier prefix', () => {
    // The two over-masks the audit found: a month and a label word.
    const nurse = 'Graduate Registered Nurse, Epworth HealthCare, Richmond Jan 2019 – Jan 2021';
    assert.equal(maskPii(nurse), nurse);
    const accountant = 'Chartered Accountant (All India Rank 38), ICAI Nov 2021';
    assert.equal(maskPii(accountant), accountant);
  });

  it('keeps course codes, grades, years and scores', () => {
    const text = 'Certificate III in Hairdressing (SHB30416), 2016. SSC GPA 5.00, CGPA 3.72/4.00. Class 1 Medical (valid to 03/2027).';
    assert.equal(maskPii(text), text);
  });

  it('masks long dashed identifiers whole', () => {
    assert.equal(maskPii('Citizenship No : 12-01-73-01234'), `Citizenship No : ${MASK.id}`);
    assertGone(maskPii('CNIC 35202-1234567-1'), '35202-1234567-1');
  });

  it('leaves dates alone', () => {
    for (const date of ['01-01-1988 to 2019', '1990-05-02 onwards', '2019-2023']) assertKept(maskPii(date), date.split(' ')[0]);
  });
});

/* ── Phones ─────────────────────────────────────────────────────────────── */

describe('phones', () => {
  it('masks every Bangladeshi mobile grouping', () => {
    for (const phone of ['01712-345678', '01712345678', '017 1122 3344', '0171-2345678', '01712 000 222',
      '+880 1712-345678', '+880-1712-000111', '+8801712345678', '০১৭১৫-৩৩৪৪৫৫']) {
      assertGone(maskPii(`Mobile: ${phone}`), phone);
    }
  });

  it('masks local numbers written with a trunk zero', () => {
    for (const phone of ['07700 900 372', '0917 123 4567', '022 2634 5678', '(09) 555 0876', '0161 234 5000']) {
      assertGone(maskPii(`Call ${phone} today`), phone);
    }
  });

  it('masks any number after a phone label, but only up to the next field', () => {
    const out = maskPii('Mobile: +61 491 570 157 | Email: a@b.com | AHPRA: PHY0001987654');
    assertKept(out, `Mobile: ${MASK.phone} |`);
    assertKept(out, `AHPRA: ${MASK.id}`);
    assertGone(maskPii('Local: 9123 4567'), '9123 4567');
  });

  it('masks the account phone however the CV groups it', () => {
    const out = maskPii('Alt: 0171-2345678', { phone: '+8801712345678' });
    assertGone(out, '2345678');
  });

  it('does not take the tail of a passport number for the account phone', () => {
    // '+65 9123 4567' once matched the '1234567' inside 'K1234567A'.
    assertKept(maskPii('Passport : K1234567A', { phone: '+65 9123 4567' }), 'Passport :');
    assertGone(maskPii('Passport : K1234567A', { phone: '+65 9123 4567' }), 'K1234567A');
    assertKept(maskPii('Tel: (212) 555-0147', { phone: '(212) 555-0147' }), `Tel: ${MASK.phone}`);
  });
});

/* ── Addresses ──────────────────────────────────────────────────────────── */

describe('addresses', () => {
  it('masks Bangladeshi address forms whole', () => {
    const cases = [
      'House 14, Road 3, Sector 7, Uttara, Dhaka-1230',
      'Holding No. 12/A, Road No. 5, Block-B, Banani, Dhaka 1213',
      'Flat 5C, Green Valley Apartments, 45/1 Indira Road, Farmgate, Dhaka-1215',
    ];
    for (const address of cases) assert.equal(maskPii(address), MASK.address, address);
  });

  it('masks a village address after its labels', () => {
    const out = maskPii('Permanent Address: Village: Kalir Bazar, P.O: Kalir Bazar, P.S: Fatullah, Dist: Narayanganj');
    for (const value of ['Kalir Bazar', 'Fatullah', 'Narayanganj']) assertGone(out, value);
  });

  it('widens a street to the rest of its line', () => {
    assert.equal(maskPii('22 Wattle Street, Penrith NSW 2750'), MASK.address);
    assert.equal(maskPii('350 West 57th Street, Apt 12C, New York, NY 10019'), MASK.address);
  });

  it('does not read a year as a postcode', () => {
    for (const text of ['Certificate III — TAFE NSW 2015 – 2019', 'Certificate III — TAFE SA 2020',
      'MSS, Mass Communication — University of Dhaka 2015', 'Production Supervisor — DBL Group, Dhaka 2019 Present']) {
      assert.equal(maskPii(text), text);
    }
  });

  it('does not read a qualification level or a court as an address', () => {
    for (const text of ['NVQ Level 4, Professional Cookery', 'Level 3 Food Hygiene', 'Argued 3 Supreme Court appeals in 2022.']) {
      assert.equal(maskPii(text), text);
    }
  });
});

/* ── Online identity ────────────────────────────────────────────────────── */

describe('handles and sites', () => {
  it('masks bare handles and labelled ids', () => {
    assertGone(maskPii('Follow my reporting at @rafsan_reports.'), 'rafsan_reports');
    assertKept(maskPii('Follow my reporting at @rafsan_reports.'), `${MASK.url}.`);
    assertGone(maskPii('Skype: tasnim.mithila'), 'tasnim.mithila');
  });

  it('masks the candidate’s own site when it shares their email domain', () => {
    const out = maskPii('bookings@hairbyjess.com.au · hairbyjess.com.au');
    assertGone(out, 'hairbyjess');
  });

  it('leaves a webmail domain mentioned elsewhere alone', () => {
    assertKept(maskPii('me@gmail.com. Applied via gmail.com jobs'), 'gmail.com jobs');
  });
});

/* ── Referees ───────────────────────────────────────────────────────────── */

describe('referees', () => {
  const refs = [
    'References',
    'Mr. Tanvir Ahmed',
    'Branch Manager, BRAC Bank PLC, Gulshan',
    'Phone: +880 1713-445566',
    'Dr. Farhana Islam',
    'Associate Professor, IBA, University of Dhaka',
    'Mobile: 01819-778899',
    'DECLARATION',
    'I hereby declare that the information above is true.',
  ].join('\n');
  const out = maskPii(refs);

  it('masks each referee’s name and contact', () => {
    for (const value of ['Tanvir Ahmed', 'Farhana Islam', '1713-445566', '01819-778899']) assertGone(out, value);
  });

  it('keeps their roles and organisations, and the headings around them', () => {
    for (const value of ['Branch Manager, BRAC Bank PLC', 'University of Dhaka', 'DECLARATION']) assertKept(out, value);
  });
});

/* ── Names ──────────────────────────────────────────────────────────────── */

describe('known names', () => {
  it('matches however the CV writes the name', () => {
    const cases = [
      ['Siobhán O’Sullivan', "Siobhan O'Sullivan"],
      ['Siobhán O Sullivan', "Siobhan O'Sullivan"],
      ['MD. ABDUL KARIM SHEIKH', 'Md. Abdul Karim Sheikh'],
      ['LIAM\nO CONNOR', 'Liam O’Connor'],
      ['Valentina Gómez', 'Valentina Gomez'],
    ];
    for (const [text, name] of cases) assert.equal(maskPii(text, { fullName: name }), MASK.name, `${text} vs ${name}`);
  });

  it('matches a Bangla name however its ya-nukta is encoded', () => {
    const precomposed = 'মোছাঃ ফারজানা ইয়াসমিন'.replace('য়', 'য়');
    assert.equal(maskPii('মোছাঃ ফারজানা ইয়াসমিন', { extraNames: [precomposed] }), MASK.name);
  });

  it('masks a bracketed nickname as a name of its own', () => {
    assert.equal(maskPii('ZHANG Wei (David)', { extraNames: ['ZHANG Wei (David)'] }), MASK.name);
    assertGone(maskPii('Ask for David at reception', { fullName: 'David Zhang' }), 'David');
  });

  it('masks a word of the name only where it stands as a name', () => {
    assertGone(maskPii('Clients know me as Jess.', { fullName: 'Jess Tran' }), 'Jess');
    assertKept(maskPii('Started as a Line Cook.', { fullName: 'Daniel Cook' }), 'Line Cook');
    assertKept(maskPii('Box Hill Institute, 2018', { fullName: 'Grace Hill' }), 'Box Hill Institute');
    assertKept(maskPii('I rose to Store Manager.', { fullName: 'Rose Walker' }), 'rose to Store Manager');
  });

  it('masks a surname that names the candidate’s own business', () => {
    assertGone(maskPii('Owner — Thompson Plumbing (sole trader)', { fullName: 'Jack Thompson' }), 'Thompson');
  });

  it('keeps an employer that merely shares a name particle', () => {
    assertKept(maskPii('Worked at Md Textiles Ltd', { fullName: 'Md Karim' }), 'Md Textiles Ltd');
  });
});

describe('inferNameFromHeader', () => {
  it('reads a name with a bracketed nickname', () => {
    assert.equal(inferNameFromHeader('ZHANG Wei (David)\nPhysiotherapist'), 'ZHANG Wei (David)');
  });
});

/* ── System prompts ─────────────────────────────────────────────────────── */

describe('system prompts', () => {
  it('are masked for values but never rewritten by the label or referee rules', () => {
    const prompt = [
      'REFERENCES',
      'Do not reproduce referee names.',
      '',
      'PERSONAL DETAILS, PHOTOGRAPHS, DECLARATIONS',
      "- Father's name or mother's name",
      '- Religion: flag it for an international CV.',
    ].join('\n');
    const { messages } = maskMessages([{ role: 'system', content: prompt }], {});
    assert.equal(messages[0].content, prompt);
  });
});

/* ── Reporting what was removed ─────────────────────────────────────────── */

describe('collectValues', () => {
  it('reports exactly the removed text, not the label kept around it', () => {
    const { values } = inspectMaskedPii('Religion : Islam\nLicence No. 312456C', {}, { collectValues: true });
    assert.deepEqual(values.map((v) => v.value).sort(), ['312456C', 'Islam']);
  });

  it('reports nothing unless asked', () => {
    assert.equal(inspectMaskedPii('Religion : Islam').values, undefined);
  });
});

describe('idempotence of the new rules', () => {
  it('re-masking masked output changes nothing', () => {
    const cv = [
      "Father's Name : Md. Abdul Jalil",
      'Date of Birth : 15-03-1990',
      'NID : 19902692512345678',
      'Permanent Address : Village: Char Bhadrasan, Upazila: Char Bhadrasan',
      'Mobile: 017 1122 3344',
      'References',
      'Engr. Mizanur Rahman',
      'Mobile: 01711-908070',
    ].join('\n');
    const once = maskPii(cv);
    assert.equal(maskPii(once), once);
  });
});
