// Scoring shared by the results page and the simulated-data generator.
// Same rules as analysis/consolidate.py: 1–4 items, "Don't know" (-1) = missing, index = (mean − 1) / 3 × 100.
import { SECTIONS, DOMAINS, HI_AREAS, FOUNDATIONS, DK } from '../questionnaire/questionnaire.js'

export const SCORED = SECTIONS.flatMap((s) =>
  s.questions.filter((q) => q.type === 'scale' && q.domain).map((q) => ({ ...q, part: s.id })),
)
export const SCORED_PARTS = SECTIONS.filter((s) => SCORED.some((q) => q.part === s.id))
export const LEVEL_NAMES = ['Absent', 'Initial', 'Developing', 'Established']
export const PART_SHORT = {
  A: 'Profile', B: 'Context', C: 'Physical resources', D: 'Human resources', E: 'AI curriculum', F: 'Generative AI',
  G: 'Information systems and software', H: 'Robotics and digital dentistry', I: 'Bioinformatics', J: 'Governance and ethics',
  K: 'Implementation and sustainability', L: 'Collaboration', M: 'Self-assessment',
}

export const toIndex = (mean) => (mean == null ? null : ((mean - 1) / 3) * 100)
export const levelOf = (index) => (index == null ? null : index < 25 ? 1 : index < 50 ? 2 : index < 75 ? 3 : 4)
const mean = (xs) => {
  const v = xs.filter((x) => x != null && !Number.isNaN(x))
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}
const val = (answers, id) => {
  const n = Number(answers[id])
  return answers[id] === '' || answers[id] == null || Number.isNaN(n) || n === DK ? null : n
}

// Scores for one course form.
export function scoreCourse(answers) {
  const domain = {}
  for (const d of Object.keys(DOMAINS)) domain[d] = toIndex(mean(SCORED.filter((q) => q.domain === d).map((q) => val(answers, q.id))))
  const part = {}
  for (const s of SCORED_PARTS) part[s.id] = toIndex(mean(SCORED.filter((q) => q.part === s.id).map((q) => val(answers, q.id))))
  const area = {}
  for (const a of HI_AREAS) area[a.key] = mean(a.domains.map((d) => domain[d]))
  const item = {}
  for (const q of SCORED) item[q.id] = val(answers, q.id)
  // Raw figures (per course): teaching hours per year, equipment, people, self-ratings.
  const terms = val(answers, 'B05') || 2
  const rows = (prefix) => Object.fromEntries(Object.keys(answers).filter((k) => k.startsWith(prefix)).map((k) => [k.slice(prefix.length), val(answers, k)]))
  const perYear = (m) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v == null ? null : v * terms]))
  const format = perYear(rows('E02_'))
  const topic = perYear(rows('E03_'))
  const equip = rows('H01_')
  const sum = (m) => { const v = Object.values(m).filter((x) => x != null); return v.length ? v.reduce((a, b) => a + b, 0) : null }
  const self = Object.fromEntries(['M01', 'M02', 'M03', 'M04', 'M12', 'M13'].map((k) => [k, val(answers, k)]))
  return {
    benchmark: mean(Object.values(domain)),
    funding: mean(FOUNDATIONS.domains.map((d) => domain[d])),
    domain, part, area, item, format, topic, equip, self,
    metric: { aiHours: sum(format), equipment: sum(equip), gpu: val(answers, 'C02'), facultyAI: val(answers, 'D02'), enrollment: val(answers, 'B01') },
  }
}

// Average a list of score objects (courses -> department, or all courses -> school).
export function averageScores(list) {
  const pick = (f) => mean(list.map(f))
  const keys = (f) => Object.keys(f(list[0]))
  const avgMap = (f) => Object.fromEntries(keys(f).map((k) => [k, pick((x) => f(x)[k])]))
  const out = { benchmark: pick((x) => x.benchmark), funding: pick((x) => x.funding), n: list.length }
  for (const k of ['domain', 'part', 'area', 'item', 'format', 'topic', 'equip', 'self', 'metric']) out[k] = avgMap((x) => x[k] || {})
  return out
}

// Full picture for one university: courses, departments and the school (= mean of its courses,
// which equals departments weighted by number of courses).
export function scoreUniversity(u) {
  const departments = u.departments.map((d) => {
    const courses = d.courses.map((c) => ({ ...c, scores: scoreCourse(c.answers) }))
    return { name: d.name, courses, scores: averageScores(courses.map((c) => c.scores)) }
  })
  const allCourses = departments.flatMap((d) => d.courses)
  const school = averageScores(allCourses.map((c) => c.scores))
  return { ...u, departments, courses: allCourses, scores: school, level: levelOf(school.benchmark) }
}

export function describe(values) {
  const v = values.filter((x) => x != null).sort((a, b) => a - b)
  const n = v.length
  if (!n) return null
  const q = (p) => {
    const i = (n - 1) * p
    const lo = Math.floor(i)
    return v[lo] + (v[Math.min(lo + 1, n - 1)] - v[lo]) * (i - lo)
  }
  const m = v.reduce((a, b) => a + b, 0) / n
  const sd = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(n - 1, 1))
  return { n, mean: m, sd, min: v[0], q1: q(0.25), median: q(0.5), q3: q(0.75), max: v[n - 1] }
}
