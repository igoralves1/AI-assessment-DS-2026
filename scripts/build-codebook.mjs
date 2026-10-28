// Writes docs/codebook.csv: one line per column of data/responses.csv, with labels and value codes.
import fs from 'node:fs'
import { toCsv } from '../src/lib/csv.js'
import { META_COLUMNS, QUESTION_COLUMNS } from '../src/questionnaire/columns.js'

const cols = ['name', 'qid', 'section', 'domain', 'type', 'label', 'values', 'pii']
fs.mkdirSync('docs', { recursive: true })
fs.writeFileSync('docs/codebook.csv', toCsv(cols, [...META_COLUMNS, ...QUESTION_COLUMNS]))
console.log(`docs/codebook.csv: ${META_COLUMNS.length + QUESTION_COLUMNS.length} columns`)
