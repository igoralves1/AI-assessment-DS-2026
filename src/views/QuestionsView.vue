<script setup>
// Public page: every part and question of the survey, what it captures and how it is scored.
// Generated from the questionnaire definition, so it always matches the live form.
import { SECTIONS, DOMAINS, DK, SURVEY_NAME, SURVEY_SUBTITLE, VERSION } from '../questionnaire/questionnaire.js'
import { QUESTION_COLUMNS } from '../questionnaire/columns.js'
import { COUNTRY_CONTEXT } from '../questionnaire/countries.js'
import { REFERENCE_GROUPS } from '../questionnaire/references.js'

const refCount = REFERENCE_GROUPS.reduce((n, g) => n + g.items.length, 0)
const host = (url) => new URL(url).hostname.replace(/^www\./, '')

const colCount = QUESTION_COLUMNS.filter((c) => !c.pii).length
const itemCount = SECTIONS.reduce((n, s) => n + s.questions.length, 0)
const domainsOf = (s) => [...new Set(s.questions.map((q) => q.domain).filter(Boolean))]

function format(q) {
  switch (q.type) {
    case 'scale': return q.noDK ? 'Rating scale 1–4' : 'Maturity scale 1–4, plus "Don\'t know / Not applicable"'
    case 'single': return 'Single choice'
    case 'multi': return q.max ? `Multiple choice (up to ${q.max})` : 'Multiple choice (all that apply)'
    case 'number': return `Number${q.unit ? ` (${q.unit})` : ''}`
    case 'text': return 'Short text'
    case 'textarea': return 'Open text'
    case 'repeat': return `Table with up to ${q.count} rows: ${q.fields.map((f) => f.l.toLowerCase()).join(', ')}`
    case 'grid': return 'Checklist: Yes / Partial / No / Don\'t know for each row'
    case 'hours': return `A number for each row (${q.unit})`
    default: return q.type
  }
}

function scoring(q) {
  if (q.pii) return 'Personal data: stored in a separate private file, never analysed.'
  if (q.type === 'scale' && q.domain) return `Scored 1–4 in the "${DOMAINS[q.domain]}" domain index ("Don't know" = missing).`
  if (q.type === 'grid') return 'Scored Yes = 2, Partial = 1, No = 0, summed into a 0–100 index.'
  if (q.type === 'hours' && q.unit.startsWith('hours')) return 'Multiplied by terms per year (B05) to give hours per year.'
  if (q.type === 'hours') return 'Counted per unit; divided by enrollment (B01) to give students per unit.'
  if (q.type === 'scale') return 'Reported descriptively; not part of the computed domain indices.'
  return 'Reported descriptively (frequencies, medians) and used to group or explain the scores.'
}

const optionsOf = (q) => (q.type === 'scale' && !q.noDK ? [...q.options, { v: DK, l: "Don't know / Not applicable" }] : q.options || [])
const ctxKeys = { privacy: 'privacy law', accreditation: 'curriculum / accreditation body', professional: 'professional and regulatory bodies', calendarNote: 'academic calendar' }
const printPage = () => window.print()
const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
const countryExamples = (key) => Object.values(COUNTRY_CONTEXT).map((c) => `${c.name}: ${c[key]}`)
</script>

