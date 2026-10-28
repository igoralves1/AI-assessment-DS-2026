// Single source of truth for the AI Readiness Assessment questionnaire.
// The website, the CSV columns (codebook) and the Word/PDF documents are all generated from this file.
//
// Question types
//   scale    1–4 anchored maturity scale (+ "Don't know / N/A" = -1). Used for domain scores.
//   single   one choice from options
//   multi    several choices; one 0/1 column per option (max = optional limit)
//   number   numeric value
//   text     short text          textarea  long text
//   repeat   a small table repeated `count` times (e.g., Tool 1..6), one column per item × field
//   grid     several rows sharing the same options (e.g., Yes / Partial / No)
//   hours    several rows, each a number of hours
//
// `pii: true` fields are stored only in the private access-codes file, never in responses.csv.
// `filledBy: 'team'` sections are completed by the research team before the access code is issued.

import { COUNTRIES, GUIDANCE_DOCS } from './countries.js'

export const VERSION = '1.0.0'
export const DK = -1 // "Don't know / Not applicable"

const scale = (id, domain, title, text, anchors, extra = {}) => ({
  id, type: 'scale', domain, title, text,
  options: anchors.map((l, i) => ({ v: i + 1, l })),
  ...extra,
})

const YES_NO = [{ v: 1, l: 'Yes' }, { v: 0, l: 'No' }]
const YPN = [{ v: 2, l: 'Yes' }, { v: 1, l: 'Partial' }, { v: 0, l: 'No' }]

// ---------------------------------------------------------------------------
// Part A — Intake (completed by the research team; generates the access code)
// ---------------------------------------------------------------------------
const partA = {
  id: 'A', filledBy: 'team',
  title: 'Part A. Named department/course profile (completed by the research team)',
  intro: 'The research team completes this part with the department head or course director (by phone, video call or email). Saving it generates the XXX-XXX access code given to the respondent.',
  questions: [
    { id: 'A01', type: 'single', title: 'Country', text: 'Country', options: COUNTRIES, required: true },
    { id: 'A02', type: 'text', title: 'Region', text: 'State / province / region', required: true },
    { id: 'A03', type: 'text', title: 'Institution', text: 'Name of dental school (institution)', required: true },
    { id: 'A04', type: 'single', title: 'Institution type', text: 'Type of institution', required: true, options: [
      { v: 1, l: 'Public (federal / national)' },
      { v: 2, l: 'Public (state / provincial / municipal)' },
      { v: 3, l: 'Private, non-profit' },
      { v: 4, l: 'Private, for-profit' },
    ] },
    { id: 'A05', type: 'text', title: 'City', text: 'City', required: true },
    { id: 'A06', type: 'text', title: 'Department', text: 'Name of the department/course being reported (e.g., Department of Oral Radiology)', required: true },
    { id: 'A07', type: 'text', title: 'Course', text: 'Course code and title referenced in this form (e.g., "RAD-301 Oral Radiology II"). Write "Department-wide" if the form covers the whole department.', required: true },
    { id: 'A08', type: 'single', title: 'Level', text: 'Level of this named department/course', required: true, other: true, options: [
      { v: 1, l: 'Undergraduate first professional degree (DDS/DMD, BDS, Bacharelado em Odontologia, 口腔医学 Bachelor)' },
      { v: 2, l: 'Research master\'s (MSc/MS, Mestrado acadêmico, 学术型硕士)' },
      { v: 3, l: 'Professional/clinical master\'s or specialty degree (MDS in India, Mestrado profissional, 专业型硕士)' },
      { v: 4, l: 'Doctoral (PhD/DSc, Doutorado, 博士)' },
      { v: 5, l: 'Residency / specialty training (US/Canada residency, Brazil residência/especialização, China standardized residency training 规培)' },
      { v: 6, l: 'Integrated long-track program (e.g., China 8-year program, DDS-PhD)' },
      { v: 7, l: 'Continuing education / CPD' },
      { v: 99, l: 'Other' },
    ] },
    { id: 'A09', type: 'single', title: 'Respondent role', text: 'Role of the respondent in this named department/course', required: true, other: true, options: [
      { v: 1, l: 'Department head / chair' },
      { v: 2, l: 'Course director / coordinator' },
      { v: 3, l: 'Program director (graduate / residency)' },
      { v: 4, l: 'Curriculum committee member' },
      { v: 5, l: 'Faculty representative' },
      { v: 6, l: 'Dean / associate dean' },
      { v: 99, l: 'Other' },
    ] },
    { id: 'A10', type: 'text', title: 'Respondent name', text: 'Respondent full name', pii: true },
    { id: 'A11', type: 'text', title: 'Respondent email', text: 'Respondent email', pii: true },
    { id: 'A12', type: 'text', title: 'Interviewer', text: 'Research team member who completed Part A', pii: true },
    { id: 'A13', type: 'single', title: 'Language', text: 'Preferred language of the respondent', other: true, options: [
      { v: 'en', l: 'English' }, { v: 'fr', l: 'French' }, { v: 'pt', l: 'Portuguese' },
      { v: 'zh', l: 'Chinese' }, { v: 'hi', l: 'Hindi' }, { v: 'es', l: 'Spanish' }, { v: 99, l: 'Other' },
    ] },
    { id: 'A14', type: 'single', title: 'Consent', text: 'Informed consent to participate was obtained', required: true, options: YES_NO },
  ],
}

