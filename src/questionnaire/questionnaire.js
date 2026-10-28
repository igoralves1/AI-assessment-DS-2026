// Single source of truth for the ICARB-D annual maturity survey of dental school departments and courses.
// The website, the CSV columns (codebook), the "all questions explained" page and the Word/PDF documents
// are all generated from this file.
//
// Question types
//   scale    1–4 anchored maturity scale (+ "Don't know / N/A" = -1). Used for domain scores.
//   single   one choice from options
//   multi    several choices; one 0/1 column per option (max = optional limit)
//   number   numeric value
//   text     short text          textarea  long text
//   repeat   a small table repeated `count` times (e.g., Tool 1..6), one column per item × field
//   grid     several rows sharing the same options (e.g., Yes / Partial / No)
//   hours    several rows, each a number (hours, or units when `unit` says so)
//
// Every question has `captures`: what the item measures and why (shown on the public questions page).
// `pii: true` fields are stored only in the private access-codes file, never in responses.csv.
// `filledBy: 'team'` sections are completed by the research team before the access code is issued.

import { COUNTRIES, GUIDANCE_DOCS } from './countries.js'

export const VERSION = '2.0.0'
export const DK = -1 // "Don't know / Not applicable"
export const SURVEY_NAME = 'ICARB-D Annual Maturity Survey of Dental Schools'
export const SURVEY_SUBTITLE = 'Artificial intelligence, health informatics, robotics and bioinformatics'

const scale = (id, domain, title, text, anchors, captures, extra = {}) => ({
  id, type: 'scale', domain, title, text, captures,
  options: anchors.map((l, i) => ({ v: i + 1, l })),
  ...extra,
})

const YES_NO = [{ v: 1, l: 'Yes' }, { v: 0, l: 'No' }]
const YPN = [{ v: 2, l: 'Yes' }, { v: 1, l: 'Partial' }, { v: 0, l: 'No' }]
const NONE = (l = 'None') => ({ v: 'none', l, exclusive: true })

// ---------------------------------------------------------------------------
// Part A — Profile (research team)
// ---------------------------------------------------------------------------
const partA = {
  id: 'A', filledBy: 'team',
  title: 'Part A. Department/course profile (completed by the research team)',
  intro: 'The research team completes this part with the department head or course director (by phone, video call or email). Saving it generates the XXX-XXX access code given to the respondent.',
  purpose: 'Identifies exactly which unit is being described (country, school, department, course, level) and records consent. These fields are the keys used to group answers by department, school and country, and to follow the same unit from one annual wave to the next.',
  questions: [
    { id: 'A01', type: 'single', title: 'Country', text: 'Country', options: COUNTRIES, required: true,
      captures: 'Country of the school. Used for country comparisons and to adapt examples (laws, regulators, degree names) in later items.' },
    { id: 'A02', type: 'text', title: 'Region', text: 'State / province / region', required: true,
      captures: 'Sub-national region, to describe geographic spread and regional inequalities within a country.' },
    { id: 'A03', type: 'text', title: 'Institution', text: 'Name of dental school (institution)', required: true,
      captures: 'The school. All departments of the same school are consolidated into one school score.' },
    { id: 'A04', type: 'single', title: 'Institution type', text: 'Type of institution', required: true, options: [
      { v: 1, l: 'Public (federal / national)' },
      { v: 2, l: 'Public (state / provincial / municipal)' },
      { v: 3, l: 'Private, non-profit' },
      { v: 4, l: 'Private, for-profit' },
    ], captures: 'Funding model of the school, to test whether public and private schools differ in maturity and resources.' },
    { id: 'A05', type: 'text', title: 'City', text: 'City', required: true,
      captures: 'City of the campus, for mapping and to distinguish campuses of the same institution.' },
    { id: 'A06', type: 'text', title: 'Department', text: 'Name of the department/course being reported (e.g., Department of Oral Radiology)', required: true,
      captures: 'The department. Answers are first consolidated at this level.' },
    { id: 'A07', type: 'text', title: 'Course', text: 'Course code and title referenced in this form (e.g., "RAD-301 Oral Radiology II"). Write "Department-wide" if the form covers the whole department.', required: true,
      captures: 'The named course, so readers can see exactly which courses produced each school\'s curriculum results.' },
    { id: 'A08', type: 'single', title: 'Level', text: 'Level of this named department/course', required: true, other: true, options: [
      { v: 1, l: 'Undergraduate first professional degree (DDS/DMD, BDS, Bacharelado em Odontologia, 口腔医学 Bachelor)' },
      { v: 2, l: 'Research master\'s (MSc/MS, Mestrado acadêmico, 学术型硕士)' },
      { v: 3, l: 'Professional/clinical master\'s or specialty degree (MDS in India, Mestrado profissional, 专业型硕士)' },
      { v: 4, l: 'Doctoral (PhD/DSc, Doutorado, 博士)' },
      { v: 5, l: 'Residency / specialty training (US/Canada residency, Brazil residência/especialização, China standardized residency training 规培)' },
      { v: 6, l: 'Integrated long-track program (e.g., China 8-year program, DDS-PhD)' },
      { v: 7, l: 'Continuing education / CPD' },
      { v: 99, l: 'Other' },
    ], captures: 'Training level, harmonized across five national systems, to compare undergraduate, graduate and residency teaching.' },
    { id: 'A09', type: 'single', title: 'Respondent role', text: 'Role of the respondent in this named department/course', required: true, other: true, options: [
      { v: 1, l: 'Department head / chair' },
      { v: 2, l: 'Course director / coordinator' },
      { v: 3, l: 'Program director (graduate / residency)' },
      { v: 4, l: 'Curriculum committee member' },
      { v: 5, l: 'Faculty representative' },
      { v: 6, l: 'Dean / associate dean' },
      { v: 99, l: 'Other' },
    ], captures: 'Who answered, to judge how close the respondent is to the information (used in sensitivity analyses).' },
    { id: 'A10', type: 'text', title: 'Respondent name', text: 'Respondent full name', pii: true,
      captures: 'Contact only. Stored in a separate private file, never in the analysis data.' },
    { id: 'A11', type: 'text', title: 'Respondent email', text: 'Respondent email', pii: true,
      captures: 'Contact only, for reminders and next year\'s invitation. Stored separately.' },
    { id: 'A12', type: 'text', title: 'Interviewer', text: 'Research team member who completed Part A', pii: true,
      captures: 'Audit trail of who issued the code. Stored separately.' },
    { id: 'A13', type: 'single', title: 'Language', text: 'Preferred language of the respondent', other: true, options: [
      { v: 'en', l: 'English' }, { v: 'fr', l: 'French' }, { v: 'pt', l: 'Portuguese' },
      { v: 'zh', l: 'Chinese' }, { v: 'hi', l: 'Hindi' }, { v: 'es', l: 'Spanish' }, { v: 99, l: 'Other' },
    ], captures: 'Language for communication and translated versions of the instrument.' },
    { id: 'A14', type: 'single', title: 'Consent', text: 'Informed consent to participate was obtained', required: true, options: YES_NO,
      captures: 'Ethical requirement. Forms without consent are excluded from analysis.' },
    { id: 'A15', type: 'number', title: 'Survey year (wave)', text: 'Survey year (annual wave), e.g., 2026', required: true, min: 2026, max: 2100,
      captures: 'The annual wave. The survey is repeated every year so changes in each department can be tracked over time.' },
    { id: 'A16', type: 'text', title: 'Previous code', text: 'Access code this same department/course used in the previous year, if any (XXX-XXX)',
      captures: 'Links this year\'s answers to last year\'s for the same unit, to measure year-to-year progress.' },
  ],
}

// ---------------------------------------------------------------------------
// Part B — Context
// ---------------------------------------------------------------------------
const partB = {
  id: 'B', filledBy: 'respondent',
  title: 'Part B. Context of the department/course',
  intro: 'Answer every item only for the department/course named in Part A. Approximate numbers are acceptable.',
  purpose: 'Describes the size and structure of the unit (students, faculty, calendar, hours) and which of the four technology domains it touches. These numbers are denominators: they turn raw counts (e.g., computers, trained faculty, teaching hours) into comparable ratios.',
  questions: [
    { id: 'B01', type: 'number', title: 'Enrollment', text: 'Approximate number of students enrolled in this department/course per year', unit: 'students', min: 0,
      captures: 'Size of the student body, used to compute students per computer, per device and per trained teacher.' },
    { id: 'B02', type: 'number', title: 'Faculty headcount', text: 'Number of faculty members assigned to this department/course (headcount)', unit: 'faculty', min: 0,
      captures: 'Teaching staff size, denominator for the share of faculty with AI, informatics, robotics or bioinformatics expertise.' },
    { id: 'B03', type: 'number', title: 'Faculty FTE', text: 'Full-time equivalent (FTE) of faculty assigned to this department/course', unit: 'FTE', min: 0, step: 0.1,
      captures: 'Teaching capacity adjusted for part-time staff.' },
    { id: 'B04', type: 'single', title: 'Academic calendar', text: 'Academic calendar used by this department/course', countryHint: 'calendarNote', options: [
      { v: 1, l: 'Semester (2 terms per year)' },
      { v: 2, l: 'Trimester (3 terms per year)' },
      { v: 3, l: 'Quarter (4 terms per year)' },
      { v: 4, l: 'Annual system (1 term per year)' },
      { v: 5, l: 'Modular / block system' },
    ], captures: 'Calendar type, needed because hours are asked per term and calendars differ between countries.' },
    { id: 'B05', type: 'number', title: 'Terms per year', text: 'Number of academic terms per year (used to convert hours per term into hours per year)', unit: 'terms', min: 1, max: 6,
      captures: 'Converts every "hours per term" answer into hours per year so schools are comparable.' },
    { id: 'B06', type: 'number', title: 'Course hours', text: 'Total contact hours of this course per term (all topics)', unit: 'hours per term', min: 0,
      captures: 'Total course time, to express technology teaching as a share of all teaching time.' },
    { id: 'B07', type: 'multi', title: 'Program years', text: 'In which program year(s) is this course taught?', options: [
      { v: 'y1', l: 'Year 1' }, { v: 'y2', l: 'Year 2' }, { v: 'y3', l: 'Year 3' }, { v: 'y4', l: 'Year 4' },
      { v: 'y5', l: 'Year 5' }, { v: 'y6', l: 'Year 6 or later / internship' }, { v: 'grad', l: 'Graduate / residency year' },
    ], captures: 'When in the program students meet this content (early exposure vs. clinical years).' },
    { id: 'B08', type: 'single', title: 'Course format', text: 'Main format of this course', options: [
      { v: 1, l: 'Didactic (lectures/seminars)' }, { v: 2, l: 'Preclinical / laboratory' },
      { v: 3, l: 'Clinical' }, { v: 4, l: 'Mixed' }, { v: 5, l: 'Research' },
    ], captures: 'Teaching setting, because equipment and tool use differ between lecture, lab and clinic courses.' },
    { id: 'B09', type: 'multi', title: 'Domains addressed', text: 'Which technology domains does this department/course address in teaching, research or care?', options: [
      { v: 'ai', l: 'Artificial intelligence' }, { v: 'hin', l: 'Health informatics (EHR, imaging systems, teledentistry, data)' },
      { v: 'rob', l: 'Robotics and digital dentistry (CAD/CAM, simulators, robots, navigation)' },
      { v: 'bio', l: 'Bioinformatics and omics' }, NONE('None of these'),
    ], captures: 'Which of the four ICARB-D domains are present at all, giving a quick profile before the detailed parts.' },
    { id: 'B10', type: 'single', title: 'Respondent experience', text: 'Your own experience with digital technologies (AI, informatics, robotics or bioinformatics) in teaching, research or practice', options: [
      { v: 1, l: 'None' }, { v: 2, l: 'Less than 1 year' }, { v: 3, l: '1–3 years' }, { v: 4, l: 'More than 3 years' },
    ], captures: 'Respondent background, used to check whether answers vary with the respondent\'s own experience.' },
    scale('B11', null, 'Respondent AI literacy', 'How would you rate your own AI literacy?', [
      'Basic: I know general concepts only',
      'Intermediate: I can interpret AI outputs and their limitations',
      'Advanced: I can critically appraise AI studies and select tools',
      'Expert: I develop, train or validate AI models',
    ], 'Self-rated AI literacy of the respondent (not scored as unit maturity).', { noDK: true }),
  ],
}

