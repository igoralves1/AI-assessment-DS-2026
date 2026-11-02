// Maturity checklist built from the questionnaire: for every 1–4 item, level 4 ("established") is the target
// and level 3 ("developing") is the next step. AI-GUARD style Yes / Partial / No grids add their rows as targets.
// Used by the public guide (#/questions), the Word/PDF document and the slides for teachers and decision makers.
import { SECTIONS } from './questionnaire.js'

export const LEVELS = [
  { v: 1, l: 'Absent', d: 'Nothing in place yet.' },
  { v: 2, l: 'Initial', d: 'Interest or informal, isolated efforts.' },
  { v: 3, l: 'Developing', d: 'In place in part, or not yet routine.' },
  { v: 4, l: 'Established', d: 'Routine, documented and supported.' },
]

export const CHECKLIST = SECTIONS
  .filter((s) => s.filledBy === 'respondent' && s.id !== 'M')
  .map((s) => ({
    id: s.id,
    title: s.title.replace(/^Part [A-Z]\. /, ''),
    goal: s.goal,
    items: s.questions.flatMap((q) => {
      if (q.type === 'scale' && q.domain) {
        return [{ id: q.id, title: q.title, target: q.options[3].l, next: q.options[2].l }]
      }
      if (q.type === 'grid') {
        return q.rows.map((r) => ({ id: `${q.id}_${r.v}`, title: r.l, target: 'Yes: fully in place', next: 'Partial' }))
      }
      return []
    }),
  }))
  .filter((g) => g.items.length)

export const CHECKLIST_COUNT = CHECKLIST.reduce((n, g) => n + g.items.length, 0)
