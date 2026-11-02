<script setup>
// Results 2026 — SIMULATED. Fifteen fictional universities with randomly generated answers, to show how the
// benchmark, the group comparison and each university's diagnostic will look once real data arrive.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DATA from '../simulated/results-2026-simulated.json'
import { SECTIONS, HI_AREAS, DOMAINS, ALL_QUESTIONS } from '../questionnaire/questionnaire.js'
import { CHECKLIST } from '../questionnaire/checklist.js'
import { scoreUniversity, averageScores, describe, levelOf, toIndex, LEVEL_NAMES, PART_SHORT, SCORED, SCORED_PARTS } from '../lib/scoring.js'
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

// ---- extra analyses -----------------------------------------------------------
const rowsOf = (qid) => ALL_QUESTIONS.find((q) => q.id === qid).rows
const TOPICS = rowsOf('E03')
const EQUIP = rowsOf('H01')
const FORMATS = rowsOf('E02')
const answerCounts = (x) => {
  const c = [0, 0, 0, 0]
  for (const course of x.courses) for (const v of Object.values(course.scores.item)) if (v != null) c[v - 1]++
  return c
}
const allCourses = unis.flatMap((x) => x.courses.map((c) => ({ ...c, uni: x })))
const courseLevels = [1, 2, 3, 4].map((l) => allCourses.filter((c) => levelOf(c.scores.benchmark) === l).length)
const itemStats = SCORED.map((q) => {
  const vals = unis.map((x) => x.scores.item[q.id]).filter((v) => v != null)
  return { id: q.id, part: q.part, title: q.title, mean: vals.reduce((a, b) => a + b, 0) / vals.length, below: vals.filter((v) => v < 2.5).length }
}).sort((a, b) => a.mean - b.mean)
const deptAgg = (() => {
  const m = {}
  for (const x of unis) for (const d of x.departments) (m[d.name] ||= []).push(d.scores.benchmark)
  return Object.entries(m).map(([name, v]) => ({ label: name, value: v.reduce((a, b) => a + b, 0) / v.length, n: v.length })).sort((a, b) => b.value - a.value)
})()
function pearson(a, b) {
  const n = a.length, ma = a.reduce((x, y) => x + y, 0) / n, mb = b.reduce((x, y) => x + y, 0) / n
  let num = 0, da = 0, db = 0
  for (let i = 0; i < n; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2 }
  return num / Math.sqrt(da * db)
}
const colVals = (c) => unis.map((x) => c.get(x.scores))
const corrRows = RADAR_AXES.map((c) => ({ id: c.key, name: c.label, col: c }))
const corrPairs = corrRows.flatMap((r, i) => corrRows.slice(i + 1).map((c) => ({ a: r.name, b: c.name, r: pearson(colVals(r.col), colVals(c.col)) }))).sort((x, y) => y.r - x.r)
const selfGap = unis.map((x) => toIndex(x.scores.self.M13) - x.scores.benchmark)
const meanSelfGap = selfGap.reduce((a, b) => a + b, 0) / selfGap.length
const areaMeans = RADAR_AXES.map((c) => ({ label: c.full || c.label, v: group.area[c.key] ?? group.domain[c.key] })).sort((a, b) => b.v - a.v)
const insights = [
  `${ranked[0].name} leads with a benchmark of ${Math.round(ranked[0].scores.benchmark)}; ${ranked[ranked.length - 1].name} is lowest at ${Math.round(ranked[ranked.length - 1].scores.benchmark)}. The spread is wide (SD ${stats[0].stats.sd.toFixed(1)} points).`,
  `Across all universities the strongest area or foundation is ${areaMeans[0].label} (${Math.round(areaMeans[0].v)}) and the weakest is ${areaMeans[areaMeans.length - 1].label} (${Math.round(areaMeans[areaMeans.length - 1].v)}).`,
  `${courseLevels[0] + courseLevels[1]} of ${allCourses.length} courses (${Math.round(((courseLevels[0] + courseLevels[1]) / allCourses.length) * 100)}%) are below level 3, so most improvement work sits at course level.`,
  `The most common gap is "${itemStats[0].title}" (${itemStats[0].id}): ${itemStats[0].below} of 15 universities average below level 2.5.`,
  `${corrPairs[0].a} and ${corrPairs[0].b} move together most closely (r = ${corrPairs[0].r.toFixed(2)}), so investment in one is likely to support the other.`,
  Math.abs(meanSelfGap) < 3
    ? `On average, course directors' self-ratings are close to the computed benchmark (difference ${meanSelfGap >= 0 ? '+' : '−'}${Math.abs(meanSelfGap).toFixed(1)} points), although individual universities differ (see the self-rating chart).`
    : `On average, course directors rate their overall maturity ${Math.abs(Math.round(meanSelfGap))} points ${meanSelfGap >= 0 ? 'higher' : 'lower'} than the computed benchmark.`,
]