<template>
  <article class="questions">
    <header class="q-hero">
      <div class="eyebrow">Questionnaire guide · version {{ VERSION }}</div>
      <h1>{{ SURVEY_NAME }}</h1>
      <p class="lead">{{ SURVEY_SUBTITLE }}: every question, what it is designed to capture, and how answers are used.</p>
      <div class="q-actions">
        <router-link class="btn primary" to="/">I have an access code</router-link>
        <button class="btn" @click="printPage">Print this guide</button>
      </div>
    </header>

    <section class="card">
      <h2>What the survey is for</h2>
      <p>The survey gives a comprehensive picture of how mature each dental school department and course is in four technology domains: <strong>artificial intelligence</strong>, <strong>health informatics</strong>, <strong>robotics and digital dentistry</strong>, and <strong>bioinformatics</strong>. It pictures the current <strong>physical resources</strong> (computers, equipment, laboratories, data) and <strong>human resources</strong> (trained faculty, technical staff, partners), as well as teaching hours, governance and sustainability.</p>
      <p>It is answered <strong>every year</strong>. Each annual wave maps the state of the art across universities and courses, and comparing waves shows how each department develops over time. Results are consolidated from course to department, school and country.</p>
      <dl class="facts">
        <div><dt>Parts</dt><dd>{{ SECTIONS.length }}</dd></div>
        <div><dt>Questions</dt><dd>{{ itemCount }}</dd></div>
        <div><dt>Data columns</dt><dd>{{ colCount }}</dd></div>
        <div><dt>Scored domains</dt><dd>{{ Object.keys(DOMAINS).length }}</dd></div>
      </dl>
    </section>

    <section class="card">
      <h2>How to read the answers</h2>
      <ul class="plain">
        <li><strong>Maturity scale 1–4.</strong> 1 = absent, 2 = initial, 3 = developing, 4 = established, adapted from the PAHO/WHO AI readiness toolkit. "Don't know" is treated as missing, never as zero.</li>
        <li><strong>Domain index 0–100.</strong> The 1–4 items of a domain are averaged and converted: (mean − 1) ÷ 3 × 100.</li>
        <li><strong>Checklists.</strong> Yes = 2, Partial = 1, No = 0, expressed as a percentage of the maximum (PAHO AI-GUARD).</li>
        <li><strong>Hours and counts.</strong> Hours per term × terms per year = hours per year. Equipment counts are divided by enrollment.</li>
        <li><strong>Consolidation.</strong> Course → department (mean) → school (weighted by the number of courses) → country.</li>
        <li><strong>Country adaptation.</strong> Some items show the laws, regulators and degree names of the respondent's country (Canada, USA, Brazil, China, India).</li>
      </ul>
    </section>

    <nav class="card toc" aria-label="Parts of the survey">
      <h2>Parts of the survey</h2>
      <table>
        <thead><tr><th>Part</th><th>Topic</th><th>Questions</th><th>Answered by</th></tr></thead>
        <tbody>
          <tr v-for="s in SECTIONS" :key="s.id">
            <td class="mono">{{ s.id }}</td>
            <td><a :href="'#part-' + s.id" @click.prevent="goTo('part-' + s.id)">{{ s.title.replace(/^Part [A-Z]\. /, '') }}</a></td>
            <td>{{ s.questions.length }}</td>
            <td>{{ s.filledBy === 'team' ? 'Research team' : 'Respondent' }}</td>
          </tr>
          <tr>
            <td class="mono">—</td>
            <td><a href="#references" @click.prevent="goTo('references')">References</a></td>
            <td>{{ refCount }}</td>
            <td>Sources</td>
          </tr>
        </tbody>
      </table>
      <h3>Scored domains</h3>
      <div class="chips"><span v-for="(name, key) in DOMAINS" :key="key"><b>{{ key }}</b> {{ name }}</span></div>
    </nav>

    <section v-for="s in SECTIONS" :id="'part-' + s.id" :key="s.id" class="card part">
      <h2>{{ s.title }}</h2>
      <p class="purpose"><strong>What this part captures.</strong> {{ s.purpose }}</p>
      <p v-if="s.intro" class="muted">{{ s.intro }}</p>
      <div v-if="domainsOf(s).length" class="chips small"><span v-for="d in domainsOf(s)" :key="d"><b>{{ d }}</b> {{ DOMAINS[d] }}</span></div>

      <div v-for="q in s.questions" :key="q.id" class="q-item">
        <div class="q-head">
          <span class="qid">{{ q.id }}</span>
          <div>
            <h3>{{ q.title }}</h3>
            <p class="q-text">{{ q.text }}</p>
          </div>
        </div>
        <dl class="q-meta">
          <dt>Captures</dt><dd>{{ q.captures }}</dd>
          <dt>Answer</dt><dd>{{ format(q) }}</dd>
          <dt>Use</dt><dd>{{ scoring(q) }}</dd>
          <template v-if="q.countryHint"><dt>Country</dt><dd>Shown with the {{ ctxKeys[q.countryHint] }} of each country, e.g. {{ countryExamples(q.countryHint).slice(0, 2).join('; ') }}.</dd></template>
          <template v-if="q.countryFiltered"><dt>Country</dt><dd>The list adapts to the respondent's country; international documents are always shown.</dd></template>
        </dl>
        <details v-if="optionsOf(q).length || q.rows || q.fields" :open="q.type === 'scale'">
          <summary>{{ q.type === 'scale' ? 'Scale anchors' : q.rows ? 'Rows' : q.fields ? 'Table columns' : 'Answer options' }}</summary>
          <ol v-if="q.type === 'scale'" class="anchors">
            <li v-for="o in optionsOf(q)" :key="o.v"><span class="lvl">{{ o.v === DK ? '–' : o.v }}</span>{{ o.l }}</li>
          </ol>
          <ul v-else-if="q.rows" class="opts"><li v-for="r in q.rows" :key="r.v">{{ r.l }}</li></ul>
          <ul v-else-if="q.fields" class="opts">
            <li v-for="f in q.fields" :key="f.id">{{ f.l }}<span v-if="f.options" class="muted"> — {{ f.options.map((o) => o.l).join('; ') }}</span></li>
          </ul>
          <ul v-else class="opts">
            <li v-for="o in optionsOf(q)" :key="o.v">{{ o.l }}<span v-if="o.countries" class="muted"> ({{ o.countries.join(', ') }})</span></li>
            <li v-if="q.other" class="muted">Other (free text)</li>
          </ul>
        </details>
      </div>
    </section>

    <section id="references" class="card refs">
      <h2>References</h2>
      <p class="muted">Documents, organizations, universities and studies on technology in dentistry and public health that informed this survey. Open an item to read a short summary. Links were checked on 28 October 2026.</p>
      <nav class="ref-toc" aria-label="Reference groups">
        <a v-for="g in REFERENCE_GROUPS" :key="g.id" :href="'#ref-' + g.id" @click.prevent="goTo('ref-' + g.id)">{{ g.title }}</a>
      </nav>
      <div v-for="g in REFERENCE_GROUPS" :id="'ref-' + g.id" :key="g.id" class="ref-group">
        <h3>{{ g.title }}</h3>
        <p v-if="g.note" class="muted">{{ g.note }}</p>
        <details v-for="r in g.items" :key="r.url" class="ref">
          <summary>
            <span class="ref-title">{{ r.title }}</span>
            <span class="ref-meta">{{ r.source }}<template v-if="r.year"> · {{ r.year }}</template><template v-if="r.code"> · {{ r.code }}</template></span>
          </summary>
          <p>{{ r.summary }}</p>
          <p class="ref-links">
            <a :href="r.url" target="_blank" rel="noopener">Open source ({{ host(r.url) }}) ↗</a>
            <a v-for="l in r.links || []" :key="l.url" :href="l.url" target="_blank" rel="noopener">{{ l.label }} ↗</a>
          </p>
        </details>
      </div>
    </section>
  </article>
