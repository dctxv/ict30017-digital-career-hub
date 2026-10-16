-- Module: add_new_sector_career_paths  [DRAFT — NOT YET APPLIED TO ANY DATABASE]
--
-- Fills the 4 near-empty categories identified in the career-path category
-- audit: Garments/Textile & Supply Chain, NGO & Development Sector,
-- Agriculture & Environment, and Healthcare & Pharmaceuticals (the last one
-- reframed away from the existing generic "Science/research" framing).
--
-- See new_sector_research.md for full citations. Every salary figure below is
-- tagged inline as either plain (a real, dated posting/article gave this
-- number — no tag needed) or "(estimated)" (no real posting gave a figure for
-- this role/stage; the number is interpolated from comparable, confirmed BD
-- roles in the same sector and seniority tier, NOT pulled from an external
-- salary survey). A second research pass specifically for the fields that
-- were still NULL tried payscale.com and similar sites directly; see
-- "REJECTED SOURCES" in new_sector_research.md for why those results were NOT
-- used (tiny, self-reported samples with implausible ranges, and one site
-- whose occupation pages are templated estimates off national GNI data, not
-- measured wages).
--
-- salary_entry/salary_senior AND disciplines.description are capped at 50
-- characters on the live database (narrower than the TEXT type both have in
-- create_content_tables.sql — the hosted table has diverged from the tracked
-- schema; this never surfaced before because every existing discipline
-- description and salary string already happened to be under 50 chars). The
-- full one-sentence reasoning behind each "(estimated)" salary figure does
-- not fit in 50 chars, so it was moved out of the value and into
-- "Salary-field reasoning, kept in full" at the bottom of
-- new_sector_research.md instead — nothing was dropped, just relocated. The
-- 4 new discipline descriptions were shortened to short taglines to match the
-- style (and length) of the existing 7.
--
-- THIS IS A DRAFT FOR REVIEW. It is now listed in migrationOrder.js (after
-- add_discipline_groups.sql, since the disciplines INSERT below writes
-- group_name) but should not be run against the shared hosted database until
-- a human has spot-checked a sample of these figures — ESPECIALLY every field
-- marked "(estimated)" below, since those are reasoned interpolations, not
-- sourced facts, and the client has explicitly asked for acknowledged,
-- authentic sourcing on this data.
--
-- IDs are intentionally omitted throughout so this is purely additive via
-- the SERIAL sequence — it cannot collide with the existing 70 career_paths
-- or 7 disciplines rows.

BEGIN;

-- ---------------------------------------------------------------------
-- New disciplines
-- ---------------------------------------------------------------------

INSERT INTO disciplines (name, description, group_name) VALUES
  ('Garments, Textile & Supply Chain', 'RMG merchandising, QA, sourcing and production', 'Garments, Textile & Supply Chain'),
  ('NGO & Development Sector', 'NGO, development and microfinance careers', 'NGO & Development Sector'),
  ('Agriculture & Environment', 'Agriculture, fisheries and environment roles', 'Agriculture & Environment'),
  ('Healthcare & Pharmaceuticals', 'Pharmacy, pharma manufacturing and healthcare', 'Healthcare & Pharmaceuticals')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------
-- 1. Garments, Textile & Supply Chain
-- ---------------------------------------------------------------------

INSERT INTO career_paths (title, industry, discipline, description, skills, progression, salary_entry, salary_senior) VALUES

('Merchandiser', 'Garments/RMG', 'Garments, Textile & Supply Chain',
 'Merchandisers are the link between international buyers, fabric/trim suppliers and the factory floor — handling product development, costing, sample approval and the order calendar from booking through shipment. The single most common white-collar role in Bangladesh''s RMG sector.',
 '["Buyer communication (English)","Negotiation","Costing & pricing","Fabric & garment construction knowledge","MS Office","Working under deadline pressure"]'::jsonb,
 '[{"label":"Assistant Merchandiser","time":"0–1 yr"},{"label":"Merchandiser","time":"1–3 yrs","current":true},{"label":"Senior Merchandiser","time":"3–8 yrs"},{"label":"Merchandising Manager","time":"8+ yrs"}]'::jsonb,
 'BDT 15,000', 'BDT 80,000–300,000+'),

