// Teacher slides: the main idea of the survey and the goal of each group of questions.
// Output: public/downloads/ICARB-D-Survey-Teacher-Slides.pptx (the PDF is made by `npm run slides`).
import fs from 'node:fs'
import pptxgen from 'pptxgenjs'
import { SECTIONS, MAIN_QUESTION, UNITS, VERSION } from '../src/questionnaire/questionnaire.js'
import { CHECKLIST_COUNT, LEVELS } from '../src/questionnaire/checklist.js'
import { PAHO_BOOKS } from '../src/questionnaire/inspiration.js'

const OUT_DIR = 'public/downloads'
const OUT = `${OUT_DIR}/ICARB-D-Survey-Teacher-Slides.pptx`
const GUIDE = 'igoralves1.github.io/AI-assessment-DS-2026/#/questions'

// Palette (matches the survey website)
const DEEP = '0B3B40'
const TEAL = '0F5C63'
const SOFT = 'E3F0F0'
const AMBER = 'C77D00'
const INK = '1C2321'
const MUTED = '5D6865'
const LINE = 'DDE2DF'
const WHITE = 'FFFFFF'
const HEAD = 'Cambria'
const BODY = 'Calibri'

// Short, slide-sized description of each group (the goal itself comes from the questionnaire).
const ASKS = {
  A: ['Country, state and school', 'The unit: whole school, one department or one course', 'Training level and the respondent\'s role', 'Survey year, consent and last year\'s code'],
  B: ['Students and faculty (headcount and full-time equivalent)', 'Academic calendar and terms per year', 'Course hours and the technology fields the unit touches'],
  C: ['Computers, GPUs, cloud access and dedicated spaces', 'Software and the AI tools students actually use', 'Datasets, data quality and representativeness', 'Privacy, security, connectivity and IT support'],
  D: ['Faculty able to teach AI, and faculty doing AI research', 'Training received and planned', 'Partners and technical staff', 'Openness to change and the main barriers'],
  E: ['Hours per year, by teaching format and by 16 topics', 'Programming and formal AI model development', 'Named predoctoral and graduate courses', 'Assessment, materials and planned changes'],
  F: ['Policy and permitted uses for students and faculty', 'Prompt design and checking AI outputs', 'Safeguards in place (adapted from PAHO AI-GUARD)'],
  G: ['Electronic records and imaging archives', 'Coding, teledentistry and analytics', 'Access to clinical data for research', 'Teaching hours and informatics staff'],
  H: ['Number of robots, simulators, scanners, CBCT, milling units and 3D printers', 'How students get hands-on access', 'Digital workflow, maintenance and trained faculty', 'Teaching hours and research'],
  I: ['Laboratories, sequencing, biobanks and computing', 'Pipelines and people with bioinformatics skills', 'Teaching hours and research areas', 'How data are shared (FAIR principles)'],
  J: ['Written plan, leadership and oversight', 'Ethics and bias teaching', 'Standards and guidance in use (ADA, CODA, HIPAA, FDA, NIST)', 'Patient consent and a governance checklist for AI tools'],
  K: ['Pilot projects and whether they scale', 'Metrics, evaluation and feedback', 'Cost-benefit and sustainability', 'Funding sources, budget and grants'],
  L: ['Interest in multi-institution AI projects', 'De-identified data that could be shared', 'Preferred ways to collaborate', 'What stands in the way'],
  M: ['Overall maturity in each of the four fields', 'Main barriers and facilitators', 'The single most urgent need', 'Innovative practice and the vision for 2030'],
}
const SHORT = {
  A: 'Profile of the unit', B: 'Context', C: 'Physical resources', D: 'Human resources', E: 'AI curriculum', F: 'Generative AI',
  G: 'Health informatics', H: 'Robotics and digital dentistry', I: 'Bioinformatics and omics', J: 'Governance and ethics',
  K: 'Implementation and sustainability', L: 'Collaboration', M: 'Self-assessment',
}
const FAMILY = [
  { name: 'Who and what', parts: ['A', 'B'], color: '6B7F86' },
  { name: 'Resources', parts: ['C', 'D'], color: TEAL },
  { name: 'Teaching', parts: ['E', 'F'], color: '2D6A3E' },
  { name: 'The four fields', parts: ['G', 'H', 'I'], color: '3A5BA0' },
  { name: 'Rules and lasting change', parts: ['J', 'K', 'L'], color: '8A4B2A' },
  { name: 'Self-view', parts: ['M'], color: AMBER },
]
const familyOf = (id) => FAMILY.find((f) => f.parts.includes(id))

