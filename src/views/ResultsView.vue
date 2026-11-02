<script setup>
// Results 2026 — SIMULATED. Fifteen fictional universities with randomly generated answers, to show how the
// benchmark, the group comparison and each university's diagnostic will look once real data arrive.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DATA from '../simulated/results-2026-simulated.json'
import { SECTIONS, HI_AREAS, DOMAINS } from '../questionnaire/questionnaire.js'
import { CHECKLIST } from '../questionnaire/checklist.js'
import { scoreUniversity, averageScores, describe, levelOf, LEVEL_NAMES, PART_SHORT, SCORED, SCORED_PARTS } from '../lib/scoring.js'
import * as charts from '../lib/charts.js'

const route = useRoute()
const router = useRouter()

const unis = DATA.universities.map(scoreUniversity)
const group = averageScores(unis.map((u) => u.scores))
const ranked = [...unis].sort((a, b) => b.scores.benchmark - a.scores.benchmark)
const rankOf = Object.fromEntries(ranked.map((u, i) => [u.id, i + 1]))
const fundRanked = [...unis].sort((a, b) => b.scores.funding - a.scores.funding)
const fundRankOf = Object.fromEntries(fundRanked.map((u, i) => [u.id, i + 1]))
const nCourses = unis.reduce((n, u) => n + u.courses.length, 0)
const nDepts = unis.reduce((n, u) => n + u.departments.length, 0)

const SHORT_AREA = { HIS: 'Info systems', AI: 'AI', ROB: 'Robotics', BIO: 'Bioinformatics', SWD: 'Software dev.' }
const FOUND = [['INF', 'Infrastructure'], ['DAT', 'Data & privacy'], ['HUM', 'People'], ['GOV', 'Governance'], ['IMP', 'Implementation']]
// Columns used by the heatmap, boxplots and statistics: summary scores, the five areas, the five foundations.
const COLS = [
  { key: 'benchmark', label: 'Benchmark', strong: true, get: (s) => s.benchmark },
  { key: 'funding', label: 'Funding ready', full: 'Funding readiness', strong: true, get: (s) => s.funding },
  ...HI_AREAS.map((a) => ({ key: a.key, label: SHORT_AREA[a.key], full: a.l, get: (s) => s.area[a.key] })),
  ...FOUND.map(([d, l]) => ({ key: d, label: l, get: (s) => s.domain[d] })),
]
const RADAR_AXES = COLS.slice(2)
const stats = COLS.map((c) => ({ ...c, stats: describe(unis.map((u) => c.get(u.scores))) }))
const levelCounts = [4, 3, 2, 1].map((l) => ({ l, n: unis.filter((u) => u.level === l).length }))

const checklistById = Object.fromEntries(CHECKLIST.flatMap((g) => g.items.map((it) => [it.id, it])))
const partTitle = (id) => SECTIONS.find((s) => s.id === id).title.replace(/^Part [A-Z]\. /, '')

// ---- view state -------------------------------------------------------------
const view = computed(() => (route.query.u ? 'one' : 'all'))
const selectedId = computed(() => String(route.query.u || ''))
const u = computed(() => unis.find((x) => x.id === selectedId.value) || null)
const pick = (id) => router.push({ path: '/results', query: id ? { u: id } : {} })
const step = (d) => {
  const i = unis.findIndex((x) => x.id === selectedId.value)
  pick(unis[(i + d + unis.length) % unis.length].id)
}

const strengths = computed(() => {
  if (!u.value) return { best: [], worst: [] }
  const list = RADAR_AXES.map((c) => ({ label: c.label, v: c.get(u.value.scores), avg: c.get(group) })).sort((a, b) => b.v - a.v)
  return { best: list.slice(0, 2), worst: list.slice(-2).reverse() }
})
const itemsOf = computed(() =>
  !u.value ? [] : SCORED.map((q) => ({ id: q.id, part: q.part, title: q.title, value: u.value.scores.item[q.id], target: checklistById[q.id]?.target, next: checklistById[q.id]?.next })),
)
const atTarget = computed(() => itemsOf.value.filter((it) => it.value != null && it.value >= 3.5).length)
const priorities = computed(() => itemsOf.value.filter((it) => it.value != null && it.value < 2.5).sort((a, b) => a.value - b.value).slice(0, 10))

