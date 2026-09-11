/**
 * The worked example shown by "See a sample review".
 *
 * It used to be a single English object inlined in ResumeReview.jsx. That made
 * the sample the one screen guaranteed to be in the wrong language: a visitor
 * who had switched to Bangla and had not yet uploaded anything saw an English
 * wall of text as their first impression of what the tool produces.
 *
 * Two things are deliberately NOT translated in the Bangla copy, and they are
 * the same two the live reviewer is instructed to leave alone:
 *
 *  - language_grammar.issues[].original and .corrected. These quote the
 *    candidate's English CV and give the English replacement to paste back in.
 *    Rendering them in Bangla would tell a user to put Bangla into an English
 *    document, which is worse advice than none.
 *  - ATS keywords and heading names. They are matched literally against English
 *    job adverts and applicant tracking systems.
 *
 * Scores stay numeric so the same rendering and banding logic applies to both.
 */

const en = {
  overall_score: 52,
  formatting: {
    score: 61,
    feedback: 'The resume has a clear section structure and readable layout. However, several legacy Bangladeshi conventions are present that would limit performance in modern ATS systems used by multinationals.',
    issues: [
      { section: 'Contact header', issue: 'Missing LinkedIn URL', suggestion: 'Add your LinkedIn profile URL (e.g. linkedin.com/in/yourname) — Bangladeshi MNC recruiters increasingly verify digital footprints before shortlisting.' },
      { section: 'Skills', issue: '"Computer Knowledge" heading is outdated', suggestion: 'Rename to "Technical Skills" — modern recruiters and ATS systems expect this standard heading.' },
      { section: 'Footer', issue: 'Declaration section adds no value', suggestion: 'Remove the declaration section entirely to reclaim space for skills or achievements.' },
    ],
  },
  content_quality: {
    score: 48,
    feedback: 'The educational background is solid but the experience section critically lacks quantified achievements. Recruiters will not shortlist without specific outcomes using the CAR method.',
    strengths: [
      'Educational background shows relevant qualification (Diploma in Power Technology)',
      'Training section includes practical hands-on skills aligned to the electrical sector',
    ],
    weaknesses: [
      'Experience section lists topic areas only — no actual job roles, employers, dates, or outcomes',
      'Career objective is generic ("seeking a challenging position in a dynamic environment") — replace with a targeted professional summary naming the power sector and your key qualifications',
      'Training entries missing date ranges — show "Jan 2023 – Mar 2023", not just "3 months"',
    ],
  },
  language_grammar: {
    score: 61,
    feedback: 'Generally readable, but weak verb choices and vague descriptors reduce professional impact. British English should be standardised throughout.',
    issues: [
      { original: 'Responsible for handling electrical maintenance', corrected: 'Spearheaded electrical maintenance operations for a 12-unit residential complex', type: 'Weak action verb' },
      { original: 'Good command in English', corrected: 'Professional working proficiency in English (IELTS 6.5)', type: 'Vague language descriptor' },
      { original: 'organization (used alongside "organisation")', corrected: 'organisation — standardise to British English throughout', type: 'British/American English mix' },
    ],
  },
  action_items: [
    'Experience section: Add at least 2 real job roles with employer, date range, and 2–3 CAR-method bullet points each — this is the single biggest gap recruiters will flag.',
    'Training section: Add start–end dates to all entries (e.g. "Jan 2023 – Mar 2023") — dates show WHEN you trained, not just how long.',
    'Career objective: Replace with a 2-sentence professional summary targeting a specific sector (power, electrical, or renewable energy) and naming your strongest qualification.',
    'Skills section: Research 5 current job ads in your target sector and mirror their exact keyword language — ATS systems score heavily on keyword match.',
  ],
  ats_analysis: {
    inferred_role: 'Electrical Engineer',
    inferred_industry: 'Power & Energy',
    keyword_hits: ['Electrical Wiring', 'Power Systems', 'Industrial Attachment', 'AutoCAD', 'Circuit Design'],
    keyword_gaps: ['PLC Programming', 'SCADA', 'Load Flow Analysis', 'IEEE Standards', 'Energy Audit'],
    heading_risks: [
      { original: 'Computer Knowledge', issue: 'Non-standard heading — many ATS systems will fail to map this to a recognised section', recommended: 'Technical Skills' },
    ],
    ats_tips: [
      'Add "PLC Programming" and "SCADA" explicitly to the Technical Skills section — these are high-frequency keywords in Bangladeshi power sector job ads.',
      'Replace the "Computer Knowledge" heading with "Technical Skills" — ATS parsers at multinationals use this as the standard identifier.',
      'Include the CGPA denominator for all academic entries (e.g. "3.72/4.00") — missing denominators cause ATS misreads on the dual 4.00/5.00 Bangladesh scale.',
    ],
    standard: 'international/multinational ATS',
    ats_score: 44,
  },
  job_match: null,
}