// ---------------------------------------------------------------------------
// Part C — Shared digital infrastructure and data
// ---------------------------------------------------------------------------
const TOOL_TASKS = [
  { v: 'caries', l: 'Caries detection on radiographs' },
  { v: 'perio', l: 'Periodontal bone-loss assessment' },
  { v: 'periapical', l: 'Periapical lesion detection' },
  { v: 'cbct', l: 'CBCT segmentation / 3D analysis' },
  { v: 'ceph', l: 'Cephalometric landmarking / orthodontic analysis' },
  { v: 'implant', l: 'Implant planning / guided surgery' },
  { v: 'cad', l: 'CAD/CAM restoration design' },
  { v: 'ios', l: 'Intraoral-scan analysis / smile design' },
  { v: 'lesion', l: 'Oral mucosal lesion / oral cancer screening' },
  { v: 'charting', l: 'Charting, clinical notes, ambient scribe' },
  { v: 'patient', l: 'Patient communication / education' },
  { v: 'admin', l: 'Scheduling, billing, administration' },
  { v: 'sim', l: 'Preclinical simulation feedback / preparation grading' },
  { v: 'llm', l: 'General-purpose LLM / chatbot' },
  { v: 'other', l: 'Other' },
]

const partC = {
  id: 'C', filledBy: 'respondent',
  title: 'Part C. Physical resources: computing, AI tools and data',
  intro: 'Facilities, equipment, software, data and technical support available to the named department/course.',
  purpose: 'Pictures the physical and digital resources that every technology domain depends on: computers and GPUs, cloud access, dedicated spaces, software, AI tools actually used by students, datasets, data quality, privacy, connectivity, interoperability and security. It answers "what does this department have today?"',
  questions: [
    scale('C01', 'INF', 'Computing hardware', 'Is there hardware designated for AI or data-intensive teaching or research (GPU workstations, high-performance computing, cloud credits) in this department/course?', [
      'None',
      'Only individual faculty members\' personal equipment',
      'Shared equipment, insufficient for demand',
      'Dedicated high-performance computing, regularly updated and accessible to students',
    ], 'Whether the unit has its own computing power for AI and data work, or depends on personal equipment.'),
    { id: 'C02', type: 'number', title: 'GPU workstations', text: 'Number of GPU-equipped workstations or servers available to this department/course', unit: 'units', min: 0,
      captures: 'Hard count of AI-capable machines, comparable across schools and over years.' },
    scale('C03', 'INF', 'Cloud computing', 'Access to cloud computing (institutional cloud accounts, research credits, university HPC cluster)', [
      'No access', 'Individual/ad hoc access paid by faculty', 'Institutional access on request, limited quota', 'Routine institutional access with support',
    ], 'Access to scalable computing beyond local machines.'),
    { id: 'C04', type: 'number', title: 'Student devices ratio', text: 'Number of students per institutionally provided computer during hands-on digital sessions (e.g., 1 = one computer per student)', unit: 'students per computer', min: 0, step: 0.5,
      captures: 'Whether students can actually practise hands-on, or only watch.' },
    scale('C05', 'INF', 'Dedicated digital space', 'Is there a dedicated physical space for digital dentistry, informatics or AI teaching/research (lab, innovation hub)?', [
      'None', 'Shared general computer room', 'Dedicated digital dentistry lab without AI focus', 'Dedicated AI/digital dentistry lab with staff and scheduled student access',
    ], 'Existence of a physical home for digital work, a strong sign of institutional commitment.'),
    { id: 'C06', type: 'multi', title: 'Software licences', text: 'Which data-science and AI software is available to students and faculty of this department/course?', other: true, options: [
      { v: 'python', l: 'Python / Jupyter / Google Colab' }, { v: 'r', l: 'R / RStudio' }, { v: 'matlab', l: 'MATLAB' },
      { v: 'nocode', l: 'No-code machine learning (e.g., Orange, KNIME, Teachable Machine)' },
      { v: 'annotation', l: 'Image annotation tools (e.g., CVAT, Label Studio, 3D Slicer)' },
      { v: 'stats', l: 'Statistical packages (SPSS, Stata, SAS)' },
      { v: 'commercial_ai', l: 'Commercial dental AI platforms' },
      { v: 'genai_licensed', l: 'Institutionally licensed generative AI (e.g., Copilot, ChatGPT Edu, Gemini)' },
      NONE(),
    ], captures: 'The software toolbox available, from programming languages to annotation and commercial AI.' },
    { id: 'C07', type: 'multi', title: 'AI-enabled equipment', text: 'Which AI-enabled equipment or systems are in use in this department/course?', other: true, options: [
      { v: 'radiography', l: 'Digital radiography with AI analysis' }, { v: 'cbct', l: 'CBCT with AI segmentation' },
      { v: 'ios', l: 'Intraoral scanners with AI features' }, { v: 'cadcam', l: 'CAD/CAM or 3D printing with AI design' },
      { v: 'haptic', l: 'Haptic / simulation units with AI feedback' }, { v: 'ehr_ai', l: 'Electronic health record with AI modules' },
      { v: 'lms_ai', l: 'Learning management system with AI features' }, { v: 'tutor', l: 'AI tutor / chatbot for students' },
      NONE(),
    ], captures: 'Where AI is already embedded in equipment, often without being taught explicitly.' },
    { id: 'C08', type: 'repeat', title: 'AI tools used by students', count: 6,
      text: 'List each AI tool students actually use in this department/course. Leave rows empty if not applicable.',
      fields: [
        { id: 'name', type: 'text', l: 'Tool / product name' },
        { id: 'task', type: 'single', l: 'Main task', options: TOOL_TASKS },
        { id: 'reg', type: 'single', l: 'Regulatory status', options: [
          { v: 1, l: 'Cleared/approved by the national regulator for this use' },
          { v: 2, l: 'Foreign approval only (e.g., CE, FDA)' },
          { v: 3, l: 'Commercial, not cleared' },
          { v: 4, l: 'Research / in-house prototype' },
          { v: -1, l: 'Don\'t know' },
        ] },
        { id: 'mode', type: 'single', l: 'Student use', options: [
          { v: 1, l: 'Students observe faculty use' },
          { v: 2, l: 'Preclinical / simulation only' },
          { v: 3, l: 'Students operate under supervision on patients' },
          { v: 4, l: 'Students operate independently in patient care' },
        ] },
        { id: 'graded', type: 'single', l: 'Part of graded work?', options: YES_NO },
        { id: 'since', type: 'number', l: 'Year introduced', min: 2000, max: 2100 },
      ], captures: 'An inventory of real AI tools: what they do, whether they are approved, how deeply students use them and since when. Pooled across schools it becomes a map of dental AI adoption.' },
    scale('C09', 'INF', 'Number of AI tools', 'Overall use of AI tools by students in this department/course', [
      'No AI tool is used', '1 AI tool used', '2–3 AI tools used', '4 or more AI tools used and integrated into graded coursework',
    ], 'Summary of AI tool adoption for scoring.'),
    scale('C10', 'DAT', 'De-identified dataset', 'Is there a standardized, de-identified oral-health dataset (radiographs, intraoral scans, treatment records) that students or faculty can access for AI training or research?', [
      'No dataset accessible', 'Dataset in planning or pilot stage', 'Dataset exists but access is restricted and scale is limited', 'Dataset exists with clear access protocols and is used in the course',
    ], 'Availability of data to train and test AI, the key ingredient for the consortium\'s open AI model.'),
    { id: 'C11', type: 'multi', title: 'Dataset modalities', text: 'Which data modalities are available in that dataset?', options: [
      { v: 'periapical', l: 'Periapical / bitewing radiographs' }, { v: 'panoramic', l: 'Panoramic radiographs' },
      { v: 'ceph', l: 'Cephalometric radiographs' }, { v: 'cbct', l: 'CBCT' }, { v: 'ios', l: 'Intraoral scans (3D)' },
      { v: 'photos', l: 'Clinical photographs' }, { v: 'histology', l: 'Histopathology images' },
      { v: 'records', l: 'Structured treatment / EHR records' }, { v: 'notes', l: 'Free-text clinical notes' },
      NONE('No dataset'),
    ], captures: 'Which data types exist, to plan which parts of a shared AI model each school could support.' },
    { id: 'C12', type: 'number', title: 'Dataset size', text: 'Approximate number of de-identified images or records in that dataset (enter 0 if none)', unit: 'images/records', min: 0,
      captures: 'Scale of existing data.' },
    scale('C13', 'DAT', 'Annotation capacity', 'Capacity to label/annotate data for AI (calibrated annotators, annotation protocol, inter-rater agreement)', [
      'No capacity', 'Ad hoc annotation by individual researchers', 'Annotation protocol exists, limited calibration', 'Calibrated annotators with documented protocol and agreement statistics',
    ], 'Ability to produce reliable labels, which determines whether data can be used to train trustworthy AI.'),
    scale('C14', 'DAT', 'Data quality', 'What measures ensure the accuracy, completeness and timeliness of data used in this department/course?', [
      'No measures applied', 'Ad hoc checks only', 'Some measures exist but are not comprehensive', 'Systematic quality assurance with documented protocols',
    ], 'Data quality assurance (PAHO/WHO readiness toolkit item).'),
    scale('C15', 'DAT', 'Data representativeness', 'Is the representativeness of the data assessed (age, sex, ethnicity, socioeconomic group, rural/urban, device type)?', [
      'Never assessed', 'Discussed informally', 'Assessed for some projects', 'Systematically assessed and reported',
    ], 'Whether datasets reflect the patients the AI will serve (PAHO bias-free AI guidance).'),
    scale('C16', 'DAT', 'Privacy and security', 'What privacy and security systems protect patient data used in this department/course?', [
      'No systems', 'Basic password protection only', 'Systems exist but are inconsistent', 'Comprehensive systems with encryption, audit trails and a named person responsible',
    ], 'Protection of patient data, read against each country\'s privacy law.', { countryHint: 'privacy' }),
    scale('C17', 'DAT', 'De-identification', 'Are there documented procedures for anonymization / de-identification of patient data before use in teaching or research?', [
      'No procedures', 'Informal practice only', 'Written procedures, inconsistently applied', 'Written procedures, routinely applied and audited',
    ], 'Readiness to share data safely, a precondition for joint AI development.'),
    scale('C18', 'DAT', 'Secure research environment', 'Is a secure environment available for working with identifiable or sensitive data (trusted research environment, approved server, data enclave)?', [
      'Not available', 'Planned', 'Available on request with delays', 'Available and routinely used',
    ], 'Whether sensitive data can be analysed without leaving a protected environment.'),
    scale('C19', 'INF', 'Connectivity and IT support', 'Does this department/course have reliable broadband and technical support for the digital tools it uses?', [
      'Neither reliable connectivity nor specific support', 'Basic IT support exists but does not cover these tools', 'Partial support (software installation only)', 'Dedicated educational-technology support assigned to the department/course',
    ], 'Basic connectivity and support, without which equipment goes unused.'),
    scale('C20', 'INF', 'Interoperability', 'Can the digital tools used exchange data with existing systems (EHR, imaging/PACS, learning management system) using standards such as DICOM, HL7 FHIR or LTI?', [
      'No interoperability', 'Some standards under development', 'Standards exist but implementation is inconsistent', 'Well-established standards enabling seamless integration',
    ], 'Whether systems talk to each other, a core health-informatics capability.'),
    scale('C21', 'INF', 'Cybersecurity', 'Are cybersecurity measures applied to digital tools and data (risk assessment, access control, vendor security review)?', [
      'None', 'Basic institutional measures only', 'Measures exist but not specific to these tools', 'Specific security review before adoption and periodic audit',
    ], 'Security of systems that hold patient data.'),
    scale('C22', 'INF', 'Equitable student access', 'Do all students in this course have equal access to the tools and computing needed (including outside class hours)?', [
      'No — access depends on personal devices/subscriptions', 'Limited institutional access', 'Access during scheduled sessions only', 'Equal access during and outside class hours',
    ], 'Equity of access among students.'),
  ],
}