const pres = new pptxgen()
pres.layout = 'LAYOUT_WIDE' // 13.33 x 7.5 in
pres.title = 'ICARB-D Annual Survey: guide for teachers'
pres.subject = 'Main idea of the survey and the goal of each group of questions'
pres.author = 'ICARB-D survey team'
pres.theme = { headFontFace: HEAD, bodyFontFace: BODY }

const W = 13.333
const M = 0.6

// Layouts
pres.defineSlideMaster({
  title: 'DARK',
  background: { color: DEEP },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 2.1, w: 8.6, h: 1.9, fontFace: HEAD, fontSize: 44, bold: true, color: WHITE, valign: 'bottom', align: 'left', margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: M, y: 4.2, w: 8.6, h: 1.4, fontFace: BODY, fontSize: 20, color: 'BFE3E5', valign: 'top', align: 'left', margin: 0 }, text: '' } },
  ],
})
pres.defineSlideMaster({
  title: 'CONTENT',
  background: { color: WHITE },
  margin: [0.5, 0.6, 0.6, 0.6],
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.45, w: W - 2 * M, h: 0.9, fontFace: HEAD, fontSize: 36, bold: true, color: INK, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    { text: { text: 'ICARB-D Annual Survey of Dental Schools · guide for teachers', options: { x: M, y: 7.0, w: 8, h: 0.3, fontFace: BODY, fontSize: 10, color: MUTED, margin: 0 } } },
  ],
  slideNumber: { x: W - M - 0.6, y: 7.0, w: 0.6, h: 0.3, fontFace: BODY, fontSize: 10, color: MUTED, align: 'right' },
})

const T = (slide, text, o) => slide.addText(text, { isTextBox: true, fontFace: BODY, color: INK, margin: 0, valign: 'top', ...o })
const circle = (slide, x, y, d, fill, letter, size) => {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill } })
  T(slide, letter, { x, y, w: d, h: d, fontFace: HEAD, fontSize: size, bold: true, color: WHITE, align: 'center', valign: 'middle' })
}
const card = (slide, x, y, w, h, fill = SOFT) =>
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { color: fill } })
const bullets = (items, size = 18, color = INK) =>
  items.map((t, i) => ({ text: t, options: { bullet: { indent: 18 }, breakLine: i < items.length - 1, paraSpaceAfter: 8, fontSize: size, color } }))

// ---------------------------------------------------------------- 1. Title
pres.addSection({ title: 'The main idea' })
{
  const s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'The main idea' })
  T(s, 'ICARB-D ANNUAL SURVEY OF DENTAL SCHOOLS', { x: M, y: 1.4, w: 8, h: 0.4, fontSize: 14, bold: true, color: 'BFE3E5', charSpacing: 2 })
  s.addText('Mapping the digital maturity of dental schools', { placeholder: 'title' })
  s.addText('Artificial intelligence · Health informatics · Robotics · Bioinformatics\nA guide for teachers', { placeholder: 'body' })
  // motif: four circles for the four fields
  const fields = [['AI', TEAL], ['HI', '3A5BA0'], ['RO', '2D6A3E'], ['BI', AMBER]]
  fields.forEach(([l, c], i) => circle(s, 9.9 + (i % 2) * 1.45, 2.2 + Math.floor(i / 2) * 1.45, 1.25, c, l, 26))
  T(s, `Questionnaire version ${VERSION}`, { x: M, y: 6.7, w: 6, h: 0.3, fontSize: 11, color: '8FBFC2' })
  s.addNotes('This deck explains, in about 15 minutes, what the survey is for, why it matters now, and what each group of questions is meant to achieve. It ends with how a school can use the survey as a checklist.')
}

