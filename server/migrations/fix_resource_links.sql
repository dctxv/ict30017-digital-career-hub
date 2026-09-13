-- Replace resource URLs that did not match their displayed titles or types.
-- Approved resource audit: 9 records.
BEGIN;

UPDATE resources SET url = 'https://www.aaop.org.au/work-experience-model' WHERE id = 4;
UPDATE resources SET url = 'https://www.bdjobs.com/cover_letter/Step_by_Step.asp' WHERE id = 6;
UPDATE resources SET url = 'https://eea.org.au/courses/project-management-essentials' WHERE id = 23;
UPDATE resources SET url = 'https://www.pon.harvard.edu/daily/negotiation-skills-daily/what-is-negotiation/' WHERE id = 30;
UPDATE resources SET url = 'https://www.arts.ac.uk/students/student-careers/freelance-and-business-support/how-to-work-as-a-freelancer' WHERE id = 34;
UPDATE resources SET url = 'https://www.coursera.org/learn/leadership-storytelling' WHERE id = 35;
UPDATE resources SET url = 'https://www.prospects.ac.uk/careers-advice/cvs-and-cover-letters/creative-cvs/' WHERE id = 36;
UPDATE resources SET url = 'https://www.indeed.com/career-advice/interviewing/teacher-interview-questions' WHERE id = 37;
UPDATE resources SET url = 'https://www.indeed.com/career-advice/resumes-cover-letters/cv-for-teacher' WHERE id = 41;

COMMIT;
