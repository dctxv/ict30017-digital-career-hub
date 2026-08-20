/**
 * Module: prompt/stages
 * Responsibility: One block per candidate stage. Exactly one is loaded.
 *
 * Stage governs section ordering and whether an Objective or a Summary belongs
 * at the top. Bdjobs guidance is explicit that an objective suits fresh or
 * lightly experienced applicants while a summary suits experienced ones, and
 * that freshers lead with education. The old prompt had no ordering rules at
 * all, so it applied experienced-candidate expectations to students.
 */

const STAGE_BLOCKS = {
  student: `CANDIDATE STAGE - STUDENT

The highest relevant qualification is still ongoing.

- Expected order: contact, objective, education, projects and coursework,
  training, any internship or part-time work, skills, extracurricular activity.
- Education BEFORE experience is correct here. Do not flag it.
- A Career Objective is appropriate.
- Academic projects, coursework, competitions, club roles and volunteering are the
  primary evidence. Assess them as seriously as you would employment.
- Never criticise limited work history as though it were a defect. Assess how well
  the available evidence is presented.
- An ongoing qualification must be labelled as ongoing with an expected completion
  date. That is correct, not an error.`,

  fresher: `CANDIDATE STAGE - FRESHER

Recently graduated, under roughly two years of relevant full-time work.

- Expected order: contact, objective, education, projects or thesis, training,
  internships and any employment, skills, extracurricular activity.
- Education BEFORE experience is correct here. Do not flag it.
- A targeted Career Objective is appropriate and conventional.
- Internships, industrial attachments, final-year projects and thesis work are
  primary evidence. Expect the candidate's own contribution to be identifiable.
- Extracurricular involvement, leadership and volunteering carry real weight for
  freshers in this market. Their absence is worth raising; one-word hobby lists
  are not evidence.
- SSC and HSC or equivalent entries are commonly expected at this stage.`,

  early_career: `CANDIDATE STAGE - EARLY CAREER

Roughly two to five years of relevant experience.

- Expected order: contact, short targeted profile or objective, experience,
  education, skills, training, other sections.
- Experience should now lead over education.
- A short targeted profile is preferable to a student-style objective.
- Expect progression to be visible: increasing responsibility, or deepening
  specialism, across roles.
- Academic detail should be contracting. SSC and HSC entries are optional and
  their absence is not a defect unless the employer asks.`,

  experienced: `CANDIDATE STAGE - EXPERIENCED

More than roughly five years of relevant experience.

- Expected order: contact, career summary, experience, skills, education,
  training and credentials, other sections.
- Experience BEFORE education. A resume leading with education at this stage is
  worth flagging.
- A Career Summary replaces the fresher objective. A generic objective at this
  stage is a genuine weakness.
- Expect achievement and scope rather than duty lists: team size, budget or volume
  where the candidate can evidence it, systems owned, outcomes delivered.
- Do NOT expect SSC and HSC entries, and do not flag their absence.
- Extracurricular activities are no longer expected. Do not flag their absence.`,

  senior: `CANDIDATE STAGE - SENIOR OR SPECIALIST

Extensive experience with sustained leadership or deep specialism.

- Expected order: contact, executive or professional summary, experience with
  scope and outcomes, major projects, leadership and governance, professional
  memberships and credentials, education, publications or speaking where relevant.
- Professional memberships, designations, licences, major projects and leadership
  scope become primary evidence.
- Page limits do not apply the way they do for early-career candidates. Do not
  recommend cutting to one or two pages purely on length.
- Expect strategic and organisational impact, not task descriptions.
- Do not expect or request SSC, HSC or extracurricular entries.`,

  unknown: `CANDIDATE STAGE - NOT SPECIFIED

Infer the stage from the resume using the conservative definitions given earlier,
and state your inference in the content feedback.

- Where the inference is uncertain, do not apply stage-specific ordering penalties.
- Do not flag education-before-experience ordering unless you are confident the
  candidate is experienced.
- Do not flag a Career Objective unless you are confident the candidate is
  experienced, in which case recommend a summary and explain why.`,
};

/**
 * @param {string} stage one of CANDIDATE_STAGES
 * @returns {string} the block for that stage, falling back to unknown
 */
export function stageBlock(stage) {
  return STAGE_BLOCKS[stage] ?? STAGE_BLOCKS.unknown;
}

export { STAGE_BLOCKS };