// ---- rendering --------------------------------------------------------------
const el = {} // chart containers, filled by function refs in the template
function render() {
  if (view.value === 'all') {
    if (el.bars) charts.benchmarkBars(el.bars, ranked.map((x) => ({ id: x.id, name: x.name, value: x.scores.benchmark, funding: x.scores.funding, level: x.level })), { onPick: pick })
    if (el.scatter) charts.scatter(el.scatter, unis.map((x) => ({ id: x.id, name: x.name, x: x.scores.benchmark, y: x.scores.funding, level: x.level })), { onPick: pick })
    if (el.heat) charts.heatmap(el.heat, ranked, COLS, (row, c) => c.get(row.scores), { onPick: pick })
    if (el.box) charts.boxplots(el.box, stats.map((c) => ({ key: c.key, label: c.label, stats: c.stats, values: unis.map((x) => ({ name: x.name, v: c.get(x.scores) })) })))
  } else if (u.value) {
    const s = u.value.scores
    if (el.gauge) charts.gauge(el.gauge, s.benchmark, u.value.level)
    if (el.radar) charts.radar(el.radar, RADAR_AXES, [
      { name: 'Average of 15', color: 'var(--viz-s2)', dashed: true, values: Object.fromEntries(RADAR_AXES.map((c) => [c.key, c.get(group)])) },
      { name: u.value.name, color: 'var(--viz-s1)', fill: true, values: Object.fromEntries(RADAR_AXES.map((c) => [c.key, c.get(s)])) },
    ])
    if (el.parts) charts.partBars(el.parts, SCORED_PARTS.map((p) => ({ key: p.id, label: `${p.id} · ${PART_SHORT[p.id]}`, value: s.part[p.id], avg: group.part[p.id] })))
    if (el.depts) charts.deptBars(el.depts, u.value.departments.map((d) => ({ name: d.name, value: d.scores.benchmark, courses: d.courses.map((c) => ({ code: c.code, value: c.scores.benchmark })) })))
    if (el.items) charts.itemMatrix(el.items, SCORED_PARTS.map((p) => ({ id: p.id, title: partTitle(p.id), items: itemsOf.value.filter((it) => it.part === p.id) })))
  }
}
let ro
onMounted(async () => {
  await nextTick()
  render()
  ro = new ResizeObserver(() => render())
  ro.observe(document.querySelector('.results'))
})
onBeforeUnmount(() => ro && ro.disconnect())
watch(() => route.query.u, async () => { await nextTick(); render(); window.scrollTo(0, 0) })

const f = (v) => (v == null ? '—' : Math.round(v))
const f1 = (v) => (v == null ? '—' : v.toFixed(1))
</script>