// ---------------------------------------------------------------- 2. Main question
{
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'The main idea' })
  s.addText('The question the survey answers', { placeholder: 'title' })
  card(s, M, 1.5, W - 2 * M, 1.75, DEEP)
  T(s, MAIN_QUESTION, { x: M + 0.35, y: 1.62, w: W - 2 * M - 0.7, h: 1.5, fontFace: HEAD, fontSize: 21, color: WHITE, valign: 'middle' })
  T(s, 'A form can describe one of three units, and the person closest to it answers:', { x: M, y: 3.55, w: W - 2 * M, h: 0.4, fontSize: 16, color: MUTED })
  const cw = (W - 2 * M - 0.6) / 3
  UNITS.forEach((u, i) => {
    const x = M + i * (cw + 0.3)
    card(s, x, 4.1, cw, 2.5)
    circle(s, x + 0.3, 4.35, 0.75, TEAL, String(i + 1), 22)
    T(s, u.l, { x: x + 1.2, y: 4.35, w: cw - 1.4, h: 0.75, fontSize: 18, bold: true, valign: 'middle' })
    T(s, 'Who answers', { x: x + 0.3, y: 5.3, w: cw - 0.6, h: 0.3, fontSize: 12, bold: true, color: TEAL })
    T(s, u.who, { x: x + 0.3, y: 5.6, w: cw - 0.6, h: 0.9, fontSize: 15 })
  })
  s.addNotes('The survey gives the reader a complete, clear picture of how mature a school, a department or a course is in four fields. Results combine into a ranking of schools and can be compared with schools in other countries.')
}

// ---------------------------------------------------------------- 3. Why now + origin
{
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'The main idea' })
  s.addText('Why map maturity now', { placeholder: 'title' })
  const why = [
    ['AI has reached the clinic', 'AI reads radiographs, digital workflows replace analogue ones, and students use generative AI every day.'],
    ['Schools move at different speeds', 'Investment, training and rules vary widely, and no shared measure says who is ready or where the gaps are.'],
    ['Evidence to plan', 'A common, yearly measure lets deans and faculty plan, learn from the best prepared, and see progress.'],
  ]
  const cw = (W - 2 * M - 0.6) / 3
  why.forEach(([h, b], i) => {
    const x = M + i * (cw + 0.3)
    card(s, x, 1.7, cw, 4.6)
    circle(s, x + 0.35, 2.0, 0.85, i === 2 ? AMBER : TEAL, String(i + 1), 26)
    T(s, h, { x: x + 0.35, y: 3.1, w: cw - 0.7, h: 0.9, fontFace: HEAD, fontSize: 22, bold: true, color: TEAL })
    T(s, b, { x: x + 0.35, y: 4.05, w: cw - 0.7, h: 2.0, fontSize: 18 })
  })
  s.addNotes('Stress that the survey is not a test of individual teachers. It is a shared measure that helps schools plan, and it is repeated every year.')
}

const SHORT_TITLE = {
  'readiness-toolkit': ['AI in Public Health:', 'Readiness Toolkit'],
  'ai-guard': ['AI-GUARD Tool'],
  'bias-free-ai': ['Bias-free AI in Health'],
  'prompt-design': ['AI Prompt Design', 'for Public Health'],
}
const ROLE = {
  'readiness-toolkit': 'Main inspiration: the dimensions, the maturity scale and the analysis steps',
  'ai-guard': 'Governance checklist for AI tools (items F06 and J11)',
  'bias-free-ai': 'Data representativeness and bias teaching (items C15 and J06)',
  'prompt-design': 'Prompt design and checking AI outputs (items F04–F05)',
}
{
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'The main idea' })
  s.addText('Inspired by four PAHO publications', { placeholder: 'title' })
  T(s, 'The Pan American Health Organization built a questionnaire to measure how ready public health institutions are to use AI. This survey adapts it to dental schools. Click a cover to open it on PAHO\'s website.',
    { x: M, y: 1.25, w: W - 2 * M, h: 0.65, fontSize: 15, color: MUTED })
  const cw = (W - 2 * M - 0.9) / 4
  const iw = 1.9
  const ih = iw * 936 / 662
  PAHO_BOOKS.forEach((b, i) => {
    const x = M + i * (cw + 0.3)
    s.addImage({ path: `public/covers/${b.key}.jpg`, x: x + (cw - iw) / 2, y: 2.0, w: iw, h: ih, altText: `Cover of ${b.title}`, hyperlink: { url: b.url, tooltip: b.title } })
    T(s, SHORT_TITLE[b.key].map((t, k, a) => ({ text: t, options: { hyperlink: { url: b.url }, color: TEAL, bold: true, breakLine: k < a.length - 1 } })), { x, y: 4.75, w: cw, h: 0.75, fontSize: 15, align: 'center', valign: 'middle' })
    T(s, `${b.publisher} · ${b.year}`, { x, y: 5.5, w: cw, h: 0.3, fontSize: 12, color: MUTED, align: 'center' })
    T(s, ROLE[b.key], { x: x + 0.1, y: 5.85, w: cw - 0.2, h: 0.9, fontSize: 13, align: 'center' })
  })
  s.addNotes('Links: ' + PAHO_BOOKS.map((b) => `${b.title} (${b.publisher}, ${b.year}): ${b.url}`).join(' | ') + '. Cover images belong to PAHO and are shown only to identify the publications.')
}

