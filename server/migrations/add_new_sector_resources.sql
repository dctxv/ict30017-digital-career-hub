-- Module: add_new_sector_resources  [DRAFT — NOT YET APPLIED TO ANY DATABASE]
--
-- Adds 3 resources each (Resume Writing, Job Search, Skill Development) for
-- the 4 new disciplines added by add_new_sector_career_paths.sql: Garments,
-- Textile & Supply Chain; NGO & Development Sector; Agriculture &
-- Environment; Healthcare & Pharmaceuticals. 12 rows total. Interview Prep
-- and Soft Skills were intentionally left out for these 4 — the existing
-- "All disciplines" resources already cover that generic advice, and these
-- 3 categories are where sector-specific content actually differs.
--
-- Every URL below was opened directly (not just a search snippet) and its
-- real content checked against the title/description before being included —
-- this follows the client's explicit standard from the Oct 8 2026 meeting:
-- "I need to know the source, if that's authentic source or not... if it is
-- coming from somewhere, we need to acknowledge them." See
-- "New-sector resources: sourcing notes" in new_sector_research.md for the
-- per-link verification note and which ones are sector-specific-but-not-
-- Bangladesh-specific (flagged honestly rather than overstated).
--
-- THIS IS A DRAFT FOR REVIEW. Not yet added to migrationOrder.js. Given that
-- career_paths and disciplines both turned out to have shorter real column
-- limits than their migration files describe, run
-- `node scripts/check-schema.js` (now also covers `resources`) before
-- applying this, and shorten any value here that doesn't fit.

BEGIN;

INSERT INTO resources (title_en, description_en, type, discipline, category, url) VALUES

-- Garments, Textile & Supply Chain
('How to Write a Merchandiser Resume (With Garment Industry Sample)',
 'A step-by-step guide to structuring a merchandiser/buying-house CV, with a sample resume built around a real garment merchandiser profile and a tailoring checklist.',
 'Guide', 'Garments, Textile & Supply Chain', 'Resume Writing',
 'https://www.cake.me/resources/resume/merchandiser-resume'),

('Garments/Textile Jobs on Bdjobs.com',
 'Live, filterable job listings for the Garments/Textile industry on Bangladesh''s largest job site, covering Merchandiser, QC Officer, Industrial Engineer and Compliance roles.',
 'Article', 'Garments, Textile & Supply Chain', 'Job Search',
 'https://bdjobs.com/h/jobs?lang=en&icatId=2'),

('BGMEA University of Fashion & Technology (BUFT) — Programs',
 'BGMEA''s own university, offering RMG-specific postgraduate diplomas and certificate courses, including Apparel Merchandising and Knitwear/Woven Garments Merchandising.',
 'Course', 'Garments, Textile & Supply Chain', 'Skill Development',
 'https://buft.edu.bd/programs'),

-- NGO & Development Sector
('Preparing Effective Development CVs: A Step-by-Step Guide (Devex)',
 'A practical guide to writing CVs for international development and NGO roles, covering direct-hire vs. donor-tender applications and matching a CV to a Terms of Reference, with templates.',
 'PDF', 'NGO & Development Sector', 'Resume Writing',
 'https://www.colorado.edu/center/mortenson/sites/default/files/attached-files/devex_preparing_effective_development_cvs_0.pdf'),

('ReliefWeb Jobs — Humanitarian & Development Sector Job Board',
 'A global job board listing vacancies at UN agencies, INGOs and development/humanitarian organisations, filterable by country (including Bangladesh) and by role.',
 'Guide', 'NGO & Development Sector', 'Job Search',
 'https://reliefweb.int/jobs'),

('Project Management for Development (PM4R Methodology)',
 'A free course on the Results-Based Project Management (PM4R) methodology — scheduling, budgeting, risk and stakeholder roles — framed for NGO and donor-funded projects.',
 'Course', 'NGO & Development Sector', 'Skill Development',
 'https://www.coursera.org/learn/project-management-for-development'),

-- Agriculture & Environment
('How to Write a Job-Winning CV for Farming and Agriculture Roles',
 'A sector-specific CV guide covering formatting, relevant experience selection and cover-letter tips for agriculture/farming job applicants.',
 'Guide', 'Agriculture & Environment', 'Resume Writing',
 'https://www.fwi.co.uk/business/farming-cvs-eight-tips-writing-job-winning-resume'),

('BPSC — Government Job Circulars (incl. Agriculture Cadre)',
 'The official Bangladesh Public Service Commission portal for recruitment circulars, including the BCS Agriculture cadre and non-cadre postings relevant to DAE and BADC.',
 'Article', 'Agriculture & Environment', 'Job Search',
 'https://bpsc.gov.bd/'),

('Modern Issues in Food & Agriculture (University of Illinois, Coursera)',
 'A university-taught course on sustainability, conservation, technology and policy in agriculture and food systems, part of an Agribusiness specialization.',
 'Course', 'Agriculture & Environment', 'Skill Development',
 'https://www.coursera.org/learn/modern-issues-in-food-and-agriculture'),

-- Healthcare & Pharmaceuticals
('How to Write an Effective CV for Pharmacy Roles',
 'A sector-specific CV guide from the Royal Pharmaceutical Society''s journal, covering structure, tailoring to job criteria, impact statements and ATS keywords.',
 'Guide', 'Healthcare & Pharmaceuticals', 'Resume Writing',
 'https://pharmaceutical-journal.com/article/ld/writing-an-effective-cv-for-pharmacy-roles-a-guide-for-graduates'),

('Square Pharmaceuticals eRecruitment Portal',
 'The official job portal of Square Pharmaceuticals, Bangladesh''s largest pharmaceutical company, listing live openings across QA/production, medical and sales roles.',
 'Article', 'Healthcare & Pharmaceuticals', 'Job Search',
 'http://career.squarepharma.com.bd/'),

('Introduction to the Pharmaceutical Industry (University of Glasgow, Coursera)',
 'A beginner course covering the drug development lifecycle, clinical trials, regulatory compliance and pharmacovigilance — useful groundwork for regulatory affairs or QA roles.',
 'Course', 'Healthcare & Pharmaceuticals', 'Skill Development',
 'https://www.coursera.org/learn/introduction-to-the-pharmaceutical-industry');

COMMIT;