// ---------------------------------------------------------------------------
// Part D — Human resources
// ---------------------------------------------------------------------------
const partD = {
  id: 'D', filledBy: 'respondent',
  title: 'Part D. Human resources and expertise (AI and data science)',
  intro: 'Faculty and staff assigned to the named department/course.',
  purpose: 'Pictures the people: how many faculty can teach AI, who does AI research, what training they received, which partners and technical staff support them, and what holds them back. Equipment without trained people does not change teaching; this part measures that capacity.',
  questions: [
    scale('D01', 'HUM', 'Faculty able to teach AI', 'What proportion of faculty can independently teach AI content (machine-learning principles, interpreting AI outputs, critical appraisal of AI literature)?', [
      '0%', '1–10%', '11–25%', 'More than 25%',
    ], 'Teaching capacity for AI as a share of all faculty.'),
    { id: 'D02', type: 'number', title: 'Faculty teaching AI (n)', text: 'Number of faculty who currently teach any AI content in this department/course', unit: 'faculty', min: 0,
      captures: 'Exact count, comparable across years.' },
    { id: 'D03', type: 'number', title: 'Faculty with formal AI degree', text: 'Number of faculty with a formal qualification in AI, computer science, data science or biomedical informatics (degree or university certificate)', unit: 'faculty', min: 0,
      captures: 'Deep expertise in the unit, beyond self-taught knowledge.' },
    scale('D04', 'HUM', 'AI-primary researchers', 'How many faculty have AI in dentistry or dental education as their primary research area?', [
      'None', '1', '2–3', '4 or more',
    ], 'Research leadership in AI, often the engine of curricular change.'),
    { id: 'D05', type: 'number', title: 'AI publications (3 y)', text: 'Number of peer-reviewed AI-related publications by faculty of this department/course in the past 3 years', unit: 'publications', min: 0,
      captures: 'Research output, a verifiable indicator of AI activity.' },
    { id: 'D06', type: 'number', title: 'AI graduate trainees', text: 'Number of graduate students, residents or postdocs currently working on AI projects in this department/course', unit: 'trainees', min: 0,
      captures: 'The next generation of AI researchers being trained.' },
    scale('D07', 'HUM', 'Faculty AI training', 'What formal AI training have faculty received in the past 24 months?', [
      'No training received', 'Voluntary, sporadic sessions only', 'Organized training, but low or inconsistent attendance', 'Systematic training with institutional incentives and tracking',
    ], 'Institutional investment in faculty development.'),
    { id: 'D08', type: 'number', title: 'Training hours per faculty', text: 'Average hours of AI training per faculty member in the past 12 months', unit: 'hours', min: 0,
      captures: 'Intensity of faculty training.' },
    { id: 'D09', type: 'multi', title: 'Training formats', text: 'Formats of AI training available to faculty', other: true, options: [
      { v: 'workshop', l: 'Institutional workshops / seminars' }, { v: 'mooc', l: 'Online courses (MOOCs, e.g., Coursera, edX)' },
      { v: 'certificate', l: 'University certificate programs' }, { v: 'conference', l: 'Conference sessions (IADR, ADEA, ADEE, SBPqO, IDA, CSA)' },
      { v: 'peer', l: 'Peer mentoring / communities of practice' }, { v: 'vendor', l: 'Vendor training' },
      { v: 'degree', l: 'Sponsored degree programs' }, NONE(),
    ], captures: 'How faculty learn, to design consortium training that fills gaps.' },
    { id: 'D10', type: 'repeat', title: 'Interdisciplinary partners', count: 3,
      text: 'Name each external unit this department/course collaborates with on AI, informatics, robotics or bioinformatics (e.g., Department of Computer Science, Faculty of Engineering, a company).',
      fields: [
        { id: 'name', type: 'text', l: 'Partner unit' },
        { id: 'type', type: 'single', l: 'Type', options: [
          { v: 1, l: 'Same university — computer science / engineering' },
          { v: 2, l: 'Same university — medicine / public health / biology / other' },
          { v: 3, l: 'Other university (national)' }, { v: 4, l: 'Other university (international)' },
          { v: 5, l: 'Industry / company' }, { v: 6, l: 'Government / hospital / other' },
        ] },
      ], captures: 'The collaboration network, showing who dental schools rely on for technical expertise.' },
    scale('D11', 'HUM', 'Partnership depth', 'Depth of interdisciplinary collaboration', [
      'No partners', 'Informal individual collaboration only', 'Formal project-based collaboration', 'Long-term institutional partnership with joint funding or appointments',
    ], 'How formal and durable those partnerships are.'),
    scale('D12', 'HUM', 'Technical staff', 'Access to dedicated technical personnel (data scientists, AI engineers, statisticians, research software engineers)', [
      'No access', 'Shared across the school, high demand', 'Adequate access for most needs', 'Dedicated technical staff embedded in the department/course',
    ], 'Technical support available to faculty and students.'),
    { id: 'D13', type: 'number', title: 'Technical staff FTE', text: 'Full-time equivalent of technical data/AI staff available to this department/course', unit: 'FTE', min: 0, step: 0.1,
      captures: 'Exact technical staffing, comparable over years.' },
    scale('D14', 'HUM', 'Hiring plans', 'Is recruitment of faculty or staff with AI, informatics, robotics or bioinformatics expertise planned?', [
      'Not planned', 'Discussed, no approved position', 'Position approved or recruitment underway', 'Expertise already recruited and further positions planned',
    ], 'Forward-looking investment in people.'),
    scale('D15', 'HUM', 'Faculty openness', 'Overall attitude of faculty in this department/course toward integrating these technologies', [
      'Mostly resistant', 'Mixed / indifferent', 'Mostly supportive', 'Strongly supportive with active champions',
    ], 'Cultural readiness for change.'),
    { id: 'D16', type: 'multi', title: 'Faculty competency barriers', max: 2, text: 'Most significant barriers to faculty competency (select up to two)', other: true, options: [
      { v: 'time', l: 'Lack of faculty time' }, { v: 'funding', l: 'Lack of funding for training' },
      { v: 'interest', l: 'Lack of faculty interest' }, { v: 'trainers', l: 'Lack of qualified trainers' },
      { v: 'priorities', l: 'Competing curricular priorities' }, { v: 'recognition', l: 'No recognition in promotion/tenure' },
      { v: 'language', l: 'Training not available in local language' },
    ], captures: 'The main obstacles, so consortium support can target them.' },
  ],
}