// ---------------------------------------------------------------- 4. Overview of the 13 groups
pres.addSection({ title: 'The groups of questions' })
{
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'The groups of questions' })
  s.addText('Thirteen groups of questions', { placeholder: 'title' })
  T(s, `${SECTIONS.reduce((n, x) => n + x.questions.length, 0)} questions in 13 parts. Part A is completed with the research team; parts B to M by the respondent, in about 45–60 minutes.`,
    { x: M, y: 1.3, w: W - 2 * M, h: 0.4, fontSize: 15, color: MUTED })
  // legend of the six families
  let lx = M
  FAMILY.forEach((f) => {
    circle(s, lx, 1.9, 0.28, f.color, '', 8)
    T(s, f.name, { x: lx + 0.36, y: 1.88, w: 2.2, h: 0.32, fontSize: 13, bold: true, color: f.color, valign: 'middle' })
    lx += 0.36 + f.name.length * 0.085 + 0.35
  })
  const cols = 4
  const cw = (W - 2 * M - 0.25 * (cols - 1)) / cols
  SECTIONS.forEach((sec, k) => {
    const f = familyOf(sec.id)
    const x = M + (k % cols) * (cw + 0.25)
    const y = 2.45 + Math.floor(k / cols) * 1.12
    card(s, x, y, cw, 0.95)
    circle(s, x + 0.15, y + 0.15, 0.65, f.color, sec.id, 20)
    T(s, SHORT[sec.id], { x: x + 0.95, y: y + 0.05, w: cw - 1.1, h: 0.85, fontSize: 15, bold: true, valign: 'middle' })
  })
  s.addNotes('The next slides take one group at a time: the goal we want to achieve with it, and what its questions cover.')
}

// ---------------------------------------------------------------- 5–17. One slide per group
for (const sec of SECTIONS) {
  const fam = familyOf(sec.id)
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'The groups of questions' })
  s.addText(`Part ${sec.id} · ${SHORT[sec.id]}`, { placeholder: 'title' })
  // left: badge + facts
  circle(s, M, 1.6, 1.9, fam.color, sec.id, 60)
  T(s, `${sec.questions.length}`, { x: M, y: 3.75, w: 1.9, h: 0.6, fontFace: HEAD, fontSize: 32, bold: true, color: fam.color, align: 'center' })
  T(s, 'questions', { x: M, y: 4.3, w: 1.9, h: 0.3, fontSize: 13, color: MUTED, align: 'center' })
  T(s, sec.filledBy === 'team' ? 'Completed with the research team' : 'Answered by the respondent', { x: M - 0.1, y: 4.8, w: 2.1, h: 0.7, fontSize: 13, color: MUTED, align: 'center' })
  T(s, fam.name, { x: M - 0.1, y: 5.6, w: 2.1, h: 0.4, fontSize: 13, bold: true, color: fam.color, align: 'center' })
  // right: goal callout + what we ask
  const x = M + 2.5
  const w = W - x - M
  card(s, x, 1.55, w, 1.75)
  T(s, 'GOAL', { x: x + 0.35, y: 1.72, w: 2, h: 0.3, fontSize: 12, bold: true, color: fam.color, charSpacing: 2 })
  T(s, sec.goal, { x: x + 0.35, y: 2.02, w: w - 0.7, h: 1.15, fontFace: HEAD, fontSize: 22, color: INK })
  T(s, 'What the questions cover', { x, y: 3.6, w, h: 0.4, fontSize: 16, bold: true, color: MUTED })
  s.addText(bullets(ASKS[sec.id], 20), { isTextBox: true, x, y: 4.05, w, h: 2.7, fontFace: BODY, margin: 0, valign: 'top' })
  s.addNotes(`${sec.title}. Goal: ${sec.goal} What this part captures: ${sec.purpose}`)
}

