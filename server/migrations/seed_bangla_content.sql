-- Bangla translations for the seeded content.
--
-- Runs after add_bilingual_content.sql, which creates the columns this fills.
-- Split from that migration on purpose: the schema change is structural and
-- permanent, while this is content and will be re-run and extended as more of
-- the catalogue is translated.
--
-- Only prose is translated. Job titles, employer names, institutions, skills
-- and technologies stay in English, because that is how a Bangladeshi job
-- seeker writes and searches for them — see the header of
-- add_bilingual_content.sql for the full rule.
--
-- Every statement targets a row by its seeded id and only ever writes the _bn
-- columns, so re-running it cannot disturb the English content and cannot
-- overwrite a translation an admin has since edited through the dashboard...
-- with one exception: it DOES overwrite _bn values, since that is its whole
-- purpose. Once the team starts editing translations in the admin dashboard,
-- treat this file as the initial seed and stop re-running it.
--
-- Idempotent with respect to the English columns; safe to run more than once.

BEGIN;

-- ── disciplines ─────────────────────────────────────────────────────────
-- name_bn is a display label. The English `name` stays the join key that
-- career_paths, resources and alumni reference, so it is never touched.
UPDATE disciplines SET name_bn = 'আইটি', description_bn = 'তথ্যপ্রযুক্তি ও কম্পিউটার সায়েন্স' WHERE name = 'IT';
UPDATE disciplines SET name_bn = 'ফিন্যান্স', description_bn = 'ব্যাংকিং, হিসাববিজ্ঞান ও আর্থিক সেবা' WHERE name = 'Finance';
UPDATE disciplines SET name_bn = 'বিজ্ঞান', description_bn = 'বিশুদ্ধ ও ফলিত বিজ্ঞান' WHERE name = 'Science';
UPDATE disciplines SET name_bn = 'ইঞ্জিনিয়ারিং', description_bn = 'সিভিল, ইলেকট্রিক্যাল, মেকানিক্যাল ও সংশ্লিষ্ট শাখা' WHERE name = 'Engineering';
UPDATE disciplines SET name_bn = 'ব্যবসা', description_bn = 'মার্কেটিং, ব্যবস্থাপনা ও বাণিজ্য' WHERE name = 'Business';
UPDATE disciplines SET name_bn = 'কলা', description_bn = 'মানবিক, সমাজবিজ্ঞান ও সৃজনশীল কলা' WHERE name = 'Arts';
UPDATE disciplines SET name_bn = 'শিক্ষা', description_bn = 'শিক্ষকতা ও শিক্ষা নেতৃত্ব' WHERE name = 'Education';

