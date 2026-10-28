// Builds docs/ICARB-D-Annual-Survey-Dental-Schools.docx from the questionnaire definition.
// PDF: npm run docs (converts with LibreOffice).
import fs from 'node:fs'
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, LevelFormat, PageBreak, Footer, PageNumber, BorderStyle, TableOfContents,
} from 'docx'
import { SECTIONS, DOMAINS, VERSION, DK } from '../src/questionnaire/questionnaire.js'
import { COUNTRIES, COUNTRY_CONTEXT } from '../src/questionnaire/countries.js'
import { QUESTION_COLUMNS } from '../src/questionnaire/columns.js'
import { STUDY, REFERENCES } from './study-text.mjs'

const ACCENT = '0F5C63'
const PAGE_W = 12240, MARGIN = 1080, CONTENT_W = PAGE_W - 2 * MARGIN // US Letter, 0.75" margins

const p = (text, opts = {}) => new Paragraph({ spacing: { after: 120 }, ...opts, children: Array.isArray(text) ? text : [new TextRun(text)] })
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] })
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] })
const bullet = (runs) => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 60 }, children: typeof runs === 'string' ? [new TextRun(runs)] : runs })
const box = (label, indent = 360) => new Paragraph({ indent: { left: indent }, spacing: { after: 40 }, children: [new TextRun({ text: '☐  ', font: 'Segoe UI Symbol' }), new TextRun(label)] })
const blank = (label) => new Paragraph({ indent: { left: 360 }, spacing: { after: 80 }, children: [new TextRun(`${label}  ______________________________`)] })

const border = { style: BorderStyle.SINGLE, size: 4, color: 'BFC8C5' }
const borders = { top: border, bottom: border, left: border, right: border }
function cell(text, width, { header = false, center = false } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA }, borders,
    shading: header ? { type: ShadingType.CLEAR, fill: 'E3F0F0', color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: String(text), bold: header, size: 18 })] })],
  })
}
function table(headers, rows, widths) {
  const total = widths.reduce((a, b) => a + b, 0)
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, widths[i], { header: true, center: i > 0 })) }),
      ...rows.map((r) => new TableRow({ children: r.map((v, i) => cell(v, widths[i], { center: i > 0 && v.length < 4 })) })),
    ],
  })
}
const spacer = () => new Paragraph({ spacing: { after: 120 }, children: [] })

const HINT_ROW = { privacy: 'Privacy law', accreditation: 'Curriculum / accreditation body', professional: 'Professional and regulatory bodies', calendarNote: 'Academic calendar' }