// ---------------------------------------------------------------------------
// Part E — AI curriculum
// ---------------------------------------------------------------------------
const TOPICS = [
  { v: 'fundamentals', l: 'AI fundamentals and terminology' },
  { v: 'ml_dl', l: 'Machine learning / deep learning principles' },
  { v: 'data_science', l: 'Data science and statistics for AI' },
  { v: 'programming', l: 'Programming (Python, R)' },
  { v: 'model_training', l: 'Model development and training' },
  { v: 'validation', l: 'Model validation and performance metrics (sensitivity, AUC, calibration)' },
  { v: 'bias', l: 'Bias, fairness and subgroup performance' },
  { v: 'explainability', l: 'Explainability / interpretability' },
  { v: 'clinical_interp', l: 'Clinical interpretation of AI outputs and AI errors' },
  { v: 'imaging', l: 'AI in dental imaging (radiographs, CBCT)' },
  { v: 'planning', l: 'AI in treatment planning, CAD/CAM, orthodontics, implants' },
  { v: 'genai', l: 'Generative AI, large language models and prompt design' },
  { v: 'ethics', l: 'Ethics, privacy, informed consent, accountability' },
  { v: 'regulation', l: 'Regulation, standards and approval of AI devices' },
  { v: 'appraisal', l: 'Critical appraisal of AI literature and reporting guidelines' },
  { v: 'research_methods', l: 'AI as a research tool (literature, analysis, writing)' },
]

const partE = {
  id: 'E', filledBy: 'respondent',
  title: 'Part E. AI curriculum and teaching',
  intro: 'Refers to the named course (Part A, item A07). Hours: include lectures, hands-on sessions and assignments; exclude generic literature searching and routine use of clinical software.',
  purpose: 'Measures what students are actually taught about AI and for how long: hours per term by format and by 16 topics (including programming and formal model development), named undergraduate and graduate courses, assessment, materials and planned changes. Hours are converted to hours per year (with B05) to build an international benchmark.',
  questions: [
    scale('E01', 'CUR', 'Dedicated AI instruction', 'Does the course include dedicated AI instruction (not a passing mention)?', [
      'None', 'Mentioned in 1–2 lectures only', '1 dedicated module or class session (≤4 hours)', '1 or more dedicated AI courses, or systematic integration across sessions',
    ], 'Whether AI is taught deliberately, not only mentioned.'),
    { id: 'E02', type: 'hours', title: 'AI hours by format', unit: 'hours per term',
      text: 'Hours of AI-specific instruction a student receives in this course per term, by format (enter 0 if none)',
      rows: [
        { v: 'lecture', l: 'Lectures / seminars' }, { v: 'handson', l: 'Hands-on / computer lab' },
        { v: 'clinical', l: 'Clinical / preclinical use with supervision' }, { v: 'self', l: 'Assignments / guided self-study' },
      ], captures: 'Total AI teaching time and how much of it is hands-on rather than passive.' },
    { id: 'E03', type: 'hours', title: 'AI hours by topic', unit: 'hours per term',
      text: 'Hours per term devoted to each AI topic in this course (enter 0 if not covered; a session may count toward more than one topic)',
      rows: TOPICS, captures: 'The content profile of AI teaching across 16 topics, from fundamentals to programming, validation, bias and regulation.' },
    { id: 'E04', type: 'single', title: 'Required or elective', text: 'Is the AI content of this course required or elective?', options: [
      { v: 0, l: 'No AI content' }, { v: 1, l: 'Elective / optional' }, { v: 2, l: 'Required for some students / tracks' }, { v: 3, l: 'Required for all students' },
    ], captures: 'Whether every graduate is exposed, or only volunteers.' },
    { id: 'E05', type: 'number', title: 'AI credits', text: 'Academic credits awarded for AI content (local credit units; 0 if none)', unit: 'credits', min: 0, step: 0.5,
      captures: 'Formal weight of AI in the curriculum.' },
    scale('E06', 'CUR', 'Technical depth', 'Which best describes the technical depth of AI instruction?', [
      'Conceptual awareness only', 'Clinical interpretation of AI outputs', 'Hands-on operation of existing AI tools under guidance', 'Includes programming or formal AI development',
    ], 'Depth of AI teaching, from awareness to building models.'),
    scale('E07', 'CUR', 'Programming / AI development', 'Does the course cover programming (Python/R) or formal AI development (model training, validation, bias assessment)?', [
      'None', 'Instructor demonstration only', 'Hands-on exercises under guidance', 'Students independently complete a small AI project (e.g., train and validate a classifier)',
    ], 'Whether students gain the skills needed to contribute to building AI.'),
    { id: 'E08', type: 'multi', title: 'Development platforms', text: 'Platforms used for programming or model development', other: true, options: [
      { v: 'python', l: 'Python / Jupyter / Colab' }, { v: 'r', l: 'R' }, { v: 'nocode', l: 'No-code tool (Orange, KNIME, Teachable Machine)' },
      { v: 'automl', l: 'Cloud AutoML (Google, Azure, AWS)' }, { v: 'vendor', l: 'Vendor research platform' },
      NONE('Not applicable'),
    ], captures: 'The tools used for hands-on development.' },
    { id: 'E09', type: 'number', title: 'Programming hours', text: 'Hours per term devoted to programming or model development', unit: 'hours per term', min: 0,
      captures: 'Time spent on programming and formal AI development specifically.' },
    { id: 'E10', type: 'number', title: 'Student AI projects', text: 'Number of student AI projects (coursework, theses, capstones) completed in the past academic year', unit: 'projects', min: 0,
      captures: 'Concrete student output in AI.' },
    { id: 'E11', type: 'repeat', title: 'Undergraduate AI courses', count: 3,
      text: 'Name the undergraduate course(s) in this department that are dedicated to AI or contain a dedicated AI module',
      fields: [
        { id: 'name', type: 'text', l: 'Course code and title' },
        { id: 'hours', type: 'number', l: 'AI hours per term', min: 0 },
        { id: 'status', type: 'single', l: 'Status', options: [{ v: 1, l: 'Elective' }, { v: 2, l: 'Required' }] },
      ], captures: 'The named undergraduate AI courses and their hours, for the transparency list in publications.' },
    { id: 'E12', type: 'repeat', title: 'Graduate / residency AI courses', count: 3,
      text: 'Name the graduate or residency course(s) in this department that include AI content',
      fields: [
        { id: 'name', type: 'text', l: 'Course code and title' },
        { id: 'hours', type: 'number', l: 'AI hours per term', min: 0 },
        { id: 'status', type: 'single', l: 'Status', options: [{ v: 1, l: 'Elective' }, { v: 2, l: 'Required' }] },
      ], captures: 'The named graduate and residency AI courses and their hours.' },
    scale('E13', 'CUR', 'Graduate AI offering', 'Graduate-level AI offering in this department', [
      'No graduate AI course', 'Elective only', 'Required course exists', 'Required course plus a formal AI research project requirement',
    ], 'Maturity of AI at graduate level.'),
    { id: 'E14', type: 'number', title: 'AI theses (3 y)', text: 'Number of master\'s/doctoral theses or residency projects on AI defended in this department in the past 3 years', unit: 'theses', min: 0,
      captures: 'Graduate research output in AI.' },
    scale('E15', 'CUR', 'Clinical AI training', 'Are students trained in clinical application and critical interpretation of AI outputs (reading AI-assisted reports, identifying AI errors, understanding limitations)?', [
      'None', 'Informal discussion only', '1 dedicated session', 'Integrated into clinical rotations with formal assessment',
    ], 'Preparation for safe use of AI with patients.'),
    scale('E16', 'CUR', 'Assessment of AI competency', 'How is student AI competency assessed?', [
      'Not assessed', 'Written exam only', 'Separate AI assignment or project', 'Competency-based assessment (OSCE station, portfolio, practical demonstration)',
    ], 'Whether AI learning is verified, not just delivered.'),
    { id: 'E17', type: 'multi', title: 'Teaching methods', text: 'Teaching methods used for AI content', other: true, options: [
      { v: 'lecture', l: 'Lectures' }, { v: 'flipped', l: 'Flipped classroom' }, { v: 'cbl', l: 'Case-based learning' },
      { v: 'pbl', l: 'Problem-based learning' }, { v: 'journal', l: 'Journal club / critical appraisal' },
      { v: 'lab', l: 'Computer lab / coding exercises' }, { v: 'hackathon', l: 'Hackathon / competition' },
      { v: 'clinical', l: 'Supervised clinical use of AI tools' }, { v: 'sim', l: 'Simulation with AI feedback' },
      { v: 'tutor', l: 'AI tutor / chatbot-assisted learning' },
    ], captures: 'How AI is taught, to identify practices worth sharing across the consortium.' },
    scale('E18', 'CUR', 'Educational materials', 'Dedicated AI educational materials (textbooks, online modules, case libraries)', [
      'None used', 'Scattered resources, not formally organized', 'Some dedicated materials used', 'Comprehensive, curated collection integrated into the course',
    ], 'Quality of teaching resources.'),
    { id: 'E19', type: 'repeat', title: 'Materials used', count: 3, text: 'Name the main AI educational materials used',
      fields: [{ id: 'name', type: 'text', l: 'Material (title / URL)' }], captures: 'Specific materials, to build a shared open library.' },
    scale('E20', 'CUR', 'Competency framework', 'Is AI teaching aligned with a competency framework (e.g., IADR/ITU-WHO core curriculum for dental AI, national curriculum guidelines)?', [
      'No framework', 'Aware of frameworks, not used', 'Partially aligned', 'Explicitly mapped to a framework with defined learning outcomes',
    ], 'Alignment with international and national curriculum guidance.', { countryHint: 'accreditation' }),
    scale('E21', 'CUR', 'AI as a teaching tool', 'Is AI used as a tool to deliver teaching (adaptive learning, automated feedback on preparations, AI-generated cases, virtual patients)?', [
      'Not used', 'Experimented by individual faculty', 'Used regularly in some activities', 'Systematically used and evaluated',
    ], 'AI used to teach, not only taught as a topic.'),
    { id: 'E22', type: 'number', title: 'CPD AI offerings', text: 'Number of continuing-education (CPD) activities on AI offered by this department in the past 12 months', unit: 'activities', min: 0,
      captures: 'Reach of the department beyond its own students, to practising dentists.' },
    scale('E23', 'CUR', 'Student preparedness', 'How prepared and interested in AI are students in this course?', [
      'Low interest and preparedness', 'Interest but low preparedness', 'Interest and moderate preparedness', 'High interest and preparedness',
    ], 'Student readiness as perceived by faculty.'),
    scale('E24', 'CUR', 'Planned curriculum change', 'Is an increase of AI content planned for the next 2 years?', [
      'No plans', 'Under informal discussion', 'Approved, not yet implemented', 'Being implemented now',
    ], 'Momentum: where the curriculum is heading.'),
  ],
}

