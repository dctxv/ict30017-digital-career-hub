-- Module: fix_tier1_resource_links  [DRAFT — NOT YET APPLIED TO ANY DATABASE]
--
-- Fixes 32 of the 54 resources that existed before this migration (the 12
-- new-sector resources added by add_new_sector_resources.sql were already
-- verified when written and are untouched here).
--
-- Triggered by the client's request to show whether a resource's source is
-- reliable/authentic. While researching that, a full audit of the live
-- resources table (via scripts/list-resources.js) found two kinds of real
-- problems, not just "needs a reliability label":
--
--   1. The exact same URL reused across unrelated resources — a dead giveaway
--      of copy-paste placeholder data, not a real per-resource source:
--        - youtube.com/watch?v=Q0Ychzwgfow reused 5x (ids 42,32,27,25,10)
--        - scribd.com/document/160183049/CV-Format-Final reused 4x (1,11,26,31)
--          (also a login-walled Scribd doc, not freely readable)
--        - youtube.com/watch?v=ZBcPLf2UTx4 reused 2x (7,20)
--        - youtube.com/watch?v=1NuTj6j3bU4 reused 2x (12,40)
--        - the Dhaka-civil-engineer Glassdoor page reused 2x (2,22)
--        - github.com/TamimEhsan/interview-questions-bangladesh reused 2x (17,21)
--        - the bare codecamp.asthait.com homepage reused 2x (5,15)
--        - bdjobs.com/h/jobs?fcatID=1 reused 2x (9,39)
--
--   2. A real, live page whose actual content simply doesn't match the
--      resource's title (confirmed by fetching each page directly, not just
--      trusting the domain/title) — e.g. "Best coding bootcamps for
--      Bangladeshi students" linked to a Daily Star article about a
--      government economic strategic plan with no bootcamp content at all.
--
-- Every replacement URL below was individually fetched and read (not just a
-- search snippet) before being accepted, following the same standard used
-- for the 12 new-sector resources and the client's Oct 8 2026 standard:
-- "I need to know the source, if that's authentic... if it's coming from
-- somewhere, we need to acknowledge them." Bangladesh-specific sources were
-- preferred; where none genuinely fit, a reputable international source was
-- used instead rather than forcing a weak local match — see commit/chat
-- notes for the per-resource verification reasoning.
--
-- `type` is corrected alongside `url` for 7 rows where the real replacement
-- source is a different medium than originally labeled (e.g. a Video slot
-- where no genuine matching video existed, replaced with a verified
-- article/guide instead — honest relabeling rather than forcing a video).
--
-- Two caveats worth flagging to the client, not blocking:
--   - id 8's replacement (Dhaka Tribune, financial certifications) is a
--     2014 article — still live and on-topic, but dated.
--   - ids 22, 16, 19 use reputable international sources because no live,
--     genuinely matching Bangladesh-specific source could be found despite
--     searching.
--
-- THIS IS A DRAFT FOR REVIEW. Not yet added to migrationOrder.js.

BEGIN;

-- All disciplines
UPDATE resources SET url = 'https://www.youtube.com/watch?v=mi2mCQGejMM' WHERE id = 42;
UPDATE resources SET url = 'https://cdc.daffodilvarsity.edu.bd/interview-tips' WHERE id = 2;
UPDATE resources SET url = 'https://www.thefinancialexpress.com.bd/trade/employers-find-wide-skill-gap-study-1638672781', type = 'Article' WHERE id = 4;

-- Arts
UPDATE resources SET url = 'https://www.youtube.com/watch?v=nlY3IMn047k' WHERE id = 32;
UPDATE resources SET url = 'https://www.bls.gov/careeroutlook/2018/article/creative-careers-update.htm' WHERE id = 33;

-- Business
UPDATE resources SET url = 'https://www.youtube.com/watch?v=G-ZLiUWT4UQ' WHERE id = 27;
UPDATE resources SET url = 'https://standout-cv.com/cv-examples/business-operations/corporate-cv' WHERE id = 31;
UPDATE resources SET url = 'https://bikroy.com/jobs/business' WHERE id = 29;