const bn = {
  overall_score: 52,
  formatting: {
    score: 61,
    feedback: 'রিজিউমের সেকশন বিন্যাস স্পষ্ট এবং লেআউট পড়ার উপযোগী। তবে বাংলাদেশে প্রচলিত পুরোনো কিছু রীতি রয়ে গেছে, যেগুলো মাল্টিন্যাশনাল কোম্পানির আধুনিক ATS-এ ভালো ফল দেবে না।',
    issues: [
      { section: 'যোগাযোগের অংশ', issue: 'LinkedIn ঠিকানা নেই', suggestion: 'আপনার LinkedIn প্রোফাইলের ঠিকানা যোগ করুন (যেমন linkedin.com/in/yourname) — বাংলাদেশের MNC রিক্রুটাররা শর্টলিস্ট করার আগে ক্রমেই বেশি করে অনলাইন উপস্থিতি যাচাই করছেন।' },
      { section: 'দক্ষতা', issue: '"Computer Knowledge" শিরোনামটি সেকেলে', suggestion: '"Technical Skills" নামে বদলে দিন — আধুনিক রিক্রুটার ও ATS এই প্রমিত শিরোনামটিই আশা করে।' },
      { section: 'শেষাংশ', issue: 'Declaration অংশটি কোনো কাজে আসছে না', suggestion: 'Declaration অংশটি পুরোপুরি বাদ দিন এবং সেই জায়গা দক্ষতা বা অর্জনের জন্য ব্যবহার করুন।' },
    ],
  },
  content_quality: {
    score: 48,
    feedback: 'শিক্ষাগত যোগ্যতার অংশ মজবুত, কিন্তু অভিজ্ঞতার অংশে পরিমাপযোগ্য অর্জনের গুরুতর ঘাটতি রয়েছে। CAR পদ্ধতিতে সুনির্দিষ্ট ফলাফল না থাকলে রিক্রুটাররা শর্টলিস্ট করবেন না।',
    strengths: [
      'শিক্ষাগত যোগ্যতায় প্রাসঙ্গিক ডিগ্রি রয়েছে (Diploma in Power Technology)',
      'ট্রেনিং অংশে ইলেকট্রিক্যাল সেক্টরের সাথে মানানসই হাতে-কলমে দক্ষতা আছে',
    ],
    weaknesses: [
      'অভিজ্ঞতার অংশে কেবল বিষয়ের তালিকা আছে — কোনো প্রকৃত পদ, প্রতিষ্ঠান, সময়কাল বা ফলাফল নেই',
      'ক্যারিয়ার অবজেক্টিভটি গতানুগতিক ("seeking a challenging position in a dynamic environment") — এর বদলে পাওয়ার সেক্টরের নাম ও আপনার মূল যোগ্যতা উল্লেখ করে একটি লক্ষ্যভিত্তিক প্রফেশনাল সামারি লিখুন',
      'ট্রেনিংয়ের এন্ট্রিগুলোতে তারিখ নেই — "3 months" না লিখে "Jan 2023 – Mar 2023" লিখুন',
    ],
  },
  language_grammar: {
    score: 61,
    // original and corrected quote the English CV and its English replacement.
    // Only `type`, the category name, is translated.
    feedback: 'সাধারণভাবে পড়ার উপযোগী, তবে দুর্বল ক্রিয়াপদ ও অস্পষ্ট বর্ণনা পেশাদার প্রভাব কমিয়ে দিচ্ছে। পুরো রিজিউমে জুড়ে ব্রিটিশ ইংরেজি বানান এক রাখা উচিত।',
    issues: [
      { original: 'Responsible for handling electrical maintenance', corrected: 'Spearheaded electrical maintenance operations for a 12-unit residential complex', type: 'দুর্বল অ্যাকশন ভার্ব' },
      { original: 'Good command in English', corrected: 'Professional working proficiency in English (IELTS 6.5)', type: 'অস্পষ্ট ভাষাগত বর্ণনা' },
      { original: 'organization (used alongside "organisation")', corrected: 'organisation — standardise to British English throughout', type: 'ব্রিটিশ ও আমেরিকান ইংরেজির মিশ্রণ' },
    ],
  },
  action_items: [
    'অভিজ্ঞতার অংশ: প্রতিষ্ঠান, সময়কাল এবং প্রতিটির জন্য CAR পদ্ধতির ২–৩টি বুলেটসহ অন্তত ২টি প্রকৃত পদ যোগ করুন — রিক্রুটাররা এটিকেই সবচেয়ে বড় ঘাটতি হিসেবে ধরবেন।',
    'ট্রেনিং অংশ: প্রতিটি এন্ট্রিতে শুরু ও শেষের তারিখ দিন (যেমন "Jan 2023 – Mar 2023") — তারিখ দেখায় আপনি কখন ট্রেনিং নিয়েছেন, শুধু কত দিন নয়।',
    'ক্যারিয়ার অবজেক্টিভ: এর বদলে একটি নির্দিষ্ট সেক্টর (পাওয়ার, ইলেকট্রিক্যাল বা নবায়নযোগ্য জ্বালানি) লক্ষ্য করে এবং আপনার সবচেয়ে শক্তিশালী যোগ্যতার নাম উল্লেখ করে দুই বাক্যের প্রফেশনাল সামারি লিখুন।',
    'দক্ষতার অংশ: আপনার লক্ষ্য সেক্টরের ৫টি চলতি চাকরির বিজ্ঞাপন দেখে সেগুলোর হুবহু কিওয়ার্ড ব্যবহার করুন — ATS কিওয়ার্ড মিলের উপর বড় স্কোর দেয়।',
  ],
  ats_analysis: {
    // Keywords and heading names stay in English: they are matched literally
    // against English job adverts and applicant tracking systems.
    inferred_role: 'Electrical Engineer',
    inferred_industry: 'Power & Energy',
    keyword_hits: ['Electrical Wiring', 'Power Systems', 'Industrial Attachment', 'AutoCAD', 'Circuit Design'],
    keyword_gaps: ['PLC Programming', 'SCADA', 'Load Flow Analysis', 'IEEE Standards', 'Energy Audit'],
    heading_risks: [
      { original: 'Computer Knowledge', issue: 'প্রমিত নয় এমন শিরোনাম — অনেক ATS এটিকে পরিচিত কোনো সেকশনের সাথে মেলাতে পারবে না', recommended: 'Technical Skills' },
    ],
    ats_tips: [
      'Technical Skills অংশে স্পষ্টভাবে "PLC Programming" ও "SCADA" যোগ করুন — বাংলাদেশের পাওয়ার সেক্টরের বিজ্ঞাপনে এগুলো খুব বেশি ব্যবহৃত কিওয়ার্ড।',
      '"Computer Knowledge" শিরোনামটি "Technical Skills" দিয়ে বদলে দিন — মাল্টিন্যাশনাল কোম্পানির ATS পার্সার এটিকেই প্রমিত শনাক্তকারী হিসেবে ব্যবহার করে।',
      'সব শিক্ষাগত এন্ট্রিতে CGPA-র হর উল্লেখ করুন (যেমন "3.72/4.00") — হর না থাকলে বাংলাদেশের ৪.০০ ও ৫.০০ দুই স্কেলের কারণে ATS ভুল পড়ে।',
    ],
    standard: 'international/multinational ATS',
    ats_score: 44,
  },
  job_match: null,
}

const SAMPLES = { en, bn }

/** Falls back to the English sample for any language without its own copy. */
export function sampleReview(lang) {
  return SAMPLES[lang] ?? SAMPLES.en
}