// ---------------------------------------------------------------------------
// Part F — Generative AI
// ---------------------------------------------------------------------------
const partF = {
  id: 'F', filledBy: 'respondent',
  title: 'Part F. Generative AI in teaching and learning',
  intro: 'Generative AI includes chatbots and large language models such as ChatGPT, Gemini, Copilot, DeepSeek, Qwen or Ernie Bot.',
  purpose: 'Captures how the unit governs and teaches generative AI: policies, permitted uses, prompt-design and verification skills, and safeguards (adapted from PAHO "AI prompt design" and AI-GUARD Tier 1). Generative AI spread faster than any earlier technology, so this part is tracked closely year to year.',
  questions: [
    scale('F01', 'GEN', 'Generative AI policy', 'Which policy governs student and faculty use of generative AI in this department/course?', [
      'No policy', 'General academic-integrity policy only, not AI-specific', 'Interim guidance issued', 'Formal, regularly updated policy with training',
    ], 'Maturity of generative-AI rules.'),
    { id: 'F02', type: 'text', title: 'Policy name', text: 'Name of the policy document (and level: university / school / department / course)',
      captures: 'The actual document, so policies can be compared and shared.' },
    { id: 'F03', type: 'multi', title: 'Permitted student uses', text: 'Which student uses of generative AI are permitted in this course?', other: true, options: [
      { v: 'study', l: 'Studying / explanations' }, { v: 'writing', l: 'Writing support with disclosure' },
      { v: 'cases', l: 'Practising clinical cases' }, { v: 'coding', l: 'Coding assistance' },
      { v: 'research', l: 'Literature search / research support' }, { v: 'assessment', l: 'Use during assessments' },
      { v: 'prohibited', l: 'All use is prohibited', exclusive: true }, { v: 'undefined', l: 'Not defined', exclusive: true },
    ], captures: 'What students may actually do with generative AI.' },
    scale('F04', 'GEN', 'Prompt design teaching', 'Are students taught how to design effective prompts (context, task, format, audience, constraints)?', [
      'Not taught', 'Mentioned informally', '1 dedicated session', 'Integrated practice with feedback',
    ], 'Prompt design as a core digital skill (PAHO).'),
    scale('F05', 'GEN', 'Verification of outputs', 'Are students taught to verify generative-AI outputs (hallucinations, fabricated references, outdated guidance)?', [
      'Not taught', 'Mentioned informally', '1 dedicated session', 'Integrated practice with assessment',
    ], 'Critical checking of AI output, essential for patient safety.'),
    { id: 'F06', type: 'grid', title: 'Generative AI safeguards', options: YPN,
      text: 'Which safeguards are in place for generative AI use in this department/course? (adapted from PAHO AI-GUARD, Tier 1)',
      rows: [
        { v: 'no_patient_data', l: 'Rule that no identifiable patient data is entered into public AI tools' },
        { v: 'secure_tool', l: 'An institutionally licensed, privacy-protected generative AI tool is available' },
        { v: 'disclosure', l: 'Students must disclose AI use in assignments' },
        { v: 'human_review', l: 'Human verification required before AI output is used in patient care' },
        { v: 'incident', l: 'Process to report misuse or AI errors' },
        { v: 'training', l: 'Staff and students trained on limitations and bias of generative AI' },
      ], captures: 'A safeguards checklist scored Yes = 2, Partial = 1, No = 0 into a generative-AI safeguards index.' },
    { id: 'F07', type: 'single', title: 'Faculty GenAI use', text: 'How often do faculty use generative AI to prepare teaching materials or assessments?', options: [
      { v: 1, l: 'Never' }, { v: 2, l: 'Occasionally' }, { v: 3, l: 'Monthly' }, { v: 4, l: 'Weekly or more' }, { v: -1, l: 'Don\'t know' },
    ], captures: 'Faculty adoption of generative AI in their own work.' },
    { id: 'F08', type: 'single', title: 'AI-detection software', text: 'Is AI-text detection software used to assess student work?', options: [
      { v: 1, l: 'Yes, routinely' }, { v: 2, l: 'Yes, occasionally' }, { v: 0, l: 'No' }, { v: -1, l: 'Don\'t know' },
    ], captures: 'Reliance on detection tools, which have known accuracy problems.' },
  ],
}

// ---------------------------------------------------------------------------
// Part G — Health informatics
// ---------------------------------------------------------------------------
const partG = {
  id: 'G', filledBy: 'respondent',
  title: 'Part G. Health informatics',
  intro: 'Health informatics covers electronic health records, imaging systems, coding and terminologies, teledentistry, data analytics and geographic information systems.',
  purpose: 'Measures the digital backbone of the school clinic and how informatics is taught: electronic records, imaging archives, coding, teledentistry, analytics and research data access, plus teaching hours and staff. Health informatics produces the structured data that AI and research depend on.',
  questions: [
    scale('G01', 'HIN', 'Electronic health record', 'Which best describes the patient record system used in the clinics of this department?', [
      'Paper records', 'Electronic scheduling/billing only; clinical notes on paper', 'Electronic clinical records, mostly free text', 'Integrated electronic record with structured data, imaging and decision support',
    ], 'Digital maturity of patient records, the main source of clinical data.'),
    { id: 'G02', type: 'text', title: 'EHR system name', text: 'Name the electronic record and imaging (PACS) systems used (e.g., axiUm, Dentrix, MiPACS)',
      captures: 'The actual systems, to study interoperability and shared data formats across schools.' },
    { id: 'G03', type: 'multi', title: 'Coding and terminologies', text: 'Which coding systems are used to record diagnoses and procedures?', other: true, options: [
      { v: 'icd', l: 'ICD-10 / ICD-11' }, { v: 'snodent', l: 'SNODENT / SNOMED CT' },
      { v: 'procedure', l: 'Procedure codes (CDT, TUSS or national equivalent)' },
      NONE('Free text only / none'),
    ], captures: 'Use of standard codes, which makes data comparable and usable for AI.' },
    scale('G04', 'HIN', 'Digital imaging archive', 'How are dental images stored and shared?', [
      'Film or images not archived centrally', 'Digital images stored per device or computer', 'Central archive (PACS) for some modalities', 'Enterprise PACS integrated with the health record via DICOM',
    ], 'Whether images are centrally available, a precondition for imaging AI.'),
    scale('G05', 'HIN', 'Teledentistry', 'Use of teledentistry (remote consultation, triage, monitoring) in this department', [
      'None', 'Ad hoc use by individuals', 'Structured program in some services', 'Routine teledentistry with student involvement',
    ], 'Remote care capacity and student exposure to it.'),
    scale('G06', 'HIN', 'Data analytics', 'Are clinic and teaching data analysed with dashboards or routine reports?', [
      'Never', 'Occasional manual reports', 'Regular reports for some indicators', 'Routine dashboards used for clinical and teaching quality decisions',
    ], 'Use of data for decisions, a sign of informatics maturity.'),
    scale('G07', 'HIN', 'Research access to clinical data', 'Can researchers access clinic data (de-identified) for research?', [
      'Not possible', 'Ad hoc extracts by IT', 'Formal request process', 'Curated research data warehouse with governance',
    ], 'Ability to turn routine care into research and AI datasets.'),
    scale('G08', 'HIN', 'Public-health informatics / GIS', 'Use of population health informatics (geographic information systems, surveillance data, epidemiological databases) in teaching or research', [
      'Never', 'Occasionally', 'In some projects or courses', 'Routinely',
    ], 'Use of population-level and geographic data in oral public health.'),
    { id: 'G09', type: 'hours', title: 'Health informatics hours by topic', unit: 'hours per term',
      text: 'Hours per term of health-informatics teaching in this course, by topic (enter 0 if none)',
      rows: [
        { v: 'ehr', l: 'Electronic records and documentation quality' },
        { v: 'standards', l: 'Coding, terminologies and interoperability standards' },
        { v: 'tele', l: 'Teledentistry and digital communication' },
        { v: 'analytics', l: 'Data analytics, epidemiology and GIS' },
        { v: 'privacy', l: 'Privacy, cybersecurity and data protection law' },
      ], captures: 'Time spent teaching health informatics, by topic, converted to hours per year.' },
    scale('G10', 'HIN', 'Informatics teaching depth', 'Depth of health-informatics teaching', [
      'None', 'Mentioned in lectures', 'Dedicated module', 'Dedicated course with practical assessment',
    ], 'Whether informatics is a real part of the curriculum.'),
    { id: 'G11', type: 'number', title: 'Faculty with informatics training', text: 'Number of faculty with formal training in health informatics or GIS', unit: 'faculty', min: 0,
      captures: 'Human capacity in health informatics.' },
    scale('G12', 'HIN', 'Clinical informatics staff', 'Support from clinical informatics staff (EHR analysts, imaging/PACS administrators)', [
      'None', 'Central university IT only', 'Shared clinical informatics staff', 'Dedicated clinical informatics team for the school',
    ], 'Technical staff who keep clinical systems running and data usable.'),
  ],
}

