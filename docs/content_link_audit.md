# Resource link audit

Every row in `resources` was reported as showing a title that does not match
the page it opens. This is what can be established from the seed data alone.

**The link destinations themselves have not been checked.** Verifying them needs
outbound access to the hosts involved, which the environment this audit was run
in does not have. Nothing below is a guess about page content — every finding is
provable from `seed_content_data.sql` without opening a single link. No
replacement URLs have been written: a plausible-looking wrong link is worse than
a flagged one, because it stops looking like a problem.

42 rows reference 23 distinct URLs.

## 1. Rows whose `type` contradicts the link

The badge on the card, its colour, and whether the link reads "Watch" or
"Read more" all come from `type`. These rows promise one medium and open
another, so the card is wrong before the destination is even considered.

| id | declared type | link actually is | title |
|---:|---|---|---|
| 4 | Video | Article | Soft skills in Asian professional culture — what employers expect |
| 6 | Guide | Article | How to write a cover letter for Bangladeshi employers |
| 23 | Course | Article | Must-have software skills for engineers |
| 30 | Guide | Article | Negotiation and persuasion skills for business professionals |
| 34 | Guide | Video | Freelancing and remote work opportunities for arts graduates |
| 35 | Course | Article | Creative thinking and storytelling in the workplace |
| 36 | Guide | Article | How to write a CV for creative roles |
| 37 | Guide | Video | How to prepare for teaching job interviews |
| 41 | Guide | Article | How to write a CV for teaching positions |

9 rows.

## 2. One URL serving titles from different categories

The seed file notes that some guides are "deliberately listed against more than
one discipline or category". Reusing one CV-format document across the finance,
engineering and business CV guides is defensible — same resource, several
audiences. Reusing one link across genuinely different *topics* is not, and that
is what these are.

### `https://www.youtube.com/watch?v=Q0Ychzwgfow`

6 rows across 3 categories:

- **id 10** _Soft Skills_ — Soft skills every finance professional needs
- **id 25** _Soft Skills_ — Project management skills for engineers
- **id 27** _Interview Prep_ — How to prepare for marketing and sales interviews
- **id 32** _Interview Prep_ — Portfolio preparation for creative job interviews
- **id 34** _Job Search_ — Freelancing and remote work opportunities for arts graduates
- **id 42** _Job Search_ — How to network as a fresh graduate in Bangladesh

### `https://www.youtube.com/watch?v=ZBcPLf2UTx4`

3 rows across 2 categories:

- **id 7** _Interview Prep_ — How to ace finance interviews at Bangladeshi banks
- **id 20** _Soft Skills_ — Scientific writing and publishing for early career researchers
- **id 37** _Interview Prep_ — How to prepare for teaching job interviews

### `https://www.thedailystar.net/tech-startup/news/why-entrepreneurship-must-be-bangladeshs-next-national-mission-4108111`

2 rows across 2 categories:

- **id 4** _Soft Skills_ — Soft skills in Asian professional culture — what employers expect
- **id 33** _Skill Development_ — Skills you need for media and creative careers

### `https://codecamp.asthait.com/`

2 rows across 2 categories:

- **id 5** _Skill Development_ — Building technical skills for software engineering roles
- **id 15** _Soft Skills_ — Communication and teamwork in software development

### `https://www.youtube.com/watch?v=1NuTj6j3bU4`

2 rows across 2 categories:

- **id 12** _Interview Prep_ — Technical interview preparation for software engineers
- **id 40** _Soft Skills_ — Classroom management and communication skills

### `https://github.com/TamimEhsan/interview-questions-bangladesh`

2 rows across 2 categories:

- **id 17** _Interview Prep_ — Interview tips for research assistant positions
- **id 21** _Resume Writing_ — How to write a research CV for science roles

### `https://www.epicflow.com/blog/engineering-project-management-the-essential-guide/`

2 rows across 2 categories:

- **id 23** _Skill Development_ — Must-have software skills for engineers
- **id 35** _Soft Skills_ — Creative thinking and storytelling in the workplace

## What to do with this

Each row above needs a human to open the link and either replace the URL or
rewrite the title to match what is actually there. Both are editable in the
admin dashboard without a migration.

The resources table in the admin dashboard now marks any URL used by more than
one row, so this class of error is visible while editing rather than only after
someone clicks through and notices.