('Quality Assurance / QC Officer', 'Garments/RMG', 'Garments, Textile & Supply Chain',
 'Monitors factory production against buyer tech packs and SOPs — fabric/trim approval, line and machine checks, pre-final inspection and sign-off before shipment — and trains/supervises junior QC staff.',
 '["Garment inspection & measurement","Fabric & wash testing","Buyer quality standards (AQL)","English + Bangla communication","Attention to detail"]'::jsonb,
 '[{"label":"Quality Controller / Supervisor","time":"3–7 yrs","current":true},{"label":"Senior / Officer, QA","time":"2–5 yrs"},{"label":"Manager / Deputy Manager, QA","time":"10–12 yrs"}]'::jsonb,
 'BDT 18,000–25,000 (estimated)',
 'BDT 70,000–120,000 (estimated)'),

('Production Planning & Coordination (PPC) Officer', 'Garments/RMG', 'Garments, Textile & Supply Chain',
 'Turns confirmed orders into a line-by-line production schedule, coordinates with merchandising on order status, schedules raw-material supply, and root-causes any gap against the shipment date.',
 '["Production planning & SOPs","Team leadership","Problem-solving under pressure","Bilingual communication","Computer literacy"]'::jsonb,
 '[{"label":"Junior Planning Executive","time":"0–2 yrs"},{"label":"PPC Officer","time":"2–4 yrs","current":true},{"label":"Senior PPC Officer / Planning Manager","time":"5–8 yrs"},{"label":"Head of Planning","time":"8+ yrs"}]'::jsonb,
 'BDT 30,000–32,000 (Officer grade, 2–4 yrs exp)',
 'BDT 80,000–140,000 (estimated)'),

('Sourcing / Procurement Officer', 'Garments/RMG', 'Garments, Textile & Supply Chain',
 'Sources and price-negotiates trims, accessories, dyes/chemicals and other inputs against buyer specs and the production calendar, and tracks supplier delivery against schedule.',
 '["Supplier negotiation & evaluation","Procurement/SCM process","MS Office","English fluency","Product knowledge (trims/fabric/chemicals)"]'::jsonb,
 '[{"label":"Junior Sourcing / Procurement Officer","time":"0–2 yrs"},{"label":"Sourcing / Procurement Officer","time":"2–5 yrs","current":true},{"label":"Senior Sourcing Officer / Manager","time":"5–8 yrs"},{"label":"Head of Sourcing","time":"8+ yrs"}]'::jsonb,
 'BDT 20,000–28,000 (estimated)',
 'BDT 80,000–150,000 (estimated — interpolated)'),

('Social Compliance Officer', 'Garments/RMG', 'Garments, Textile & Supply Chain',
 'Implements buyer codes of conduct (BSCI, SMETA, WRAP, SEDEX, SA8000) and Bangladesh labour law at factory level, preparing for audits, writing corrective action plans and running health & safety training.',
 '["Bangladesh labour law","Buyer compliance codes (BSCI/WRAP/SMETA)","Social/ethical audit handling","CAP writing","English report writing"]'::jsonb,
 '[{"label":"Compliance Officer / Executive","time":"0–3 yrs"},{"label":"Compliance Officer (mid)","time":"3–5 yrs","current":true},{"label":"Senior / Assistant Manager, Compliance","time":"5–8 yrs"},{"label":"Head of Compliance","time":"8+ yrs"}]'::jsonb,
 'BDT 18,000–25,000 (estimated)',
 'BDT 70,000–120,000 (estimated)'),

('Industrial Engineer (RMG)', 'Garments/RMG', 'Garments, Textile & Supply Chain',
 'Owns the work-study side of production: calculates Standard Minute Value (SMV) for each operation, balances sewing lines against targets, and works with planning to translate capacity into schedules.',
 '["Work study / time-motion analysis","SMV calculation","Line balancing","Lean/Six Sigma familiarity","Industrial & Production or Textile Engineering background"]'::jsonb,
 '[{"label":"IE Trainee / Junior IE Officer","time":"0–2 yrs"},{"label":"IE Officer / Executive","time":"2–5 yrs","current":true},{"label":"Senior IE Officer / Assistant Manager","time":"5–8 yrs"},{"label":"IE Manager","time":"8+ yrs"}]'::jsonb,
 'BDT 22,000–30,000 (estimated)',
 'BDT 80,000–150,000 (estimated — interpolated)');

-- ---------------------------------------------------------------------
-- 2. NGO & Development Sector
-- ---------------------------------------------------------------------

INSERT INTO career_paths (title, industry, discipline, description, skills, progression, salary_entry, salary_senior) VALUES