-- ── career_paths ────────────────────────────────────────────────────────
-- title, skills and progression are intentionally left in English: they are
-- the terms a user carries to a job advert.
UPDATE career_paths SET description_bn = 'বাংলাদেশে ব্যাংক, NGO এবং কর্পোরেট ফিন্যান্স টিমে Financial Analyst-দের চাহিদা অনেক বেশি। এই কাজে আর্থিক তথ্য বিশ্লেষণ, রিপোর্ট তৈরি এবং ব্যবসায়িক সিদ্ধান্তে সহায়তা করতে হয়।', industry_bn = 'ব্যাংকিং ও ফিন্যান্স' WHERE id = 1;
UPDATE career_paths SET description_bn = 'Relationship Officer-রা Dutch-Bangla, BRAC Bank ও City Bank-এর মতো ব্যাংকে ক্লায়েন্ট অ্যাকাউন্ট দেখাশোনা করেন, ঋণ প্রক্রিয়া করেন এবং গ্রাহকসেবা দেন।', industry_bn = 'ব্যাংকিং' WHERE id = 2;
UPDATE career_paths SET description_bn = 'Audit Associate-রা ACNABIN, Rahman Rahman Huq এবং KPMG Bangladesh-এর মতো ফার্মে কাজ করেন এবং আর্থিক নথিপত্রের নির্ভুলতা ও কমপ্লায়েন্স যাচাই করেন।', industry_bn = 'নিরীক্ষা' WHERE id = 3;
UPDATE career_paths SET description_bn = 'Tax Consultant-রা ব্যক্তি ও প্রতিষ্ঠানকে কর জমা দিতে, কর পরিকল্পনা সাজাতে এবং বাংলাদেশের কর আইন মেনে চলতে সাহায্য করেন।', industry_bn = 'কর' WHERE id = 4;
UPDATE career_paths SET description_bn = 'Investment Analyst-রা বাংলাদেশের ব্রোকারেজ ফার্ম ও অ্যাসেট ম্যানেজমেন্ট কোম্পানির জন্য শেয়ার, বন্ড ও অন্যান্য বিনিয়োগ নিয়ে গবেষণা করেন।', industry_bn = 'বিনিয়োগ' WHERE id = 5;
UPDATE career_paths SET description_bn = 'Credit Risk Officer-রা ঋণের আবেদন যাচাই করেন, ঋণগ্রহীতার ঝুঁকি নিরূপণ করেন এবং ব্যাংক ও আর্থিক প্রতিষ্ঠানের জন্য ঋণসীমা নির্ধারণ করেন।', industry_bn = 'ঝুঁকি ব্যবস্থাপনা' WHERE id = 6;
UPDATE career_paths SET description_bn = 'Accounts Executive-রা প্রতিদিনের হিসাবরক্ষণ, আর্থিক বিবরণী তৈরি এবং প্রতিষ্ঠানের প্রদেয় ও প্রাপ্য হিসাব সামলান।', industry_bn = 'হিসাবরক্ষণ' WHERE id = 7;
UPDATE career_paths SET description_bn = 'Treasury Analyst-রা বাংলাদেশের বড় কর্পোরেট প্রতিষ্ঠানের নগদ প্রবাহ, বৈদেশিক মুদ্রার ঝুঁকি এবং ব্যাংকিং সম্পর্ক পরিচালনা করেন।', industry_bn = 'ট্রেজারি' WHERE id = 8;
UPDATE career_paths SET description_bn = 'Microfinance Officer-রা BRAC, ASA ও Grameen Bank-এর মতো সংস্থার সাথে কাজ করে গ্রামীণ উদ্যোক্তাদের ক্ষুদ্রঋণ দেন।', industry_bn = 'ক্ষুদ্রঋণ' WHERE id = 9;
UPDATE career_paths SET description_bn = 'Underwriter-রা বিমার আবেদন যাচাই করেন, ঝুঁকি নিরূপণ করেন এবং জীবন, স্বাস্থ্য ও সম্পত্তি বিমার কভারেজের পরিমাণ নির্ধারণ করেন।', industry_bn = 'বিমা' WHERE id = 10;
UPDATE career_paths SET description_bn = 'Software Engineer-রা Pathao, Shohoz এবং বাংলাদেশের অসংখ্য সফটওয়্যার আউটসোর্সিং ফার্মের জন্য অ্যাপ্লিকেশন ডিজাইন, কোড ও রক্ষণাবেক্ষণ করেন।', industry_bn = 'প্রযুক্তি' WHERE id = 11;
UPDATE career_paths SET description_bn = 'Frontend Developer-রা HTML, CSS ও JavaScript ফ্রেমওয়ার্ক ব্যবহার করে ওয়েবসাইট ও ওয়েব অ্যাপ্লিকেশনের ইউজার ইন্টারফেস তৈরি করেন।', industry_bn = 'প্রযুক্তি' WHERE id = 12;
UPDATE career_paths SET description_bn = 'Backend Developer-রা ওয়েব ও মোবাইল অ্যাপ্লিকেশন চালানোর সার্ভার-সাইড লজিক, ডেটাবেজ ও API তৈরি করেন।', industry_bn = 'প্রযুক্তি' WHERE id = 13;
UPDATE career_paths SET description_bn = 'DevOps Engineer-রা টেক কোম্পানির ডিপ্লয়মেন্ট পাইপলাইন, ক্লাউড অবকাঠামো ও সিস্টেমের নির্ভরযোগ্যতা দেখাশোনা করেন।', industry_bn = 'প্রযুক্তি' WHERE id = 14;
UPDATE career_paths SET description_bn = 'Data Analyst-রা তথ্য সংগ্রহ, প্রক্রিয়াকরণ ও বিশ্লেষণ করে প্রতিষ্ঠানকে তথ্যভিত্তিক সিদ্ধান্ত নিতে সাহায্য করেন।', industry_bn = 'ডেটা' WHERE id = 15;
UPDATE career_paths SET description_bn = 'QA Engineer-রা সফটওয়্যার পরীক্ষা করেন, ত্রুটি খুঁজে বের করেন এবং রিলিজের আগে পণ্যের মান নিশ্চিত করেন।', industry_bn = 'মান নিয়ন্ত্রণ' WHERE id = 16;
UPDATE career_paths SET description_bn = 'DBA-রা প্রতিষ্ঠানের ডেটাবেজ পরিচালনা, সুরক্ষা ও কর্মক্ষমতা উন্নয়নের কাজ করেন।', industry_bn = 'ডেটাবেজ' WHERE id = 17;
UPDATE career_paths SET description_bn = 'Cybersecurity Analyst-রা প্রতিষ্ঠানকে সাইবার হুমকি থেকে রক্ষা করেন, সিস্টেম পর্যবেক্ষণ করেন এবং কোনো ঘটনা ঘটলে দ্রুত ব্যবস্থা নেন।', industry_bn = 'নিরাপত্তা' WHERE id = 18;
UPDATE career_paths SET description_bn = 'IT Support Specialist-রা ব্যবহারকারীদের কারিগরি সমস্যায় সাহায্য করেন, হার্ডওয়্যার রক্ষণাবেক্ষণ করেন এবং নেটওয়ার্ক পরিচালনা করেন।', industry_bn = 'IT সাপোর্ট' WHERE id = 19;
UPDATE career_paths SET description_bn = 'Mobile Developer-রা বাংলাদেশি স্টার্টআপ ও বড় প্রতিষ্ঠানের জন্য Android ও iOS অ্যাপ তৈরি করেন।', industry_bn = 'মোবাইল ডেভেলপমেন্ট' WHERE id = 20;
UPDATE career_paths SET description_bn = 'Civil Engineer-রা সড়ক, সেতু, ভবন ও অবকাঠামো প্রকল্পের নকশা করেন এবং নির্মাণকাজ তদারকি করেন।', industry_bn = 'নির্মাণ' WHERE id = 21;
UPDATE career_paths SET description_bn = 'Electrical Engineer-রা ভবন, কারখানা ও বিদ্যুৎকেন্দ্রের বৈদ্যুতিক ব্যবস্থার নকশা, পরীক্ষা ও রক্ষণাবেক্ষণ করেন।', industry_bn = 'বিদ্যুৎ ও জ্বালানি' WHERE id = 22;
UPDATE career_paths SET description_bn = 'Mechanical Engineer-রা কারখানার যন্ত্রপাতি, HVAC ব্যবস্থা ও উৎপাদন সরঞ্জামের নকশা ও রক্ষণাবেক্ষণ করেন।', industry_bn = 'উৎপাদন' WHERE id = 23;
UPDATE career_paths SET description_bn = 'Chemical Engineer-রা ওষুধ, বস্ত্র ও সার কারখানায় কাজ করেন এবং রাসায়নিক প্রক্রিয়ার নকশা করেন।', industry_bn = 'ওষুধশিল্প' WHERE id = 24;
UPDATE career_paths SET description_bn = 'Textile Engineer-রা বাংলাদেশের সবচেয়ে বড় রপ্তানি খাতে কাজ করেন এবং উৎপাদন ও মান নিয়ন্ত্রণ পরিচালনা করেন।', industry_bn = 'বস্ত্র' WHERE id = 25;
UPDATE career_paths SET description_bn = 'Industrial Engineer-রা উৎপাদন প্রক্রিয়া উন্নত করেন, অপচয় কমান এবং কর্মদক্ষতা বাড়ান।', industry_bn = 'উৎপাদন' WHERE id = 26;
UPDATE career_paths SET description_bn = 'Environmental Engineer-রা বর্জ্য ব্যবস্থাপনা, দূষণ নিয়ন্ত্রণ ও টেকসই উন্নয়ন প্রকল্পে কাজ করেন।', industry_bn = 'পরিবেশ' WHERE id = 27;
UPDATE career_paths SET description_bn = 'Telecom Engineer-রা মোবাইল নেটওয়ার্ক, ফাইবার অপটিক ও যোগাযোগ ব্যবস্থার নকশা ও রক্ষণাবেক্ষণ করেন।', industry_bn = 'টেলিকম' WHERE id = 28;
UPDATE career_paths SET description_bn = 'Automobile Engineer-রা অটোমোটিভ কোম্পানিতে গাড়ি সংযোজন, রক্ষণাবেক্ষণ ও নকশার কাজ করেন।', industry_bn = 'অটোমোটিভ' WHERE id = 29;
UPDATE career_paths SET description_bn = 'Marine Engineer-রা চট্টগ্রাম ও ঢাকায় জাহাজ, বন্দর ও সামুদ্রিক কার্যক্রম নিয়ে কাজ করেন।', industry_bn = 'নৌ ও সমুদ্র' WHERE id = 30;
UPDATE career_paths SET description_bn = 'Marketing Executive-রা প্রচারণার পরিকল্পনা ও বাস্তবায়ন করেন, সোশ্যাল মিডিয়া সামলান এবং বাজারের গতিপ্রকৃতি বিশ্লেষণ করেন।', industry_bn = 'মার্কেটিং' WHERE id = 31;
UPDATE career_paths SET description_bn = 'HR Executive-রা নিয়োগ, নতুন কর্মীদের যোগদান প্রক্রিয়া, বেতন ও কর্মী সম্পর্ক দেখাশোনা করেন।', industry_bn = 'মানবসম্পদ' WHERE id = 32;
UPDATE career_paths SET description_bn = 'BDO-রা নতুন ব্যবসার সুযোগ খুঁজে বের করেন, ক্লায়েন্টের সাথে সম্পর্ক গড়েন এবং প্রতিষ্ঠানের আয় বাড়াতে ভূমিকা রাখেন।', industry_bn = 'বিক্রয়' WHERE id = 33;
UPDATE career_paths SET description_bn = 'Supply Chain Officer-রা উৎপাদন ও খুচরা প্রতিষ্ঠানের ক্রয়, গুদামজাতকরণ ও পণ্য বিতরণ পরিচালনা করেন।', industry_bn = 'লজিস্টিকস' WHERE id = 34;
UPDATE career_paths SET description_bn = 'Operations Executive-রা প্রতিদিনের ব্যবসায়িক কার্যক্রম সচল রাখেন এবং প্রক্রিয়ার দক্ষতা নিশ্চিত করেন।', industry_bn = 'অপারেশনস' WHERE id = 35;
UPDATE career_paths SET description_bn = 'Export-Import Officer-রা ট্রেডিং কোম্পানির কাস্টমস, নথিপত্র ও আন্তর্জাতিক শিপিং সামলান।', industry_bn = 'আন্তর্জাতিক বাণিজ্য' WHERE id = 36;
UPDATE career_paths SET description_bn = 'CSM-রা টেক ও সেবাদানকারী প্রতিষ্ঠানের গ্রাহক সন্তুষ্টি, গ্রাহক ধরে রাখা ও আনুগত্য নিশ্চিত করেন।', industry_bn = 'গ্রাহকসেবা' WHERE id = 37;
UPDATE career_paths SET description_bn = 'Project Coordinator-রা বিভিন্ন খাতে প্রকল্পের পরিকল্পনা, অগ্রগতি পর্যবেক্ষণ ও বাস্তবায়নে সহায়তা করেন।', industry_bn = 'প্রকল্প ব্যবস্থাপনা' WHERE id = 38;
UPDATE career_paths SET description_bn = 'E-commerce Manager-রা Daraz, Chaldal-সহ বিভিন্ন প্ল্যাটফর্মের অনলাইন স্টোর দেখাশোনা করেন, পণ্যের তালিকা সামলান এবং বিক্রি বাড়ান।', industry_bn = 'ই-কমার্স' WHERE id = 39;
UPDATE career_paths SET description_bn = 'Grameenphone, Unilever, BAT-সহ বিভিন্ন মাল্টিন্যাশনালের MT প্রোগ্রাম ভবিষ্যতের নেতৃত্ব তৈরি করে।', industry_bn = 'ব্যবস্থাপনা' WHERE id = 40;
UPDATE career_paths SET description_bn = 'Research Associate-রা icddr,b, BARI, BRRI এবং বিশ্ববিদ্যালয়ের গবেষণা কেন্দ্রে কাজ করেন।', industry_bn = 'গবেষণা' WHERE id = 41;
UPDATE career_paths SET description_bn = 'Biomedical Scientist-রা হাসপাতালের ল্যাব, ডায়াগনস্টিক সেন্টার ও ওষুধ কোম্পানিতে কাজ করেন।', industry_bn = 'স্বাস্থ্যসেবা' WHERE id = 42;
UPDATE career_paths SET description_bn = 'QC Officer-রা Square, Beximco-সহ বিভিন্ন ওষুধ কোম্পানিতে কাঁচামাল ও তৈরি পণ্য পরীক্ষা করেন।', industry_bn = 'ওষুধশিল্প' WHERE id = 43;
UPDATE career_paths SET description_bn = 'Environmental Scientist-রা সংরক্ষণ, দূষণ পর্যবেক্ষণ ও জলবায়ু পরিবর্তন সংক্রান্ত প্রকল্পে কাজ করেন।', industry_bn = 'পরিবেশ' WHERE id = 44;
UPDATE career_paths SET description_bn = 'Microbiologist-রা খাদ্য নিরাপত্তা, ওষুধের ল্যাব ও ক্লিনিক্যাল ডায়াগনস্টিকে কাজ করেন।', industry_bn = 'অণুজীববিজ্ঞান' WHERE id = 45;
UPDATE career_paths SET description_bn = 'Food Scientist-রা নতুন খাদ্যপণ্য উদ্ভাবন করেন, নিরাপত্তা নিশ্চিত করেন এবং খাদ্য কোম্পানির পণ্যের মান উন্নত করেন।', industry_bn = 'খাদ্য' WHERE id = 46;
UPDATE career_paths SET description_bn = 'Genetic Counselor-রা হাসপাতাল ও ডায়াগনস্টিক ল্যাবে কাজ করেন এবং জিনগত রোগ নিয়ে রোগীদের পরামর্শ দেন।', industry_bn = 'জিনতত্ত্ব' WHERE id = 47;
UPDATE career_paths SET description_bn = 'Agronomist-রা কৃষি গবেষণা, ফসল ব্যবস্থাপনা ও কৃষি পরামর্শ সেবায় কাজ করেন।', industry_bn = 'কৃষি' WHERE id = 48;
UPDATE career_paths SET description_bn = 'Fisheries Officer-রা মৎস্যচাষ, মৎস্য ব্যবস্থাপনা ও সামুদ্রিক সংরক্ষণে কাজ করেন।', industry_bn = 'মৎস্য' WHERE id = 49;
UPDATE career_paths SET description_bn = 'CRC-রা ওষুধ কোম্পানি ও গবেষণা হাসপাতালের ক্লিনিক্যাল ট্রায়াল পরিচালনা করেন।', industry_bn = 'ক্লিনিক্যাল গবেষণা' WHERE id = 50;
UPDATE career_paths SET description_bn = 'Content Writer-রা ডিজিটাল এজেন্সি ও মিডিয়া হাউসের জন্য আর্টিকেল, ব্লগ ও সোশ্যাল মিডিয়ার কনটেন্ট লেখেন।', industry_bn = 'গণমাধ্যম' WHERE id = 51;
UPDATE career_paths SET description_bn = 'Graphic Designer-রা ব্র্যান্ড, বিজ্ঞাপনী সংস্থা ও ডিজিটাল মিডিয়ার জন্য ভিজ্যুয়াল কনটেন্ট তৈরি করেন।', industry_bn = 'ডিজাইন' WHERE id = 52;
UPDATE career_paths SET description_bn = 'সাংবাদিকরা বাংলাদেশের সংবাদপত্র, টিভি চ্যানেল ও অনলাইন নিউজ পোর্টালের জন্য সংবাদ সংগ্রহ ও প্রতিবেদন তৈরি করেন।', industry_bn = 'সংবাদ' WHERE id = 53;
UPDATE career_paths SET description_bn = 'PRO-রা প্রতিষ্ঠানের গণমাধ্যম সম্পর্ক, প্রেস রিলিজ ও কর্পোরেট যোগাযোগ পরিচালনা করেন।', industry_bn = 'জনসংযোগ' WHERE id = 54;
UPDATE career_paths SET description_bn = 'Social Media Manager-রা ব্র্যান্ড ও এজেন্সির সোশ্যাল মিডিয়া কৌশল সাজান ও বাস্তবায়ন করেন।', industry_bn = 'ডিজিটাল মার্কেটিং' WHERE id = 55;
UPDATE career_paths SET description_bn = 'ফটোগ্রাফার ও ভিডিওগ্রাফাররা মিডিয়া হাউস, বিয়ের ফটোগ্রাফি ও ক্রিয়েটিভ এজেন্সিতে কাজ করেন।', industry_bn = 'গণমাধ্যম' WHERE id = 56;
UPDATE career_paths SET description_bn = 'UX/UI Designer-রা ওয়েবসাইট ও মোবাইল অ্যাপের সহজবোধ্য ইন্টারফেস তৈরি করেন।', industry_bn = 'টেক ডিজাইন' WHERE id = 57;
UPDATE career_paths SET description_bn = 'Event Manager-রা কর্পোরেট অনুষ্ঠান, বিয়ে ও সম্মেলনের পরিকল্পনা ও আয়োজন করেন।', industry_bn = 'ইভেন্ট' WHERE id = 58;
UPDATE career_paths SET description_bn = 'অনুবাদকরা প্রকাশনা, গণমাধ্যম ও আন্তর্জাতিক সংস্থায় কাজ করেন।', industry_bn = 'অনুবাদ' WHERE id = 59;
UPDATE career_paths SET description_bn = 'Copywriter-রা ব্র্যান্ড, এজেন্সি ও মার্কেটিং প্রচারণার জন্য বিজ্ঞাপনের লেখা তৈরি করেন।', industry_bn = 'বিজ্ঞাপন' WHERE id = 60;
UPDATE career_paths SET description_bn = 'স্কুল শিক্ষকরা সারা বাংলাদেশের বেসরকারি ও সরকারি স্কুলে প্রাথমিক বা মাধ্যমিক পর্যায়ের শিক্ষার্থীদের পড়ান।', industry_bn = 'শিক্ষা' WHERE id = 61;
UPDATE career_paths SET description_bn = 'Program Officer-রা BRAC ও Save the Children-এর মতো NGO-র শিক্ষা কর্মসূচি সাজান ও পরিচালনা করেন।', industry_bn = 'NGO' WHERE id = 62;
UPDATE career_paths SET description_bn = 'Curriculum Developer-রা স্কুল ও এডটেক কোম্পানির জন্য শেখার উপকরণ, সিলেবাস ও মূল্যায়ন তৈরি করেন।', industry_bn = 'এডটেক' WHERE id = 63;
UPDATE career_paths SET description_bn = 'Educational Counsellor-রা শিক্ষার্থীদের ক্যারিয়ার, বিশ্ববিদ্যালয়ে ভর্তি ও বিদেশে পড়াশোনা নিয়ে পরামর্শ দেন।', industry_bn = 'কাউন্সেলিং' WHERE id = 64;
UPDATE career_paths SET description_bn = 'Instructional Designer-রা অনলাইন কোর্স, ই-লার্নিং মডিউল ও প্রশিক্ষণ উপকরণ তৈরি করেন।', industry_bn = 'এডটেক' WHERE id = 65;
UPDATE career_paths SET description_bn = 'বিশ্ববিদ্যালয়ের শিক্ষকরা স্নাতক পর্যায়ের কোর্স পড়ান এবং নিজের বিষয়ে গবেষণা করেন।', industry_bn = 'উচ্চশিক্ষা' WHERE id = 66;
UPDATE career_paths SET description_bn = 'Special Education Teacher-রা শেখার সমস্যা, শারীরিক প্রতিবন্ধকতা বা অন্যান্য বিশেষ চাহিদাসম্পন্ন শিক্ষার্থীদের নিয়ে কাজ করেন।', industry_bn = 'বিশেষ শিক্ষা' WHERE id = 67;
UPDATE career_paths SET description_bn = 'EdTech Specialist-রা স্কুল ও শিক্ষাপ্রতিষ্ঠানে প্রযুক্তিনির্ভর সমাধান বাস্তবায়ন করেন।', industry_bn = 'এডটেক' WHERE id = 68;
UPDATE career_paths SET description_bn = 'Training Coordinator-রা কর্পোরেট প্রতিষ্ঠান ও NGO-র কর্মী প্রশিক্ষণ কর্মসূচি আয়োজন করেন।', industry_bn = 'কর্পোরেট প্রশিক্ষণ' WHERE id = 69;
UPDATE career_paths SET description_bn = 'Early Childhood Educator-রা প্রি-স্কুল ও কিন্ডারগার্টেনে ৩-৬ বছর বয়সী শিশুদের পড়ান।', industry_bn = 'প্রাক-প্রাথমিক শিক্ষা' WHERE id = 70;