// ---------------------------------------------------------------------------
// Part B — Context of the named department/course (respondent)
// ---------------------------------------------------------------------------
const partB = {
  id: 'B', filledBy: 'respondent',
  title: 'Part B. Context of the named department/course',
  intro: 'Answer every item only for the department/course named in Part A. Approximate numbers are acceptable.',
  questions: [
    { id: 'B01', type: 'number', title: 'Enrollment', text: 'Approximate number of students enrolled in this department/course per year', unit: 'students', min: 0 },
    { id: 'B02', type: 'number', title: 'Faculty headcount', text: 'Number of faculty members assigned to this department/course (headcount)', unit: 'faculty', min: 0 },
    { id: 'B03', type: 'number', title: 'Faculty FTE', text: 'Full-time equivalent (FTE) of faculty assigned to this department/course', unit: 'FTE', min: 0, step: 0.1 },
    { id: 'B04', type: 'single', title: 'Academic calendar', text: 'Academic calendar used by this department/course', countryHint: 'calendarNote', options: [
      { v: 1, l: 'Semester (2 terms per year)' },
      { v: 2, l: 'Trimester (3 terms per year)' },
      { v: 3, l: 'Quarter (4 terms per year)' },
      { v: 4, l: 'Annual system (1 term per year)' },
      { v: 5, l: 'Modular / block system' },
    ] },
    { id: 'B05', type: 'number', title: 'Terms per year', text: 'Number of academic terms per year (used to convert hours per term into hours per year)', unit: 'terms', min: 1, max: 6 },
    { id: 'B06', type: 'number', title: 'Course hours', text: 'Total contact hours of this course per term (all topics, not only AI)', unit: 'hours per term', min: 0 },
    { id: 'B07', type: 'multi', title: 'Program years', text: 'In which program year(s) is this course taught?', options: [
      { v: 'y1', l: 'Year 1' }, { v: 'y2', l: 'Year 2' }, { v: 'y3', l: 'Year 3' }, { v: 'y4', l: 'Year 4' },
      { v: 'y5', l: 'Year 5' }, { v: 'y6', l: 'Year 6 or later / internship' }, { v: 'grad', l: 'Graduate / residency year' },
    ] },
    { id: 'B08', type: 'single', title: 'Course format', text: 'Main format of this course', options: [
      { v: 1, l: 'Didactic (lectures/seminars)' }, { v: 2, l: 'Preclinical / laboratory' },
      { v: 3, l: 'Clinical' }, { v: 4, l: 'Mixed' }, { v: 5, l: 'Research' },
    ] },
    { id: 'B09', type: 'number', title: 'AI courses in department', text: 'How many courses in this department include any AI content?', unit: 'courses', min: 0 },
    { id: 'B10', type: 'single', title: 'Respondent AI experience', text: 'Your own experience with AI in teaching, research or practice', options: [
      { v: 1, l: 'None' }, { v: 2, l: 'Less than 1 year' }, { v: 3, l: '1–3 years' }, { v: 4, l: 'More than 3 years' },
    ] },
    scale('B11', null, 'Respondent AI literacy', 'How would you rate your own AI literacy?', [
      'Basic: I know general concepts only',
      'Intermediate: I can interpret AI outputs and their limitations',
      'Advanced: I can critically appraise AI studies and select tools',
      'Expert: I develop, train or validate AI models',
    ], { noDK: true }),
  ],
}