('Program / Project Officer', 'NGO/Development', 'NGO & Development Sector',
 'Delivers project activities in the field for an NGO/INGO program — selecting and training beneficiaries, running field visits, managing project budgets, and compiling data for donor reports.',
 '["Field implementation","Beneficiary survey methods","Donor report writing","MS Office","Community & local-government liaison","Safeguarding awareness"]'::jsonb,
 '[{"label":"Project/Program Officer, entry","time":"0–2 yrs","current":true},{"label":"Program Officer","time":"2–4 yrs"},{"label":"Senior Program Officer","time":"5+ yrs"},{"label":"Program Manager","time":"7+ yrs"}]'::jsonb,
 'BDT 45,000–50,000', 'BDT 80,000–90,000'),

('Monitoring & Evaluation (M&E) Officer', 'NGO/Development', 'NGO & Development Sector',
 'Designs and runs digital data-collection tools, trains field monitoring staff, checks data quality, and produces M&E reports for program management and donors.',
 '["M&E / log-frame design","Quantitative & qualitative data collection","Mobile data tools (e.g. ODK)","Statistical software","Report writing"]'::jsonb,
 '[{"label":"Data Management / Monitoring Officer","time":"~1 yr"},{"label":"M&E Officer","time":"~4 yrs","current":true},{"label":"M&E Coordinator / Manager","time":"7+ yrs"},{"label":"M&E Specialist / Advisor","time":"senior"}]'::jsonb,
 'BDT 50,000 (at ~4 yrs, no entry figure)',
 'BDT 90,000–130,000 (estimated)'),

('Field Officer', 'NGO/Development', 'NGO & Development Sector',
 'Grassroots-facing role in microfinance or community-health/development programs — enrolling beneficiaries, disbursing and collecting loans or services, and running community group meetings.',
 '["Community mobilization & facilitation","Basic microfinance or health-program knowledge","Record-keeping","Rural fieldwork","Coordination with local government"]'::jsonb,
 '[{"label":"Field Officer, entry","time":"0–1 yr","current":true},{"label":"Senior Field Officer","time":"mid"},{"label":"Upazila / Branch Coordinator","time":"5+ yrs"}]'::jsonb,
 'BDT 20,000–28,000 (estimated)',
 'BDT 45,000–65,000 (estimated — interpolated)'),

('Credit / Branch Officer (Microfinance)', 'NGO/Development', 'NGO & Development Sector',
 'Front-line microfinance role: surveys and selects clients, forms borrower groups, disburses loans, collects installments, and manages portfolio quality and compliance.',
 '["Loan appraisal & portfolio management","Client/group formation","Cash handling","Microfinance compliance","Interpersonal/fieldwork skills"]'::jsonb,
 '[{"label":"Credit Officer / Trainee Officer","time":"1–2 yrs","current":true},{"label":"Senior Officer, Compliance & Service Assurance","time":"mid"},{"label":"Branch Manager","time":"5–8 yrs"},{"label":"Area / Regional Manager","time":"8–12 yrs"}]'::jsonb,
 'BDT 18,000–25,000 (estimated)',
 'BDT 50,000–80,000 (estimated — interpolated)'),

('Program Coordinator / Program Manager', 'NGO/Development', 'NGO & Development Sector',
 'Manages a project/program portfolio, supervises field staff, owns budget planning and donor reporting, and coordinates across programs and with government/partner stakeholders.',
 '["Project/program management","Staff supervision","Donor reporting & compliance","Multi-stakeholder coordination","Strategic planning"]'::jsonb,
 '[{"label":"Program Coordinator","time":"mid","current":true},{"label":"Program Manager","time":"7–8 yrs"},{"label":"Deputy Country Director","time":"10–15 yrs"},{"label":"Country Director","time":"15+ yrs"}]'::jsonb,
 'BDT 60,000 (Coordinator level, no fresher)',
 '~BDT 229,000 (n=6, low confidence)'),

('Communications Officer', 'NGO/Development', 'NGO & Development Sector',
 'Produces storytelling content and public/donor-facing material from fieldwork, manages website/social media content, and documents program activities via photography and video.',
 '["Writing & storytelling","Photography/videography & basic design","Social media & digital communications","Donor-visibility compliance","Fieldwork interviewing"]'::jsonb,
 '[{"label":"Communications Associate","time":"0–3 yrs"},{"label":"Communications Officer","time":"3–5 yrs","current":true},{"label":"Communications Manager","time":"5–8 yrs"},{"label":"Country Director track","time":"8+ yrs"}]'::jsonb,
 'BDT 50,000', 'BDT 70,000–80,000 (at 4–5 yrs)'),

