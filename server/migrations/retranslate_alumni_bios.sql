-- Re-translates alumni.bio_bn to match the "run the site strictly in
-- Bangla" decision from add_full_bilingual_content.sql.
--
-- seed_bangla_content.sql wrote these bios under the OLDER rule stated in
-- add_bilingual_content.sql -- "job titles, employer names, institutions,
-- skills and technologies stay in English, because that is how a
-- Bangladeshi job seeker writes and searches for them". That rule was
-- explicitly overridden later for career_paths.title/skills/progression and
-- for alumni.full_name/institution/current_role (see
-- add_full_bilingual_content.sql's header), but the bios themselves were
-- never revisited, so they still read as Bangla sentence structure wrapped
-- around English job-title phrases and employer names -- "সাদিয়া Pathao-তে
-- backend developer হিসেবে কাজ করেন" -- which is what a বাংলা-mode reader
-- sees on the Alumni page today.
--
-- This rewrites each bio in full Bangla script: employer names are
-- transliterated (Pathao -> পাঠাও, BRAC Bank -> ব্র্যাক ব্যাংক, ...) and
-- English job-title phrases are translated to the same vocabulary already
-- used for current_role_bn elsewhere in the dashboard. Named software,
-- platform and certification products are kept in Latin script, matching
-- the one exception add_full_bilingual_content.sql itself carves out for
-- skills_bn (Excel, PostgreSQL, React, AWS, AutoCAD, CFA, GMP, ...) --
-- those are brand names, not vocabulary, and transliterating a product name
-- like "Node.js" or "React" is not how Bangla tech writing actually renders
-- them.
--
-- Idempotent: only ever writes bio_bn by seeded id, so re-running it is
-- safe and cannot disturb the English bio or any other column.

BEGIN;

UPDATE alumni SET bio_bn = 'সাদিয়া পাঠাও-তে ব্যাকএন্ড ডেভেলপার হিসেবে কাজ করেন। তিনি Node.js ও মাইক্রোসার্ভিসেস আর্কিটেকচারে দক্ষ। বিশ্ববিদ্যালয়ে থাকতে তিনি বুয়েট কোডিং ক্লাবের নেতৃত্ব দিয়েছেন এবং সেলাইজ ডিজিটাল প্ল্যাটফর্মস-এ ইন্টার্ন করেছেন।' WHERE id = 1;
UPDATE alumni SET bio_bn = 'রাকিব ব্র্যাক ব্যাংকে আর্থিক বিশ্লেষক হিসেবে কাজ করেন। তিনি CFA লেভেল ২ সম্পন্ন করেছেন এবং এর আগে স্ট্যান্ডার্ড চার্টার্ড ব্যাংকে ইন্টার্ন করেছেন। তিনি শিক্ষার্থীদের আর্থিক মডেলিং ও Excel-এর দক্ষতায় মনোযোগ দিতে পরামর্শ দেন।' WHERE id = 2;
UPDATE alumni SET bio_bn = 'তানিয়া আইসিডিডিআর,বি-র সংক্রামক রোগ বিভাগে গবেষণা সহযোগী হিসেবে কাজ করেন। তিনি ৩টি গবেষণাপত্রের সহ-লেখক এবং বর্তমানে জনস্বাস্থ্যে স্নাতকোত্তর (মাস্টার অফ পাবলিক হেলথ) করছেন।' WHERE id = 3;
UPDATE alumni SET bio_bn = 'মেহেদী রংস প্রপার্টিজ লিমিটেডে অবকাঠামো প্রকল্প পরিচালনা করেন। তিনি ঢাকায় ৫টি বড় আবাসিক প্রকল্প তদারকি করেছেন এবং প্রকল্প পরিকল্পনা ও ব্যয় নিরূপণে দক্ষ।' WHERE id = 4;
UPDATE alumni SET bio_bn = 'নুসরাত ইউনিলিভার বাংলাদেশে ব্র্যান্ড নির্বাহী হিসেবে কাজ করেন। তিনি লাইফবয় ব্র্যান্ড দেখাশোনা করেন এবং লক্ষ লক্ষ গ্রাহকের কাছে পৌঁছানো সফল ডিজিটাল প্রচারণার নেতৃত্ব দিয়েছেন।' WHERE id = 5;
UPDATE alumni SET bio_bn = 'আরিফ শহজ-এ ফ্রন্টএন্ড ডেভেলপার হিসেবে কাজ করেন। React এবং ব্যবহারবান্ধব ইন্টারফেস তৈরিতে তাঁর আগ্রহ। তিনি নিজের সাবেক বিশ্ববিদ্যালয়ের শিক্ষার্থীদের মেন্টরও করেন।' WHERE id = 6;
UPDATE alumni SET bio_bn = 'ফারজানা দ্য ডেইলি স্টার-এর ডিজিটাল শাখার কনটেন্ট কৌশল পরিচালনা করেন। তিনি সোশ্যাল মিডিয়ার জন্য আকর্ষণীয় কনটেন্ট তৈরি করেন এবং তাঁদের ইনস্টাগ্রাম অনুসারীর সংখ্যা ৫ লাখে নিয়ে গেছেন।' WHERE id = 7;
UPDATE alumni SET bio_bn = 'শাহিদ গ্রামীণফোনে ম্যানেজমেন্ট ট্রেইনি। এমটি প্রোগ্রামের অংশ হিসেবে তিনি সেলস, মার্কেটিং ও অপারেশনস-সহ বিভিন্ন বিভাগে ঘুরে কাজ করছেন।' WHERE id = 8;
UPDATE alumni SET bio_bn = 'মৌমিতা এলজিইডি-তে জুনিয়র প্রকৌশলী হিসেবে কাজ করেন। তিনি ৩টি জেলায় গ্রামীণ সড়ক উন্নয়ন প্রকল্পে কাজ করেছেন এবং টেকসই অবকাঠামো নিয়ে আগ্রহী।' WHERE id = 9;
UPDATE alumni SET bio_bn = 'ইমরান স্কয়ার ফার্মাসিউটিক্যালসের মান নিয়ন্ত্রণ বিভাগে কাজ করেন। তিনি পণ্য GMP মান পূরণ করছে কি না তা নিশ্চিত করেন এবং ৩টি সফল পণ্য বাজারজাতকরণে অবদান রেখেছেন।' WHERE id = 10;

COMMIT;