// ---------------------------------------------------------------------------
// Part C — Physical resources, infrastructure and data
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
  title: 'Part C. Physical resources, infrastructure and data',
  intro: 'Facilities, equipment, software, data and technical support available to the named department/course.',
  questions: [
    scale('C01', 'INF', 'Computing hardware', 'Is there hardware designated for AI-related teaching or research (GPU workstations, high-performance computing, cloud credits) in this department/course?', [
      'None',
      'Only individual faculty members\' personal equipment',
      'Shared equipment, insufficient for demand',
      'Dedicated high-performance computing, regularly updated and accessible to students',
    ]),
    { id: 'C02', type: 'number', title: 'GPU workstations', text: 'Number of GPU-equipped workstations or servers available to this department/course', unit: 'units', min: 0 },
    scale('C03', 'INF', 'Cloud computing', 'Access to cloud computing for AI (institutional cloud accounts, research credits, university HPC cluster)', [
      'No access', 'Individual/ad hoc access paid by faculty', 'Institutional access on request, limited quota', 'Routine institutional access with support',
    ]),
    { id: 'C04', type: 'number', title: 'Student devices ratio', text: 'Number of students per institutionally provided computer during hands-on AI or digital sessions (e.g., 1 = one computer per student)', unit: 'students per computer', min: 0, step: 0.5 },
    scale('C05', 'INF', 'Dedicated digital/AI space', 'Is there a dedicated physical space for digital dentistry or AI teaching/research (lab, innovation hub)?', [
      'None', 'Shared general computer room', 'Dedicated digital dentistry lab without AI focus', 'Dedicated AI/digital dentistry lab with staff and scheduled student access',
    ]),
    { id: 'C06', type: 'multi', title: 'Software licences', text: 'Which AI/data-science software is available to students and faculty of this department/course?', other: true, options: [
      { v: 'python', l: 'Python / Jupyter / Google Colab' }, { v: 'r', l: 'R / RStudio' }, { v: 'matlab', l: 'MATLAB' },
      { v: 'nocode', l: 'No-code machine learning (e.g., Orange, KNIME, Teachable Machine)' },
      { v: 'annotation', l: 'Image annotation tools (e.g., CVAT, Label Studio, 3D Slicer)' },
      { v: 'stats', l: 'Statistical packages (SPSS, Stata, SAS)' },
      { v: 'commercial_ai', l: 'Commercial dental AI platforms' },
      { v: 'genai_licensed', l: 'Institutionally licensed generative AI (e.g., Copilot, ChatGPT Edu, Gemini)' },
      { v: 'none', l: 'None', exclusive: true },
    ] },
    { id: 'C07', type: 'multi', title: 'AI-enabled equipment', text: 'Which AI-enabled equipment or systems are in use in this department/course?', other: true, options: [
      { v: 'radiography', l: 'Digital radiography with AI analysis' }, { v: 'cbct', l: 'CBCT with AI segmentation' },
      { v: 'ios', l: 'Intraoral scanners with AI features' }, { v: 'cadcam', l: 'CAD/CAM or 3D printing with AI design' },
      { v: 'haptic', l: 'Haptic / simulation units with AI feedback' }, { v: 'ehr_ai', l: 'Electronic health record with AI modules' },
      { v: 'lms_ai', l: 'Learning management system with AI features' }, { v: 'tutor', l: 'AI tutor / chatbot for students' },
      { v: 'none', l: 'None', exclusive: true },
    ] },
    { id: 'C08', type: 'repeat', title: 'Clinical/educational AI tools', count: 6,
      text: 'List each AI tool students actually use in this department/course. Leave rows empty if not applicable.',
      fields: [
        { id: 'name', type: 'text', l: 'Tool / product name' },
        { id: 'task', type: 'single', l: 'Main task', options: TOOL_TASKS },
        { id: 'reg', type: 'single', l: 'Regulatory status', options: [
          { v: 1, l: 'Cleared/approved by the national regulator for this use' },
          { v: 2, l: 'Foreign approval only (e.g., CE, FDA) ' },
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
        { id: 'since', type: 'number', l: 'Year introduced', min: 2000, max: 2035 },
      ] },
    scale('C09', 'INF', 'Number of AI tools', 'Overall use of AI tools by students in this department/course', [
      'No AI tool is used', '1 AI tool used', '2–3 AI tools used', '4 or more AI tools used and integrated into graded coursework',
    ]),
    { id: 'C10', type: 'text', title: 'EHR / imaging systems', text: 'Name the electronic health record and imaging (PACS) systems used in this department/course (e.g., axiUm, Dentrix, MiPACS)' },
    scale('C11', 'DAT', 'De-identified dataset', 'Is there a standardized, de-identified oral-health dataset (radiographs, intraoral scans, treatment records) that students or faculty of this department/course can access for AI training or research?', [
      'No dataset accessible', 'Dataset in planning or pilot stage', 'Dataset exists but access is restricted and scale is limited', 'Dataset exists with clear access protocols and is used in the course',
    ]),
    { id: 'C12', type: 'multi', title: 'Dataset modalities', text: 'Which data modalities are available in that dataset?', options: [
      { v: 'periapical', l: 'Periapical / bitewing radiographs' }, { v: 'panoramic', l: 'Panoramic radiographs' },
      { v: 'ceph', l: 'Cephalometric radiographs' }, { v: 'cbct', l: 'CBCT' }, { v: 'ios', l: 'Intraoral scans (3D)' },
      { v: 'photos', l: 'Clinical photographs' }, { v: 'histology', l: 'Histopathology images' },
      { v: 'records', l: 'Structured treatment / EHR records' }, { v: 'notes', l: 'Free-text clinical notes' },
      { v: 'none', l: 'No dataset', exclusive: true },
    ] },
    { id: 'C13', type: 'number', title: 'Dataset size', text: 'Approximate number of de-identified images or records in that dataset (enter 0 if none)', unit: 'images/records', min: 0 },
    scale('C14', 'DAT', 'Annotation capacity', 'Capacity to label/annotate data for AI (calibrated annotators, annotation protocol, inter-rater agreement)', [
      'No capacity', 'Ad hoc annotation by individual researchers', 'Annotation protocol exists, limited calibration', 'Calibrated annotators with documented protocol and agreement statistics',
    ]),
    scale('C15', 'DAT', 'Data quality', 'What measures ensure the accuracy, completeness and timeliness of data used in this department/course?', [
      'No measures applied', 'Ad hoc checks only', 'Some measures exist but are not comprehensive', 'Systematic quality assurance with documented protocols',
    ]),
    scale('C16', 'DAT', 'Data representativeness', 'Is the representativeness of the data assessed (age, sex, ethnicity, socioeconomic group, rural/urban, device type)?', [
      'Never assessed', 'Discussed informally', 'Assessed for some projects', 'Systematically assessed and reported',
    ]),
    scale('C17', 'DAT', 'Privacy and security', 'What privacy and security systems protect patient data used in this department/course?', [
      'No systems', 'Basic password protection only', 'Systems exist but are inconsistent', 'Comprehensive systems with encryption, audit trails and a named person responsible',
    ], { countryHint: 'privacy' }),
    scale('C18', 'DAT', 'De-identification', 'Are there documented procedures for anonymization / de-identification of patient data before use in teaching or AI research?', [
      'No procedures', 'Informal practice only', 'Written procedures, inconsistently applied', 'Written procedures, routinely applied and audited',
    ]),
    scale('C19', 'DAT', 'Secure research environment', 'Is a secure environment available for working with identifiable or sensitive data (trusted research environment, approved server, data enclave)?', [
      'Not available', 'Planned', 'Available on request with delays', 'Available and routinely used',
    ]),
    scale('C20', 'INF', 'Connectivity and IT support', 'Does this department/course have reliable broadband and technical support for the AI tools it uses?', [
      'Neither reliable connectivity nor AI-specific support', 'Basic IT support exists but does not cover AI tools', 'Partial support (software installation only)', 'Dedicated AI / educational-technology support assigned to the department/course',
    ]),
    scale('C21', 'INF', 'Interoperability', 'Can the AI tools used exchange data with existing systems (EHR, imaging/PACS, learning management system) using standards such as DICOM, HL7 FHIR or LTI?', [
      'No interoperability', 'Some standards under development', 'Standards exist but implementation is inconsistent', 'Well-established standards enabling seamless integration',
    ]),
    scale('C22', 'INF', 'Cybersecurity', 'Are cybersecurity measures applied to AI tools and data (risk assessment, access control, vendor security review)?', [
      'None', 'Basic institutional measures only', 'Measures exist but not specific to AI tools', 'AI-specific security review before adoption and periodic audit',
    ]),
    scale('C23', 'INF', 'Equitable student access', 'Do all students in this course have equal access to the AI tools and computing needed (including outside class hours)?', [
      'No — access depends on personal devices/subscriptions', 'Limited institutional access', 'Access during scheduled sessions only', 'Equal access during and outside class hours',
    ]),
  ],
}

// ---------------------------------------------------------------------------
// Part D — Human resources and expertise
// ---------------------------------------------------------------------------
const partD = {
  id: 'D', filledBy: 'respondent',
  title: 'Part D. Human resources and expertise',
  intro: 'Faculty and staff assigned to the named department/course.',
  questions: [
    scale('D01', 'HUM', 'Faculty able to teach AI', 'What proportion of faculty can independently teach AI content (machine-learning principles, interpreting AI outputs, critical appraisal of AI literature)?', [
      '0%', '1–10%', '11–25%', 'More than 25%',
    ]),
    { id: 'D02', type: 'number', title: 'Faculty teaching AI (n)', text: 'Number of faculty who currently teach any AI content in this department/course', unit: 'faculty', min: 0 },
    { id: 'D03', type: 'number', title: 'Faculty with formal AI degree', text: 'Number of faculty with a formal qualification in AI, computer science, data science or biomedical informatics (degree or university certificate)', unit: 'faculty', min: 0 },
    scale('D04', 'HUM', 'AI-primary researchers', 'How many faculty have AI in dentistry or dental education as their primary research area?', [
      'None', '1', '2–3', '4 or more',
    ]),
    { id: 'D05', type: 'number', title: 'AI publications (3 y)', text: 'Number of peer-reviewed AI-related publications by faculty of this department/course in the past 3 years', unit: 'publications', min: 0 },
    { id: 'D06', type: 'number', title: 'AI graduate trainees', text: 'Number of graduate students, residents or postdocs currently working on AI projects in this department/course', unit: 'trainees', min: 0 },
    scale('D07', 'HUM', 'Faculty AI training', 'What formal AI training have faculty received in the past 24 months?', [
      'No training received', 'Voluntary, sporadic sessions only', 'Organized training, but low or inconsistent attendance', 'Systematic training with institutional incentives and tracking',
    ]),
    { id: 'D08', type: 'number', title: 'Training hours per faculty', text: 'Average hours of AI training per faculty member in the past 12 months', unit: 'hours', min: 0 },
    { id: 'D09', type: 'multi', title: 'Training formats', text: 'Formats of AI training available to faculty', other: true, options: [
      { v: 'workshop', l: 'Institutional workshops / seminars' }, { v: 'mooc', l: 'Online courses (MOOCs, e.g., Coursera, edX)' },
      { v: 'certificate', l: 'University certificate programs' }, { v: 'conference', l: 'Conference sessions (IADR, ADEA, ADEE, SBPqO, IDA, CSA)' },
      { v: 'peer', l: 'Peer mentoring / communities of practice' }, { v: 'vendor', l: 'Vendor training' },
      { v: 'degree', l: 'Sponsored degree programs' }, { v: 'none', l: 'None', exclusive: true },
    ] },
    { id: 'D10', type: 'repeat', title: 'Interdisciplinary partners', count: 3,
      text: 'Name each external unit this department/course collaborates with on AI teaching or research (e.g., Department of Computer Science, Faculty of Engineering, a company).',
      fields: [
        { id: 'name', type: 'text', l: 'Partner unit' },
        { id: 'type', type: 'single', l: 'Type', options: [
          { v: 1, l: 'Same university — computer science / engineering' },
          { v: 2, l: 'Same university — medicine / public health / other' },
          { v: 3, l: 'Other university (national)' }, { v: 4, l: 'Other university (international)' },
          { v: 5, l: 'Industry / company' }, { v: 6, l: 'Government / hospital / other' },
        ] },
      ] },
    scale('D11', 'HUM', 'Partnership depth', 'Depth of interdisciplinary collaboration on AI', [
      'No partners', 'Informal individual collaboration only', 'Formal project-based collaboration', 'Long-term institutional partnership with joint funding or appointments',
    ]),
    scale('D12', 'HUM', 'Technical staff', 'Access to dedicated technical personnel (data scientists, AI engineers, statisticians, research software engineers)', [
      'No access', 'Shared across the school, high demand', 'Adequate access for most needs', 'Dedicated technical staff embedded in the department/course',
    ]),
    { id: 'D13', type: 'number', title: 'Technical staff FTE', text: 'Full-time equivalent of technical AI/data staff available to this department/course', unit: 'FTE', min: 0, step: 0.1 },
    scale('D14', 'HUM', 'AI hiring', 'Is recruitment of faculty or staff with AI expertise planned?', [
      'Not planned', 'Discussed, no approved position', 'Position approved or recruitment underway', 'AI expertise already recruited and further positions planned',
    ]),
    scale('D15', 'HUM', 'Faculty openness', 'Overall attitude of faculty in this department/course toward integrating AI', [
      'Mostly resistant', 'Mixed / indifferent', 'Mostly supportive', 'Strongly supportive with active champions',
    ]),
    { id: 'D16', type: 'multi', title: 'Faculty competency barriers', max: 2, text: 'Most significant barriers to faculty AI competency (select up to two)', other: true, options: [
      { v: 'time', l: 'Lack of faculty time' }, { v: 'funding', l: 'Lack of funding for training' },
      { v: 'interest', l: 'Lack of faculty interest' }, { v: 'trainers', l: 'Lack of qualified trainers' },
      { v: 'priorities', l: 'Competing curricular priorities' }, { v: 'recognition', l: 'No recognition in promotion/tenure' },
      { v: 'language', l: 'Training not available in local language' },
    ] },
  ],
}

// ---------------------------------------------------------------------------
// Part E — Curriculum and teaching
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
  title: 'Part E. Curriculum and teaching initiatives',
  intro: 'Refers exclusively to the named course (Part A, item A07). Hours: include lectures, hands-on sessions and assignments; exclude generic literature searching and routine use of clinical software.',
  questions: [
    scale('E01', 'CUR', 'Dedicated AI instruction', 'Does the course include dedicated AI instruction (not a passing mention)?', [
      'None', 'Mentioned in 1–2 lectures only', '1 dedicated module or class session (≤4 hours)', '1 or more dedicated AI courses, or systematic integration across sessions',
    ]),
    { id: 'E02', type: 'hours', title: 'AI hours by format', unit: 'hours per term',
      text: 'Hours of AI-specific instruction a student receives in this course per term, by format (enter 0 if none)',
      rows: [
        { v: 'lecture', l: 'Lectures / seminars' }, { v: 'handson', l: 'Hands-on / computer lab' },
        { v: 'clinical', l: 'Clinical / preclinical use with supervision' }, { v: 'self', l: 'Assignments / guided self-study' },
      ] },
    { id: 'E03', type: 'hours', title: 'AI hours by topic', unit: 'hours per term',
      text: 'Hours per term devoted to each AI topic in this course (enter 0 if not covered; a session may count toward more than one topic)',
      rows: TOPICS },
    { id: 'E04', type: 'single', title: 'Required or elective', text: 'Is the AI content of this course required or elective?', options: [
      { v: 0, l: 'No AI content' }, { v: 1, l: 'Elective / optional' }, { v: 2, l: 'Required for some students / tracks' }, { v: 3, l: 'Required for all students' },
    ] },
    { id: 'E05', type: 'number', title: 'AI credits', text: 'Academic credits awarded for AI content (local credit units; 0 if none)', unit: 'credits', min: 0, step: 0.5 },
    scale('E06', 'CUR', 'Technical depth', 'Which best describes the technical depth of AI instruction?', [
      'Conceptual awareness only', 'Clinical interpretation of AI outputs', 'Hands-on operation of existing AI tools under guidance', 'Includes programming or formal AI development',
    ]),
    scale('E07', 'CUR', 'Programming / AI development', 'Does the course cover programming (Python/R) or formal AI development (model training, validation, bias assessment)?', [
      'None', 'Instructor demonstration only', 'Hands-on exercises under guidance', 'Students independently complete a small AI project (e.g., train and validate a classifier)',
    ]),
    { id: 'E08', type: 'multi', title: 'Development platforms', text: 'Platforms used for programming or model development', other: true, options: [
      { v: 'python', l: 'Python / Jupyter / Colab' }, { v: 'r', l: 'R' }, { v: 'nocode', l: 'No-code tool (Orange, KNIME, Teachable Machine)' },
      { v: 'automl', l: 'Cloud AutoML (Google, Azure, AWS)' }, { v: 'vendor', l: 'Vendor research platform' },
      { v: 'none', l: 'Not applicable', exclusive: true },
    ] },
    { id: 'E09', type: 'number', title: 'Programming hours', text: 'Hours per term devoted to programming or model development', unit: 'hours per term', min: 0 },
    { id: 'E10', type: 'number', title: 'Student AI projects', text: 'Number of student AI projects (coursework, theses, capstones) completed in the past academic year', unit: 'projects', min: 0 },
    { id: 'E11', type: 'repeat', title: 'Undergraduate AI courses', count: 3,
      text: 'Name the undergraduate course(s) in this department that are dedicated to AI or contain a dedicated AI module',
      fields: [
        { id: 'name', type: 'text', l: 'Course code and title' },
        { id: 'hours', type: 'number', l: 'AI hours per term', min: 0 },
        { id: 'status', type: 'single', l: 'Status', options: [{ v: 1, l: 'Elective' }, { v: 2, l: 'Required' }] },
      ] },
    { id: 'E12', type: 'repeat', title: 'Graduate / residency AI courses', count: 3,
      text: 'Name the graduate or residency course(s) in this department that include AI content',
      fields: [
        { id: 'name', type: 'text', l: 'Course code and title' },
        { id: 'hours', type: 'number', l: 'AI hours per term', min: 0 },
        { id: 'status', type: 'single', l: 'Status', options: [{ v: 1, l: 'Elective' }, { v: 2, l: 'Required' }] },
      ] },
    scale('E13', 'CUR', 'Graduate AI offering', 'Graduate-level AI offering in this department', [
      'No graduate AI course', 'Elective only', 'Required course exists', 'Required course plus a formal AI research project requirement',
    ]),
    { id: 'E14', type: 'number', title: 'AI theses (3 y)', text: 'Number of master\'s/doctoral theses or residency projects on AI defended in this department in the past 3 years', unit: 'theses', min: 0 },
    scale('E15', 'CUR', 'Clinical AI training', 'Are students trained in clinical application and critical interpretation of AI outputs (reading AI-assisted reports, identifying AI errors, understanding limitations)?', [
      'None', 'Informal discussion only', '1 dedicated session', 'Integrated into clinical rotations with formal assessment',
    ]),
    scale('E16', 'CUR', 'Assessment of AI competency', 'How is student AI competency assessed?', [
      'Not assessed', 'Written exam only', 'Separate AI assignment or project', 'Competency-based assessment (OSCE station, portfolio, practical demonstration)',
    ]),
    { id: 'E17', type: 'multi', title: 'Teaching methods', text: 'Teaching methods used for AI content', other: true, options: [
      { v: 'lecture', l: 'Lectures' }, { v: 'flipped', l: 'Flipped classroom' }, { v: 'cbl', l: 'Case-based learning' },
      { v: 'pbl', l: 'Problem-based learning' }, { v: 'journal', l: 'Journal club / critical appraisal' },
      { v: 'lab', l: 'Computer lab / coding exercises' }, { v: 'hackathon', l: 'Hackathon / competition' },
      { v: 'clinical', l: 'Supervised clinical use of AI tools' }, { v: 'sim', l: 'Simulation with AI feedback' },
      { v: 'tutor', l: 'AI tutor / chatbot-assisted learning' },
    ] },
    scale('E18', 'CUR', 'Educational materials', 'Dedicated AI educational materials (textbooks, online modules, case libraries)', [
      'None used', 'Scattered resources, not formally organized', 'Some dedicated materials used', 'Comprehensive, curated collection integrated into the course',
    ]),
    { id: 'E19', type: 'repeat', title: 'Materials used', count: 3, text: 'Name the main AI educational materials used',
      fields: [{ id: 'name', type: 'text', l: 'Material (title / URL)' }] },
    scale('E20', 'CUR', 'Competency framework', 'Is AI teaching aligned with a competency framework (e.g., IADR/ITU-WHO core curriculum for dental AI, national curriculum guidelines)?', [
      'No framework', 'Aware of frameworks, not used', 'Partially aligned', 'Explicitly mapped to a framework with defined learning outcomes',
    ], { countryHint: 'accreditation' }),
    scale('E21', 'CUR', 'AI as a teaching tool', 'Is AI used as a tool to deliver teaching (adaptive learning, automated feedback on preparations, AI-generated cases, virtual patients)?', [
      'Not used', 'Experimented by individual faculty', 'Used regularly in some activities', 'Systematically used and evaluated',
    ]),
    { id: 'E22', type: 'number', title: 'CPD AI offerings', text: 'Number of continuing-education (CPD) activities on AI offered by this department in the past 12 months', unit: 'activities', min: 0 },
    scale('E23', 'CUR', 'Student preparedness', 'How prepared and interested in AI are students in this course?', [
      'Low interest and preparedness', 'Interest but low preparedness', 'Interest and moderate preparedness', 'High interest and preparedness',
    ]),
    scale('E24', 'CUR', 'Planned curriculum change', 'Is an increase of AI content planned for the next 2 years?', [
      'No plans', 'Under informal discussion', 'Approved, not yet implemented', 'Being implemented now',
    ]),
  ],
}