('Research & Advocacy Officer', 'NGO/Development', 'NGO & Development Sector',
 'Supports research design, builds data-collection tools, analyzes data, and drafts research reports and policy briefs for evidence-based advocacy.',
 '["Research design & methodology","Statistical data analysis","Report & policy-brief writing","Advocacy/stakeholder liaison","Social-science background"]'::jsonb,
 '[{"label":"Research Analyst","time":"3 yrs","current":true},{"label":"Research & Policy/Advocacy Officer","time":"mid"},{"label":"Senior Research Officer","time":"senior"},{"label":"Research & Advocacy Manager","time":"leadership"}]'::jsonb,
 'BDT 45,000–60,000 (estimated)',
 'BDT 90,000–120,000 (estimated — interpolated)'),

('Grants & Proposal Development Officer', 'NGO/Development', 'NGO & Development Sector',
 'Tracks funding opportunities, leads or contributes to donor proposal and budget development, and builds relationships with institutional or philanthropic donors.',
 '["Grant/proposal writing","Budget development","Donor research & relationship management","Compliance with donor processes","Cross-team coordination"]'::jsonb,
 '[{"label":"Partnerships / Fundraising Officer","time":"3 yrs","current":true},{"label":"Proposal Writing / Grants Officer","time":"3+ yrs"},{"label":"Senior Grants / Partnerships Officer","time":"senior"},{"label":"Head of Resource Mobilization","time":"leadership"}]'::jsonb,
 'BDT 63,579 (at 3 yrs, no fresher)', '~BDT 79,500 (at 3+ yrs, different role tier)');

-- ---------------------------------------------------------------------
-- 3. Agriculture & Environment
-- ---------------------------------------------------------------------

INSERT INTO career_paths (title, industry, discipline, description, skills, progression, salary_entry, salary_senior) VALUES

('Agricultural Extension Officer', 'Agriculture (Government — DAE)', 'Agriculture & Environment',
 'Delivers crop-production advice, pest/disease diagnosis and farmer training at block/union/upazila level for the Department of Agricultural Extension (DAE), or enters directly as Upazila Agriculture Officer via the BCS Agriculture cadre exam.',
 '["Agriculture diploma or BSc Ag","Crop/pest diagnosis","Farmer training & extension communication","Record-keeping/reporting","Rural fieldwork"]'::jsonb,
 '[{"label":"Sub-Assistant Agriculture Officer (SAAO)","time":"entry, diploma","current":true},{"label":"Agriculture Extension Officer","time":"mid"},{"label":"Upazila Agriculture Officer","time":"BSc/BCS entry route"},{"label":"Deputy Director","time":"district"},{"label":"Director","time":"divisional"}]'::jsonb,
 'BDT 16,000 (SAAO, Grade 10 basic — 2015 pay scale)',
 'BDT 66,000+ (estimated, Grade 2 proxy)'),

('Agronomist / Technical Officer', 'Agriculture (Private — Agri-input)', 'Agriculture & Environment',
 'Advises growers on agronomic practices for a seed/agrochemical company, manages demand-generation in an assigned rural territory, and liaises with DAE field offices and local stockists.',
 '["BSc/MSc Agriculture","Communication & interpersonal skills","Rural fieldwork (incl. motorcycle travel)","Crop-protection/seed product knowledge","Problem-solving"]'::jsonb,
 '[{"label":"Territory Officer","time":"entry","current":true},{"label":"Senior Territory Officer / Area Manager","time":"mid"},{"label":"Regional Manager","time":"senior"},{"label":"Portfolio Manager / Country Head","time":"leadership"}]'::jsonb,
 'BDT 20,000–28,000 (estimated)',
 'BDT 70,000–120,000 (estimated — interpolated)'),

('Agribusiness / Agri-Marketing Officer', 'Agriculture (Private)', 'Agriculture & Environment',
 'Manages a sales territory for agro-inputs, builds trader/end-user networks, supports credit customers, and submits sales and expense reports against monthly targets.',
 '["BSc Agriculture/Botany/Forestry/Fisheries","Sales target management","Customer relationship management","Travel-heavy fieldwork","Reporting"]'::jsonb,
 '[{"label":"Marketing Officer","time":"1–3 yrs","current":true},{"label":"District Marketing Officer","time":"mid"},{"label":"Regional Manager","time":"senior"}]'::jsonb,
 'BDT 20,000–28,000 (estimated)',
 'BDT 70,000–120,000 (estimated — interpolated)'),

