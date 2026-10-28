// Rules shared by every storage backend: which answers a respondent may change, and intake validation.
import { SECTIONS, VERSION } from '../questionnaire/questionnaire.js'
import { RESPONSE_COLUMNS, ACCESS_COLUMNS, INTAKE_COLUMNS } from '../questionnaire/columns.js'

const intakeSection = SECTIONS.find((s) => s.filledBy === 'team')
const respondentNames = new Set(
  RESPONSE_COLUMNS.filter((c) => c.qid && c.section !== intakeSection.id).map((c) => c.name),
)
const intakeNames = new Set(INTAKE_COLUMNS.map((c) => c.name))

export function missingIntake(answers) {
  return intakeSection.questions.filter((q) => q.required && (answers[q.id] === undefined || answers[q.id] === '')).map((q) => q.id)
}

// Build the two rows created when the research team issues a code.
export function newRecordRows(code, intake, now = new Date().toISOString()) {
  const clean = Object.fromEntries(Object.entries(intake).filter(([k]) => intakeNames.has(k)))
  const response = { code, status: 'issued', created_at: now, updated_at: now, submitted_at: '', version: VERSION }
  for (const c of RESPONSE_COLUMNS) if (c.qid && clean[c.name] !== undefined) response[c.name] = clean[c.name]
  const access = { code, created_at: now }
  for (const c of ACCESS_COLUMNS) if (clean[c.name] !== undefined) access[c.name] = clean[c.name]
  return { response, access }
}

// Merge respondent answers into a stored row. Intake, metadata and unknown keys are ignored.
export function applyAnswers(row, answers, submit, now = new Date().toISOString()) {
  for (const [k, v] of Object.entries(answers || {})) if (respondentNames.has(k)) row[k] = v
  row.updated_at = now
  if (submit) { row.status = 'submitted'; row.submitted_at = now } else if (row.status === 'issued') row.status = 'in_progress'
  return row
}

export function publicRecord(row) {
  return Object.fromEntries(RESPONSE_COLUMNS.map((c) => [c.name, row[c.name] ?? '']))
}