// ---------------------------------------------------------------------------
// Part H — Robotics and digital dentistry
// ---------------------------------------------------------------------------
const partH = {
  id: 'H', filledBy: 'respondent',
  title: 'Part H. Robotics and digital dentistry',
  intro: 'Includes robot-assisted surgery, haptic and virtual-reality simulators, navigation, scanners, CAD/CAM milling and 3D printing.',
  purpose: 'Takes an inventory of the physical equipment for robotics and digital dentistry (how many units of each), how students access it, how digital workflows are used, who can teach and maintain it, teaching hours and research. Counted every year, it shows how equipment and skills spread across schools.',
  questions: [
    { id: 'H01', type: 'hours', title: 'Equipment inventory', unit: 'units available',
      text: 'Number of units available to this department/course (enter 0 if none)',
      rows: [
        { v: 'robot_implant', l: 'Robot-assisted implant surgery systems' },
        { v: 'robot_other', l: 'Other surgical, endodontic or automated robotic systems' },
        { v: 'navigation', l: 'Dynamic navigation systems for guided surgery' },
        { v: 'haptic', l: 'Haptic or virtual-reality dental simulators' },
        { v: 'phantom', l: 'Conventional simulation units (phantom heads)' },
        { v: 'ios', l: 'Intraoral scanners' },
        { v: 'cbct', l: 'CBCT units' },
        { v: 'milling', l: 'Chairside or lab milling units (CAD/CAM)' },
        { v: 'printer', l: '3D printers' },
        { v: 'xr', l: 'Augmented/virtual-reality headsets' },
      ], captures: 'A hard count of equipment, comparable across schools and years and convertible to students per unit.' },
    { id: 'H02', type: 'single', title: 'Equipment age', text: 'Average age of the main digital and robotic equipment', options: [
      { v: 1, l: 'Less than 3 years' }, { v: 2, l: '3–5 years' }, { v: 3, l: '6–10 years' }, { v: 4, l: 'More than 10 years' }, { v: -1, l: 'Don\'t know' },
    ], captures: 'How up to date the equipment is.' },
    scale('H03', 'ROB', 'Student access to robotics', 'Student access to robotic, haptic or navigation systems', [
      'No access', 'Demonstration only', 'Supervised hands-on practice in preclinic', 'Regular hands-on practice including supervised clinical cases',
    ], 'Whether students actually use the equipment.'),
    scale('H04', 'ROB', 'Digital workflow', 'Use of a full digital workflow (scan, design, manufacture) in teaching and clinics', [
      'Analog only', 'Partial digital steps', 'Full digital workflow in some clinics', 'Full digital workflow routine across clinics and teaching',
    ], 'Integration of digital dentistry into everyday care and teaching.'),
    { id: 'H05', type: 'hours', title: 'Robotics/digital hours by topic', unit: 'hours per term',
      text: 'Hours per term of robotics and digital-dentistry teaching in this course, by topic (enter 0 if none)',
      rows: [
        { v: 'cadcam', l: 'Digital workflow, CAD/CAM and 3D printing' },
        { v: 'simulation', l: 'Haptic / virtual-reality simulation' },
        { v: 'robotic_surgery', l: 'Robot-assisted surgery (principles, demonstration, practice)' },
        { v: 'navigation', l: 'Navigation and guided surgery' },
        { v: 'engineering', l: 'Engineering, automation and maintenance basics' },
      ], captures: 'Time spent teaching robotics and digital dentistry, by topic.' },
    { id: 'H06', type: 'number', title: 'Faculty trained in robotics', text: 'Number of faculty trained to operate or teach robotic, navigation or haptic systems', unit: 'faculty', min: 0,
      captures: 'Teaching capacity for robotics and digital dentistry.' },
    { id: 'H07', type: 'number', title: 'Technical support FTE', text: 'Full-time equivalent of technicians or engineers supporting digital and robotic equipment', unit: 'FTE', min: 0, step: 0.1,
      captures: 'Staff who keep the equipment working.' },
    scale('H08', 'ROB', 'Maintenance and replacement', 'Maintenance and replacement of digital/robotic equipment', [
      'No plan', 'Ad hoc repairs', 'Service contracts for some equipment', 'Full maintenance and replacement plan with budget',
    ], 'Whether investment in equipment is sustainable.'),
    scale('H09', 'ROB', 'Safety and credentialing', 'Training and credentialing protocols before robotic or navigation systems are used on patients', [
      'None', 'Informal supervision', 'Written protocol, not always applied', 'Formal credentialing with documented training and supervision',
    ], 'Patient safety when new technology is used in the clinic.'),
    scale('H10', 'ROB', 'Robotics research', 'Robotics and digital-dentistry research in this department', [
      'None', 'Individual projects', 'Funded projects', 'Established research group with engineering partners',
    ], 'Research activity that drives innovation.'),
  ],
}

// ---------------------------------------------------------------------------
// Part I — Bioinformatics and omics
// ---------------------------------------------------------------------------
const partI = {
  id: 'I', filledBy: 'respondent',
  title: 'Part I. Bioinformatics and omics',
  intro: 'Bioinformatics covers the computational analysis of biological data such as the oral microbiome, genomes, gene expression, proteins and metabolites.',
  purpose: 'Pictures laboratory and computing resources for omics research (sequencing, biobanks, pipelines), the people with bioinformatics skills, teaching hours and data-sharing practices. It shows which schools can contribute biological data to future multi-modal AI that links images, records and biology.',
  questions: [
    { id: 'I01', type: 'multi', title: 'Laboratory resources', text: 'Which resources are available to this department/course?', other: true, options: [
      { v: 'wetlab', l: 'Molecular biology laboratory' }, { v: 'sequencer', l: 'DNA/RNA sequencer in the department or school' },
      { v: 'core', l: 'University sequencing / genomics core facility' }, { v: 'biobank', l: 'Biobank of oral samples (saliva, plaque, tissue)' },
      { v: 'massspec', l: 'Mass spectrometry (proteomics / metabolomics)' }, { v: 'hpc', l: 'High-performance computing for bioinformatics' },
      NONE(),
    ], captures: 'The physical infrastructure for generating and analysing biological data.' },
    scale('I02', 'BIO', 'Biobank and sample governance', 'Status of biological sample collection and storage', [
      'None', 'Samples collected per project only', 'Biobank with consent protocol', 'Biobank with linked clinical data, governance and use by several projects',
    ], 'Ability to run omics studies and link biology to clinical data.'),
    { id: 'I03', type: 'multi', title: 'Research areas', text: 'Bioinformatics and omics research areas active in this department', other: true, options: [
      { v: 'microbiome', l: 'Oral microbiome' }, { v: 'genomics', l: 'Host genomics / genetic association studies' },
      { v: 'transcriptomics', l: 'Transcriptomics' }, { v: 'proteomics', l: 'Proteomics / metabolomics (e.g., saliva)' },
      { v: 'epigenetics', l: 'Epigenetics' }, { v: 'craniofacial', l: 'Craniofacial and developmental genetics' },
      { v: 'amr', l: 'Antimicrobial resistance' }, NONE(),
    ], captures: 'Which omics fields the department works in, to match partners across the consortium.' },
    { id: 'I04', type: 'multi', title: 'Software and pipelines', text: 'Bioinformatics software and resources used', other: true, options: [
      { v: 'qiime', l: 'QIIME 2 / mothur (microbiome)' }, { v: 'bioconductor', l: 'R / Bioconductor' }, { v: 'galaxy', l: 'Galaxy' },
      { v: 'python', l: 'Python (Biopython, scikit-bio)' }, { v: 'workflow', l: 'Workflow managers (Nextflow, Snakemake)' },
      { v: 'databases', l: 'Public databases (NCBI, HOMD, UniProt)' }, NONE(),
    ], captures: 'Computational tools in use, and whether analyses are reproducible.' },
    { id: 'I05', type: 'number', title: 'Faculty with bioinformatics expertise', text: 'Number of faculty with bioinformatics or computational-biology expertise', unit: 'faculty', min: 0,
      captures: 'Human capacity in bioinformatics.' },
    scale('I06', 'BIO', 'Bioinformatics support', 'Access to bioinformatics support', [
      'None', 'External collaborators only', 'Shared university core facility', 'Dedicated bioinformatician in the department',
    ], 'Whether biological data can be analysed in-house.'),
    { id: 'I07', type: 'hours', title: 'Bioinformatics hours by topic', unit: 'hours per term',
      text: 'Hours per term of bioinformatics teaching in this course, by topic (enter 0 if none)',
      rows: [
        { v: 'basics', l: 'Molecular biology and genetics foundations for omics' },
        { v: 'microbiome', l: 'Microbiome analysis' },
        { v: 'sequencing', l: 'Sequencing data analysis' },
        { v: 'biostat', l: 'Statistics for high-dimensional data' },
        { v: 'fair', l: 'Data sharing and FAIR principles' },
      ], captures: 'Time spent teaching bioinformatics, by topic.' },
    scale('I08', 'BIO', 'Bioinformatics teaching depth', 'Depth of bioinformatics teaching', [
      'None', 'Conceptual only', 'Demonstrations', 'Hands-on analysis of real data',
    ], 'Whether students learn to analyse biological data themselves.'),
    { id: 'I09', type: 'number', title: 'Omics publications (3 y)', text: 'Number of peer-reviewed bioinformatics/omics publications by this department in the past 3 years', unit: 'publications', min: 0,
      captures: 'Research output in bioinformatics.' },
    scale('I10', 'BIO', 'Data sharing (FAIR)', 'Sharing of omics data in public repositories', [
      'Not shared', 'Shared on request', 'Sometimes deposited in public repositories', 'Routinely deposited with FAIR metadata',
    ], 'Open-science practice, important for consortium-wide reuse of data.'),
  ],
}