('Fisheries & Aquaculture Officer', 'Agriculture/Fisheries', 'Agriculture & Environment',
 'Breeds fish via hatching/rearing, oversees pond water quality and feeding, monitors fish health, and supervises hatchery staff — in private aquaculture/feed companies or the government Department of Fisheries track.',
 '["BSc Fisheries/Zoology/Biology/Aquaculture","Fish propagation & disease management","Water-quality monitoring","Staff supervision","Outdoor fieldwork"]'::jsonb,
 '[{"label":"Hatchery / Field Officer","time":"entry","current":true},{"label":"Assistant Manager","time":"mid"},{"label":"Deputy Manager","time":"senior"},{"label":"Manager","time":"leadership"}]'::jsonb,
 'BDT 20,000–28,000 (estimated)',
 'BDT 60,000–100,000 (estimated — interpolated)'),

('Soil Scientist (SRDI)', 'Agriculture (Government — SRDI)', 'Agriculture & Environment',
 'Conducts field and laboratory soil surveys and classification, analyzes soil/water/fertilizer samples, and advises extension workers, farmers and planners — a Bangladesh Civil Service (Agriculture) cadre role at the Soil Resources Development Institute.',
 '["BSc/MSc Soil Science or Agriculture","Soil survey & lab analysis","GIS/remote-sensing interpretation","Technical report writing","Extension training"]'::jsonb,
 '[{"label":"Scientific Officer","time":"entry","current":true},{"label":"Senior Scientific Officer","time":"mid"},{"label":"Principal Scientific Officer","time":"senior"},{"label":"Chief Scientific Officer","time":"senior"},{"label":"Director","time":"leadership"}]'::jsonb,
 'BDT 22,000 (Grade 9 basic, estimated)',
 'BDT 66,000 (Grade 2 basic, confirmed)'),

('Climate & Environment Project Officer', 'NGO/Development — Environment', 'Agriculture & Environment',
 'Plans, monitors and supervises field activities for donor-funded climate/environment projects — raising farmer or community awareness on climate resilience and environmental standards, and preparing Environmental and Social Management Plans.',
 '["Environmental Science/Engineering background","Environmental monitoring","ESMP preparation","Training & facilitation","Bilingual fieldwork communication"]'::jsonb,
 '[{"label":"Project / Environment Officer","time":"1–3 yrs, contractual","current":true},{"label":"Senior / Technical Officer","time":"mid"},{"label":"Programme Manager / Coordinator","time":"senior"}]'::jsonb,
 'BDT 50,000 (3+ yrs exp, no fresher)',
 'BDT 80,000–110,000 (estimated)');

-- ---------------------------------------------------------------------
-- 4. Healthcare & Pharmaceuticals
-- ---------------------------------------------------------------------

INSERT INTO career_paths (title, industry, discipline, description, skills, progression, salary_entry, salary_senior) VALUES

('Pharmacist', 'Pharmaceuticals/Healthcare', 'Healthcare & Pharmaceuticals',
 'Works in retail/community pharmacies, hospital pharmacies, or industry pharmacist roles. Running or supervising a Bangladeshi pharmacy legally requires Pharmacy Council of Bangladesh (PCB) registration alongside a DGDA drug license.',
 '["Pharmacology knowledge","PCB registration/compliance","Dispensing accuracy","Drug-interaction checking","Inventory management","Patient counseling"]'::jsonb,
 '[{"label":"Registered / Staff Pharmacist","time":"0–3 yrs","current":true},{"label":"Senior Pharmacist","time":"3–6 yrs"},{"label":"Chief / Head Pharmacist","time":"10+ yrs, requires A-grade PCB registration + M.Pharm"}]'::jsonb,
 'BDT 23,000–27,000 (estimated, category avg)',
 'BDT 80,000–150,000 (estimated)'),

('Medical Promotion Officer (Pharma Sales)', 'Pharmaceuticals', 'Healthcare & Pharmaceuticals',
 'Promotes a pharma company''s drug portfolio directly to prescribing physicians, splitting the day between hospital visits and private clinics — a common fresh-graduate entry point into the pharmaceutical industry.',
 '["Relationship-building with doctors","Product/pharmacology knowledge","Target-driven sales execution","Bangla + English communication","Time management"]'::jsonb,
 '[{"label":"Medical Promotion Officer (MPO)","time":"0–2 yrs","current":true},{"label":"Product / Territory Executive","time":"2–5 yrs"},{"label":"Area / Regional Sales Manager","time":"5+ yrs"}]'::jsonb,
 'BDT 25,000–45,000 (estimated, stale base)',
 'BDT 60,000–100,000 (estimated — interpolated)'),