// ---------------------------------------------------------------------------
// Part F — Generative AI (based on PAHO "AI prompt design for public health" and AI-GUARD Tier 1)
// ---------------------------------------------------------------------------
const partF = {
  id: 'F', filledBy: 'respondent',
  title: 'Part F. Generative AI in teaching and learning',
  intro: 'Generative AI includes chatbots and large language models such as ChatGPT, Gemini, Copilot, DeepSeek, Qwen or Ernie Bot.',
  questions: [
    scale('F01', 'GEN', 'Generative AI policy', 'Which policy governs student and faculty use of generative AI in this department/course?', [
      'No policy', 'General academic-integrity policy only, not AI-specific', 'Interim guidance issued', 'Formal, regularly updated policy with training',
    ]),
    { id: 'F02', type: 'text', title: 'Policy name', text: 'Name of the policy document (and level: university / school / department / course)' },
    { id: 'F03', type: 'multi', title: 'Permitted student uses', text: 'Which student uses of generative AI are permitted in this course?', other: true, options: [
      { v: 'study', l: 'Studying / explanations' }, { v: 'writing', l: 'Writing support with disclosure' },
      { v: 'cases', l: 'Practising clinical cases' }, { v: 'coding', l: 'Coding assistance' },
      { v: 'research', l: 'Literature search / research support' }, { v: 'assessment', l: 'Use during assessments' },
      { v: 'prohibited', l: 'All use is prohibited', exclusive: true }, { v: 'undefined', l: 'Not defined', exclusive: true },
    ] },
    scale('F04', 'GEN', 'Prompt design teaching', 'Are students taught how to design effective prompts (context, task, format, audience, constraints)?', [
      'Not taught', 'Mentioned informally', '1 dedicated session', 'Integrated practice with feedback',
    ]),
    scale('F05', 'GEN', 'Verification of outputs', 'Are students taught to verify generative-AI outputs (hallucinations, fabricated references, outdated guidance)?', [
      'Not taught', 'Mentioned informally', '1 dedicated session', 'Integrated practice with assessment',
    ]),
    { id: 'F06', type: 'grid', title: 'Generative AI safeguards', options: YPN,
      text: 'Which safeguards are in place for generative AI use in this department/course? (adapted from PAHO AI-GUARD, Tier 1)',
      rows: [
        { v: 'no_patient_data', l: 'Rule that no identifiable patient data is entered into public AI tools' },
        { v: 'secure_tool', l: 'An institutionally licensed, privacy-protected generative AI tool is available' },
        { v: 'disclosure', l: 'Students must disclose AI use in assignments' },
        { v: 'human_review', l: 'Human verification required before AI output is used in patient care' },
        { v: 'incident', l: 'Process to report misuse or AI errors' },
        { v: 'training', l: 'Staff and students trained on limitations and bias of generative AI' },
      ] },
    { id: 'F07', type: 'single', title: 'Faculty GenAI use', text: 'How often do faculty use generative AI to prepare teaching materials or assessments?', options: [
      { v: 1, l: 'Never' }, { v: 2, l: 'Occasionally' }, { v: 3, l: 'Monthly' }, { v: 4, l: 'Weekly or more' }, { v: -1, l: 'Don\'t know' },
    ] },
    { id: 'F08', type: 'single', title: 'AI-detection software', text: 'Is AI-text detection software used to assess student work?', options: [
      { v: 1, l: 'Yes, routinely' }, { v: 2, l: 'Yes, occasionally' }, { v: 0, l: 'No' }, { v: -1, l: 'Don\'t know' },
    ] },
  ],
}