<template>
  <article class="results viz">
    <header class="r-hero">
      <div class="eyebrow">Results 2026 · simulated data</div>
      <h1>Results 2026</h1>
      <div class="sim-banner" role="note">
        <strong>Simulated results.</strong> These 15 universities are fictional ("Dental University of A" to "of O") and every answer was generated at random to show how the results will look. By design, 4 universities are at level 4, 3 at level 3, 5 at level 2 and 3 at level 1. Real results will replace this page after the first wave.
      </div>
      <nav class="r-tabs" aria-label="Results views">
        <button :class="{ on: view === 'all' }" @click="pick('')">All 15 universities</button>
        <button :class="{ on: view === 'one' }" @click="pick(selectedId || ranked[0].id)">One university</button>
        <select v-if="view === 'one'" :value="selectedId" aria-label="Choose a university" @change="pick($event.target.value)">
          <option v-for="x in unis" :key="x.id" :value="x.id">{{ x.name }}</option>
        </select>
      </nav>
    </header>

    <!-- ===================== ALL UNIVERSITIES ===================== -->
    <template v-if="view === 'all'">
      <section class="tiles">
        <div class="tile"><span class="t-label">Universities</span><span class="t-value">{{ unis.length }}</span><span class="t-sub">{{ nDepts }} departments · {{ nCourses }} courses</span></div>
        <div class="tile"><span class="t-label">Mean benchmark</span><span class="t-value">{{ f(stats[0].stats.mean) }}</span><span class="t-sub">SD {{ f1(stats[0].stats.sd) }} · median {{ f(stats[0].stats.median) }}</span></div>
        <div class="tile"><span class="t-label">Range</span><span class="t-value">{{ f(stats[0].stats.min) }}–{{ f(stats[0].stats.max) }}</span><span class="t-sub">lowest to highest benchmark</span></div>
        <div class="tile"><span class="t-label">Maturity levels</span>
          <span class="t-levels"><span v-for="c in levelCounts" :key="c.l" class="lv"><i :style="{ background: `var(--viz-l${c.l})` }"></i>L{{ c.l }}: <b>{{ c.n }}</b></span></span>
          <span class="t-sub">universities per level</span></div>
      </section>

      <section class="card">
        <h2>Benchmark by university</h2>
        <p class="muted">Health informatics maturity, 0–100. Colour shows the level: 1 Absent (below 25), 2 Initial, 3 Developing, 4 Established (75 and above). Click a university to open its diagnostic.</p>
        <div :ref="(x) => (el.bars = x)" class="chart"></div>
      </section>

      <section class="card">
        <h2>Who could best use a grant?</h2>
        <p class="muted">Benchmark against funding readiness (the five foundations: infrastructure, data, people, governance, implementation). Universities in the shaded corner are strong on both.</p>
        <div :ref="(x) => (el.scatter = x)" class="chart"></div>
      </section>

      <section class="card">
        <h2>Heatmap: areas and foundations</h2>
        <p class="muted">Each cell is a 0–100 index; darker blue is more mature. Rows are sorted by benchmark.</p>
        <div :ref="(x) => (el.heat = x)" class="chart scroll-x"></div>
      </section>

      <section class="card">
        <h2>Distribution across the 15 universities</h2>
        <p class="muted">Boxplots: the box spans the middle half of the universities (25th to 75th percentile), the line inside is the median, the whiskers reach the lowest and highest values. Each dot is one university.</p>
        <div :ref="(x) => (el.box = x)" class="chart scroll-x"></div>
      </section>

      <section class="card">
        <h2>Statistics</h2>
        <div class="table-scroll">
          <table class="stats">
            <thead><tr><th>Index</th><th>n</th><th>Mean</th><th>SD</th><th>Min</th><th>Q1</th><th>Median</th><th>Q3</th><th>Max</th></tr></thead>
            <tbody><tr v-for="c in stats" :key="c.key" :class="{ strong: c.strong }"><td>{{ c.full || c.label }}</td><td>{{ c.stats.n }}</td><td>{{ f1(c.stats.mean) }}</td><td>{{ f1(c.stats.sd) }}</td><td>{{ f(c.stats.min) }}</td><td>{{ f(c.stats.q1) }}</td><td>{{ f(c.stats.median) }}</td><td>{{ f(c.stats.q3) }}</td><td>{{ f(c.stats.max) }}</td></tr></tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>All universities</h2>
        <div class="table-scroll">
          <table class="stats">
            <thead><tr><th>Rank</th><th>University</th><th>State</th><th>Level</th><th>Benchmark</th><th>Funding readiness</th><th>Departments</th><th>Courses</th></tr></thead>
            <tbody>
              <tr v-for="x in ranked" :key="x.id" class="clickable" @click="pick(x.id)">
                <td>{{ rankOf[x.id] }}</td><td>{{ x.name }}</td><td>{{ x.state }}</td>
                <td><span class="badge" :style="{ background: `var(--viz-l${x.level})`, color: x.level >= 3 ? '#fff' : '#0b0b0b' }">{{ x.level }} · {{ LEVEL_NAMES[x.level - 1] }}</span></td>
                <td>{{ f(x.scores.benchmark) }}</td><td>{{ f(x.scores.funding) }}</td><td>{{ x.departments.length }}</td><td>{{ x.courses.length }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- ===================== ONE UNIVERSITY ===================== -->
    <template v-else-if="u">
      <section class="card one-head">
        <div class="one-title">
          <div>
            <h2>{{ u.name }}</h2>
            <p class="muted">{{ u.state }} · {{ u.departments.length }} departments · {{ u.courses.length }} courses answered by their directors</p>
          </div>
          <div class="nav-btns"><button class="btn" @click="step(-1)">‹ Previous</button><button class="btn" @click="step(1)">Next ›</button></div>
        </div>
        <div class="one-grid">
          <div :ref="(x) => (el.gauge = x)" class="gauge"></div>
          <div class="one-tiles">
            <div class="tile"><span class="t-label">Rank</span><span class="t-value">{{ rankOf[u.id] }}<small> / 15</small></span><span class="t-sub">by benchmark</span></div>
            <div class="tile"><span class="t-label">Funding readiness</span><span class="t-value">{{ f(u.scores.funding) }}</span><span class="t-sub">rank {{ fundRankOf[u.id] }} of 15</span></div>
            <div class="tile"><span class="t-label">Questions at target</span><span class="t-value">{{ atTarget }}<small> / {{ itemsOf.length }}</small></span><span class="t-sub">average level 3.5 or higher</span></div>
          </div>
        </div>
        <div class="diagnosis">
          <h3>Overall diagnostic</h3>
          <p>{{ u.name }} is at <strong>level {{ u.level }} ({{ LEVEL_NAMES[u.level - 1] }})</strong> in health informatics, with a benchmark of <strong>{{ f(u.scores.benchmark) }}</strong> against an average of {{ f(group.benchmark) }} for the 15 universities.
            Its strongest areas are <strong>{{ strengths.best.map((s) => `${s.label} (${f(s.v)})`).join(' and ') }}</strong>; the weakest are <strong>{{ strengths.worst.map((s) => `${s.label} (${f(s.v)})`).join(' and ') }}</strong>.
            {{ atTarget }} of its {{ itemsOf.length }} rated questions are already at target (average level 3.5 or higher), and {{ itemsOf.filter((it) => it.value != null && it.value < 2.5).length }} need action (average below level 2.5).</p>
        </div>
      </section>

      <section class="card">
        <h2>Profile by area and foundation</h2>
        <p class="muted">This university (solid blue) against the average of the 15 universities (dashed orange). Scale 0–100 from the centre.</p>
        <div class="legend"><span><i style="background: var(--viz-s1)"></i>{{ u.name }}</span><span><i class="dash" style="border-color: var(--viz-s2)"></i>Average of 15</span></div>
        <div :ref="(x) => (el.radar = x)" class="chart center"></div>
      </section>

      <section class="card">
        <h2>Diagnostic by group of questions</h2>
        <p class="muted">Index for each part of the questionnaire, coloured by level. The orange tick marks the average of the 15 universities.</p>
        <div :ref="(x) => (el.parts = x)" class="chart"></div>
      </section>

      <section class="card">
        <h2>Departments and courses</h2>
        <p class="muted">The bar is the department's benchmark; each dot is one course, coloured by its level.</p>
        <div :ref="(x) => (el.depts = x)" class="chart"></div>
      </section>

      <section class="card">
        <h2>Diagnostic by question</h2>
        <p class="muted">Each cell is one 1–4 question, showing the average level across this university's courses. Hover or focus a cell to see the target and the next step.</p>
        <div class="legend"><span v-for="l in [1, 2, 3, 4]" :key="l"><i :style="{ background: `var(--viz-l${l})` }"></i>{{ l }} · {{ LEVEL_NAMES[l - 1] }}</span></div>
        <div :ref="(x) => (el.items = x)" class="item-matrix"></div>
      </section>

      <section class="card">
        <h2>Priority actions</h2>
        <p class="muted">The questions with the lowest average level: the first steps on the maturity checklist for this university.</p>
        <ol v-if="priorities.length" class="priorities">
          <li v-for="it in priorities" :key="it.id"><strong>{{ it.title }}</strong> <span class="muted mono">{{ it.id }} · level {{ f1(it.value) }}</span><br />
            <span>Next step: {{ it.next }}</span><br /><span class="muted">Target: {{ it.target }}</span></li>
        </ol>
        <p v-else class="muted">No question averages below level 2.5.</p>
      </section>
    </template>
  </article>
</template>

<style scoped>
.results { max-width: 980px; margin: 0 auto; }
.r-hero h1 { margin: 4px 0 10px; }
.sim-banner { border: 2px dashed var(--warn); border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; }
.r-tabs { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 16px; }
.r-tabs button { border: 1px solid var(--border); background: var(--surface); color: var(--text); border-radius: 999px; padding: 7px 14px; cursor: pointer; font: inherit; }
.r-tabs button.on { background: var(--accent); border-color: var(--accent); color: #fff; }
.r-tabs select { font: inherit; padding: 7px 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text); }
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; margin-bottom: 16px; }
.tile { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 2px; }
.t-label { font-size: .78rem; color: var(--muted); }
.t-value { font-size: 1.8rem; font-weight: 700; }
.t-value small { font-size: .9rem; color: var(--muted); font-weight: 400; }
.t-sub { font-size: .8rem; color: var(--muted); }
.t-levels { display: flex; flex-wrap: wrap; gap: 4px 12px; margin: 6px 0 2px; }
.lv { display: inline-flex; align-items: center; gap: 5px; font-size: .9rem; }
.lv i, .legend i { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
.legend { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: .85rem; margin: 6px 0 8px; }
.legend span { display: inline-flex; align-items: center; gap: 6px; }
.legend i.dash { width: 18px; height: 0; border-top: 2px dashed; border-radius: 0; }
.chart { width: 100%; }
.chart.center { display: flex; justify-content: center; }
.scroll-x { overflow-x: auto; }
.stats { width: 100%; border-collapse: collapse; font-size: .88rem; font-variant-numeric: tabular-nums; }
.stats th, .stats td { padding: 6px 8px; border-bottom: 1px solid var(--border); text-align: right; white-space: nowrap; }
.stats th:first-child, .stats td:first-child, .stats td:nth-child(2) { text-align: left; }
.stats tr.strong td { font-weight: 700; }
.stats tr.clickable { cursor: pointer; }
.stats tr.clickable:hover td { background: var(--accent-soft); }
.badge { display: inline-block; border-radius: 6px; padding: 1px 7px; font-size: .8rem; }
.one-title { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: flex-start; }
.one-title h2 { margin: 0; }
.nav-btns { display: flex; gap: 8px; }
.one-grid { display: grid; grid-template-columns: 280px 1fr; gap: 16px; align-items: center; margin-top: 10px; }
.one-tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
.gauge { display: flex; justify-content: center; }
.diagnosis { margin-top: 12px; padding: 12px 14px; background: var(--accent-soft); border-radius: 10px; }
.diagnosis h3 { margin: 0 0 4px; font-size: 1rem; }
.diagnosis p { margin: 0; line-height: 1.5; }
.priorities li { margin-bottom: 10px; line-height: 1.45; }
.mono { font-family: ui-monospace, Menlo, monospace; font-size: .8rem; }
@media (max-width: 640px) { .one-grid { grid-template-columns: 1fr; } }
</style>