// ---------------------------------------------------------------------------
// Part J — Governance, ethics, bias and regulation
// ---------------------------------------------------------------------------
const partJ = {
  id: 'J', filledBy: 'respondent',
  title: 'Part J. Governance, ethics, bias and regulation',
  intro: 'Items J01–J07 refer to the named department/course; J08–J12 refer to the policies and procedures that govern it.',
  purpose: 'Captures the rules around technology use: strategic plans, leadership, oversight, ethics and bias teaching, use of national and international guidance, patient consent, a governance checklist for AI tools (PAHO AI-GUARD) and stakeholder involvement. Strong governance is what makes technology use safe and trustworthy.',
  questions: [
    scale('J01', 'GOV', 'Written plan', 'Does this department/course have a written plan or formal strategic direction for AI and digital technology in teaching?', [
      'None', 'Informal consensus, not documented', 'Draft document under discussion', 'Formal strategic plan, regularly reviewed',
    ], 'Strategic intent written down.'),
    scale('J02', 'GOV', 'Leadership commitment', 'How committed is the leadership of this department (head, division chief) to advancing these initiatives?', [
      'No commitment shown', 'Initial interest, no concrete actions', 'Some commitment, inconsistent or limited in scope', 'Strong commitment with ongoing initiatives and resources',
    ], 'Leadership support, one of the strongest predictors of change.'),
    scale('J03', 'GOV', 'Oversight structure', 'Is there a committee or a named person accountable for AI and digital technology in teaching and clinics?', [
      'None', 'Informal responsibility', 'Committee or person named, limited mandate', 'Formal committee with mandate, reporting line and regular meetings',
    ], 'Accountability for technology decisions.'),
    scale('J04', 'GOV', 'AI ethics teaching', 'Does this course teach AI ethics (bias, privacy, informed consent, accountability, equity)?', [
      'None', 'Brief mention only', '1 dedicated session', 'Systematic integration with case-based discussion and assessment',
    ], 'Preparation of students for ethical use.'),
    { id: 'J05', type: 'multi', title: 'Ethics topics', text: 'Which ethics topics are covered?', options: [
      { v: 'bias', l: 'Algorithmic bias and equity' }, { v: 'privacy', l: 'Privacy and data protection' },
      { v: 'consent', l: 'Informed consent for technology use with patients' }, { v: 'accountability', l: 'Professional accountability / liability' },
      { v: 'transparency', l: 'Transparency and explainability' }, { v: 'automation', l: 'Automation bias / over-reliance' },
      { v: 'ip', l: 'Intellectual property and authorship' }, { v: 'environment', l: 'Environmental impact of AI' },
      { v: 'integrity', l: 'Academic integrity' }, { v: 'genetic', l: 'Genetic data and biobank ethics' }, NONE(),
    ], captures: 'The ethics content profile.' },
    scale('J06', 'GOV', 'Bias teaching', 'Are students taught to check AI performance across patient subgroups and to recognize biased training data (PAHO Bias-free AI)?', [
      'Not taught', 'Mentioned informally', '1 dedicated session', 'Hands-on exercises with real or simulated subgroup analyses',
    ], 'A specific skill for fair AI.'),
    scale('J07', 'GOV', 'Ethical guidelines available', 'Are established ethical guidelines or white papers on AI and digital technology in dentistry available to faculty and students?', [
      'None available', 'Some documents exist but are incomplete', 'Guidelines exist but need dissemination', 'Comprehensive, well-implemented guidelines available',
    ], 'Access to guidance (PAHO/WHO readiness toolkit item).'),
    { id: 'J08', type: 'multi', title: 'Guidance documents used', text: 'Which of the following documents are used in teaching or clinical protocols of this department/course?', options: GUIDANCE_DOCS, countryFiltered: true,
      captures: 'Which international and national documents shape practice; the list adapts to the respondent\'s country.' },
    scale('J09', 'GOV', 'Regulatory guidance incorporated', 'Is national / professional regulatory guidance on AI and digital technology in dentistry incorporated into teaching and clinical protocols?', [
      'Not incorporated', 'Aware but not incorporated', 'Discussed in faculty meetings', 'Incorporated into teaching and clinical protocols',
    ], 'Translation of regulation into practice.', { countryHint: 'professional' }),
    scale('J10', 'GOV', 'Patient consent', 'Are patients informed / asked for consent when AI or robotic systems are used in their care in the school clinic?', [
      'Never', 'Occasionally, at clinician discretion', 'Required by policy but inconsistently applied', 'Required by policy, documented in the record',
    ], 'Respect for patient autonomy.'),
    { id: 'J11', type: 'grid', title: 'AI tool governance (AI-GUARD)', options: YPN,
      text: 'Before and during use of clinical AI tools in this department/course, are the following in place? (adapted from PAHO AI-GUARD, Tier 2)',
      rows: [
        { v: 'ownership', l: 'Defined owner / responsible authority for each AI tool' },
        { v: 'vendor_docs', l: 'Vendor documentation or model card reviewed (intended use, training data, limitations)' },
        { v: 'validation', l: 'Independent / external validation evidence reviewed' },
        { v: 'regulatory', l: 'Regulatory clearance verified for the intended use' },
        { v: 'subgroup', l: 'Performance across patient subgroups evaluated' },
        { v: 'human_review', l: 'Human review required before acting on AI output' },
        { v: 'override', l: 'Clinician override possible and logged' },
        { v: 'incident', l: 'Incident / error reporting process defined' },
        { v: 'updates', l: 'Update / version-change notification procedure defined' },
        { v: 'monitoring', l: 'Ongoing performance monitoring (drift) planned' },
      ], captures: 'A 10-item governance checklist scored Yes = 2, Partial = 1, No = 0 into the AI-GUARD index.' },
    scale('J12', 'GOV', 'Stakeholder involvement', 'How involved are stakeholders (faculty, students, clinical staff, IT, patients, external partners) in decisions about technology integration?', [
      'Not involved', 'Limited, non-systematic involvement', 'Involvement exists but inconsistent', 'Well-established processes for systematic stakeholder input',
    ], 'Participation in decisions (PAHO/WHO readiness toolkit item).'),
  ],
}

// ---------------------------------------------------------------------------
// Part K — Implementation, evaluation and sustainability
// ---------------------------------------------------------------------------
const partK = {
  id: 'K', filledBy: 'respondent',
  title: 'Part K. Implementation, evaluation and sustainability',
  intro: 'Refers to technology initiatives of the named department/course (AI, informatics, robotics, bioinformatics).',
  purpose: 'Measures whether initiatives move from pilots to routine use and whether they last: pilots, scalability, workflow integration, metrics, evaluation, feedback, cost-benefit, sustainability and funding (PAHO/WHO readiness toolkit). It separates one-off enthusiasm from lasting change.',
  questions: [
    { id: 'K01', type: 'repeat', title: 'Pilot projects', count: 3, text: 'Name any technology pilot project currently running in this department/course',
      fields: [
        { id: 'name', type: 'text', l: 'Project' },
        { id: 'domain', type: 'single', l: 'Domain', options: [
          { v: 1, l: 'AI' }, { v: 2, l: 'Health informatics' }, { v: 3, l: 'Robotics / digital dentistry' }, { v: 4, l: 'Bioinformatics' },
        ] },
        { id: 'area', type: 'single', l: 'Area', options: [
          { v: 1, l: 'Teaching / learning' }, { v: 2, l: 'Assessment' }, { v: 3, l: 'Clinical care' },
          { v: 4, l: 'Research' }, { v: 5, l: 'Administration' },
        ] },
      ], captures: 'Named pilots, their domain and area, to share lessons across schools.' },
    scale('K02', 'IMP', 'Pilot maturity', 'Status of technology pilot projects', [
      'No pilot projects', 'Initial pilots with limited outcomes', 'Pilots ongoing, outcomes not yet assessed', 'Pilots with positive, documented outcomes',
    ], 'Evidence from pilots.'),
    scale('K03', 'IMP', 'Scalability', 'Potential for scaling successful initiatives to other courses', [
      'No potential', 'Limited potential; substantial effort required', 'Some potential, requires significant resources and coordination', 'High potential with a clear pathway',
    ], 'Whether success can spread.'),
    scale('K04', 'IMP', 'Workflow integration', 'How well are these technologies integrated into clinical and teaching workflows?', [
      'Not integrated', 'Used outside routine workflow', 'Partly integrated', 'Fully integrated in routine workflow',
    ], 'Routine use versus side projects.'),
    scale('K05', 'IMP', 'Performance metrics', 'Are there established metrics for monitoring the performance or impact of technology teaching initiatives?', [
      'No metrics', 'Limited metrics', 'Metrics exist but need refinement', 'Comprehensive metrics with regular review',
    ], 'Measurement of results.'),
    scale('K06', 'IMP', 'Evaluation framework', 'Is the impact of technology teaching evaluated with a framework (e.g., Kirkpatrick levels: reaction, learning, behaviour, results)?', [
      'Not evaluated', 'Student satisfaction only', 'Learning outcomes measured', 'Learning and clinical/behavioural outcomes measured',
    ], 'Depth of evaluation.'),
    scale('K07', 'IMP', 'Feedback mechanisms', 'Are there mechanisms to collect and act on feedback from students and faculty?', [
      'None', 'Informal feedback only', 'Formal collection, inconsistent follow-up', 'Formal collection with documented actions',
    ], 'Listening to users.'),
    scale('K08', 'IMP', 'Continuous improvement', 'Are there mechanisms for continuous improvement based on evaluation?', [
      'No mechanisms', 'Limited mechanisms', 'Mechanisms exist but need better integration', 'Comprehensive feedback loops',
    ], 'Learning from evaluation.'),
    scale('K09', 'IMP', 'Cost-benefit evaluation', 'Has the cost and benefit of technology initiatives been evaluated (licences, hardware, staff time vs. outcomes)?', [
      'Never', 'Informal estimate', 'Formal evaluation for some initiatives', 'Formal evaluation for all major initiatives',
    ], 'Economic evidence for investment decisions.'),
    scale('K10', 'IMP', 'Financial sustainability', 'Are there plans for long-term financial sustainability (budget lines, grant strategies, partnerships)?', [
      'No plans', 'Initial discussions only', 'Plans exist but incomplete', 'Comprehensive, well-developed plans',
    ], 'Whether initiatives will survive after initial funding.'),
    { id: 'K11', type: 'repeat', title: 'Funding sources', count: 3, text: 'Name each funding source that supports technology teaching or research in this department/course',
      fields: [
        { id: 'name', type: 'text', l: 'Funding source' },
        { id: 'type', type: 'single', l: 'Type', options: [
          { v: 1, l: 'Institutional budget' }, { v: 2, l: 'National research agency (e.g., NIH, CIHR, CNPq/CAPES/FAPs, NSFC, ICMR/DST)' },
          { v: 3, l: 'Industry' }, { v: 4, l: 'Philanthropy / foundation' }, { v: 5, l: 'International agency' }, { v: 6, l: 'Other' },
        ] },
      ], captures: 'Who pays, to identify funding opportunities for consortium projects.' },
    scale('K12', 'IMP', 'Funding adequacy', 'Funding available for technology teaching or research in this department/course', [
      'No funding', 'Limited funding with significant gaps', 'Funding available but inconsistent or insufficient', 'Sufficient, reliable funding',
    ], 'Adequacy of money.'),
    { id: 'K13', type: 'single', title: 'Annual budget', text: 'Approximate annual budget dedicated to these technologies in this department/course (USD equivalent)', options: [
      { v: 0, l: 'None' }, { v: 1, l: 'Less than 5,000' }, { v: 2, l: '5,000 – 25,000' }, { v: 3, l: '25,001 – 100,000' },
      { v: 4, l: 'More than 100,000' }, { v: -1, l: 'Don\'t know' },
    ], captures: 'Order of magnitude of investment, comparable across countries.' },
    { id: 'K14', type: 'number', title: 'Grants (3 y)', text: 'Number of competitive grants related to these technologies obtained by this department in the past 3 years', unit: 'grants', min: 0,
      captures: 'Success in attracting competitive funding.' },
  ],
}

