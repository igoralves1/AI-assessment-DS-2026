// Storage server: keeps all answers in plain CSV files (one row per access code, one column per item).
//
//   data/responses.csv     analysis file (no personal data) -> used by analysis/consolidate.py
//   data/access_codes.csv  private file: code + respondent name/email + interviewer
//
// Run:  ADMIN_TOKEN=choose-a-secret npm run server     (default port 8787)
// The data/ folder is git-ignored: never commit it to a public repository.

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { toCsv, parseCsv } from '../src/lib/csv.js'
import { generateCode, isValidCode, normalizeCode } from '../src/lib/code.js'
import { RESPONSE_COLUMNS, ACCESS_COLUMNS, QUESTION_COLUMNS } from '../src/questionnaire/columns.js'
import { missingIntake, newRecordRows, applyAnswers, publicRecord } from '../src/lib/records.js'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data')
const PORT = Number(process.env.PORT || 8787)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || ''
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,https://igoralves1.github.io').split(',')

if (!ADMIN_TOKEN || ADMIN_TOKEN.length < 12) {
  console.error('Set ADMIN_TOKEN (at least 12 characters) before starting the server.')
  process.exit(1)
}

const RESP_FILE = path.join(DATA_DIR, 'responses.csv')
const ACCESS_FILE = path.join(DATA_DIR, 'access_codes.csv')
const respCols = RESPONSE_COLUMNS.map((c) => c.name)
const accessCols = ACCESS_COLUMNS.map((c) => c.name)

fs.mkdirSync(DATA_DIR, { recursive: true })

function load(file) {
  if (!fs.existsSync(file)) return new Map()
  const { records } = parseCsv(fs.readFileSync(file, 'utf8'))
  return new Map(records.map((r) => [r.code, r]))
}

// Write to a temp file then rename, so a crash never leaves a half-written CSV.
function save(file, cols, map) {
  const tmp = `${file}.tmp`
  fs.writeFileSync(tmp, toCsv(cols, [...map.values()]), 'utf8')
  fs.renameSync(tmp, file)
}

const responses = load(RESP_FILE)
const access = load(ACCESS_FILE)
// Rewrite on start so the header always matches the current questionnaire version.
save(RESP_FILE, respCols, responses)
save(ACCESS_FILE, accessCols, access)

// Simple brute-force protection for the code login: 20 attempts per IP per 10 minutes.
const attempts = new Map()
function tooManyAttempts(ip) {
  const now = Date.now()
  const list = (attempts.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000)
  list.push(now)
  attempts.set(ip, list)
  return list.length > 20
}

function send(res, status, body, headers = {}) {
  const isText = typeof body === 'string'
  res.writeHead(status, { 'Content-Type': isText ? 'text/csv; charset=utf-8' : 'application/json', ...headers })
  res.end(isText ? body : JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 1e6) { reject(new Error('Body too large')); req.destroy() }
    })
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}) } catch (e) { reject(e) } })
  })
}

function isAdmin(req) {
  const given = Buffer.from(String(req.headers['x-admin-token'] || ''))
  const expected = Buffer.from(ADMIN_TOKEN)
  return given.length === expected.length && crypto.timingSafeEqual(given, expected)
}

const codebookCsv = () => toCsv(['name', 'qid', 'section', 'domain', 'type', 'label', 'values', 'pii'], QUESTION_COLUMNS)

async function handle(req, res) {
  const url = new URL(req.url, 'http://x')
  const p = url.pathname
  const ip = req.socket.remoteAddress

  if (req.method === 'GET' && p === '/api/health') return send(res, 200, { ok: true, mode: 'server' })

  if (req.method === 'POST' && p === '/api/login') {
    if (tooManyAttempts(ip)) return send(res, 429, { error: 'Too many attempts. Try again in 10 minutes.' })
    const { code } = await readBody(req)
    const c = normalizeCode(code)
    const row = isValidCode(c) && responses.get(c)
    if (!row) return send(res, 404, { error: 'Code not found.' })
    return send(res, 200, { record: publicRecord(row) })
  }

  const m = p.match(/^\/api\/responses\/([A-Z0-9-]{7})$/)
  if (req.method === 'PUT' && m) {
    const row = responses.get(m[1])
    if (!row) return send(res, 404, { error: 'Code not found.' })
    if (row.status === 'submitted') return send(res, 409, { error: 'This form was already submitted.' })
    const { answers, submit } = await readBody(req)
    applyAnswers(row, answers, !!submit)
    save(RESP_FILE, respCols, responses)
    return send(res, 200, { record: publicRecord(row) })
  }

  if (p === '/api/export/codebook.csv') return send(res, 200, codebookCsv())

  // ---- admin (research team) endpoints ----
  if (p.startsWith('/api/admin/') && !isAdmin(req)) return send(res, 401, { error: 'Invalid admin token.' })

  if (req.method === 'GET' && p === '/api/admin/check') return send(res, 200, { ok: true })

  if (req.method === 'POST' && p === '/api/admin/codes') {
    const { intake } = await readBody(req)
    const missing = missingIntake(intake || {})
    if (missing.length) return send(res, 400, { error: `Missing required fields: ${missing.join(', ')}` })
    const code = generateCode((n) => crypto.randomInt(n), (c) => responses.has(c))
    const rows = newRecordRows(code, intake)
    responses.set(code, rows.response)
    access.set(code, rows.access)
    save(RESP_FILE, respCols, responses)
    save(ACCESS_FILE, accessCols, access)
    return send(res, 201, { code })
  }

  if (req.method === 'GET' && p === '/api/admin/codes') {
    const list = [...responses.values()].map((r) => ({
      code: r.code, wave: r.A15, status: r.status, created_at: r.created_at, updated_at: r.updated_at,
      country: r.A01, institution: r.A03, department: r.A06, course: r.A07,
      contact: access.get(r.code)?.A10 || '',
    }))
    return send(res, 200, { codes: list })
  }

  if (req.method === 'GET' && p === '/api/admin/export/responses.csv') return send(res, 200, toCsv(respCols, [...responses.values()]))
  if (req.method === 'GET' && p === '/api/admin/export/access_codes.csv') return send(res, 200, toCsv(accessCols, [...access.values()]))

  return send(res, 404, { error: 'Not found' })
}

http.createServer(async (req, res) => {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  }
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }
  try {
    await handle(req, res)
  } catch (e) {
    console.error(e)
    send(res, 400, { error: 'Bad request' })
  }
}).listen(PORT, () => {
  console.log(`Storage server on http://localhost:${PORT}  (data: ${DATA_DIR})`)
})