// ---------------------------------------------------------------------------
// Part G — Governance, ethics, bias and regulation
// ---------------------------------------------------------------------------
const partG = {
  id: 'G', filledBy: 'respondent',
  title: 'Part G. Governance, ethics, bias and regulation',
  intro: 'Items G01–G07 refer to the named department/course; G08–G12 refer to the policies and procedures that govern it.',
  questions: [
    scale('G01', 'GOV', 'Written AI plan', 'Does this department/course have a written plan or formal strategic direction for AI integration in teaching?', [
      'None', 'Informal consensus, not documented', 'Draft document under discussion', 'Formal strategic plan, regularly reviewed',
    ]),
    scale('G02', 'GOV', 'Leadership commitment', 'How committed is the leadership of this department (head, division chief) to advancing AI initiatives?', [
      'No commitment shown', 'Initial interest, no concrete actions', 'Some commitment, inconsistent or limited in scope', 'Strong commitment with ongoing initiatives and resources',
    ]),
    scale('G03', 'GOV', 'Oversight structure', 'Is there an AI committee or a named person accountable for AI in teaching and clinics?', [
      'None', 'Informal responsibility', 'Committee or person named, limited mandate', 'Formal committee with mandate, reporting line and regular meetings',
    ]),
    scale('G04', 'GOV', 'AI ethics teaching', 'Does this course teach AI ethics (bias, privacy, informed consent, accountability, equity)?', [
      'None', 'Brief mention only', '1 dedicated session', 'Systematic integration with case-based discussion and assessment',
    ]),
    { id: 'G05', type: 'multi', title: 'Ethics topics', text: 'Which AI ethics topics are covered?', options: [
      { v: 'bias', l: 'Algorithmic bias and equity' }, { v: 'privacy', l: 'Privacy and data protection' },
      { v: 'consent', l: 'Informed consent for AI use with patients' }, { v: 'accountability', l: 'Professional accountability / liability' },
      { v: 'transparency', l: 'Transparency and explainability' }, { v: 'automation', l: 'Automation bias / over-reliance' },
      { v: 'ip', l: 'Intellectual property and authorship' }, { v: 'environment', l: 'Environmental impact of AI' },
      { v: 'integrity', l: 'Academic integrity' }, { v: 'none', l: 'None', exclusive: true },
    ] },
    scale('G06', 'GOV', 'Bias teaching', 'Are students taught to check AI performance across patient subgroups and to recognize biased training data (PAHO Bias-free AI)?', [
      'Not taught', 'Mentioned informally', '1 dedicated session', 'Hands-on exercises with real or simulated subgroup analyses',
    ]),
    scale('G07', 'GOV', 'Ethical guidelines available', 'Are established ethical guidelines or white papers on AI in dental education or practice available to faculty and students?', [
      'None available', 'Some documents exist but are incomplete', 'Guidelines exist but need dissemination', 'Comprehensive, well-implemented guidelines available',
    ]),
    { id: 'G08', type: 'multi', title: 'Guidance documents used', text: 'Which of the following documents are used in teaching or clinical protocols of this department/course?', options: GUIDANCE_DOCS, countryFiltered: true },
    scale('G09', 'GOV', 'Regulatory guidance incorporated', 'Is national / professional regulatory guidance on AI in dentistry incorporated into teaching and clinical protocols?', [
      'Not incorporated', 'Aware but not incorporated', 'Discussed in faculty meetings', 'Incorporated into teaching and clinical protocols',
    ], { countryHint: 'professional' }),
    scale('G10', 'GOV', 'Patient consent for AI', 'Are patients informed / asked for consent when AI is used in their care in the school clinic?', [
      'Never', 'Occasionally, at clinician discretion', 'Required by policy but inconsistently applied', 'Required by policy, documented in the record',
    ]),
    { id: 'G11', type: 'grid', title: 'AI tool governance (AI-GUARD)', options: YPN,
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
      ] },
    scale('G12', 'GOV', 'Stakeholder involvement', 'How involved are stakeholders (faculty, students, clinical staff, IT, patients, external partners) in decisions about AI integration?', [
      'Not involved', 'Limited, non-systematic involvement', 'Involvement exists but inconsistent', 'Well-established processes for systematic stakeholder input',
    ]),
  ],
}