('Quality Assurance / QC Officer (Pharma)', 'Pharmaceuticals', 'Healthcare & Pharmaceuticals',
 'Performs and supervises chemical/physical testing of raw materials and finished products against pharmacopoeia standards, reviews analytical data for GMP batch release, and supports method validation.',
 '["Analytical chemistry / HPLC","GMP & pharmacopoeia standards (BP/USP/EP)","Data integrity & SOP discipline","Attention to detail","Audit/compliance literacy (QA level)"]'::jsonb,
 '[{"label":"QC Officer","time":"0–2 yrs","current":true},{"label":"Senior / Executive Officer, QA or QC","time":"2–5 yrs"},{"label":"QA/QC Manager","time":"5+ yrs"}]'::jsonb,
 'BDT 20,000–30,000 (estimated)',
 'BDT 60,000–100,000 (estimated — interpolated)'),

('Regulatory Affairs Officer (Pharma)', 'Pharmaceuticals', 'Healthcare & Pharmaceuticals',
 'Liaises with the Directorate General of Drug Administration (DGDA) to secure product and drug registration approvals for a company''s portfolio.',
 '["DGDA regulation knowledge","Dossier/documentation preparation","Regulator liaison & negotiation","Pharmacy/pharmacology background","Compliance attention to detail"]'::jsonb,
 '[{"label":"Regulatory Affairs Officer","time":"0–3 yrs","current":true},{"label":"Assistant / Deputy Manager, RA","time":"2–5 yrs"},{"label":"Manager / Head of Regulatory Affairs","time":"senior"}]'::jsonb,
 'BDT 25,000–35,000 (estimated)',
 'BDT 80,000–150,000 (estimated — interpolated)'),

('Production / Formulation Officer (Pharma)', 'Pharmaceuticals', 'Healthcare & Pharmaceuticals',
 'Prepares production schedules against demand, completes Batch Manufacturing/Packaging Records for each batch, and coordinates with QA on in-process checks on the factory floor.',
 '["Pharmaceutical manufacturing knowledge","GMP & batch documentation (BMR/BPR)","Production scheduling","Team supervision","Machinery/process knowledge"]'::jsonb,
 '[{"label":"Production Officer / Trainee","time":"0–2 yrs","current":true},{"label":"Senior Officer","time":"2–4 yrs"},{"label":"Asst. Production Manager","time":"2–4 yrs + B/M.Pharm"},{"label":"Production Manager","time":"5+ yrs"}]'::jsonb,
 'BDT 22,000–30,000 (estimated)',
 'BDT 70,000–120,000 (estimated — interpolated)'),

('Medical Technologist / Lab Diagnostics Officer', 'Healthcare', 'Healthcare & Pharmaceuticals',
 'Performs sample collection and laboratory testing (e.g. diagnostics equipment per SOPs), and maintains lab logistics and quality standards for a hospital, NGO or private diagnostic-lab employer.',
 '["Diploma in Medical Technology (Lab)","Sample collection/handling","Lab equipment operation","SOP adherence & record-keeping","Basic quality-control discipline"]'::jsonb,
 '[{"label":"Medical Technologist, entry","time":"0–2 yrs","current":true},{"label":"Senior Medical Technologist","time":"mid"},{"label":"Lab Supervisor / In-charge","time":"senior"}]'::jsonb,
 'BDT 15,000',
 'BDT 35,000–50,000 (estimated)');

COMMIT;

-- ---------------------------------------------------------------------
-- Deliberately NOT included in this draft (see new_sector_research.md for why):
--   Garments: standalone "Textile Engineer" (it's a feeder degree, not a
--     posted title), "Supply Chain Manager" (only a non-RMG posting found).
--   Agriculture: Horticulturist, Forestry Officer (degree-level track
--     unsourced — only the non-degree "Forester" field post is confirmed).
--   Healthcare: Clinical Research Associate (no BD-specific posting found,
--     only a low-sample salary survey), Hospital/Healthcare Administrator
--     (no usable source found at all).
-- All six are real roles worth a dedicated follow-up search before adding.