-- Education
UPDATE resources SET url = 'https://www.youtube.com/watch?v=mt-2QVIhxV4' WHERE id = 40;
UPDATE resources SET url = 'https://www.thedailystar.net/opinion/views/news/quality-training-crucial-primary-school-teachers-3224491' WHERE id = 38;
UPDATE resources SET url = 'https://bikroy.com/teaching-jobs' WHERE id = 39;

-- Engineering
UPDATE resources SET url = 'https://www.youtube.com/watch?v=IXZSqTjenhk' WHERE id = 25;
UPDATE resources SET url = 'https://imeche.org/careers-education/careers-information/mechanical-engineering-careers-guide/write-a-great-cv' WHERE id = 26;
UPDATE resources SET url = 'https://techbullion.com/top-5-must-have-engineering-software-skills-for-2025our-guide-how-to-not-be-replaced-by-ai/', type = 'Article' WHERE id = 23;
UPDATE resources SET url = 'https://www.thedailystar.net/campus/career/news/why-are-bangladeshs-brightest-engineering-minds-leaving-3701521' WHERE id = 24;
UPDATE resources SET url = 'https://careerkarma.com/blog/civil-engineer-interview-questions-and-answers/' WHERE id = 22;

-- Finance
UPDATE resources SET url = 'https://forum.daffodilvarsity.edu.bd/index.php/topic,1437.0.html', type = 'Guide' WHERE id = 7;
UPDATE resources SET url = 'https://www.aiub.edu/offices/opa/career-portal/brush-up-your-cv' WHERE id = 1;
UPDATE resources SET url = 'https://www.efinancialcareers.com/news/2023/01/banking-cv' WHERE id = 11;
UPDATE resources SET url = 'https://bdjobs.com/h/jobs?lang=en&fcatId=2' WHERE id = 9;
UPDATE resources SET url = 'https://www.dhakatribune.com/feature/career/90195/global-certification-for-chartered-financial' WHERE id = 8;
UPDATE resources SET url = 'https://ubwp.buffalo.edu/business-management-mba-ms/?p=3668', type = 'Article' WHERE id = 10;

-- IT
UPDATE resources SET url = 'https://www.youtube.com/watch?v=XOtrOSatBoY' WHERE id = 12;
UPDATE resources SET url = 'https://codecamp.asthait.com/logic-camp/' WHERE id = 5;
UPDATE resources SET url = 'https://dev.to/mehrdadkhodaverdi/teamwork-and-communication-the-hidden-skills-of-a-software-engineer-30gk' WHERE id = 15;
UPDATE resources SET url = 'https://www.coursereport.com/cities/dhaka' WHERE id = 13;
UPDATE resources SET url = 'https://www.freecodecamp.org/news/heres-the-resume-i-used-to-get-a-job-at-google-as-a-software-engineer-26516526f29a/', type = 'Article' WHERE id = 16;

-- Science
UPDATE resources SET url = 'https://pubs.rsc.org/en/content/articlehtml/2021/ta/d1ta90183d', type = 'Article' WHERE id = 20;
UPDATE resources SET url = 'https://rolecatcher.com/en/interviews/careers/professionals/education-professionals/university-teachers/university-teachers/university-research-assistant' WHERE id = 17;
UPDATE resources SET url = 'https://www.srgtalent.com/blog/how-to-write-a-scientific-cv' WHERE id = 21;
UPDATE resources SET url = 'https://rolecatcher.com/en/skills/knowledge/natural-sciences-mathematics-and-statistics/biological-and-related-sciences/laboratory-techniques', type = 'Article' WHERE id = 18;
UPDATE resources SET url = 'https://targetjobs.co.uk/careers-advice/science-and-research/beyond-science-alternative-graduate-careers-scientists' WHERE id = 19;

COMMIT;