// ---------------------------------------------------------------------------
// Part H — Implementation, monitoring, evaluation and sustainability
// ---------------------------------------------------------------------------
const partH = {
  id: 'H', filledBy: 'respondent',
  title: 'Part H. Implementation, monitoring, evaluation and sustainability',
  intro: 'Refers to AI initiatives of the named department/course.',
  questions: [
    { id: 'H01', type: 'repeat', title: 'Pilot projects', count: 3, text: 'Name any AI pilot project currently running in this department/course',
      fields: [
        { id: 'name', type: 'text', l: 'Project' },
        { id: 'area', type: 'single', l: 'Area', options: [
          { v: 1, l: 'Teaching / learning' }, { v: 2, l: 'Assessment' }, { v: 3, l: 'Clinical care' },
          { v: 4, l: 'Research' }, { v: 5, l: 'Administration' },
        ] },
      ] },
    scale('H02', 'IMP', 'Pilot maturity', 'Status of AI pilot projects', [
      'No pilot projects', 'Initial pilots with limited outcomes', 'Pilots ongoing, outcomes not yet assessed', 'Pilots with positive, documented outcomes',
    ]),
    scale('H03', 'IMP', 'Scalability', 'Potential for scaling successful AI initiatives to other courses', [
      'No potential', 'Limited potential; substantial effort required', 'Some potential, requires significant resources and coordination', 'High potential with a clear pathway',
    ]),
    scale('H04', 'IMP', 'Workflow integration', 'How well are AI tools integrated into the clinical and teaching workflows of this department?', [
      'Not integrated', 'Used outside routine workflow', 'Partly integrated', 'Fully integrated in routine workflow',
    ]),
    scale('H05', 'IMP', 'Performance metrics', 'Are there established metrics for monitoring the performance or impact of AI teaching initiatives?', [
      'No metrics', 'Limited metrics', 'Metrics exist but need refinement', 'Comprehensive metrics with regular review',
    ]),
    scale('H06', 'IMP', 'Evaluation framework', 'Is the impact of AI teaching evaluated with a framework (e.g., Kirkpatrick levels: reaction, learning, behaviour, results)?', [
      'Not evaluated', 'Student satisfaction only', 'Learning outcomes measured', 'Learning and clinical/behavioural outcomes measured',
    ]),
    scale('H07', 'IMP', 'Feedback mechanisms', 'Are there mechanisms to collect and act on feedback from students and faculty about AI initiatives?', [
      'None', 'Informal feedback only', 'Formal collection, inconsistent follow-up', 'Formal collection with documented actions',
    ]),
    scale('H08', 'IMP', 'Continuous improvement', 'Are there mechanisms for continuous improvement based on evaluation of AI initiatives?', [
      'No mechanisms', 'Limited mechanisms', 'Mechanisms exist but need better integration', 'Comprehensive feedback loops',
    ]),
    scale('H09', 'IMP', 'Cost-benefit evaluation', 'Has the cost and benefit of AI tools/initiatives been evaluated (licences, hardware, staff time vs. outcomes)?', [
      'Never', 'Informal estimate', 'Formal evaluation for some initiatives', 'Formal evaluation for all major initiatives',
    ]),
    scale('H10', 'IMP', 'Financial sustainability', 'Are there plans for long-term financial sustainability of AI initiatives (budget lines, grant strategies, partnerships)?', [
      'No plans', 'Initial discussions only', 'Plans exist but incomplete', 'Comprehensive, well-developed plans',
    ]),
    { id: 'H11', type: 'repeat', title: 'Funding sources', count: 3, text: 'Name each funding source that supports AI teaching or research in this department/course',
      fields: [
        { id: 'name', type: 'text', l: 'Funding source' },
        { id: 'type', type: 'single', l: 'Type', options: [
          { v: 1, l: 'Institutional budget' }, { v: 2, l: 'National research agency (e.g., NIH, CIHR, CNPq/CAPES/FAPs, NSFC, ICMR/DST)' },
          { v: 3, l: 'Industry' }, { v: 4, l: 'Philanthropy / foundation' }, { v: 5, l: 'International agency' }, { v: 6, l: 'Other' },
        ] },
      ] },
    scale('H12', 'IMP', 'Funding adequacy', 'Funding available for AI teaching or research in this department/course', [
      'No funding', 'Limited funding with significant gaps', 'Funding available but inconsistent or insufficient', 'Sufficient, reliable funding',
    ]),
    { id: 'H13', type: 'single', title: 'Annual AI budget', text: 'Approximate annual budget dedicated to AI in this department/course (USD equivalent)', options: [
      { v: 0, l: 'None' }, { v: 1, l: 'Less than 5,000' }, { v: 2, l: '5,000 – 25,000' }, { v: 3, l: '25,001 – 100,000' },
      { v: 4, l: 'More than 100,000' }, { v: -1, l: 'Don\'t know' },
    ] },
    { id: 'H14', type: 'number', title: 'AI grants (3 y)', text: 'Number of competitive AI-related grants obtained by this department in the past 3 years', unit: 'grants', min: 0 },
  ],
}

