-- Module: add_new_sector_bangla_content  [DRAFT — NOT YET APPLIED TO ANY DATABASE]
--
-- Bangla translations for everything added by add_new_sector_career_paths.sql
-- and add_new_sector_resources.sql: 4 disciplines, 26 career paths, 12
-- resources. Fills the existing _bn columns (name_bn/description_bn/
-- group_name_bn on disciplines; title_bn/description_bn/industry_bn/
-- skills_bn/progression_bn on career_paths; title_bn/description_bn on
-- resources) the same way seed_bangla_content.sql and
-- seed_full_bangla_content.sql did for the original 7 disciplines and 70
-- career paths.
--
-- Follows the same convention those two migrations already established:
-- prose and job titles are translated, but product/standard/certification
-- names stay in Latin script where that's how they're actually used in
-- Bangladesh (RMG, QA, QC, MS Office, HPLC, GMP, BSCI/SMETA/WRAP/SEDEX/SA8000,
-- AQL, CAP, SMV, DGDA, PCB, BMR/BPR, ODK, GIS, ESMP, M&E), and progression
-- "time" values stay as-is (e.g. "0–2 yrs") since those were never
-- translated for the original content either.
--
-- Matched by title/name rather than id, since these rows were inserted
-- without explicit ids (see add_new_sector_career_paths.sql's header) and
-- rely on SERIAL for their actual id.
--
-- THIS IS A DRAFT FOR REVIEW. Not yet added to migrationOrder.js — add it
-- after add_new_sector_resources.sql once that migration has actually run,
-- since these UPDATEs target rows that must already exist.

BEGIN;

-- ---------------------------------------------------------------------
-- Disciplines
-- ---------------------------------------------------------------------

UPDATE disciplines SET
  name_bn = 'পোশাক, বস্ত্র ও সরবরাহ শৃঙ্খলা',
  description_bn = 'RMG মার্চেন্ডাইজিং, QA, সোর্সিং ও উৎপাদন',
  group_name_bn = 'পোশাক, বস্ত্র ও সরবরাহ শৃঙ্খলা'
WHERE name = 'Garments, Textile & Supply Chain';

UPDATE disciplines SET
  name_bn = 'এনজিও ও উন্নয়ন খাত',
  description_bn = 'এনজিও, উন্নয়ন ও মাইক্রোফাইন্যান্স ক্যারিয়ার',
  group_name_bn = 'এনজিও ও উন্নয়ন খাত'
WHERE name = 'NGO & Development Sector';

UPDATE disciplines SET
  name_bn = 'কৃষি ও পরিবেশ',
  description_bn = 'কৃষি, মৎস্য ও পরিবেশ বিষয়ক পদ',
  group_name_bn = 'কৃষি ও পরিবেশ'
WHERE name = 'Agriculture & Environment';

UPDATE disciplines SET
  name_bn = 'স্বাস্থ্যসেবা ও ফার্মাসিউটিক্যালস',
  description_bn = 'ফার্মেসি, ফার্মা উৎপাদন ও স্বাস্থ্যসেবা',
  group_name_bn = 'স্বাস্থ্যসেবা ও ফার্মাসিউটিক্যালস'
WHERE name = 'Healthcare & Pharmaceuticals';

-- ---------------------------------------------------------------------
-- 1. Garments, Textile & Supply Chain
-- ---------------------------------------------------------------------

UPDATE career_paths SET
  title_bn = 'মার্চেন্ডাইজার',
  industry_bn = 'গার্মেন্টস/RMG',
  description_bn = 'মার্চেন্ডাইজাররা আন্তর্জাতিক ক্রেতা, ফ্যাব্রিক/ট্রিম সরবরাহকারী এবং কারখানার মধ্যে সংযোগকারী — পণ্য উন্নয়ন, কস্টিং, স্যাম্পল অনুমোদন এবং বুকিং থেকে শিপমেন্ট পর্যন্ত অর্ডার ক্যালেন্ডার পরিচালনা করেন। বাংলাদেশের RMG খাতে এটি সবচেয়ে প্রচলিত হোয়াইট-কলার পদ।',
  skills_bn = '["বায়ারের সাথে যোগাযোগ (ইংরেজি)","নেগোসিয়েশন","কস্টিং ও মূল্য নির্ধারণ","ফ্যাব্রিক ও গার্মেন্ট কনস্ট্রাকশন জ্ঞান","MS Office","সময়সীমার চাপে কাজ করা"]'::jsonb,
  progression_bn = '[{"label":"অ্যাসিস্ট্যান্ট মার্চেন্ডাইজার","time":"0–1 yr"},{"label":"মার্চেন্ডাইজার","time":"1–3 yrs","current":true},{"label":"সিনিয়র মার্চেন্ডাইজার","time":"3–8 yrs"},{"label":"মার্চেন্ডাইজিং ম্যানেজার","time":"8+ yrs"}]'::jsonb
WHERE title = 'Merchandiser' AND discipline = 'Garments, Textile & Supply Chain';

UPDATE career_paths SET
  title_bn = 'কোয়ালিটি অ্যাসুরেন্স / QC অফিসার',
  industry_bn = 'গার্মেন্টস/RMG',
  description_bn = 'বায়ারের টেক প্যাক ও SOP অনুযায়ী কারখানার উৎপাদন পর্যবেক্ষণ করেন — ফ্যাব্রিক/ট্রিম অনুমোদন, লাইন ও মেশিন চেক, শিপমেন্টের আগে প্রি-ফাইনাল ইন্সপেকশন ও সাইন-অফ — এবং জুনিয়র QC স্টাফদের প্রশিক্ষণ ও তত্ত্বাবধান করেন।',
  skills_bn = '["গার্মেন্ট ইন্সপেকশন ও পরিমাপ","ফ্যাব্রিক ও ওয়াশ টেস্টিং","বায়ার কোয়ালিটি স্ট্যান্ডার্ড (AQL)","ইংরেজি ও বাংলা যোগাযোগ","খুঁটিনাটি বিষয়ে মনোযোগ"]'::jsonb,
  progression_bn = '[{"label":"কোয়ালিটি কন্ট্রোলার / সুপারভাইজার","time":"3–7 yrs","current":true},{"label":"সিনিয়র / অফিসার, QA","time":"2–5 yrs"},{"label":"ম্যানেজার / ডেপুটি ম্যানেজার, QA","time":"10–12 yrs"}]'::jsonb
WHERE title = 'Quality Assurance / QC Officer' AND discipline = 'Garments, Textile & Supply Chain';

UPDATE career_paths SET
  title_bn = 'প্রোডাকশন প্ল্যানিং অ্যান্ড কোঅর্ডিনেশন (PPC) অফিসার',
  industry_bn = 'গার্মেন্টস/RMG',
  description_bn = 'নিশ্চিত অর্ডারগুলোকে লাইন-বাই-লাইন উৎপাদন সময়সূচিতে রূপান্তর করেন, অর্ডারের অবস্থা নিয়ে মার্চেন্ডাইজিংয়ের সাথে সমন্বয় করেন, কাঁচামাল সরবরাহের সময়সূচি নির্ধারণ করেন এবং শিপমেন্টের তারিখের বিপরীতে যেকোনো ঘাটতির মূল কারণ চিহ্নিত করেন।',
  skills_bn = '["প্রোডাকশন প্ল্যানিং ও SOP","টিম নেতৃত্ব","চাপের মধ্যে সমস্যা সমাধান","দ্বিভাষিক যোগাযোগ","কম্পিউটার দক্ষতা"]'::jsonb,
  progression_bn = '[{"label":"জুনিয়র প্ল্যানিং এক্সিকিউটিভ","time":"0–2 yrs"},{"label":"PPC অফিসার","time":"2–4 yrs","current":true},{"label":"সিনিয়র PPC অফিসার / প্ল্যানিং ম্যানেজার","time":"5–8 yrs"},{"label":"হেড অব প্ল্যানিং","time":"8+ yrs"}]'::jsonb
WHERE title = 'Production Planning & Coordination (PPC) Officer' AND discipline = 'Garments, Textile & Supply Chain';

UPDATE career_paths SET
  title_bn = 'সোর্সিং / প্রকিউরমেন্ট অফিসার',
  industry_bn = 'গার্মেন্টস/RMG',
  description_bn = 'বায়ারের স্পেসিফিকেশন ও উৎপাদন ক্যালেন্ডার অনুযায়ী ট্রিম, এক্সেসরিজ, ডাই/রাসায়নিক ও অন্যান্য উপকরণ সংগ্রহ ও দরদাম করেন, এবং সময়সূচি অনুযায়ী সরবরাহকারীর ডেলিভারি ট্র্যাক করেন।',
  skills_bn = '["সরবরাহকারী নেগোসিয়েশন ও মূল্যায়ন","প্রকিউরমেন্ট/SCM প্রক্রিয়া","MS Office","ইংরেজিতে দক্ষতা","পণ্য জ্ঞান (ট্রিম/ফ্যাব্রিক/রাসায়নিক)"]'::jsonb,
  progression_bn = '[{"label":"জুনিয়র সোর্সিং / প্রকিউরমেন্ট অফিসার","time":"0–2 yrs"},{"label":"সোর্সিং / প্রকিউরমেন্ট অফিসার","time":"2–5 yrs","current":true},{"label":"সিনিয়র সোর্সিং অফিসার / ম্যানেজার","time":"5–8 yrs"},{"label":"হেড অব সোর্সিং","time":"8+ yrs"}]'::jsonb
WHERE title = 'Sourcing / Procurement Officer' AND discipline = 'Garments, Textile & Supply Chain';

UPDATE career_paths SET
  title_bn = 'সোশ্যাল কমপ্লায়েন্স অফিসার',
  industry_bn = 'গার্মেন্টস/RMG',
  description_bn = 'কারখানা পর্যায়ে বায়ারের আচরণবিধি (BSCI, SMETA, WRAP, SEDEX, SA8000) ও বাংলাদেশ শ্রম আইন বাস্তবায়ন করেন, অডিটের প্রস্তুতি নেন, করণীয় পরিকল্পনা (CAP) লেখেন এবং স্বাস্থ্য ও নিরাপত্তা প্রশিক্ষণ পরিচালনা করেন।',
  skills_bn = '["বাংলাদেশ শ্রম আইন","বায়ার কমপ্লায়েন্স কোড (BSCI/WRAP/SMETA)","সোশ্যাল/এথিক্যাল অডিট পরিচালনা","CAP লেখা","ইংরেজি রিপোর্ট লেখা"]'::jsonb,
  progression_bn = '[{"label":"কমপ্লায়েন্স অফিসার / এক্সিকিউটিভ","time":"0–3 yrs"},{"label":"কমপ্লায়েন্স অফিসার (মিড)","time":"3–5 yrs","current":true},{"label":"সিনিয়র / অ্যাসিস্ট্যান্ট ম্যানেজার, কমপ্লায়েন্স","time":"5–8 yrs"},{"label":"হেড অব কমপ্লায়েন্স","time":"8+ yrs"}]'::jsonb
WHERE title = 'Social Compliance Officer' AND discipline = 'Garments, Textile & Supply Chain';

UPDATE career_paths SET
  title_bn = 'ইন্ডাস্ট্রিয়াল ইঞ্জিনিয়ার (RMG)',
  industry_bn = 'গার্মেন্টস/RMG',
  description_bn = 'উৎপাদনের ওয়ার্ক-স্টাডি অংশের দায়িত্বে থাকেন: প্রতিটি অপারেশনের জন্য স্ট্যান্ডার্ড মিনিট ভ্যালু (SMV) হিসাব করেন, টার্গেটের বিপরীতে সেলাই লাইন ব্যালেন্স করেন এবং সক্ষমতাকে সময়সূচিতে রূপান্তরের জন্য প্ল্যানিং টিমের সাথে কাজ করেন।',
  skills_bn = '["ওয়ার্ক স্টাডি / টাইম-মোশন বিশ্লেষণ","SMV হিসাব","লাইন ব্যালেন্সিং","Lean/Six Sigma সম্পর্কে ধারণা","ইন্ডাস্ট্রিয়াল অ্যান্ড প্রোডাকশন বা টেক্সটাইল ইঞ্জিনিয়ারিং ব্যাকগ্রাউন্ড"]'::jsonb,
  progression_bn = '[{"label":"IE ট্রেইনি / জুনিয়র IE অফিসার","time":"0–2 yrs"},{"label":"IE অফিসার / এক্সিকিউটিভ","time":"2–5 yrs","current":true},{"label":"সিনিয়র IE অফিসার / অ্যাসিস্ট্যান্ট ম্যানেজার","time":"5–8 yrs"},{"label":"IE ম্যানেজার","time":"8+ yrs"}]'::jsonb
WHERE title = 'Industrial Engineer (RMG)' AND discipline = 'Garments, Textile & Supply Chain';

-- ---------------------------------------------------------------------
-- 2. NGO & Development Sector
-- ---------------------------------------------------------------------

UPDATE career_paths SET
  title_bn = 'প্রোগ্রাম / প্রজেক্ট অফিসার',
  industry_bn = 'এনজিও/উন্নয়ন',
  description_bn = 'একটি NGO/INGO প্রোগ্রামের জন্য মাঠপর্যায়ে কার্যক্রম পরিচালনা করেন — সুবিধাভোগী নির্বাচন ও প্রশিক্ষণ, ফিল্ড ভিজিট পরিচালনা, প্রকল্প বাজেট ব্যবস্থাপনা এবং দাতা প্রতিবেদনের জন্য তথ্য সংকলন করেন।',
  skills_bn = '["ফিল্ড বাস্তবায়ন","সুবিধাভোগী জরিপ পদ্ধতি","দাতা প্রতিবেদন লেখা","MS Office","কমিউনিটি ও স্থানীয় সরকারের সাথে যোগাযোগ","সেফগার্ডিং সচেতনতা"]'::jsonb,
  progression_bn = '[{"label":"প্রজেক্ট/প্রোগ্রাম অফিসার, এন্ট্রি","time":"0–2 yrs","current":true},{"label":"প্রোগ্রাম অফিসার","time":"2–4 yrs"},{"label":"সিনিয়র প্রোগ্রাম অফিসার","time":"5+ yrs"},{"label":"প্রোগ্রাম ম্যানেজার","time":"7+ yrs"}]'::jsonb
WHERE title = 'Program / Project Officer' AND discipline = 'NGO & Development Sector';

UPDATE career_paths SET
  title_bn = 'মনিটরিং অ্যান্ড ইভালুয়েশন (M&E) অফিসার',
  industry_bn = 'এনজিও/উন্নয়ন',
  description_bn = 'ডিজিটাল তথ্য সংগ্রহের টুল ডিজাইন ও পরিচালনা করেন, ফিল্ড মনিটরিং স্টাফদের প্রশিক্ষণ দেন, তথ্যের মান যাচাই করেন এবং প্রোগ্রাম ব্যবস্থাপনা ও দাতাদের জন্য M&E প্রতিবেদন তৈরি করেন।',
  skills_bn = '["M&E / লগ-ফ্রেম ডিজাইন","পরিমাণগত ও গুণগত তথ্য সংগ্রহ","মোবাইল ডেটা টুল (যেমন ODK)","পরিসংখ্যান সফটওয়্যার","রিপোর্ট লেখা"]'::jsonb,
  progression_bn = '[{"label":"ডেটা ম্যানেজমেন্ট / মনিটরিং অফিসার","time":"~1 yr"},{"label":"M&E অফিসার","time":"~4 yrs","current":true},{"label":"M&E কোঅর্ডিনেটর / ম্যানেজার","time":"7+ yrs"},{"label":"M&E স্পেশালিস্ট / অ্যাডভাইজার","time":"senior"}]'::jsonb
WHERE title = 'Monitoring & Evaluation (M&E) Officer' AND discipline = 'NGO & Development Sector';

UPDATE career_paths SET
  title_bn = 'ফিল্ড অফিসার',
  industry_bn = 'এনজিও/উন্নয়ন',
  description_bn = 'মাইক্রোফাইন্যান্স বা কমিউনিটি-স্বাস্থ্য/উন্নয়ন প্রোগ্রামে তৃণমূল পর্যায়ের দায়িত্ব পালন করেন — সুবিধাভোগী নিবন্ধন, ঋণ বা সেবা বিতরণ ও আদায়, এবং কমিউনিটি গ্রুপ মিটিং পরিচালনা করেন।',
  skills_bn = '["কমিউনিটি মোবিলাইজেশন ও ফ্যাসিলিটেশন","বেসিক মাইক্রোফাইন্যান্স বা স্বাস্থ্য-প্রোগ্রাম জ্ঞান","রেকর্ড-কিপিং","গ্রামীণ ফিল্ডওয়ার্ক","স্থানীয় সরকারের সাথে সমন্বয়"]'::jsonb,
  progression_bn = '[{"label":"ফিল্ড অফিসার, এন্ট্রি","time":"0–1 yr","current":true},{"label":"সিনিয়র ফিল্ড অফিসার","time":"mid"},{"label":"উপজেলা / শাখা কোঅর্ডিনেটর","time":"5+ yrs"}]'::jsonb
WHERE title = 'Field Officer' AND discipline = 'NGO & Development Sector';

UPDATE career_paths SET
  title_bn = 'ক্রেডিট / ব্রাঞ্চ অফিসার (মাইক্রোফাইন্যান্স)',
  industry_bn = 'এনজিও/উন্নয়ন',
  description_bn = 'ফ্রন্ট-লাইন মাইক্রোফাইন্যান্স পদ: গ্রাহক জরিপ ও নির্বাচন, ঋণগ্রহীতা গ্রুপ গঠন, ঋণ বিতরণ, কিস্তি আদায়, এবং পোর্টফোলিওর মান ও কমপ্লায়েন্স ব্যবস্থাপনা করেন।',
  skills_bn = '["ঋণ মূল্যায়ন ও পোর্টফোলিও ব্যবস্থাপনা","ক্লায়েন্ট/গ্রুপ গঠন","নগদ অর্থ পরিচালনা","মাইক্রোফাইন্যান্স কমপ্লায়েন্স","আন্তঃব্যক্তিক/ফিল্ডওয়ার্ক দক্ষতা"]'::jsonb,
  progression_bn = '[{"label":"ক্রেডিট অফিসার / ট্রেইনি অফিসার","time":"1–2 yrs","current":true},{"label":"সিনিয়র অফিসার, কমপ্লায়েন্স অ্যান্ড সার্ভিস অ্যাসুরেন্স","time":"mid"},{"label":"ব্রাঞ্চ ম্যানেজার","time":"5–8 yrs"},{"label":"এরিয়া / রিজিওনাল ম্যানেজার","time":"8–12 yrs"}]'::jsonb
WHERE title = 'Credit / Branch Officer (Microfinance)' AND discipline = 'NGO & Development Sector';

UPDATE career_paths SET
  title_bn = 'প্রোগ্রাম কোঅর্ডিনেটর / প্রোগ্রাম ম্যানেজার',
  industry_bn = 'এনজিও/উন্নয়ন',
  description_bn = 'একটি প্রকল্প/প্রোগ্রাম পোর্টফোলিও পরিচালনা করেন, ফিল্ড স্টাফ তত্ত্বাবধান করেন, বাজেট পরিকল্পনা ও দাতা প্রতিবেদনের দায়িত্বে থাকেন, এবং বিভিন্ন প্রোগ্রাম ও সরকারি/অংশীদার স্টেকহোল্ডারদের সাথে সমন্বয় করেন।',
  skills_bn = '["প্রজেক্ট/প্রোগ্রাম ব্যবস্থাপনা","স্টাফ তত্ত্বাবধান","দাতা প্রতিবেদন ও কমপ্লায়েন্স","বহু-স্টেকহোল্ডার সমন্বয়","কৌশলগত পরিকল্পনা"]'::jsonb,
  progression_bn = '[{"label":"প্রোগ্রাম কোঅর্ডিনেটর","time":"mid","current":true},{"label":"প্রোগ্রাম ম্যানেজার","time":"7–8 yrs"},{"label":"ডেপুটি কান্ট্রি ডিরেক্টর","time":"10–15 yrs"},{"label":"কান্ট্রি ডিরেক্টর","time":"15+ yrs"}]'::jsonb
WHERE title = 'Program Coordinator / Program Manager' AND discipline = 'NGO & Development Sector';

UPDATE career_paths SET
  title_bn = 'কমিউনিকেশনস অফিসার',
  industry_bn = 'এনজিও/উন্নয়ন',
  description_bn = 'ফিল্ডওয়ার্ক থেকে গল্প-বলার কনটেন্ট ও জনসাধারণ/দাতাদের জন্য উপযোগী উপকরণ তৈরি করেন, ওয়েবসাইট/সোশ্যাল মিডিয়া কনটেন্ট পরিচালনা করেন, এবং ছবি ও ভিডিওর মাধ্যমে প্রোগ্রাম কার্যক্রম নথিভুক্ত করেন।',
  skills_bn = '["লেখালেখি ও গল্প বলা","ফটোগ্রাফি/ভিডিওগ্রাফি ও বেসিক ডিজাইন","সোশ্যাল মিডিয়া ও ডিজিটাল যোগাযোগ","দাতা-দৃশ্যমানতা কমপ্লায়েন্স","ফিল্ডওয়ার্ক ইন্টারভিউ"]'::jsonb,
  progression_bn = '[{"label":"কমিউনিকেশনস অ্যাসোসিয়েট","time":"0–3 yrs"},{"label":"কমিউনিকেশনস অফিসার","time":"3–5 yrs","current":true},{"label":"কমিউনিকেশনস ম্যানেজার","time":"5–8 yrs"},{"label":"কান্ট্রি ডিরেক্টর ট্র্যাক","time":"8+ yrs"}]'::jsonb
WHERE title = 'Communications Officer' AND discipline = 'NGO & Development Sector';

UPDATE career_paths SET
  title_bn = 'রিসার্চ অ্যান্ড অ্যাডভোকেসি অফিসার',
  industry_bn = 'এনজিও/উন্নয়ন',
  description_bn = 'গবেষণা নকশায় সহায়তা করেন, তথ্য সংগ্রহের টুল তৈরি করেন, তথ্য বিশ্লেষণ করেন, এবং প্রমাণ-ভিত্তিক অ্যাডভোকেসির জন্য গবেষণা প্রতিবেদন ও নীতি সংক্ষিপ্তসার তৈরি করেন।',
  skills_bn = '["গবেষণা নকশা ও পদ্ধতি","পরিসংখ্যানগত তথ্য বিশ্লেষণ","রিপোর্ট ও নীতি-সংক্ষিপ্তসার লেখা","অ্যাডভোকেসি/স্টেকহোল্ডার যোগাযোগ","সামাজিক বিজ্ঞান ব্যাকগ্রাউন্ড"]'::jsonb,
  progression_bn = '[{"label":"রিসার্চ অ্যানালিস্ট","time":"3 yrs","current":true},{"label":"রিসার্চ অ্যান্ড পলিসি/অ্যাডভোকেসি অফিসার","time":"mid"},{"label":"সিনিয়র রিসার্চ অফিসার","time":"senior"},{"label":"রিসার্চ অ্যান্ড অ্যাডভোকেসি ম্যানেজার","time":"leadership"}]'::jsonb
WHERE title = 'Research & Advocacy Officer' AND discipline = 'NGO & Development Sector';

UPDATE career_paths SET
  title_bn = 'গ্র্যান্টস অ্যান্ড প্রপোজাল ডেভেলপমেন্ট অফিসার',
  industry_bn = 'এনজিও/উন্নয়ন',
  description_bn = 'ফান্ডিং সুযোগ অনুসরণ করেন, দাতা প্রপোজাল ও বাজেট তৈরিতে নেতৃত্ব দেন বা অবদান রাখেন, এবং প্রাতিষ্ঠানিক বা দাতব্য দাতাদের সাথে সম্পর্ক গড়ে তোলেন।',
  skills_bn = '["গ্র্যান্ট/প্রপোজাল লেখা","বাজেট তৈরি","দাতা গবেষণা ও সম্পর্ক ব্যবস্থাপনা","দাতা প্রক্রিয়ার সাথে কমপ্লায়েন্স","ক্রস-টিম সমন্বয়"]'::jsonb,
  progression_bn = '[{"label":"পার্টনারশিপস / ফান্ডরেইজিং অফিসার","time":"3 yrs","current":true},{"label":"প্রপোজাল রাইটিং / গ্র্যান্টস অফিসার","time":"3+ yrs"},{"label":"সিনিয়র গ্র্যান্টস / পার্টনারশিপস অফিসার","time":"senior"},{"label":"হেড অব রিসোর্স মোবিলাইজেশন","time":"leadership"}]'::jsonb
WHERE title = 'Grants & Proposal Development Officer' AND discipline = 'NGO & Development Sector';

-- ---------------------------------------------------------------------
-- 3. Agriculture & Environment
-- ---------------------------------------------------------------------

UPDATE career_paths SET
  title_bn = 'এগ্রিকালচারাল এক্সটেনশন অফিসার',
  industry_bn = 'কৃষি (সরকারি — DAE)',
  description_bn = 'কৃষি সম্প্রসারণ অধিদপ্তরের (DAE) হয়ে ব্লক/ইউনিয়ন/উপজেলা পর্যায়ে ফসল উৎপাদন পরামর্শ, পোকামাকড়/রোগ নির্ণয় ও কৃষক প্রশিক্ষণ প্রদান করেন, অথবা BCS কৃষি ক্যাডার পরীক্ষার মাধ্যমে সরাসরি উপজেলা কৃষি কর্মকর্তা হিসেবে যোগদান করেন।',
  skills_bn = '["কৃষি ডিপ্লোমা বা BSc Ag","ফসল/পোকামাকড় নির্ণয়","কৃষক প্রশিক্ষণ ও সম্প্রসারণ যোগাযোগ","রেকর্ড-কিপিং/রিপোর্টিং","গ্রামীণ ফিল্ডওয়ার্ক"]'::jsonb,
  progression_bn = '[{"label":"সাব-অ্যাসিস্ট্যান্ট এগ্রিকালচার অফিসার (SAAO)","time":"entry, diploma","current":true},{"label":"এগ্রিকালচার এক্সটেনশন অফিসার","time":"mid"},{"label":"উপজেলা কৃষি কর্মকর্তা","time":"BSc/BCS entry route"},{"label":"উপপরিচালক","time":"district"},{"label":"পরিচালক","time":"divisional"}]'::jsonb
WHERE title = 'Agricultural Extension Officer' AND discipline = 'Agriculture & Environment';

UPDATE career_paths SET
  title_bn = 'অ্যাগ্রোনমিস্ট / টেকনিক্যাল অফিসার',
  industry_bn = 'কৃষি (বেসরকারি — এগ্রি-ইনপুট)',
  description_bn = 'একটি বীজ/কৃষিরাসায়নিক কোম্পানির জন্য কৃষকদের চাষাবাদ পদ্ধতি সম্পর্কে পরামর্শ দেন, নির্ধারিত গ্রামীণ এলাকায় চাহিদা তৈরি পরিচালনা করেন, এবং DAE ফিল্ড অফিস ও স্থানীয় বিক্রেতাদের সাথে যোগাযোগ রাখেন।',
  skills_bn = '["BSc/MSc কৃষি","যোগাযোগ ও আন্তঃব্যক্তিক দক্ষতা","গ্রামীণ ফিল্ডওয়ার্ক (মোটরসাইকেল ভ্রমণসহ)","ফসল-সুরক্ষা/বীজ পণ্য জ্ঞান","সমস্যা সমাধান"]'::jsonb,
  progression_bn = '[{"label":"টেরিটরি অফিসার","time":"entry","current":true},{"label":"সিনিয়র টেরিটরি অফিসার / এরিয়া ম্যানেজার","time":"mid"},{"label":"রিজিওনাল ম্যানেজার","time":"senior"},{"label":"পোর্টফোলিও ম্যানেজার / কান্ট্রি হেড","time":"leadership"}]'::jsonb
WHERE title = 'Agronomist / Technical Officer' AND discipline = 'Agriculture & Environment';

UPDATE career_paths SET
  title_bn = 'এগ্রিবিজনেস / এগ্রি-মার্কেটিং অফিসার',
  industry_bn = 'কৃষি (বেসরকারি)',
  description_bn = 'কৃষি-উপকরণের জন্য একটি বিক্রয় এলাকা পরিচালনা করেন, ব্যবসায়ী/শেষ-ব্যবহারকারী নেটওয়ার্ক গড়ে তোলেন, ক্রেডিট গ্রাহকদের সহায়তা করেন, এবং মাসিক টার্গেটের বিপরীতে বিক্রয় ও খরচের প্রতিবেদন জমা দেন।',
  skills_bn = '["BSc কৃষি/উদ্ভিদবিজ্ঞান/বনবিদ্যা/মৎস্যবিজ্ঞান","বিক্রয় টার্গেট ব্যবস্থাপনা","গ্রাহক সম্পর্ক ব্যবস্থাপনা","ভ্রমণ-নির্ভর ফিল্ডওয়ার্ক","রিপোর্টিং"]'::jsonb,
  progression_bn = '[{"label":"মার্কেটিং অফিসার","time":"1–3 yrs","current":true},{"label":"ডিস্ট্রিক্ট মার্কেটিং অফিসার","time":"mid"},{"label":"রিজিওনাল ম্যানেজার","time":"senior"}]'::jsonb
WHERE title = 'Agribusiness / Agri-Marketing Officer' AND discipline = 'Agriculture & Environment';

UPDATE career_paths SET
  title_bn = 'ফিশারিজ অ্যান্ড অ্যাকুয়াকালচার অফিসার',
  industry_bn = 'কৃষি/মৎস্য',
  description_bn = 'হ্যাচিং/রিয়ারিংয়ের মাধ্যমে মাছ চাষ করেন, পুকুরের পানির মান ও খাদ্য তদারকি করেন, মাছের স্বাস্থ্য পর্যবেক্ষণ করেন, এবং হ্যাচারি স্টাফ তত্ত্বাবধান করেন — বেসরকারি অ্যাকুয়াকালচার/ফিড কোম্পানি অথবা সরকারি মৎস্য অধিদপ্তরের ট্র্যাকে।',
  skills_bn = '["BSc মৎস্যবিজ্ঞান/প্রাণিবিদ্যা/জীববিজ্ঞান/অ্যাকুয়াকালচার","মাছ প্রজনন ও রোগ ব্যবস্থাপনা","পানির মান পর্যবেক্ষণ","স্টাফ তত্ত্বাবধান","আউটডোর ফিল্ডওয়ার্ক"]'::jsonb,
  progression_bn = '[{"label":"হ্যাচারি / ফিল্ড অফিসার","time":"entry","current":true},{"label":"অ্যাসিস্ট্যান্ট ম্যানেজার","time":"mid"},{"label":"ডেপুটি ম্যানেজার","time":"senior"},{"label":"ম্যানেজার","time":"leadership"}]'::jsonb
WHERE title = 'Fisheries & Aquaculture Officer' AND discipline = 'Agriculture & Environment';

UPDATE career_paths SET
  title_bn = 'সয়েল সায়েন্টিস্ট (SRDI)',
  industry_bn = 'কৃষি (সরকারি — SRDI)',
  description_bn = 'মাঠ ও গবেষণাগারে মাটি জরিপ ও শ্রেণিবিন্যাস করেন, মাটি/পানি/সার নমুনা বিশ্লেষণ করেন, এবং সম্প্রসারণ কর্মী, কৃষক ও পরিকল্পনাবিদদের পরামর্শ দেন — এটি মৃত্তিকা সম্পদ উন্নয়ন ইনস্টিটিউটের একটি বাংলাদেশ সিভিল সার্ভিস (কৃষি) ক্যাডার পদ।',
  skills_bn = '["BSc/MSc মৃত্তিকা বিজ্ঞান বা কৃষি","মাটি জরিপ ও ল্যাব বিশ্লেষণ","GIS/রিমোট-সেন্সিং ব্যাখ্যা","কারিগরি প্রতিবেদন লেখা","সম্প্রসারণ প্রশিক্ষণ"]'::jsonb,
  progression_bn = '[{"label":"সায়েন্টিফিক অফিসার","time":"entry","current":true},{"label":"সিনিয়র সায়েন্টিফিক অফিসার","time":"mid"},{"label":"প্রিন্সিপাল সায়েন্টিফিক অফিসার","time":"senior"},{"label":"চিফ সায়েন্টিফিক অফিসার","time":"senior"},{"label":"পরিচালক","time":"leadership"}]'::jsonb
WHERE title = 'Soil Scientist (SRDI)' AND discipline = 'Agriculture & Environment';

UPDATE career_paths SET
  title_bn = 'ক্লাইমেট অ্যান্ড এনভায়রনমেন্ট প্রজেক্ট অফিসার',
  industry_bn = 'এনজিও/উন্নয়ন — পরিবেশ',
  description_bn = 'দাতা-অর্থায়িত জলবায়ু/পরিবেশ প্রকল্পের মাঠ কার্যক্রম পরিকল্পনা, পর্যবেক্ষণ ও তত্ত্বাবধান করেন — জলবায়ু সহনশীলতা ও পরিবেশগত মান সম্পর্কে কৃষক বা কমিউনিটির সচেতনতা বৃদ্ধি করেন, এবং পরিবেশগত ও সামাজিক ব্যবস্থাপনা পরিকল্পনা তৈরি করেন।',
  skills_bn = '["এনভায়রনমেন্টাল সায়েন্স/ইঞ্জিনিয়ারিং ব্যাকগ্রাউন্ড","পরিবেশগত পর্যবেক্ষণ","ESMP তৈরি","প্রশিক্ষণ ও ফ্যাসিলিটেশন","দ্বিভাষিক ফিল্ডওয়ার্ক যোগাযোগ"]'::jsonb,
  progression_bn = '[{"label":"প্রজেক্ট / এনভায়রনমেন্ট অফিসার","time":"1–3 yrs, contractual","current":true},{"label":"সিনিয়র / টেকনিক্যাল অফিসার","time":"mid"},{"label":"প্রোগ্রাম ম্যানেজার / কোঅর্ডিনেটর","time":"senior"}]'::jsonb
WHERE title = 'Climate & Environment Project Officer' AND discipline = 'Agriculture & Environment';

-- ---------------------------------------------------------------------
-- 4. Healthcare & Pharmaceuticals
-- ---------------------------------------------------------------------

UPDATE career_paths SET
  title_bn = 'ফার্মাসিস্ট',
  industry_bn = 'ফার্মাসিউটিক্যালস/স্বাস্থ্যসেবা',
  description_bn = 'খুচরা/কমিউনিটি ফার্মেসি, হাসপাতাল ফার্মেসি, অথবা শিল্প-খাতের ফার্মাসিস্ট পদে কাজ করেন। বাংলাদেশে বৈধভাবে ফার্মেসি পরিচালনা বা তত্ত্বাবধানের জন্য DGDA ড্রাগ লাইসেন্সের পাশাপাশি ফার্মেসি কাউন্সিল অব বাংলাদেশ (PCB) নিবন্ধন আবশ্যক।',
  skills_bn = '["ফার্মাকোলজি জ্ঞান","PCB নিবন্ধন/কমপ্লায়েন্স","সঠিক ডিসপেন্সিং","ওষুধের মিথস্ক্রিয়া পরীক্ষা","ইনভেন্টরি ব্যবস্থাপনা","রোগী কাউন্সেলিং"]'::jsonb,
  progression_bn = '[{"label":"রেজিস্টার্ড / স্টাফ ফার্মাসিস্ট","time":"0–3 yrs","current":true},{"label":"সিনিয়র ফার্মাসিস্ট","time":"3–6 yrs"},{"label":"চিফ / হেড ফার্মাসিস্ট","time":"10+ yrs, requires A-grade PCB registration + M.Pharm"}]'::jsonb
WHERE title = 'Pharmacist' AND discipline = 'Healthcare & Pharmaceuticals';

UPDATE career_paths SET
  title_bn = 'মেডিকেল প্রমোশন অফিসার (ফার্মা সেলস)',
  industry_bn = 'ফার্মাসিউটিক্যালস',
  description_bn = 'হাসপাতাল ভিজিট ও প্রাইভেট ক্লিনিকের মধ্যে দিন ভাগ করে, প্রেসক্রাইবিং চিকিৎসকদের কাছে সরাসরি একটি ফার্মা কোম্পানির ওষুধের পোর্টফোলিও প্রচার করেন — ফার্মাসিউটিক্যাল শিল্পে একটি সাধারণ ফ্রেশ-গ্র্যাজুয়েট এন্ট্রি পয়েন্ট।',
  skills_bn = '["চিকিৎসকদের সাথে সম্পর্ক তৈরি","পণ্য/ফার্মাকোলজি জ্ঞান","টার্গেট-নির্ভর বিক্রয় বাস্তবায়ন","বাংলা ও ইংরেজি যোগাযোগ","সময় ব্যবস্থাপনা"]'::jsonb,
  progression_bn = '[{"label":"মেডিকেল প্রমোশন অফিসার (MPO)","time":"0–2 yrs","current":true},{"label":"প্রোডাক্ট / টেরিটরি এক্সিকিউটিভ","time":"2–5 yrs"},{"label":"এরিয়া / রিজিওনাল সেলস ম্যানেজার","time":"5+ yrs"}]'::jsonb
WHERE title = 'Medical Promotion Officer (Pharma Sales)' AND discipline = 'Healthcare & Pharmaceuticals';

UPDATE career_paths SET
  title_bn = 'কোয়ালিটি অ্যাসুরেন্স / QC অফিসার (ফার্মা)',
  industry_bn = 'ফার্মাসিউটিক্যালস',
  description_bn = 'ফার্মাকোপিয়া স্ট্যান্ডার্ডের বিপরীতে কাঁচামাল ও তৈরি পণ্যের রাসায়নিক/ভৌত পরীক্ষা পরিচালনা ও তত্ত্বাবধান করেন, GMP ব্যাচ রিলিজের জন্য বিশ্লেষণাত্মক তথ্য পর্যালোচনা করেন, এবং পদ্ধতি যাচাইকরণে সহায়তা করেন।',
  skills_bn = '["অ্যানালিটিক্যাল কেমিস্ট্রি / HPLC","GMP ও ফার্মাকোপিয়া স্ট্যান্ডার্ড (BP/USP/EP)","ডেটা ইন্টিগ্রিটি ও SOP নিয়মানুবর্তিতা","খুঁটিনাটি বিষয়ে মনোযোগ","অডিট/কমপ্লায়েন্স সচেতনতা (QA পর্যায়ে)"]'::jsonb,
  progression_bn = '[{"label":"QC অফিসার","time":"0–2 yrs","current":true},{"label":"সিনিয়র / এক্সিকিউটিভ অফিসার, QA বা QC","time":"2–5 yrs"},{"label":"QA/QC ম্যানেজার","time":"5+ yrs"}]'::jsonb
WHERE title = 'Quality Assurance / QC Officer (Pharma)' AND discipline = 'Healthcare & Pharmaceuticals';

UPDATE career_paths SET
  title_bn = 'রেগুলেটরি অ্যাফেয়ার্স অফিসার (ফার্মা)',
  industry_bn = 'ফার্মাসিউটিক্যালস',
  description_bn = 'কোম্পানির পোর্টফোলিওর জন্য পণ্য ও ওষুধ নিবন্ধন অনুমোদন নিশ্চিত করতে ঔষধ প্রশাসন অধিদপ্তরের (DGDA) সাথে যোগাযোগ রাখেন।',
  skills_bn = '["DGDA প্রবিধান জ্ঞান","ডসিয়ার/ডকুমেন্টেশন তৈরি","রেগুলেটরের সাথে যোগাযোগ ও নেগোসিয়েশন","ফার্মেসি/ফার্মাকোলজি ব্যাকগ্রাউন্ড","কমপ্লায়েন্সে মনোযোগ"]'::jsonb,
  progression_bn = '[{"label":"রেগুলেটরি অ্যাফেয়ার্স অফিসার","time":"0–3 yrs","current":true},{"label":"অ্যাসিস্ট্যান্ট / ডেপুটি ম্যানেজার, RA","time":"2–5 yrs"},{"label":"ম্যানেজার / হেড অব রেগুলেটরি অ্যাফেয়ার্স","time":"senior"}]'::jsonb
WHERE title = 'Regulatory Affairs Officer (Pharma)' AND discipline = 'Healthcare & Pharmaceuticals';

UPDATE career_paths SET
  title_bn = 'প্রোডাকশন / ফর্মুলেশন অফিসার (ফার্মা)',
  industry_bn = 'ফার্মাসিউটিক্যালস',
  description_bn = 'চাহিদার বিপরীতে উৎপাদন সময়সূচি তৈরি করেন, প্রতিটি ব্যাচের জন্য ব্যাচ ম্যানুফ্যাকচারিং/প্যাকেজিং রেকর্ড সম্পন্ন করেন, এবং কারখানায় ইন-প্রসেস চেকের জন্য QA-এর সাথে সমন্বয় করেন।',
  skills_bn = '["ফার্মাসিউটিক্যাল উৎপাদন জ্ঞান","GMP ও ব্যাচ ডকুমেন্টেশন (BMR/BPR)","উৎপাদন সময়সূচি","টিম তত্ত্বাবধান","যন্ত্রপাতি/প্রক্রিয়া জ্ঞান"]'::jsonb,
  progression_bn = '[{"label":"প্রোডাকশন অফিসার / ট্রেইনি","time":"0–2 yrs","current":true},{"label":"সিনিয়র অফিসার","time":"2–4 yrs"},{"label":"অ্যাসিস্ট্যান্ট প্রোডাকশন ম্যানেজার","time":"2–4 yrs + B/M.Pharm"},{"label":"প্রোডাকশন ম্যানেজার","time":"5+ yrs"}]'::jsonb
WHERE title = 'Production / Formulation Officer (Pharma)' AND discipline = 'Healthcare & Pharmaceuticals';

UPDATE career_paths SET
  title_bn = 'মেডিকেল টেকনোলজিস্ট / ল্যাব ডায়াগনস্টিকস অফিসার',
  industry_bn = 'স্বাস্থ্যসেবা',
  description_bn = 'নমুনা সংগ্রহ ও গবেষণাগার পরীক্ষা পরিচালনা করেন (যেমন SOP অনুযায়ী ডায়াগনস্টিক যন্ত্রপাতি ব্যবহার), এবং হাসপাতাল, এনজিও বা বেসরকারি ডায়াগনস্টিক ল্যাব নিয়োগকর্তার জন্য ল্যাব লজিস্টিকস ও মান বজায় রাখেন।',
  skills_bn = '["মেডিকেল টেকনোলজি (ল্যাব) ডিপ্লোমা","নমুনা সংগ্রহ/পরিচালনা","ল্যাব যন্ত্রপাতি পরিচালনা","SOP মেনে চলা ও রেকর্ড-কিপিং","বেসিক কোয়ালিটি-কন্ট্রোল নিয়মানুবর্তিতা"]'::jsonb,
  progression_bn = '[{"label":"মেডিকেল টেকনোলজিস্ট, এন্ট্রি","time":"0–2 yrs","current":true},{"label":"সিনিয়র মেডিকেল টেকনোলজিস্ট","time":"mid"},{"label":"ল্যাব সুপারভাইজার / ইন-চার্জ","time":"senior"}]'::jsonb
WHERE title = 'Medical Technologist / Lab Diagnostics Officer' AND discipline = 'Healthcare & Pharmaceuticals';

-- ---------------------------------------------------------------------
-- Resources
-- ---------------------------------------------------------------------

UPDATE resources SET
  title_bn = 'মার্চেন্ডাইজার রিজিউমে কীভাবে লিখবেন (গার্মেন্ট ইন্ডাস্ট্রি নমুনাসহ)',
  description_bn = 'একটি বাস্তব গার্মেন্ট মার্চেন্ডাইজার প্রোফাইলের নমুনা রিজিউমে এবং একটি টেইলরিং চেকলিস্টসহ, মার্চেন্ডাইজার/বায়িং-হাউজ সিভি সাজানোর ধাপে ধাপে গাইড।'
WHERE title_en = 'How to Write a Merchandiser Resume (With Garment Industry Sample)' AND discipline = 'Garments, Textile & Supply Chain';

UPDATE resources SET
  title_bn = 'Bdjobs.com-এ গার্মেন্টস/টেক্সটাইল চাকরি',
  description_bn = 'বাংলাদেশের সবচেয়ে বড় চাকরির সাইটে গার্মেন্টস/টেক্সটাইল শিল্পের জন্য লাইভ, ফিল্টারযোগ্য চাকরির তালিকা, যেখানে মার্চেন্ডাইজার, QC অফিসার, ইন্ডাস্ট্রিয়াল ইঞ্জিনিয়ার ও কমপ্লায়েন্স পদ অন্তর্ভুক্ত।'
WHERE title_en = 'Garments/Textile Jobs on Bdjobs.com' AND discipline = 'Garments, Textile & Supply Chain';

UPDATE resources SET
  title_bn = 'BGMEA ইউনিভার্সিটি অব ফ্যাশন অ্যান্ড টেকনোলজি (BUFT) — প্রোগ্রাম',
  description_bn = 'BGMEA-এর নিজস্ব বিশ্ববিদ্যালয়, যেখানে RMG-নির্দিষ্ট স্নাতকোত্তর ডিপ্লোমা ও সার্টিফিকেট কোর্স পাওয়া যায়, যার মধ্যে রয়েছে অ্যাপারেল মার্চেন্ডাইজিং এবং নিটওয়্যার/ওভেন গার্মেন্টস মার্চেন্ডাইজিং।'
WHERE title_en = 'BGMEA University of Fashion & Technology (BUFT) — Programs' AND discipline = 'Garments, Textile & Supply Chain';

UPDATE resources SET
  title_bn = 'কার্যকর ডেভেলপমেন্ট সিভি তৈরি: ধাপে ধাপে গাইড (Devex)',
  description_bn = 'আন্তর্জাতিক ডেভেলপমেন্ট ও এনজিও পদের জন্য সিভি লেখার একটি ব্যবহারিক গাইড, যেখানে ডাইরেক্ট-হায়ার বনাম দাতা-টেন্ডার আবেদন এবং টার্মস অফ রেফারেন্সের সাথে সিভি মিলানো নিয়ে আলোচনা করা হয়েছে, সাথে টেমপ্লেটসহ।'
WHERE title_en = 'Preparing Effective Development CVs: A Step-by-Step Guide (Devex)' AND discipline = 'NGO & Development Sector';

UPDATE resources SET
  title_bn = 'ReliefWeb জবস — মানবিক ও উন্নয়ন খাতের চাকরির বোর্ড',
  description_bn = 'UN সংস্থা, INGO এবং উন্নয়ন/মানবিক সংগঠনের শূন্যপদের একটি বৈশ্বিক চাকরির বোর্ড, যা দেশ (বাংলাদেশসহ) ও ভূমিকা অনুযায়ী ফিল্টার করা যায়।'
WHERE title_en = 'ReliefWeb Jobs — Humanitarian & Development Sector Job Board' AND discipline = 'NGO & Development Sector';

UPDATE resources SET
  title_bn = 'ডেভেলপমেন্টের জন্য প্রজেক্ট ম্যানেজমেন্ট (PM4R পদ্ধতি)',
  description_bn = 'রেজাল্টস-বেসড প্রজেক্ট ম্যানেজমেন্ট (PM4R) পদ্ধতির উপর একটি ফ্রি কোর্স — সময়সূচি, বাজেট, ঝুঁকি ও স্টেকহোল্ডার ভূমিকা নিয়ে — যা এনজিও ও দাতা-অর্থায়িত প্রকল্পের জন্য তৈরি।'
WHERE title_en = 'Project Management for Development (PM4R Methodology)' AND discipline = 'NGO & Development Sector';

UPDATE resources SET
  title_bn = 'কৃষি পদের জন্য চাকরি-জয়ী সিভি কীভাবে লিখবেন',
  description_bn = 'কৃষি/ফার্মিং চাকরিপ্রার্থীদের জন্য ফরম্যাটিং, প্রাসঙ্গিক অভিজ্ঞতা নির্বাচন ও কভার-লেটার টিপসসহ একটি খাত-নির্দিষ্ট সিভি গাইড।'
WHERE title_en = 'How to Write a Job-Winning CV for Farming and Agriculture Roles' AND discipline = 'Agriculture & Environment';

UPDATE resources SET
  title_bn = 'BPSC — সরকারি চাকরির বিজ্ঞপ্তি (কৃষি ক্যাডারসহ)',
  description_bn = 'নিয়োগ বিজ্ঞপ্তির জন্য বাংলাদেশ পাবলিক সার্ভিস কমিশনের অফিসিয়াল পোর্টাল, যেখানে BCS কৃষি ক্যাডার এবং DAE ও BADC সম্পর্কিত নন-ক্যাডার পদ অন্তর্ভুক্ত।'
WHERE title_en = 'BPSC — Government Job Circulars (incl. Agriculture Cadre)' AND discipline = 'Agriculture & Environment';

UPDATE resources SET
  title_bn = 'খাদ্য ও কৃষির আধুনিক বিষয়সমূহ (ইলিনয় বিশ্ববিদ্যালয়, Coursera)',
  description_bn = 'কৃষি ও খাদ্য ব্যবস্থায় টেকসইতা, সংরক্ষণ, প্রযুক্তি ও নীতি নিয়ে একটি বিশ্ববিদ্যালয়-পরিচালিত কোর্স, যা একটি অ্যাগ্রিবিজনেস স্পেশালাইজেশনের অংশ।'
WHERE title_en = 'Modern Issues in Food & Agriculture (University of Illinois, Coursera)' AND discipline = 'Agriculture & Environment';

UPDATE resources SET
  title_bn = 'ফার্মেসি পদের জন্য কার্যকর সিভি কীভাবে লিখবেন',
  description_bn = 'রয়্যাল ফার্মাসিউটিক্যাল সোসাইটির জার্নাল থেকে একটি খাত-নির্দিষ্ট সিভি গাইড, যেখানে গঠন, চাকরির শর্তের সাথে মিলানো, ইমপ্যাক্ট স্টেটমেন্ট ও ATS কীওয়ার্ড নিয়ে আলোচনা করা হয়েছে।'
WHERE title_en = 'How to Write an Effective CV for Pharmacy Roles' AND discipline = 'Healthcare & Pharmaceuticals';

UPDATE resources SET
  title_bn = 'স্কয়ার ফার্মাসিউটিক্যালস ই-রিক্রুটমেন্ট পোর্টাল',
  description_bn = 'বাংলাদেশের সবচেয়ে বড় ফার্মাসিউটিক্যাল কোম্পানি স্কয়ার ফার্মাসিউটিক্যালসের অফিসিয়াল চাকরির পোর্টাল, যেখানে QA/প্রোডাকশন, মেডিকেল ও সেলস পদে লাইভ শূন্যপদ তালিকাভুক্ত।'
WHERE title_en = 'Square Pharmaceuticals eRecruitment Portal' AND discipline = 'Healthcare & Pharmaceuticals';

UPDATE resources SET
  title_bn = 'ফার্মাসিউটিক্যাল ইন্ডাস্ট্রির ভূমিকা (গ্লাসগো বিশ্ববিদ্যালয়, Coursera)',
  description_bn = 'ওষুধ উন্নয়ন জীবনচক্র, ক্লিনিক্যাল ট্রায়াল, রেগুলেটরি কমপ্লায়েন্স ও ফার্মাকোভিজিল্যান্স নিয়ে একটি শুরুর কোর্স — রেগুলেটরি অ্যাফেয়ার্স বা QA পদের জন্য উপকারী ভিত্তি।'
WHERE title_en = 'Introduction to the Pharmaceutical Industry (University of Glasgow, Coursera)' AND discipline = 'Healthcare & Pharmaceuticals';

COMMIT;