// one university
const diffRows = computed(() => (!u.value ? [] : RADAR_AXES.map((c) => ({ label: c.full || c.label, value: c.get(u.value.scores), avg: c.get(group), diff: c.get(u.value.scores) - c.get(group) }))))
const selfVsComputed = computed(() => {
  if (!u.value) return []
  const s = u.value.scores
  return [['Health informatics', 'M13', s.benchmark], ['Info systems', 'M02', s.area.HIS], ['AI', 'M01', s.area.AI], ['Robotics', 'M03', s.area.ROB], ['Bioinformatics', 'M04', s.area.BIO], ['Software dev.', 'M12', s.area.SWD]]
    .map(([label, k, v]) => ({ label, a: v, b: toIndex(s.self[k]) }))
})
const peers = computed(() => (!u.value ? [] : unis.filter((x) => x.level === u.value.level).sort((a, b) => b.scores.benchmark - a.scores.benchmark)))
const courseRows = computed(() => (!u.value ? [] : u.value.departments.flatMap((d) => d.courses.map((c) => ({ dept: d.name, code: c.code.split(' (')[0], ...c.scores }))).sort((a, b) => b.benchmark - a.benchmark)))
const corrColor = (v) => (v < 0 ? `color-mix(in srgb, #b2182b ${Math.round(-v * 100)}%, #f7f7f7)` : `color-mix(in srgb, #1a9850 ${Math.round(v * 100)}%, #f7f7f7)`)

