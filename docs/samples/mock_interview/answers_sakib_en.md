# Answer bank — Md. Sakib Hasan (CSE fresher, Junior Software Engineer)

Stories the persona can draw on when answering the five questions. Written the
way a fresher actually talks in an interview: specific, a little plain, and
honest about what he has not done. Adapt to whatever the model asks; do not
paste a story under a question it does not answer.

## Self-introduction

I finished my B.Sc. in CSE at BRAC University in 2025 with a CGPA of 3.41. My
final year project was a campus meal ordering system where I built the Node.js
backend and the MySQL database, and my team got an A. I did a three-month
internship at Techno Solutions where I fixed bugs in a PHP inventory system and
learned how a real team uses Git and stand-ups. I am most comfortable with
JavaScript, React and Node, and I am looking for a junior role where I can work
on a product with real users.

## Teamwork / conflict

In the final year project we were three people. One teammate kept changing the
database schema without telling the rest of us, so my API broke twice in one
week. I asked for a short meeting and proposed that any schema change goes in a
shared document first and gets a message in our group before it is pushed. We
agreed, and after that we had no more broken builds from schema changes. We
finished a week before the deadline.

## Failure / mistake

At my internship I pushed a bug fix straight to the main branch without a pull
request because I thought it was small. It broke the stock report page for
about two hours before a senior noticed. I apologised, reverted it, and from
then on I always opened a pull request and asked for a review, even for a
one-line change. The senior later said the habit was more important than the
fix itself.

## Debugging / technical problem

In the meal ordering system, orders were sometimes saved twice. I added logging
around the order endpoint and found that the frontend fired the submit twice on
a slow connection because the button was not disabled after the first click. I
fixed it on both sides: disabled the button while the request was pending and
added a unique order token so the backend rejects a duplicate.

## REST API / SQL knowledge

I have written REST APIs in Express with routes for create, read, update and
delete, and returned proper status codes like 201 and 404. In SQL I am
comfortable with joins, group by and indexes on foreign keys. I have used MySQL
mostly; I have not used PostgreSQL in a project but I understand it is similar
for the queries I write.

## Git

I use feature branches, commit small changes with a clear message, and open a
pull request. I have resolved merge conflicts a few times in the final year
project when two of us edited the same route file.

## Why this company / role

I want to work on a product that real companies use every day, and the
logistics platform in the advertisement is exactly that. The stack is React and
Node, which is what I know best, and I would like to learn PostgreSQL and
Docker properly from a team that uses them.

## Salary expectation

I saw the range of 35,000 to 45,000 in the advertisement. As a fresher I would
be happy within that range, and I care more about learning from the team in the
first year.

## Weakness

My spoken English is weaker than my written English. I have started speaking in
English in the weekly meetings at the computer club to practise, and I am
comfortable writing tickets and emails in English.