function questionBlocks(q) {
  const out = []
  const meta = [q.domain ? `domain ${q.domain}` : null, q.required ? 'required' : null, q.pii ? 'personal data — stored separately' : null].filter(Boolean).join(' · ')
  out.push(new Paragraph({
    keepNext: true, spacing: { before: 200, after: 80 },
    children: [
      new TextRun({ text: `${q.id}. `, bold: true, color: ACCENT }),
      new TextRun({ text: `${q.title}. `, bold: true }),
      new TextRun(q.text),
      ...(meta ? [new TextRun({ text: `  [${meta}]`, italics: true, color: '6B7672', size: 18 })] : []),
    ],
  }))
  out.push(p([new TextRun({ text: 'Captures: ', bold: true, size: 18, color: ACCENT }), new TextRun({ text: q.captures, size: 18, color: '4A5552' })], { indent: { left: 360 }, keepNext: true, spacing: { after: 60 } }))
  if (q.countryHint) out.push(p([new TextRun({ text: `Country adaptation: see table "Country context", row "${HINT_ROW[q.countryHint]}".`, italics: true, size: 18, color: '6B7672' })], { indent: { left: 360 } }))
  if (q.type === 'multi' && q.max) out.push(p([new TextRun({ text: `Select up to ${q.max}.`, italics: true, size: 18 })], { indent: { left: 360 } }))

  switch (q.type) {
    case 'scale':
      q.options.forEach((o) => out.push(box(`(${o.v}) ${o.l}`)))
      if (!q.noDK) out.push(box(`(${DK}) Don't know / Not applicable`))
      break
    case 'single':
      q.options.forEach((o) => out.push(box(o.l)))
      if (q.other) out.push(blank('Other, specify:'))
      break
    case 'multi':
      q.options.forEach((o) => out.push(box(o.countries ? `${o.l}  [${o.countries.join(', ')}]` : o.l)))
      if (q.other) out.push(blank('Other, specify:'))
      break
    case 'number':
      out.push(blank(`Answer (${q.unit}):`))
      break
    case 'text':
      out.push(blank('Answer:'))
      break
    case 'textarea':
      for (let i = 0; i < 3; i++) out.push(new Paragraph({ indent: { left: 360 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'BFC8C5', space: 1 } }, spacing: { after: 200 }, children: [] }))
      break
    case 'grid': {
      const first = CONTENT_W - 4 * 1000
      out.push(table(['Item', ...q.options.map((o) => o.l), "Don't know"], q.rows.map((r) => [r.l, '☐', '☐', '☐', '☐']), [first, 1000, 1000, 1000, 1000]))
      out.push(p([new TextRun({ text: 'Scoring: Yes = 2, Partial = 1, No = 0.', italics: true, size: 18 })]))
      break
    }
    case 'hours':
      out.push(table(q.unit.startsWith('hours') ? ['Topic / format', `Hours (${q.unit})`] : ['Item', `Number (${q.unit})`], q.rows.map((r) => [r.l, '']), [CONTENT_W - 2200, 2200]))
      out.push(spacer())
      break
    case 'repeat': {
      const w = Math.floor(CONTENT_W / (q.fields.length + 0.4))
      const widths = [CONTENT_W - w * q.fields.length, ...q.fields.map(() => w)]
      out.push(table(['#', ...q.fields.map((f) => f.l)], Array.from({ length: q.count }, (_, i) => [String(i + 1), ...q.fields.map(() => '')]), widths))
      for (const f of q.fields.filter((f) => f.options)) {
        out.push(p([new TextRun({ text: `${f.l} codes: `, bold: true, size: 18 }), new TextRun({ text: f.options.map((o) => `${o.v} = ${o.l}`).join('; '), size: 18 })], { spacing: { before: 80, after: 60 } }))
      }
      out.push(spacer())
      break
    }
  }
  return out
}

const children = []

// Title page
children.push(
  new Paragraph({ spacing: { before: 2400, after: 200 }, children: [new TextRun({ text: 'ICARB-D ANNUAL MATURITY SURVEY', bold: true, size: 26, color: ACCENT })] }),
  new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: 'Dental School Departments and Courses', bold: true, size: 48 })] }),
  p([new TextRun({ text: 'Artificial intelligence · Health informatics · Robotics · Bioinformatics', size: 26, color: ACCENT })]),
  new Paragraph({ children: [new TextRun({ text: '', size: 2 })] }),
  p([new TextRun({ text: 'Canada · United States · Brazil · China · India', size: 28 })]),
  p([new TextRun({ text: `Department/course-specific annual questionnaire · version ${VERSION} · ${new Date().toISOString().slice(0, 10)}`, size: 22, color: '6B7672' })]),
  new Paragraph({ spacing: { before: 600, after: 120 }, children: [new TextRun({ text: 'Proposed article title', bold: true })] }),
  p([new TextRun({ text: STUDY.titles[0], italics: true })]),
  p([new TextRun({ text: 'Built on the PAHO/WHO–IDB AI Readiness Assessment Toolkit (2024), AI-GUARD (2026), Bias-free AI in Health (2026) and AI Prompt Design for Public Health (2025).', size: 20, color: '6B7672' })], { spacing: { before: 600 } }),
  new Paragraph({ children: [new PageBreak()] }),
  new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-2' }),
  new Paragraph({ children: [new PageBreak()] }),
)

// Study overview
children.push(h1('1. About the study'))
for (const para of STUDY.overview) children.push(p(para))
children.push(h2('Objectives'))
STUDY.objectives.forEach((o) => children.push(bullet(o)))
children.push(h2('How the questionnaire is applied'))
STUDY.procedure.forEach((o, i) => children.push(bullet([new TextRun({ text: `Step ${i + 1}. `, bold: true }), new TextRun(o)])))
children.push(h2('Respondent instructions'))
STUDY.instructions.forEach((o) => children.push(bullet(o)))

