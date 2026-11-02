// SIMULATED results for the "Results 2026" demonstration page.
// Fifteen fictional universities ("Dental University of A" … "of O") with randomly generated answers.
// Overall maturity levels are fixed by design: 4 at level 4, 3 at level 3, 5 at level 2 and 3 at level 1,
// assigned to the universities in random order. Nothing here is real data.
//   node scripts/build-sim-results.mjs   -> src/simulated/results-2026-simulated.json
import fs from 'node:fs'
import { ALL_QUESTIONS, DOMAINS } from '../src/questionnaire/questionnaire.js'
import { SCORED, scoreUniversity } from '../src/lib/scoring.js'

const SEED = 2026
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
let rand = mulberry32(SEED)
const normal = (sd = 1) => {
  const u = 1 - rand(), v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * sd
}
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x))
const q = (id) => ALL_QUESTIONS.find((x) => x.id === id)

const LETTERS = 'ABCDEFGHIJKLMNO'.split('')
const LEVELS = shuffle([4, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1])
const TARGET = { 1: 1.42, 2: 2.12, 3: 2.88, 4: 3.6 } // mean item level aimed at for each overall level
const STATES = ['CA', 'NY', 'TX', 'FL', 'MA', 'IL', 'OH', 'WA', 'PA', 'MI', 'NC', 'GA', 'MN', 'CO', 'AZ']
const DEPARTMENTS = ['Oral and Maxillofacial Radiology', 'Prosthodontics', 'Orthodontics', 'Periodontics', 'Restorative Dentistry',
  'Endodontics', 'Oral and Maxillofacial Surgery', 'Pediatric Dentistry', 'Oral Biology', 'Dental Public Health']
const GRIDS = ['J11', 'F06']

function makeCourse(base, domainOffset, deptOffset, code, dept) {
  const courseOffset = normal(0.15)
  const answers = { A06: dept, A07: code, A08: '1', B05: '2', B01: String(Math.round(40 + rand() * 80)) }
  for (const item of SCORED) {
    if (rand() < 0.03) { answers[item.id] = '-1'; continue } // "Don't know"
    const v = base + domainOffset[item.domain] + deptOffset + courseOffset + normal(0.55)
    answers[item.id] = String(clamp(Math.round(v), 1, 4))
  }
  const lvl = clamp(base, 1, 4)
  for (const g of GRIDS) for (const r of q(g).rows) {
    const p = (lvl - 1) / 3 + normal(0.15)
    answers[`${g}_${r.v}`] = String(p > 0.66 ? 2 : p > 0.33 ? 1 : 0)
  }
  for (const r of q('E03').rows) answers[`E03_${r.v}`] = String(Math.max(0, Math.round((lvl - 1) * rand() * 2.2 + normal(0.6))))
  for (const r of q('E02').rows) answers[`E02_${r.v}`] = String(Math.max(0, Math.round((lvl - 1) * (2 + rand() * 4) + normal(1))))
  for (const r of q('H01').rows) answers[`H01_${r.v}`] = String(Math.max(0, Math.round((lvl - 1) * rand() * 3 + normal(0.5))))
  answers.C02 = String(Math.max(0, Math.round((lvl - 1) * 2 + normal(1))))
  answers.D02 = String(Math.max(0, Math.round((lvl - 1) * 1.5 + normal(0.8))))
  for (const m of ['M01', 'M02', 'M03', 'M04', 'M12', 'M13']) answers[m] = String(clamp(Math.round(lvl + normal(0.6)), 1, 4))
  return answers
}

function makeUniversity(letter, level, i) {
  for (let attempt = 0; attempt < 200; attempt++) {
    rand = mulberry32(SEED * 100 + i * 997 + attempt)
    const base = TARGET[level] + normal(0.08)
    const domainOffset = Object.fromEntries(Object.keys(DOMAINS).map((d) => [d, normal(0.35)]))
    const depts = shuffle(DEPARTMENTS).slice(0, 3 + Math.floor(rand() * 3))
    const u = {
      id: letter, name: `Dental University of ${letter}`, state: STATES[i], targetLevel: level,
      departments: depts.map((name, k) => {
        const deptOffset = normal(0.2)
        const n = 1 + Math.floor(rand() * 3)
        const prefix = name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase()
        return { name, courses: Array.from({ length: n }, (_, c) => ({ code: `${prefix}-${300 + k * 10 + c} (${name})`, answers: makeCourse(base, domainOffset, deptOffset, `${prefix}-${300 + k * 10 + c}`, name) })) }
      }),
    }
    const scored = scoreUniversity(u)
    if (scored.level === level) return u
  }
  throw new Error(`Could not reach level ${level} for ${letter}`)
}

const universities = LETTERS.map((L, i) => makeUniversity(L, LEVELS[i], i))
const out = {
  simulated: true,
  note: 'SIMULATED DATA. Fifteen fictional universities with randomly generated answers, used only to demonstrate the analysis. Not real results.',
  wave: 2026,
  seed: SEED,
  levelsByDesign: { 4: 4, 3: 3, 2: 5, 1: 3 },
  universities,
}
fs.mkdirSync('src/simulated', { recursive: true })
fs.writeFileSync('src/simulated/results-2026-simulated.json', JSON.stringify(out))
const counts = universities.reduce((m, u) => ({ ...m, [u.targetLevel]: (m[u.targetLevel] || 0) + 1 }), {})
console.log('Wrote src/simulated/results-2026-simulated.json', JSON.stringify(counts),
  universities.map((u) => `${u.id}:L${u.targetLevel}:${scoreUniversity(u).scores.benchmark.toFixed(0)}`).join(' '))