</template>

<style scoped>
.questions { max-width: 860px; margin: 0 auto; }
.q-hero { padding: 8px 0 20px; }
.q-hero .lead { color: var(--muted); font-size: 1.1rem; }
.q-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
.q-actions .btn { text-decoration: none; }
.facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 12px 0 0; }
.facts div { background: var(--accent-soft); border-radius: 8px; padding: 10px; }
.facts dt { font-size: .75rem; color: var(--muted); }
.facts dd { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--accent); }
.plain { padding-left: 18px; margin: 0; }
.plain li { margin-bottom: 8px; }
.toc table td a { color: var(--accent); }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.chips span { font-size: .85rem; background: var(--accent-soft); border-radius: 6px; padding: 3px 8px; }
.chips.small span { font-size: .78rem; }
.part h2 { color: var(--accent); }
.purpose { background: var(--bg); border-left: 3px solid var(--accent); padding: 10px 12px; border-radius: 0 8px 8px 0; }
.q-item { border-top: 1px solid var(--border); padding: 16px 0 10px; }
.q-head { display: flex; gap: 10px; }
.q-head h3 { font-size: 1rem; margin: 0; }
.q-text { margin: 2px 0 8px; }
.q-meta { display: grid; grid-template-columns: 80px 1fr; gap: 4px 12px; margin: 0 0 6px 44px; font-size: .9rem; }
.q-meta dt { color: var(--muted); font-weight: 600; }
.q-meta dd { margin: 0; }
details { margin-left: 44px; font-size: .9rem; }
summary { cursor: pointer; color: var(--accent); font-weight: 600; padding: 4px 0; }
.anchors { list-style: none; padding: 0; margin: 4px 0; }
.anchors li { display: flex; gap: 8px; padding: 2px 0; }
.lvl { font-weight: 700; color: var(--accent); min-width: 1.2em; }
.opts { margin: 4px 0; padding-left: 18px; }
.refs h3 { margin: 22px 0 6px; color: var(--accent); }
.ref-toc { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 4px; }
.ref-toc a { font-size: .85rem; background: var(--accent-soft); color: var(--text); text-decoration: none; border-radius: 6px; padding: 4px 10px; }
details.ref { margin: 0; border-top: 1px solid var(--border); padding: 4px 0; }
details.ref summary { display: flex; flex-direction: column; gap: 2px; padding: 8px 0; color: var(--text); font-weight: 400; list-style: none; }
details.ref summary::-webkit-details-marker { display: none; }
.ref-title { font-weight: 600; }
.ref-title::before { content: '▸ '; color: var(--accent); }
details.ref[open] .ref-title::before { content: '▾ '; }
.ref-meta { font-size: .82rem; color: var(--muted); padding-left: 1.1em; }
details.ref > p { margin: 4px 0 8px 1.1em; }
.ref-links { display: flex; flex-wrap: wrap; gap: 14px; font-size: .88rem; }
.ref-links a { color: var(--accent); }
@media (max-width: 600px) {
  .facts { grid-template-columns: repeat(2, 1fr); }
  .q-meta, details { margin-left: 0; }
  .q-meta { grid-template-columns: 1fr; }
  .q-meta dt { margin-top: 4px; }
}
@media print {
  .q-actions, .topbar, .demo-banner, .footer { display: none; }
  details { display: block; }
  details.ref > p { display: block; }
  .card { break-inside: auto; border: 0; }
}
</style>