-- ── alumni ──────────────────────────────────────────────────────────────
-- Names, institutions and job titles are left as entered.
UPDATE alumni SET bio_bn = 'সাদিয়া Pathao-তে backend developer হিসেবে কাজ করেন। তিনি Node.js ও microservices architecture-এ দক্ষ। বিশ্ববিদ্যালয়ে থাকতে তিনি BUET Coding Club-এর নেতৃত্ব দিয়েছেন এবং SELISE Digital Platforms-এ ইন্টার্ন করেছেন।', industry_bn = 'প্রযুক্তি' WHERE id = 1;
UPDATE alumni SET bio_bn = 'রাকিব BRAC Bank-এ Financial Analyst হিসেবে কাজ করেন। তিনি CFA Level 2 শেষ করেছেন এবং এর আগে Standard Chartered Bank-এ ইন্টার্ন করেছেন। তিনি শিক্ষার্থীদের financial modelling ও Excel-এর দক্ষতায় মনোযোগ দিতে পরামর্শ দেন।', industry_bn = 'ব্যাংকিং ও ফিন্যান্স' WHERE id = 2;
UPDATE alumni SET bio_bn = 'তানিয়া icddr,b-র Infectious Diseases বিভাগে Research Associate হিসেবে কাজ করেন। তিনি ৩টি গবেষণাপত্রের সহ-লেখক এবং বর্তমানে Master of Public Health করছেন।', industry_bn = 'গবেষণা' WHERE id = 3;
UPDATE alumni SET bio_bn = 'মেহেদী Rangs Properties Ltd-এ অবকাঠামো প্রকল্প পরিচালনা করেন। তিনি ঢাকায় ৫টি বড় আবাসিক প্রকল্প তদারকি করেছেন এবং প্রকল্প পরিকল্পনা ও ব্যয় নিরূপণে দক্ষ।', industry_bn = 'নির্মাণ' WHERE id = 4;
UPDATE alumni SET bio_bn = 'নুসরাত Unilever Bangladesh-এ Brand Executive হিসেবে কাজ করেন। তিনি Lifebuoy ব্র্যান্ড দেখাশোনা করেন এবং লক্ষ লক্ষ গ্রাহকের কাছে পৌঁছানো সফল ডিজিটাল প্রচারণার নেতৃত্ব দিয়েছেন।', industry_bn = 'মার্কেটিং' WHERE id = 5;
UPDATE alumni SET bio_bn = 'আরিফ Shohoz-এ Frontend Developer হিসেবে কাজ করেন। React এবং ব্যবহারবান্ধব ইন্টারফেস তৈরিতে তাঁর আগ্রহ। তিনি নিজের সাবেক বিশ্ববিদ্যালয়ের শিক্ষার্থীদের মেন্টরও করেন।', industry_bn = 'প্রযুক্তি' WHERE id = 6;
UPDATE alumni SET bio_bn = 'ফারজানা The Daily Star-এর ডিজিটাল শাখার কনটেন্ট কৌশল পরিচালনা করেন। তিনি সোশ্যাল মিডিয়ার জন্য আকর্ষণীয় কনটেন্ট তৈরি করেন এবং তাঁদের Instagram অনুসারীর সংখ্যা ৫ লাখে নিয়ে গেছেন।', industry_bn = 'গণমাধ্যম' WHERE id = 7;
UPDATE alumni SET bio_bn = 'শাহিদ Grameenphone-এ Management Trainee। MT প্রোগ্রামের অংশ হিসেবে তিনি সেলস, মার্কেটিং ও অপারেশনস-সহ বিভিন্ন বিভাগে ঘুরে কাজ করছেন।', industry_bn = 'ব্যবস্থাপনা' WHERE id = 8;
UPDATE alumni SET bio_bn = 'মৌমিতা LGED-তে Junior Engineer হিসেবে কাজ করেন। তিনি ৩টি জেলায় গ্রামীণ সড়ক উন্নয়ন প্রকল্পে কাজ করেছেন এবং টেকসই অবকাঠামো নিয়ে আগ্রহী।', industry_bn = 'নির্মাণ' WHERE id = 9;
UPDATE alumni SET bio_bn = 'ইমরান Square Pharmaceuticals-এর quality control-এ কাজ করেন। তিনি পণ্য GMP মান পূরণ করছে কি না তা নিশ্চিত করেন এবং ৩টি সফল পণ্য বাজারজাতকরণে অবদান রেখেছেন।', industry_bn = 'ওষুধশিল্প' WHERE id = 10;