// ---- rendering --------------------------------------------------------------
const el = {} // chart containers, filled by function refs in the template
function render() {
  if (view.value === 'all') {
    if (el.bars) charts.benchmarkBars(el.bars, ranked.map((x) => ({ id: x.id, name: x.name, value: x.scores.benchmark, funding: x.scores.funding, level: x.level })), { onPick: pick })
    if (el.scatter) charts.scatter(el.scatter, unis.map((x) => ({ id: x.id, name: x.name, x: x.scores.benchmark, y: x.scores.funding, level: x.level })), { onPick: pick })
    if (el.heat) charts.heatmap(el.heat, ranked, COLS, (row, c) => c.get(row.scores), { onPick: pick })
    if (el.box) charts.boxplots(el.box, stats.map((c) => ({ key: c.key, label: c.label, stats: c.stats, values: unis.map((x) => ({ name: x.name, v: c.get(x.scores) })) })))
    if (el.stack) charts.stacked100(el.stack, ranked.map((x) => ({ id: x.id, label: x.name, counts: answerCounts(x) })), { onPick: pick })
    if (el.hist) charts.histogram(el.hist, allCourses.map((c) => c.scores.benchmark), { label: 'Distribution of course benchmarks' })
    if (el.partHeat) charts.heatmap(el.partHeat, ranked, SCORED_PARTS.map((p) => ({ key: p.id, label: `${p.id} · ${PART_SHORT[p.id]}`, full: `Part ${p.id} · ${PART_SHORT[p.id]}` })), (row, c) => row.scores.part[c.key], { onPick: pick, label: 'Heatmap by group of questions' })
    if (el.corr) charts.heatmap(el.corr, corrRows, RADAR_AXES, (row, c) => pearson(colVals(row.col), colVals(c)), {
      color: corrColor, ink: (v) => (Math.abs(v) > 0.65 ? '#ffffff' : '#0b0b0b'), format: (v) => v.toFixed(2), tipNote: () => '(Pearson r)', label: 'Correlation matrix',
    })
    if (el.gaps) charts.hbars(el.gaps, itemStats.slice(0, 12).map((it) => ({ label: `${it.id} · ${it.title}`, value: it.mean, note: `${it.below} of 15 universities below level 2.5` })), { max: 4, labelW: 250, format: (v) => v.toFixed(1), color: (r) => `var(--viz-l${Math.round(r.value)})`, label: 'Most common gaps' })
    if (el.best) charts.hbars(el.best, [...itemStats].reverse().slice(0, 12).map((it) => ({ label: `${it.id} · ${it.title}`, value: it.mean, note: `${15 - it.below} of 15 universities at level 2.5 or above` })), { max: 4, labelW: 250, format: (v) => v.toFixed(1), color: (r) => `var(--viz-l${Math.round(r.value)})`, label: 'Strongest questions' })
    if (el.disc) charts.hbars(el.disc, deptAgg.map((d) => ({ label: `${d.label} (n=${d.n})`, value: d.value })), { max: 100, labelW: 270, color: (r) => `var(--viz-l${levelOf(r.value)})`, label: 'Benchmark by department discipline' })
    if (el.hours) charts.hbars(el.hours, [...unis].sort((a, b) => b.scores.metric.aiHours - a.scores.metric.aiHours).map((x) => ({ label: x.name, value: x.scores.metric.aiHours })), { unit: ' h', labelW: 170, color: (r, i) => 'var(--viz-s1)', label: 'AI teaching hours per year' })
    if (el.equip) charts.hbars(el.equip, [...unis].sort((a, b) => b.scores.metric.equipment - a.scores.metric.equipment).map((x) => ({ label: x.name, value: x.scores.metric.equipment })), { labelW: 170, format: (v) => v.toFixed(1), color: () => 'var(--viz-s1)', label: 'Digital and robotic equipment' })
    if (el.self) charts.scatter(el.self, unis.map((x) => ({ id: x.id, name: x.name, x: x.scores.benchmark, y: toIndex(x.scores.self.M13), level: x.level })), { onPick: pick, xLabel: 'Computed benchmark', yLabel: 'Self-rating (directors, 0–100)', quadrant: '', diagonal: true })
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
    if (el.diff) charts.diverging(el.diff, diffRows.value)
    if (el.ustack) charts.stacked100(el.ustack, [{ id: 'u', label: 'This university', counts: answerCounts(u.value) }, { id: 'g', label: 'All 15 universities', counts: unis.map(answerCounts).reduce((a, c) => a.map((v, i) => v + c[i]), [0, 0, 0, 0]) }])
    if (el.selfvs) charts.grouped(el.selfvs, selfVsComputed.value, ['Computed score', 'Self-rating by directors'], { label: 'Self-rating versus computed score' })
    if (el.topics) charts.hbars(el.topics, TOPICS.map((t) => ({ label: t.l, value: s.topic[t.v], note: `Average of 15: ${f1(group.topic[t.v])} h` })).sort((a, b) => b.value - a.value), { unit: ' h', labelW: 340, format: (v) => (v == null ? '—' : v.toFixed(1)), label: 'AI teaching hours per year by topic' })
    if (el.formats) charts.hbars(el.formats, FORMATS.map((t) => ({ label: t.l, value: s.format[t.v], note: `Average of 15: ${f1(group.format[t.v])} h` })), { unit: ' h', labelW: 340, format: (v) => (v == null ? '—' : v.toFixed(1)), label: 'AI teaching hours per year by format' })
    if (el.uequip) charts.hbars(el.uequip, EQUIP.map((t) => ({ label: t.l, value: s.equip[t.v], note: `Average of 15: ${f1(group.equip[t.v])}` })).sort((a, b) => b.value - a.value), { labelW: 340, format: (v) => (v == null ? '—' : v.toFixed(1)), label: 'Equipment available per course' })
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

      <section class="card insights">
        <h2>Key findings</h2>
        <ul><li v-for="(t, i) in insights" :key="i">{{ t }}</li></ul>
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
        <p class="muted">Each cell is a 0–100 index, from red (level 1, least mature) through yellow to green (level 4, most mature). Rows are sorted by benchmark.</p>
        <div :ref="(x) => (el.heat = x)" class="chart scroll-x"></div>
      </section>

      <section class="card">
        <h2>Distribution across the 15 universities</h2>
        <p class="muted">Boxplots: the box spans the middle half of the universities (25th to 75th percentile), the line inside is the median, the whiskers reach the lowest and highest values. Each dot is one university.</p>
        <div :ref="(x) => (el.box = x)" class="chart scroll-x"></div>
      </section>

      <section class="card">
        <h2>How the answers are spread</h2>
        <p class="muted">Share of all answers to the 1–4 questions at each level, for every course of each university. Click a row to open that university.</p>
        <div class="legend"><span v-for="l in [1, 2, 3, 4]" :key="l"><i :style="{ background: `var(--viz-l${l})` }"></i>{{ l }} · {{ LEVEL_NAMES[l - 1] }}</span></div>
        <div :ref="(x) => (el.stack = x)" class="chart"></div>
      </section>

      <section class="card">
        <h2>All {{ allCourses.length }} courses</h2>
        <p class="muted">Distribution of course benchmarks across every university: {{ courseLevels[3] }} courses at level 4, {{ courseLevels[2] }} at level 3, {{ courseLevels[1] }} at level 2 and {{ courseLevels[0] }} at level 1.</p>
        <div :ref="(x) => (el.hist = x)" class="chart"></div>
      </section>

      <section class="card">
        <h2>Heatmap by group of questions</h2>
        <p class="muted">Index for each part of the questionnaire, per university (red = level 1, green = level 4).</p>
        <div :ref="(x) => (el.partHeat = x)" class="chart scroll-x"></div>
      </section>

      <div class="two">
        <section class="card">
          <h2>Most common gaps</h2>
          <p class="muted">The 12 questions with the lowest average level across the 15 universities (scale 1–4).</p>
          <div :ref="(x) => (el.gaps = x)" class="chart"></div>
        </section>
        <section class="card">
          <h2>Most common strengths</h2>
          <p class="muted">The 12 questions with the highest average level across the 15 universities (scale 1–4).</p>
          <div :ref="(x) => (el.best = x)" class="chart"></div>
        </section>
      </div>

      <section class="card">
        <h2>Which areas move together</h2>
        <p class="muted">Correlation between areas and foundations across the 15 universities (Pearson r, −1 to 1). Green: when one is high the other tends to be high too.</p>
        <div :ref="(x) => (el.corr = x)" class="chart scroll-x"></div>
      </section>

      <section class="card">
        <h2>Benchmark by department discipline</h2>
        <p class="muted">Average benchmark of each kind of department across the universities where it took part (n = number of universities).</p>
        <div :ref="(x) => (el.disc = x)" class="chart"></div>
      </section>

      <div class="two">
        <section class="card">
          <h2>AI teaching hours</h2>
          <p class="muted">Hours per year of AI teaching, average per course.</p>
          <div :ref="(x) => (el.hours = x)" class="chart"></div>
        </section>
        <section class="card">
          <h2>Digital and robotic equipment</h2>
          <p class="muted">Units available, average per course (scanners, CBCT, printers, simulators, robots and others).</p>
          <div :ref="(x) => (el.equip = x)" class="chart"></div>
        </section>
      </div>

      <section class="card">
        <h2>Self-rating versus computed benchmark</h2>
        <p class="muted">Course directors' overall self-rating (item M13, converted to 0–100) against the computed benchmark. Above the dashed line, directors rate themselves higher than their answers show.</p>
        <div :ref="(x) => (el.self = x)" class="chart"></div>
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
                <td><span class="badge" :style="{ background: `var(--viz-l${x.level})`, color: charts.levelInk(x.level) }">{{ x.level }} · {{ LEVEL_NAMES[x.level - 1] }}</span></td>
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
        <h2>Above or below the average</h2>
        <p class="muted">Difference between this university and the average of the 15, for each area and foundation (green above, red below).</p>
        <div :ref="(x) => (el.diff = x)" class="chart"></div>
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
        <h2>How its answers are spread</h2>
        <p class="muted">Share of this university's answers to the 1–4 questions at each level, compared with all 15 universities.</p>
        <div :ref="(x) => (el.ustack = x)" class="chart"></div>
      </section>

      <section class="card">
        <h2>Self-rating versus computed score</h2>
        <p class="muted">What course directors think (self-rating, items M01–M04, M12, M13) against what their answers show, for health informatics as a whole and each area.</p>
        <div class="legend"><span><i style="background: var(--viz-s1)"></i>Computed score</span><span><i style="background: var(--viz-s2)"></i>Self-rating by directors</span></div>
        <div :ref="(x) => (el.selfvs = x)" class="chart"></div>
      </section>

      <section class="card">
        <h2>AI teaching</h2>
        <p class="muted">Hours per year of AI teaching, average per course: by topic (including programming and model development) and by format. Hover a bar to compare with the average of the 15.</p>
        <div :ref="(x) => (el.topics = x)" class="chart"></div>
        <h3 class="sub">By teaching format</h3>
        <div :ref="(x) => (el.formats = x)" class="chart"></div>
      </section>

      <section class="card">
        <h2>Equipment</h2>
        <p class="muted">Digital and robotic equipment available, average units per course.</p>
        <div :ref="(x) => (el.uequip = x)" class="chart"></div>
      </section>

      <section class="card">
        <h2>All courses</h2>
        <div class="table-scroll">
          <table class="stats">
            <thead><tr><th>Course</th><th>Department</th><th>Level</th><th>Benchmark</th><th>Funding readiness</th><th>Info systems</th><th>AI</th><th>Robotics</th><th>Bioinfo.</th><th>Software</th></tr></thead>
            <tbody>
              <tr v-for="c in courseRows" :key="c.code + c.dept">
                <td>{{ c.code }}</td><td>{{ c.dept }}</td>
                <td><span class="badge" :style="{ background: `var(--viz-l${levelOf(c.benchmark)})`, color: charts.levelInk(levelOf(c.benchmark)) }">{{ levelOf(c.benchmark) }}</span></td>
                <td>{{ f(c.benchmark) }}</td><td>{{ f(c.funding) }}</td><td>{{ f(c.area.HIS) }}</td><td>{{ f(c.area.AI) }}</td><td>{{ f(c.area.ROB) }}</td><td>{{ f(c.area.BIO) }}</td><td>{{ f(c.area.SWD) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>Peers at the same level</h2>
        <p class="muted">Universities at level {{ u.level }} ({{ LEVEL_NAMES[u.level - 1] }}), by benchmark.</p>
        <ul class="peers">
          <li v-for="x in peers" :key="x.id" :class="{ me: x.id === u.id }" @click="pick(x.id)">
            <span>{{ x.name }}</span><span class="mono">{{ f(x.scores.benchmark) }}</span>
          </li>
        </ul>
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
.insights ul { margin: 0; padding-left: 18px; }
.insights li { margin-bottom: 6px; line-height: 1.45; }
.two { display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 16px; }
.two .card { margin: 0 0 16px; min-width: 0; }
h3.sub { font-size: .95rem; margin: 16px 0 4px; }
.peers { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
.peers li { display: flex; justify-content: space-between; padding: 6px 10px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; }
.peers li.me { border-color: var(--accent); font-weight: 700; }
@media (max-width: 900px) { .two { grid-template-columns: 1fr; } }
.mono { font-family: ui-monospace, Menlo, monospace; font-size: .8rem; }
@media (max-width: 640px) { .one-grid { grid-template-columns: 1fr; } }
</style>