children.push(h2('Country context'))
children.push(p('Items marked "Country adaptation" are read with the national references below. Option lists that are specific to a country are tagged with the country code (CA, US, BR, CN, IN).'))
const ctxRows = [['Degree', 'degree'], ['Curriculum / accreditation body', 'accreditation'], ['Professional and regulatory bodies', 'professional'], ['Privacy law', 'privacy'], ['AI device regulator', 'deviceRegulator'], ['Academic calendar', 'calendarNote'], ['Languages', 'languages']]
const cw = Math.floor((CONTENT_W - 1700) / 5)
children.push(table(['', ...COUNTRIES.map((c) => c.l)], ctxRows.map(([label, key]) => [label, ...COUNTRIES.map((c) => COUNTRY_CONTEXT[c.v][key])]), [CONTENT_W - cw * 5, cw, cw, cw, cw, cw]))
children.push(spacer())

children.push(h2('Readiness domains and scale'))
children.push(p('Maturity items use a 1–4 anchored scale adapted from the PAHO/WHO toolkit (1 = absent, 2 = initial, 3 = developing, 4 = established), plus "Don\'t know / Not applicable" (coded −1 and treated as missing). Each 1–4 item belongs to one of ten domains:'))
Object.entries(DOMAINS).forEach(([k, v]) => children.push(bullet([new TextRun({ text: `${k} — `, bold: true }), new TextRun(v)])))
children.push(new Paragraph({ children: [new PageBreak()] }))

// Questionnaire
children.push(h1('2. Questionnaire'))
for (const s of SECTIONS) {
  children.push(h2(s.title))
  children.push(p([new TextRun({ text: 'What this part captures. ', bold: true }), new TextRun(s.purpose)]))
  if (s.intro) children.push(p([new TextRun({ text: s.intro, italics: true })]))
  for (const q of s.questions) children.push(...questionBlocks(q))
}
children.push(new Paragraph({ children: [new PageBreak()] }))

// Scoring and consolidation
children.push(h1('3. Scoring and consolidation'))
STUDY.consolidation.forEach((o, i) => children.push(bullet([new TextRun({ text: `${o[0]}. `, bold: true }), new TextRun(o[1])])))
children.push(h2('Data file'))
children.push(p(`Answers are stored in a flat file with one row per department/course (access code) and one column per item — ${QUESTION_COLUMNS.filter((c) => !c.pii).length} answer columns in total. The codebook (docs/codebook.csv) lists every column, its label, type, domain and value codes. Personal contact data (respondent name, email, interviewer) are kept in a separate private file.`))
children.push(h2('Methodological recommendations'))
STUDY.methods.forEach((o) => children.push(bullet(o)))

// Literature
children.push(h1('4. Related studies'))
children.push(p(STUDY.gap))
children.push(table(['Study', 'Setting / design', 'Key finding'], REFERENCES.filter((r) => r.finding).map((r) => [r.short, r.design, r.finding]), [2600, 2700, CONTENT_W - 5300]))
children.push(h2('Suggested article titles'))
STUDY.titles.forEach((t) => children.push(bullet(t)))
children.push(h2('Candidate journals'))
children.push(p(STUDY.journals))
children.push(h2('References'))
REFERENCES.forEach((r, i) => children.push(new Paragraph({ spacing: { after: 80 }, indent: { left: 400, hanging: 400 }, children: [new TextRun({ text: `${i + 1}. ${r.cite}`, size: 19 })] })))

const doc = new Document({
  creator: 'AI-assessment-DS-2026',
  title: 'ICARB-D Annual Maturity Survey — Dental School Departments and Courses',
  styles: {
    default: { document: { run: { font: { ascii: 'Arial', hAnsi: 'Arial', cs: 'Arial', eastAsia: 'Heiti SC' }, size: 21 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, color: ACCENT, font: 'Arial' }, paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 26, bold: true, font: 'Arial' }, paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1, keepNext: true } },
    ],
  },
  numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: PAGE_W, height: 15840 }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ICARB-D Annual Survey of Dental Schools · page ', size: 16, color: '6B7672' }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '6B7672' })] })] }) },
    children,
  }],
})

fs.mkdirSync('docs', { recursive: true })
const out = 'docs/ICARB-D-Annual-Survey-Dental-Schools.docx'
fs.writeFileSync(out, await Packer.toBuffer(doc))
console.log('Wrote', out)