// ---------------------------------------------------------------------------
// Part L — Consortium collaboration and the open AI model
// ---------------------------------------------------------------------------
const partL = {
  id: 'L', filledBy: 'respondent',
  title: 'Part L. Collaboration and the open dental AI model',
  intro: 'ICARB-D aims to build a free, open AI model for dentistry through joint work. These items are about your interest and capacity to take part. Answering does not commit your institution.',
  purpose: 'Maps which departments could contribute data, annotation, validation, teaching or grant work to the consortium\'s free dental AI model, under which conditions, and what stands in the way. It turns the survey into a practical plan for collaboration.',
  questions: [
    { id: 'L01', type: 'single', title: 'Interest in ICARB-D projects', text: 'Interest of this department in joining ICARB-D collaborative projects', options: [
      { v: 1, l: 'Not interested' }, { v: 2, l: 'Would like more information' }, { v: 3, l: 'Interested in participating' }, { v: 4, l: 'Already involved' },
    ], captures: 'Who wants to join, to plan the first collaborative projects.' },
    { id: 'L02', type: 'multi', title: 'Data that could be contributed', text: 'Which de-identified data could this department potentially contribute to a shared dental AI model (subject to ethics approval)?', options: [
      { v: 'periapical', l: 'Periapical / bitewing radiographs' }, { v: 'panoramic', l: 'Panoramic radiographs' }, { v: 'cbct', l: 'CBCT' },
      { v: 'ios', l: 'Intraoral scans (3D)' }, { v: 'photos', l: 'Clinical photographs' }, { v: 'records', l: 'Structured clinical records' },
      { v: 'histology', l: 'Histopathology images' }, { v: 'omics', l: 'Omics / microbiome data' }, NONE('None'),
    ], captures: 'The potential data pool for the open AI model, by modality.' },
    { id: 'L03', type: 'number', title: 'Images available for sharing', text: 'Approximate number of de-identified images or records that could be shared (0 if none)', unit: 'images/records', min: 0,
      captures: 'Scale of potential contribution.' },
    scale('L04', null, 'Ability to share data', 'Ability to share de-identified data with external partners', [
      'Not possible', 'Possible only with a new ethics approval', 'Possible under existing approvals and data-sharing agreements', 'Already sharing data with external partners',
    ], 'How quickly data could actually be shared (not part of the maturity score).'),
    { id: 'L05', type: 'multi', title: 'Preferred ways to collaborate', text: 'How would this department prefer to collaborate?', other: true, options: [
      { v: 'federated', l: 'Federated learning (data stays at our institution)' },
      { v: 'central', l: 'Contributing de-identified data to a central repository' },
      { v: 'annotation', l: 'Annotating / labelling images' },
      { v: 'validation', l: 'Testing and validating models on our own data' },
      { v: 'teaching', l: 'Sharing curricula and teaching materials' },
      { v: 'grants', l: 'Joint grant applications and publications' },
    ], captures: 'The collaboration models each partner accepts, e.g., federated learning when data cannot leave the institution.' },
    { id: 'L06', type: 'multi', title: 'Barriers to sharing', text: 'Main barriers to sharing data or collaborating', other: true, options: [
      { v: 'law', l: 'Privacy law / legal uncertainty' }, { v: 'ethics', l: 'Ethics approval' }, { v: 'policy', l: 'Institutional policy' },
      { v: 'technical', l: 'Technical capacity' }, { v: 'quality', l: 'Data quality or lack of annotation' },
      { v: 'ip', l: 'Intellectual property concerns' }, { v: 'time', l: 'Staff time' }, NONE('No major barriers'),
    ], captures: 'Obstacles the consortium must solve (e.g., model agreements, federated tools).' },
    { id: 'L07', type: 'number', title: 'People available', text: 'Number of faculty, staff or graduate students who could dedicate time to consortium projects', unit: 'people', min: 0,
      captures: 'Human capacity available for joint work.' },
    { id: 'L08', type: 'textarea', title: 'Project ideas', text: 'Ideas for collaborative projects (optional)',
      captures: 'Suggestions from the field to shape the consortium agenda.' },
  ],
}

// ---------------------------------------------------------------------------
// Part M — Self-assessment and open response
// ---------------------------------------------------------------------------
const MATURITY = [
  'Exploring: no formal action; individual interest only',
  'Planning: discussions underway, some resources identified, no systematic implementation',
  'Implementing: some formal courses/projects launched, not scaled or sustainable',
  'Mature: systematic integration, dedicated resources, continuous evaluation',
]

const partM = {
  id: 'M', filledBy: 'respondent',
  title: 'Part M. Self-assessment and open response',
  intro: '',
  purpose: 'Asks the respondent for an overall judgement of maturity in each of the four domains, the main barriers and facilitators, and open comments. Self-ratings are compared with the scores computed from Parts C–K, and open answers explain the numbers.',
  questions: [
    scale('M01', null, 'Overall maturity — AI', 'Overall maturity of this department/course in artificial intelligence', MATURITY, 'Respondent\'s overall judgement for AI, compared with computed scores.'),
    scale('M02', null, 'Overall maturity — health informatics', 'Overall maturity in health informatics', MATURITY, 'Overall judgement for health informatics.'),
    scale('M03', null, 'Overall maturity — robotics', 'Overall maturity in robotics and digital dentistry', MATURITY, 'Overall judgement for robotics and digital dentistry.'),
    scale('M04', null, 'Overall maturity — bioinformatics', 'Overall maturity in bioinformatics and omics', MATURITY, 'Overall judgement for bioinformatics.'),
    { id: 'M05', type: 'multi', title: 'Primary barriers', max: 3, text: 'Primary barriers to progress in this department/course (select up to three)', other: true, options: [
      { v: 'funding', l: 'Lack of funding' }, { v: 'expertise', l: 'Lack of faculty expertise' },
      { v: 'time', l: 'Lack of time in the curriculum' }, { v: 'leadership', l: 'Lack of leadership support' },
      { v: 'equipment', l: 'Lack of equipment / infrastructure' }, { v: 'ethics_legal', l: 'Ethical / legal uncertainty' },
      { v: 'students', l: 'Lack of student interest or preparedness' }, { v: 'data', l: 'Lack of data access' },
      { v: 'accreditation', l: 'Accreditation / curriculum rules leave no room' }, { v: 'language', l: 'Language barriers (tools/materials not in local language)' },
    ], captures: 'The three biggest obstacles, ranked across schools and countries.' },
    { id: 'M06', type: 'multi', title: 'Facilitators', max: 3, text: 'Main facilitators of progress (select up to three)', other: true, options: [
      { v: 'champions', l: 'Faculty champions' }, { v: 'leadership', l: 'Leadership support' }, { v: 'funding', l: 'Dedicated funding' },
      { v: 'partners', l: 'Interdisciplinary partners' }, { v: 'industry', l: 'Industry partnerships' },
      { v: 'students', l: 'Student demand' }, { v: 'accreditation', l: 'Accreditation / national guidelines' },
      { v: 'network', l: 'National or international networks' },
    ], captures: 'What helps, to replicate success elsewhere.' },
    { id: 'M07', type: 'textarea', title: 'Most important need', text: 'What is the single most important resource or policy support this department/course needs in the next 2 years?',
      captures: 'The top priority in the respondent\'s words, analysed by theme.' },
    { id: 'M08', type: 'textarea', title: 'Innovative practice', text: 'Describe any innovative teaching practice with AI, informatics, robotics or bioinformatics in this department/course (optional)',
      captures: 'Good practices to showcase and share.' },
    { id: 'M09', type: 'textarea', title: 'Vision 2030', text: 'How do you expect these technologies to change teaching in this department/course by 2030? (optional)',
      captures: 'Expectations for the future (PAHO "Vision 2030" question).' },
    scale('M10', null, 'Confidence in answers', 'How confident are you in the accuracy of your answers?', [
      'Low', 'Moderate', 'High', 'Very high (checked with records)',
    ], 'Data-quality flag used in sensitivity analyses.', { noDK: true }),
    { id: 'M11', type: 'single', title: 'Follow-up interview', text: 'Would you agree to a short follow-up interview?', options: YES_NO,
      captures: 'Willingness for qualitative follow-up.' },
  ],
}

export const SECTIONS = [partA, partB, partC, partD, partE, partF, partG, partH, partI, partJ, partK, partL, partM]

export const DOMAINS = {
  INF: 'Physical infrastructure and technology',
  DAT: 'Data management, quality and privacy',
  HUM: 'Human resources and expertise',
  CUR: 'AI curriculum and teaching',
  GEN: 'Generative AI governance and literacy',
  HIN: 'Health informatics',
  ROB: 'Robotics and digital dentistry',
  BIO: 'Bioinformatics and omics',
  GOV: 'Governance, ethics and regulation',
  IMP: 'Implementation, evaluation and sustainability',
}

export const ALL_QUESTIONS = SECTIONS.flatMap((s) => s.questions.map((q) => ({ ...q, section: s.id })))
export const questionById = Object.fromEntries(ALL_QUESTIONS.map((q) => [q.id, q]))
