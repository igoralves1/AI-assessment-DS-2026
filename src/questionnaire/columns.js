// Turns the questionnaire into a flat list of CSV columns (one row per access code).
// Answers are stored as a flat object { columnName: value } so a form maps 1:1 to a CSV row.

import { SECTIONS, VERSION, DK } from './questionnaire.js'

export const META_COLUMNS = [
  { name: 'code', label: 'Access code (XXX-XXX)', type: 'meta' },
  { name: 'status', label: 'issued | in_progress | submitted', type: 'meta' },
  { name: 'created_at', label: 'Code issued (ISO time)', type: 'meta' },
  { name: 'updated_at', label: 'Last saved (ISO time)', type: 'meta' },
  { name: 'submitted_at', label: 'Submitted (ISO time)', type: 'meta' },
  { name: 'version', label: 'Questionnaire version', type: 'meta' },
]

const fmtOptions = (options = []) => options.map((o) => `${o.v}=${o.l}`).join(' | ')

function questionColumns(q, section) {
  const base = { qid: q.id, section: section.id, domain: q.domain || '', pii: !!q.pii }
  const cols = []
  switch (q.type) {
    case 'scale': {
      const values = fmtOptions(q.options) + (q.noDK ? '' : ` | ${DK}=Don't know / N/A`)
      cols.push({ ...base, name: q.id, label: q.title, type: 'scale', values })
      break
    }
    case 'single':
      cols.push({ ...base, name: q.id, label: q.title, type: 'single', values: fmtOptions(q.options) })
      if (q.other) cols.push({ ...base, name: `${q.id}_other`, label: `${q.title} — other (text)`, type: 'text' })
      break
    case 'multi':
      for (const o of q.options) {
        cols.push({ ...base, name: `${q.id}__${o.v}`, label: `${q.title}: ${o.l}`, type: 'binary', values: '1=selected | 0=not selected' })
      }
      if (q.other) cols.push({ ...base, name: `${q.id}_other`, label: `${q.title} — other (text)`, type: 'text' })
      break
    case 'repeat':
      for (let n = 1; n <= q.count; n++) {
        for (const f of q.fields) {
          cols.push({ ...base, name: `${q.id}_${n}_${f.id}`, label: `${q.title} #${n}: ${f.l}`, type: f.type, values: fmtOptions(f.options) })
        }
      }
      break
    case 'grid':
      for (const r of q.rows) {
        cols.push({ ...base, name: `${q.id}_${r.v}`, label: `${q.title}: ${r.l}`, type: 'grid', values: fmtOptions(q.options) })
      }
      break
    case 'hours':
      for (const r of q.rows) {
        cols.push({ ...base, name: `${q.id}_${r.v}`, label: `${q.title}: ${r.l} (${q.unit})`, type: 'number' })
      }
      break
    default: // number, text, textarea
      cols.push({ ...base, name: q.id, label: q.title + (q.unit ? ` (${q.unit})` : ''), type: q.type })
  }
  return cols
}

export const QUESTION_COLUMNS = SECTIONS.flatMap((s) => s.questions.flatMap((q) => questionColumns(q, s)))

// Columns of the analysis file (responses.csv): no personal data.
export const RESPONSE_COLUMNS = [...META_COLUMNS, ...QUESTION_COLUMNS.filter((c) => !c.pii)]

// Columns of the private access-code file (access_codes.csv): code + personal contact data.
export const ACCESS_COLUMNS = [
  { name: 'code' }, { name: 'created_at' },
  ...QUESTION_COLUMNS.filter((c) => c.pii),
  { name: 'A03' }, { name: 'A06' },
]

export const INTAKE_COLUMNS = QUESTION_COLUMNS.filter((c) => c.section === 'A')

export { VERSION }
