// Demo backend for GitHub Pages without a server: everything stays in this browser's localStorage.
// A code issued here only works in the same browser. Use the storage server for real data collection.
import { toCsv } from '../lib/csv.js'
import { generateCode, normalizeCode } from '../lib/code.js'
import { RESPONSE_COLUMNS, ACCESS_COLUMNS, QUESTION_COLUMNS } from '../questionnaire/columns.js'
import { missingIntake, newRecordRows, applyAnswers, publicRecord } from '../lib/records.js'
import { ADMIN_CODE_HASH } from '../config.js'

const KEY = 'ai-assessment-ds-2026'

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { responses: {}, access: {} } } catch { return { responses: {}, access: {} } }
}
function write(db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { throw new Error('This browser blocked local storage.') }
}
const randomInt = (n) => {
  const buf = new Uint32Array(1)
  const limit = Math.floor(0xffffffff / n) * n
  do crypto.getRandomValues(buf); while (buf[0] >= limit)
  return buf[0] % n
}

export function localStorageBackend() {
  return {
    mode: 'local',
    async adminLogin(code) {
      const bytes = new TextEncoder().encode(String(code).trim().toUpperCase())
      const digest = await crypto.subtle.digest('SHA-256', bytes)
      const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
      if (hex !== ADMIN_CODE_HASH) throw new Error('Invalid admin code.')
    },
    async createCode(intake) {
      const missing = missingIntake(intake)
      if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`)
      const db = read()
      const code = generateCode(randomInt, (c) => !!db.responses[c])
      const rows = newRecordRows(code, intake)
      db.responses[code] = rows.response
      db.access[code] = rows.access
      write(db)
      return code
    },
    async listCodes() {
      const db = read()
      return Object.values(db.responses).map((r) => ({
        code: r.code, status: r.status, created_at: r.created_at, updated_at: r.updated_at,
        country: r.A01, institution: r.A03, department: r.A06, course: r.A07, contact: db.access[r.code]?.A10 || '',
      }))
    },
    async login(code) {
      const row = read().responses[normalizeCode(code)]
      if (!row) throw Object.assign(new Error('Code not found.'), { status: 404 })
      return publicRecord(row)
    },
    async save(code, answers, submit = false) {
      const db = read()
      const row = db.responses[code]
      if (!row) throw new Error('Code not found.')
      if (row.status === 'submitted') throw new Error('This form was already submitted.')
      applyAnswers(row, answers, submit)
      write(db)
      return publicRecord(row)
    },
    async exportResponses() { return toCsv(RESPONSE_COLUMNS.map((c) => c.name), Object.values(read().responses)) },
    async exportAccess() { return toCsv(ACCESS_COLUMNS.map((c) => c.name), Object.values(read().access)) },
    async exportCodebook() {
      return toCsv(['name', 'qid', 'section', 'domain', 'type', 'label', 'values', 'pii'], QUESTION_COLUMNS)
    },
  }
}
