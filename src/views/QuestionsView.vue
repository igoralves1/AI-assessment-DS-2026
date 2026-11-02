<script setup>
// Public page: every part and question of the survey, what it captures and how it is scored.
// Generated from the questionnaire definition, so it always matches the live form.
import { onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { SECTIONS, DOMAINS, DK, SURVEY_NAME, SURVEY_SUBTITLE, VERSION, MAIN_QUESTION, UNITS } from '../questionnaire/questionnaire.js'
import { CHECKLIST, CHECKLIST_COUNT, LEVELS } from '../questionnaire/checklist.js'
import { DOWNLOADS } from '../config.js'
import { PAHO_BOOKS } from '../questionnaire/inspiration.js'
const coverSrc = (key) => import.meta.env.BASE_URL + 'covers/' + key + '.jpg'
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
const route = useRoute()
onMounted(async () => { if (route.query.go) { await nextTick(); goTo(String(route.query.go)) } })
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
      <div class="downloads" aria-label="Downloads">
        <span class="muted">Download:</span>
        <a v-for="d in DOWNLOADS" :key="d.file" :href="d.href" download>{{ d.label }}</a>
      </div>
    </header>

    <section class="card intro">
      <h2>The main idea</h2>
      <p class="main-q">{{ MAIN_QUESTION }}</p>
      <p>To answer it, the survey maps the state of the art of maturity in four fields of innovation in dental education: <strong>artificial intelligence</strong>, <strong>health informatics</strong>, <strong>robotics and digital dentistry</strong>, and <strong>bioinformatics</strong>. A form can describe a <strong>whole dental school</strong>, <strong>one department</strong> or <strong>one course</strong> taught in a department. For each unit the reader gets a complete, clear picture of five things:</p>
      <ul class="plain five">
        <li><strong>What it has:</strong> computers, software, AI tools, data, laboratories and digital or robotic equipment.</li>
        <li><strong>Who can do the work:</strong> faculty able to teach, researchers, technical staff, training and partners.</li>
        <li><strong>What students learn:</strong> topics and hours per year, from AI basics to programming and model development.</li>
        <li><strong>How it is governed:</strong> plans, ethics, bias, privacy, generative-AI rules and safeguards for AI tools.</li>
        <li><strong>Whether it lasts:</strong> pilots that become routine, evaluation, funding and collaboration.</li>
      </ul>
      <h3>Where the idea comes from</h3>
      <p>The survey was inspired by four publications of the Pan American Health Organization (PAHO), the World Health Organization's office for the Americas. The first is a questionnaire that measures how ready public health institutions are to use artificial intelligence. This survey adapts it to dental schools and extends it to health informatics, robotics and bioinformatics. The other three shape the items on governance, bias and generative AI.</p>
      <div class="books">
        <a v-for="b in PAHO_BOOKS" :key="b.key" class="book" :href="b.url" target="_blank" rel="noopener">
          <img :src="coverSrc(b.key)" :alt="'Cover of ' + b.title" loading="lazy" width="331" height="468" />
          <span class="book-title">{{ b.title }}</span>
          <span class="muted book-meta">{{ b.publisher }} · {{ b.year }} · paho.org ↗</span>
          <span class="book-role">{{ b.role }}</span>
        </a>
      </div>
      <p class="muted small-print">Cover images belong to PAHO and are shown only to identify the publications. Each card opens the publication on PAHO's website or in IRIS, PAHO's official repository.</p>
      <h3>Why it matters now</h3>
      <p>AI is already reading radiographs, digital workflows are replacing analogue ones, and students use generative AI every day. Schools are investing at very different speeds, and there is no shared measure of who is ready, where the gaps are, or what to do next. A common, repeated measurement gives deans and faculty evidence to plan, lets schools learn from the best prepared, and shows progress from year to year.</p>
      <h3>Comparable across countries</h3>
      <p>The survey starts with US dental schools. Its core items are the same everywhere: US schools see the matching US references (CODA, ADA, HIPAA, FDA), and schools in other countries answer the same items. All scores use the same 0–100 scale, so a US school can be compared with schools abroad.</p>
      <h3>Who answers</h3>
      <table class="units">
        <thead><tr><th>Unit described</th><th>Who answers</th></tr></thead>
        <tbody><tr v-for="u in UNITS" :key="u.v"><td>{{ u.l }}</td><td>{{ u.who }}</td></tr></tbody>
      </table>
      <p class="muted">A school can send one school-wide form and as many department and course forms as it wishes. The research team completes Part A with each respondent and issues a personal access code.</p>
      <h3>What the reader gets</h3>
      <ul class="plain">
        <li>A <strong>ranking of schools</strong> with a 0–100 maturity index overall and for each of ten domains.</li>
        <li>The <strong>detail behind each score</strong>: departments, named courses, teaching hours and equipment.</li>
        <li>The <strong>main gaps and barriers</strong>, and the schools that can serve as models.</li>
        <li><strong>Progress over time</strong>, because the survey is repeated every year.</li>
        <li>A <strong>comparison</strong> between states and with schools in other countries.</li>
      </ul>
      <h3>A checklist for improvement</h3>
      <p>The same items also work as a guide. Each 1–4 item describes what level 4 ("established") looks like, so a school can use the <a href="#checklist" @click.prevent="goTo('checklist')">maturity checklist</a> to see where it stands and which steps lead to the level it wants to reach.</p>
      <dl class="facts">
        <div><dt>Parts</dt><dd>{{ SECTIONS.length }}</dd></div>
        <div><dt>Questions</dt><dd>{{ itemCount }}</dd></div>
        <div><dt>Checklist points</dt><dd>{{ CHECKLIST_COUNT }}</dd></div>
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
        <li><strong>Consolidation.</strong> Course forms → department (mean) → school (weighted by the number of courses). A school-wide form is combined with this picture to rank schools, then results are compared by state, nationally and across countries.</li>
        <li><strong>US references.</strong> Some items show the matching US law or body: HIPAA and FERPA, CODA, the ADA, ADEA and state dental boards.</li>
      </ul>
    </section>

    <nav class="card toc" aria-label="Parts of the survey">
      <h2>Parts of the survey</h2>
      <table>
        <thead><tr><th>Part</th><th>Topic</th><th>Questions</th><th>Answered by</th></tr></thead>
        <tbody>
          <tr v-for="s in SECTIONS" :key="s.id">
            <td class="mono">{{ s.id }}</td>
            <td><a :href="'#part-' + s.id" @click.prevent="goTo('part-' + s.id)">{{ s.title.replace(/^Part [A-Z]\. /, '') }}</a><div class="goal-small">{{ s.goal }}</div></td>
            <td>{{ s.questions.length }}</td>
            <td>{{ s.filledBy === 'team' ? 'Research team' : 'Respondent' }}</td>
          </tr>
          <tr>
            <td class="mono">—</td>
            <td><a href="#checklist" @click.prevent="goTo('checklist')">Maturity checklist</a></td>
            <td>{{ CHECKLIST_COUNT }}</td>
            <td>Schools</td>
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
      <p class="goal"><strong>Goal.</strong> {{ s.goal }}</p>
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
          <template v-if="q.countryHint"><dt>US reference</dt><dd>Shown with the {{ ctxKeys[q.countryHint] }}: {{ COUNTRY_CONTEXT.US[q.countryHint] }}.</dd></template>
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
            <li v-for="o in optionsOf(q)" :key="o.v">{{ o.l }}</li>
            <li v-if="q.other" class="muted">Other (free text)</li>
          </ul>
        </details>
      </div>
    </section>

    <section id="checklist" class="card checklist">
      <h2>Maturity checklist</h2>
      <p>Use this list after answering, or before planning. Each point comes from a 1–4 item of the survey. <strong>Target</strong> is level 4 (established); <strong>next step</strong> is level 3 (developing). Tick what is already true for your school, department or course. Ticks stay on this page only and are not saved.</p>
      <ol class="levels"><li v-for="l in LEVELS" :key="l.v"><b>{{ l.v }} · {{ l.l }}</b> {{ l.d }}</li></ol>
      <details v-for="g in CHECKLIST" :key="g.id" class="ck-group">
        <summary><span class="mono">{{ g.id }}</span> {{ g.title }} <span class="muted">· {{ g.items.length }} points</span></summary>
        <p class="goal"><strong>Goal.</strong> {{ g.goal }}</p>
        <ul class="ck">
          <li v-for="it in g.items" :key="it.id">
            <label><input type="checkbox" /> <span><strong>{{ it.title }}</strong> <span class="mono muted">{{ it.id }}</span><br />
              <span class="target">Target: {{ it.target }}</span><br />
              <span class="muted">Next step: {{ it.next }}</span></span></label>
          </li>
        </ul>
      </details>
    </section>

    <section id="references" class="card refs">
      <h2>References</h2>
      <p class="muted">US standards and research bodies, US dental schools, studies, and the public health frameworks that informed this survey. Open an item to read a short summary. Links were checked on 28 October and 2 November 2026.</p>
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
.main-q { font-size: 1.2rem; font-weight: 700; color: var(--accent); line-height: 1.4; margin: 4px 0 14px; }
.intro h3 { margin: 18px 0 6px; font-size: 1.02rem; }
.five li { margin-bottom: 6px; }
.units { width: 100%; border-collapse: collapse; font-size: .92rem; }
.units th, .units td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--border); vertical-align: top; }
.downloads { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; margin-top: 12px; font-size: .92rem; }
.downloads a { color: var(--accent); font-weight: 600; }
.books { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 12px 0 6px; }
.book { display: flex; flex-direction: column; gap: 4px; text-decoration: none; color: inherit; background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 10px; }
.book:hover { border-color: var(--accent); }
.book img { width: 100%; height: auto; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,.18); margin-bottom: 6px; }
.book-title { font-weight: 700; font-size: .86rem; line-height: 1.3; color: var(--accent); }
.book-meta { font-size: .76rem; }
.book-role { font-size: .8rem; line-height: 1.4; }
.small-print { font-size: .78rem; }
@media (max-width: 720px) { .books { grid-template-columns: repeat(2, 1fr); } }
.goal-small { font-size: .8rem; color: var(--muted); margin-top: 2px; }
.goal { margin: 6px 0; }
.levels { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 8px; margin: 10px 0 14px; font-size: .88rem; }
.levels li { background: var(--accent-soft); border-radius: 8px; padding: 8px 10px; }
.levels b { display: block; color: var(--accent); }
.ck-group { margin: 0 0 8px; border: 1px solid var(--border); border-radius: 8px; padding: 6px 12px; }
.ck { list-style: none; padding: 0; margin: 6px 0; }
.ck li { padding: 8px 0; border-top: 1px solid var(--border); font-size: .92rem; }
.ck label { display: flex; gap: 10px; align-items: flex-start; cursor: pointer; }
.ck input { margin-top: 4px; }
.target { color: var(--accent); }
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
