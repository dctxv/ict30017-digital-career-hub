/**
 * Module: prompt/sectors
 * Responsibility: One block per target sector. Exactly one is loaded.
 *
 * The previous prompt carried no sector routing, so every review applied the
 * same generic evidence expectations. Loading all sectors at once, as some
 * drafts do, is worse: it costs tokens on every call and dilutes attention on
 * the rules that actually apply.
 *
 * These blocks say what evidence to look for. They must never assert that a
 * candidate HAS a competency because it is common in their sector, and they must
 * never invite the candidate to claim a skill they cannot substantiate.
 */

const SECTOR_BLOCKS = {
  it_software: `TARGET SECTOR - IT AND SOFTWARE

Look for technically defensible evidence:

- Named languages, frameworks, databases and tools, with the context they were
  used in rather than a bare list.
- Projects with the candidate's OWN contribution identified. Team and academic
  projects are valid; the individual's role must be visible.
- Repositories, deployed applications or demonstrable artefacts where present.
- Engineering practice where relevant: version control, testing, code review,
  deployment, monitoring.

- Do not treat a long undifferentiated technology list as strength.
- Do not assume authorship of team or AI-assisted output without evidence.
- Where a job advertisement is supplied, derive the expected stack from it rather
  than from general industry assumption.`,

  rmg_manufacturing: `TARGET SECTOR - RMG, TEXTILES AND MANUFACTURING

Identify the candidate's actual FUNCTION first, because expectations differ
sharply between them: merchandising, production, planning, quality, compliance,
industrial engineering, supply chain, or technical or textile engineering.

Look for evidence appropriate to that function:

- Merchandising: order handling end to end, sample development and approval,
  consumption and costing, buyer communication, lead times, shipment follow-up.
- Production and planning: lines or units managed, capacity, efficiency, output
  volumes, downtime, line balancing.
- Quality: inspection systems, AQL, defect and rework rates, corrective actions.
- Compliance: buyer codes of conduct, social and technical audits, ILO-aligned
  standards, factory certifications, audit outcomes.
- Industrial engineering: SMV, method study, layout, productivity improvement.

Buyer and brand names, product categories, factory scale and certifications are
meaningful context where stated. Never invent buyers, volumes or efficiencies.`,

  banking_finance: `TARGET SECTOR - BANKING AND FINANCE

Identify the candidate's actual FUNCTION: retail or corporate banking operations,
credit, risk, compliance and AML, audit, treasury, financial analysis, sales and
relationship management, or customer service.

Look for evidence appropriate to that function:

- Products and portfolios handled, and their scale where the candidate can state it
- Regulatory and control exposure, including AML and KYC where relevant
- Core banking or analysis systems used by name
- Accuracy, turnaround, recovery or portfolio quality outcomes where evidenced
- Relevant professional qualifications, banking diplomas or certifications

Do not assume regulatory knowledge from a job title. Do not invent portfolio sizes,
recovery rates or transaction volumes.`,

  ngo_development: `TARGET SECTOR - NGO AND DEVELOPMENT

Look for:

- Programme or project responsibility, with the candidate's own role identified
- Communities, districts or regions covered, and beneficiary scale where stated
- Fieldwork, community mobilisation and stakeholder coordination
- Monitoring, evaluation, accountability and learning activity
- Donor reporting, proposal contribution and compliance with donor requirements
- Safeguarding, protection and ethical practice where the role touches vulnerable
  groups
- Sector specialism where relevant: health, WASH, education, livelihoods, climate
  and disaster resilience, gender, governance

Named donors and partners are meaningful context. Never invent beneficiary numbers
or outcome figures.`,

  civil_engineering: `TARGET SECTOR - CIVIL AND CONSTRUCTION ENGINEERING

Look for:

- Project types, scale and the candidate's specific responsibility on each
- Design, analysis, estimation and drafting tools by name
- Drawings, quantities, BOQ, estimation and tendering exposure where relevant
- Site supervision, quality control, safety practice and standards applied
- Relevant codes and standards where stated
- Professional body membership, for example IEB, where relevant

Distinguish design from site execution from estimation; they are different roles.
Never invent project values, quantities or completion figures.`,

  business: `TARGET SECTOR - GENERAL BUSINESS

Identify the specific FUNCTION rather than accepting generic business language:
sales, marketing, human resources, operations, finance and accounts, procurement,
supply chain, or administration.

Look for evidence appropriate to that function, for example:

- Sales: territories, accounts, targets and attainment where the candidate can
  state them, channel and customer types
- Marketing: campaigns, channels, brands, audience, content and measurement
- HR: recruitment volumes, employee relations, payroll, compliance, HRIS
- Operations and supply chain: processes owned, vendors, inventory, logistics
- Finance and accounts: reporting, reconciliation, audit, taxation, systems used

Reject vague self-description that could apply to any function. Never invent
targets, revenue or headcount.`,

  academic_research: `TARGET SECTOR - ACADEMIC AND RESEARCH

Look for:

- Research areas and methods, stated precisely
- Publications with venue and the candidate's authorship position
- Conference presentations and posters
- Teaching, tutoring, supervision and curriculum contribution
- Grants, funding and scholarships
- Thesis and dissertation detail in full
- Academic and professional service

Do not apply corporate conventions such as achievement metrics or ATS keyword
optimisation. Never invent publications, venues or citation counts.`,

  unknown: `TARGET SECTOR - NOT SPECIFIED

Infer the target sector and role family from the resume, state your inference in
the ATS analysis, and stay broad.

- Where the evidence supports several materially different sectors, use a broad
  role family rather than inventing precision.
- Do not apply sector-specific evidence expectations you cannot justify.
- Where a job advertisement is supplied, derive expectations from it in preference
  to any general assumption.`,
};

/**
 * @param {string} sector one of TARGET_SECTORS
 * @returns {string} the block for that sector, falling back to unknown
 */
export function sectorBlock(sector) {
  return SECTOR_BLOCKS[sector] ?? SECTOR_BLOCKS.unknown;
}

export { SECTOR_BLOCKS };