-- ── resources ───────────────────────────────────────────────────────────
-- The columns already existed; every row was seeded with NULL, so switching
-- to Bangla showed 42 English cards under a Bangla heading.
UPDATE resources SET title_bn = 'বাংলাদেশে ফিন্যান্সের চাকরির জন্য শক্তিশালী CV যেভাবে লিখবেন', description_bn = 'বাংলাদেশি ফিন্যান্স নিয়োগকর্তাদের জন্য CV সাজানোর ধাপে ধাপে গাইড, স্থানীয় রিক্রুটাররা কী খোঁজেন তা-সহ।' WHERE id = 1;
UPDATE resources SET title_bn = 'নতুন গ্র্যাজুয়েটদের জন্য ইন্টারভিউ প্রস্তুতির গাইড', description_bn = 'সাধারণ ইন্টারভিউ প্রশ্নের ধরন, প্রত্যাশিত আচরণ এবং বাংলাদেশি নিয়োগকর্তাদের সামনে আত্মবিশ্বাসের সাথে নিজেকে উপস্থাপনের উপায়।' WHERE id = 2;
UPDATE resources SET title_bn = 'বাংলাদেশের চাকরির বাজারের ২০২৬ সালের গতিপ্রকৃতি', description_bn = 'কোন খাতে নিয়োগ হচ্ছে, কোন দক্ষতার চাহিদা আছে এবং নিজেকে কীভাবে কার্যকরভাবে প্রস্তুত করবেন তার বিশ্লেষণ।' WHERE id = 3;
UPDATE resources SET title_bn = 'এশীয় পেশাগত সংস্কৃতিতে সফট স্কিল — নিয়োগকর্তারা যা আশা করেন', description_bn = 'এশীয় ও পশ্চিমা কর্মক্ষেত্রের সংস্কৃতিতে পেশাগত সফট স্কিলের পার্থক্য এবং সেগুলো কীভাবে দেখাবেন।' WHERE id = 4;
UPDATE resources SET title_bn = 'সফটওয়্যার ইঞ্জিনিয়ারিংয়ের জন্য কারিগরি দক্ষতা গড়ে তোলা', description_bn = 'বাংলাদেশি টেক কোম্পানিগুলো যেসব কারিগরি দক্ষতা সবচেয়ে বেশি খোঁজে, সেগুলোর একটি সাজানো শেখার পথ।' WHERE id = 5;
UPDATE resources SET title_bn = 'বাংলাদেশি নিয়োগকর্তাদের জন্য কভার লেটার যেভাবে লিখবেন', description_bn = 'বাংলাদেশের চাকরির বাজারে কভার লেটারের প্রচলিত রীতি — গঠন, ভাষার ধরন ও উদাহরণসহ।' WHERE id = 6;
UPDATE resources SET title_bn = 'বাংলাদেশি ব্যাংকের ফিন্যান্স ইন্টারভিউতে যেভাবে ভালো করবেন', description_bn = 'Dutch-Bangla Bank, BRAC Bank ও City Bank-এর সাধারণ ইন্টারভিউ প্রশ্ন, নমুনা উত্তর ও পরামর্শ।' WHERE id = 7;
UPDATE resources SET title_bn = 'বাংলাদেশে ক্যারিয়ার গড়তে সেরা ফিন্যান্স সার্টিফিকেশন', description_bn = 'ফিন্যান্স ক্যারিয়ার এগিয়ে নিতে CFA, ACCA, CIMA এবং দেশীয় সার্টিফিকেশনের সুযোগ।' WHERE id = 8;
UPDATE resources SET title_bn = 'বাংলাদেশে ফিন্যান্সের চাকরি কোথায় পাবেন', description_bn = 'ফিন্যান্সের চাকরির জন্য সেরা জব পোর্টাল, রিক্রুটমেন্ট এজেন্সি ও কোম্পানির ক্যারিয়ার পেজ।' WHERE id = 9;
UPDATE resources SET title_bn = 'প্রত্যেক ফিন্যান্স পেশাজীবীর যে সফট স্কিল দরকার', description_bn = 'যোগাযোগ, দরকষাকষি, নৈতিক বিচারবোধ এবং ক্লায়েন্ট সম্পর্ক ব্যবস্থাপনা।' WHERE id = 10;
UPDATE resources SET title_bn = 'বাংলাদেশি নিয়োগকর্তাদের জন্য ফিন্যান্স CV যেভাবে সাজাবেন', description_bn = 'ব্যাংক ও আর্থিক প্রতিষ্ঠানের রিক্রুটাররা নতুন গ্র্যাজুয়েটের CV-তে কী খোঁজেন।' WHERE id = 11;
UPDATE resources SET title_bn = 'সফটওয়্যার ইঞ্জিনিয়ারদের জন্য টেকনিক্যাল ইন্টারভিউ প্রস্তুতি', description_bn = 'বাংলাদেশি টেক কোম্পানিতে সচরাচর জিজ্ঞাসা করা ডেটা স্ট্রাকচার, অ্যালগরিদম ও সিস্টেম ডিজাইনের প্রশ্ন।' WHERE id = 12;
UPDATE resources SET title_bn = 'বাংলাদেশি শিক্ষার্থীদের জন্য সেরা কোডিং বুটক্যাম্প ও অনলাইন কোর্স', description_bn = 'প্রোগ্রামিং, ওয়েব ডেভেলপমেন্ট ও ডেটা সায়েন্স শেখার ফ্রি ও পেইড রিসোর্স।' WHERE id = 13;
UPDATE resources SET title_bn = 'বাংলাদেশি স্টার্টআপে IT-র চাকরি যেভাবে খুঁজবেন', description_bn = 'টেক পদের জন্য নেটওয়ার্কিং কৌশল, জব বোর্ড ও কোম্পানি নিয়ে খোঁজখবর।' WHERE id = 14;
UPDATE resources SET title_bn = 'সফটওয়্যার ডেভেলপমেন্টে যোগাযোগ ও দলগত কাজ', description_bn = 'অ্যাজাইল টিমে কাজ করা ডেভেলপারদের জন্য সফট স্কিল কেন গুরুত্বপূর্ণ।' WHERE id = 15;
UPDATE resources SET title_bn = 'নজর কাড়ে এমন ডেভেলপার CV যেভাবে লিখবেন', description_bn = 'প্রজেক্ট, GitHub-এ অবদান ও কারিগরি দক্ষতা কার্যকরভাবে তুলে ধরা।' WHERE id = 16;
UPDATE resources SET title_bn = 'রিসার্চ অ্যাসিস্ট্যান্ট পদের ইন্টারভিউ পরামর্শ', description_bn = 'icddr,b, BARI এবং বিশ্ববিদ্যালয়ের ল্যাব নতুন বিজ্ঞান গ্র্যাজুয়েটদের মধ্যে কী খোঁজে।' WHERE id = 17;
UPDATE resources SET title_bn = 'প্রত্যেক বিজ্ঞান গ্র্যাজুয়েটের জানা দরকার এমন ল্যাব কৌশল', description_bn = 'গবেষণার কাজের জন্য মাইক্রোস্কোপি, PCR, ক্রোমাটোগ্রাফি ও অন্যান্য ল্যাব দক্ষতা।' WHERE id = 18;
UPDATE resources SET title_bn = 'গবেষণার বাইরে বিজ্ঞান গ্র্যাজুয়েটদের ক্যারিয়ার পথ', description_bn = 'ওষুধশিল্প, মান নিয়ন্ত্রণ, পরিবেশ পর্যবেক্ষণ ও শিক্ষকতা।' WHERE id = 19;
UPDATE resources SET title_bn = 'নতুন গবেষকদের জন্য বৈজ্ঞানিক লেখা ও প্রকাশনা', description_bn = 'গবেষণাপত্র, গ্রান্ট প্রস্তাব ও লিটারেচার রিভিউ যেভাবে লিখবেন।' WHERE id = 20;
UPDATE resources SET title_bn = 'বিজ্ঞানের পদের জন্য রিসার্চ CV যেভাবে লিখবেন', description_bn = 'প্রকাশনা, ল্যাবের অভিজ্ঞতা ও কারিগরি দক্ষতা তুলে ধরা।' WHERE id = 21;
UPDATE resources SET title_bn = 'বাংলাদেশে ইঞ্জিনিয়ারিং ইন্টারভিউয়ের সাধারণ প্রশ্ন', description_bn = 'সিভিল, ইলেকট্রিক্যাল ও মেকানিক্যাল ইঞ্জিনিয়ারিং পদের কারিগরি ও আচরণগত প্রশ্ন।' WHERE id = 22;
UPDATE resources SET title_bn = 'ইঞ্জিনিয়ারদের জন্য অপরিহার্য সফটওয়্যার দক্ষতা', description_bn = 'বাংলাদেশি শিল্পে ব্যবহৃত AutoCAD, SolidWorks, MATLAB ও অন্যান্য টুল।' WHERE id = 23;
UPDATE resources SET title_bn = 'সরকারি ও বেসরকারি খাতে ইঞ্জিনিয়ারিংয়ের সুযোগ', description_bn = 'LGED, RAJUK, বিদ্যুৎকেন্দ্র ও নির্মাণ প্রতিষ্ঠানে যেভাবে আবেদন করবেন।' WHERE id = 24;
UPDATE resources SET title_bn = 'ইঞ্জিনিয়ারদের জন্য প্রকল্প ব্যবস্থাপনার দক্ষতা', description_bn = 'নেতৃত্ব, বাজেট, ক্লায়েন্টের সাথে যোগাযোগ ও দল সমন্বয়।' WHERE id = 25;
UPDATE resources SET title_bn = 'আলাদা করে চোখে পড়ে এমন ইঞ্জিনিয়ারিং CV যেভাবে লিখবেন', description_bn = 'প্রজেক্ট, ইন্টার্নশিপ ও কারিগরি সার্টিফিকেশন তুলে ধরা।' WHERE id = 26;
UPDATE resources SET title_bn = 'মার্কেটিং ও সেলস ইন্টারভিউয়ের প্রস্তুতি যেভাবে নেবেন', description_bn = 'Grameenphone, Unilever-সহ শীর্ষ নিয়োগকর্তাদের সাধারণ প্রশ্ন।' WHERE id = 27;
UPDATE resources SET title_bn = 'প্রত্যেক বিজনেস গ্র্যাজুয়েটের যে ডিজিটাল মার্কেটিং দক্ষতা দরকার', description_bn = 'SEO, সোশ্যাল মিডিয়া মার্কেটিং, Google Ads ও ইমেইল মার্কেটিংয়ের মূল বিষয়।' WHERE id = 28;
UPDATE resources SET title_bn = 'বাংলাদেশে বিজনেসের চাকরি কোথায় পাবেন', description_bn = 'বিজনেস গ্র্যাজুয়েটদের জন্য শীর্ষ কোম্পানি, জব পোর্টাল ও নেটওয়ার্কিং ইভেন্ট।' WHERE id = 29;
UPDATE resources SET title_bn = 'বিজনেস পেশাজীবীদের জন্য দরকষাকষি ও প্রভাব বিস্তারের দক্ষতা', description_bn = 'বেতন নিয়ে আলোচনা, চুক্তি চূড়ান্ত করা এবং স্টেকহোল্ডারদের প্রভাবিত করা।' WHERE id = 30;
UPDATE resources SET title_bn = 'কর্পোরেট পদের জন্য বিজনেস CV যেভাবে লিখবেন', description_bn = 'অভিজ্ঞতা, অর্জন ও নেতৃত্বের উদাহরণ সাজানো।' WHERE id = 31;
UPDATE resources SET title_bn = 'ক্রিয়েটিভ চাকরির ইন্টারভিউয়ের জন্য পোর্টফোলিও প্রস্তুতি', description_bn = 'নিজের ডিজাইন, লেখা বা ফটোগ্রাফির পোর্টফোলিও নিয়োগকর্তার সামনে যেভাবে উপস্থাপন করবেন।' WHERE id = 32;
UPDATE resources SET title_bn = 'মিডিয়া ও ক্রিয়েটিভ ক্যারিয়ারের জন্য যেসব দক্ষতা দরকার', description_bn = 'গ্রাফিক ডিজাইন, ভিডিও এডিটিং, কনটেন্ট রাইটিং ও সোশ্যাল মিডিয়া ব্যবস্থাপনা।' WHERE id = 33;
UPDATE resources SET title_bn = 'কলা গ্র্যাজুয়েটদের জন্য ফ্রিল্যান্সিং ও রিমোট কাজের সুযোগ', description_bn = 'প্ল্যাটফর্ম, পারিশ্রমিক নির্ধারণ এবং বাংলাদেশে বসে ফ্রিল্যান্স ক্যারিয়ার গড়া।' WHERE id = 34;
UPDATE resources SET title_bn = 'কর্মক্ষেত্রে সৃজনশীল চিন্তা ও গল্প বলার কৌশল', description_bn = 'সমস্যা সমাধান ও ভাবনা প্রকাশে সৃজনশীলতা যেভাবে কাজে লাগাবেন।' WHERE id = 35;
UPDATE resources SET title_bn = 'ক্রিয়েটিভ পদের জন্য CV যেভাবে লিখবেন', description_bn = 'চাকরির আবেদনে সৃজনশীলতা ও পেশাদারত্বের ভারসাম্য রাখা।' WHERE id = 36;
UPDATE resources SET title_bn = 'শিক্ষকতার চাকরির ইন্টারভিউয়ের প্রস্তুতি যেভাবে নেবেন', description_bn = 'ডেমো ক্লাস, শ্রেণিকক্ষ ব্যবস্থাপনার প্রশ্ন ও স্কুলের প্রত্যাশা।' WHERE id = 37;
UPDATE resources SET title_bn = 'বাংলাদেশে শিক্ষকদের পেশাগত উন্নয়ন', description_bn = 'শিক্ষকতার ক্যারিয়ার এগিয়ে নিতে ওয়ার্কশপ, সার্টিফিকেশন ও অনলাইন কোর্স।' WHERE id = 38;
UPDATE resources SET title_bn = 'বাংলাদেশে শিক্ষকতার চাকরি কোথায় পাবেন', description_bn = 'ইন্টারন্যাশনাল স্কুল, সরকারি কলেজ, NGO ও টিউশন প্ল্যাটফর্ম।' WHERE id = 39;
UPDATE resources SET title_bn = 'শ্রেণিকক্ষ ব্যবস্থাপনা ও যোগাযোগ দক্ষতা', description_bn = 'শিক্ষার্থী, অভিভাবক ও সহকর্মীদের সাথে সম্পর্ক গড়ে তোলা।' WHERE id = 40;
UPDATE resources SET title_bn = 'শিক্ষকতার পদের জন্য CV যেভাবে লিখবেন', description_bn = 'শিক্ষকতার অভিজ্ঞতা, সার্টিফিকেশন ও বিষয়ভিত্তিক দক্ষতা তুলে ধরা।' WHERE id = 41;
UPDATE resources SET title_bn = 'বাংলাদেশে নতুন গ্র্যাজুয়েট হিসেবে যেভাবে নেটওয়ার্ক গড়বেন', description_bn = 'LinkedIn-এর পরামর্শ, ইন্ডাস্ট্রি ইভেন্ট ও স্থানীয়ভাবে পেশাগত সম্পর্ক গড়া।' WHERE id = 42;

COMMIT;