// ---------------------------------------------------------------- 18. Maturity scale
pres.addSection({ title: 'Using the results' })
{
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Using the results' })
  s.addText('One scale for every field', { placeholder: 'title' })
  T(s, 'Most items are rated from 1 to 4. "Don\'t know" is allowed and never counted as zero. Each field gets a 0–100 index, and the indices combine into the school ranking.',
    { x: M, y: 1.35, w: W - 2 * M, h: 0.7, fontSize: 16, color: MUTED })
  const shades = ['C9DEDF', '8FBFC2', '3E8C92', TEAL]
  const cw = (W - 2 * M - 0.9) / 4
  LEVELS.forEach((l, i) => {
    const x = M + i * (cw + 0.3)
    const h = 1.6 + i * 0.75
    const y = 6.55 - h
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h, rectRadius: 0.12, fill: { color: shades[i] }, line: { color: shades[i] } })
    const dark = i >= 2
    T(s, String(l.v), { x: x + 0.3, y: y + 0.2, w: 1, h: 0.7, fontFace: HEAD, fontSize: 36, bold: true, color: dark ? WHITE : DEEP })
    T(s, l.l, { x: x + 0.3, y: y + 0.9, w: cw - 0.6, h: 0.4, fontSize: 18, bold: true, color: dark ? WHITE : DEEP })
    T(s, l.d, { x: x + 0.3, y: y + 1.3, w: cw - 0.6, h: 0.6, fontSize: 14, color: dark ? WHITE : INK })
  })
  s.addNotes('Level 4 describes what "established" looks like for each item. That is what turns the survey into a checklist.')
}

// ---------------------------------------------------------------- 19. Checklist
{
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Using the results' })
  s.addText('After the survey: a checklist for improvement', { placeholder: 'title' })
  T(s, `The same items become ${CHECKLIST_COUNT} checkpoints. For each one, the target is level 4 and the next step is level 3.`,
    { x: M, y: 1.35, w: W - 2 * M, h: 0.5, fontSize: 16, color: MUTED })
  const steps = [
    ['Answer', 'Complete the survey for the school, a department or a course.'],
    ['See where you stand', 'Read the 0–100 index for each field and the detail behind it.'],
    ['Choose a target', 'Decide the level you want to reach, field by field.'],
    ['Tick the checklist', 'Mark what is already true; the rest are your next steps.'],
    ['Measure again', 'Answer next year and see the progress.'],
  ]
  const cw = (W - 2 * M - 0.25 * 4) / 5
  steps.forEach(([h, b], i) => {
    const x = M + i * (cw + 0.25)
    card(s, x, 2.15, cw, 3.3)
    circle(s, x + (cw - 0.9) / 2, 2.4, 0.9, i === 3 ? AMBER : TEAL, String(i + 1), 26)
    T(s, h, { x: x + 0.2, y: 3.45, w: cw - 0.4, h: 0.7, fontSize: 17, bold: true, align: 'center', valign: 'middle' })
    T(s, b, { x: x + 0.2, y: 4.15, w: cw - 0.4, h: 1.2, fontSize: 14, align: 'center' })
  })
  card(s, M, 5.75, W - 2 * M, 0.85, 'F4F6F5')
  T(s, `The full checklist is online at ${GUIDE}?go=checklist and in chapter 4 of the questionnaire (PDF).`,
    { x: M + 0.3, y: 5.75, w: W - 2 * M - 0.6, h: 0.85, fontSize: 15, valign: 'middle' })
  s.addNotes('Encourage schools to use the checklist in curriculum or strategy meetings, and to set a realistic target level for each field.')
}

// ---------------------------------------------------------------- 20. Closing
{
  const s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'Using the results' })
  s.addText('A clear picture, every year', { placeholder: 'title' })
  s.addText(`Every question, what it captures and how it is scored:\n${GUIDE}`, { placeholder: 'body' })
  const fields = [['AI', TEAL], ['HI', '3A5BA0'], ['RO', '2D6A3E'], ['BI', AMBER]]
  fields.forEach(([l, c], i) => circle(s, 9.9 + (i % 2) * 1.45, 2.2 + Math.floor(i / 2) * 1.45, 1.25, c, l, 26))
  s.addNotes('Respondents receive a personal access code from the research team. Questions about the survey go to the team member who sent the invitation.')
}

fs.mkdirSync(OUT_DIR, { recursive: true })
await pres.writeFile({ fileName: OUT })
console.log('Wrote', OUT)