// ---------------------------------------------------------------------------
// Part I — Self-assessment and open response
// ---------------------------------------------------------------------------
const partI = {
  id: 'I', filledBy: 'respondent',
  title: 'Part I. Self-assessment and open response',
  intro: '',
  questions: [
    scale('I01', null, 'Overall maturity', 'Rate the overall AI integration maturity of this department/course', [
      'Exploring: no formal action; individual interest only',
      'Planning: discussions underway, some resources identified, no systematic implementation',
      'Implementing: some formal courses/projects launched, not scaled or sustainable',
      'Mature: systematic curriculum integration, dedicated resources, continuous evaluation',
    ]),
    { id: 'I02', type: 'multi', title: 'Primary barriers', max: 3, text: 'Primary barriers to AI integration in this department/course (select up to three)', other: true, options: [
      { v: 'funding', l: 'Lack of funding' }, { v: 'expertise', l: 'Lack of faculty expertise' },
      { v: 'time', l: 'Lack of time in the curriculum' }, { v: 'leadership', l: 'Lack of leadership support' },
      { v: 'tools', l: 'Lack of clinical AI tools / infrastructure' }, { v: 'ethics_legal', l: 'Ethical / legal uncertainty' },
      { v: 'students', l: 'Lack of student interest or preparedness' }, { v: 'data', l: 'Lack of data access' },
      { v: 'accreditation', l: 'Accreditation / curriculum rules leave no room' }, { v: 'language', l: 'Language barriers (tools/materials not in local language)' },
    ] },
    { id: 'I03', type: 'multi', title: 'Facilitators', max: 3, text: 'Main facilitators of AI integration (select up to three)', other: true, options: [
      { v: 'champions', l: 'Faculty champions' }, { v: 'leadership', l: 'Leadership support' }, { v: 'funding', l: 'Dedicated funding' },
      { v: 'partners', l: 'Interdisciplinary partners' }, { v: 'industry', l: 'Industry partnerships' },
      { v: 'students', l: 'Student demand' }, { v: 'accreditation', l: 'Accreditation / national guidelines' },
      { v: 'network', l: 'National or international networks' },
    ] },
    { id: 'I04', type: 'textarea', title: 'Most important need', text: 'What is the single most important resource or policy support this department/course needs to advance AI integration in the next 2 years?' },
    { id: 'I05', type: 'textarea', title: 'Innovative practice', text: 'Describe any innovative AI-related teaching practice implemented in this department/course (optional)' },
    { id: 'I06', type: 'textarea', title: 'Vision 2030', text: 'How do you expect AI to change teaching in this department/course by 2030? (optional)' },
    scale('I07', null, 'Confidence in answers', 'How confident are you in the accuracy of your answers?', [
      'Low', 'Moderate', 'High', 'Very high (checked with records)',
    ], { noDK: true }),
    { id: 'I08', type: 'single', title: 'Follow-up interview', text: 'Would you agree to a short follow-up interview?', options: YES_NO },
  ],
}

export const SECTIONS = [partA, partB, partC, partD, partE, partF, partG, partH, partI]

export const DOMAINS = {
  INF: 'Physical infrastructure and technology',
  DAT: 'Data management, quality and privacy',
  HUM: 'Human resources and expertise',
  CUR: 'Curriculum and teaching',
  GEN: 'Generative AI governance and literacy',
  GOV: 'Governance, ethics and regulation',
  IMP: 'Implementation, evaluation and sustainability',
}

export const ALL_QUESTIONS = SECTIONS.flatMap((s) => s.questions.map((q) => ({ ...q, section: s.id })))
export const questionById = Object.fromEntries(ALL_QUESTIONS.map((q) => [q.id, q]))
