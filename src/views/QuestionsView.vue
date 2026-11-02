<script setup>
// Public page: every part and question of the survey, what it captures and how it is scored.
// Generated from the questionnaire definition, so it always matches the live form.
import { onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { SECTIONS, DOMAINS, DK, SURVEY_NAME, SURVEY_SUBTITLE, VERSION, MAIN_GOAL, KEY_QUESTIONS, HI_AREAS, FOUNDATIONS, HIERARCHY } from '../questionnaire/questionnaire.js'
import { CHECKLIST, CHECKLIST_COUNT, LEVELS } from '../questionnaire/checklist.js'
import { DOWNLOADS } from '../config.js'
import { PAHO_BOOKS } from '../questionnaire/inspiration.js'
import { DEMO_CODE } from '../lib/demo.js'
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
      <div class="demo-box" id="demo">
        <div class="eyebrow">Try the form</div>
        <p>Demonstration code: <span class="demo-code">{{ DEMO_CODE }}</span></p>
        <p><strong>This is only a demonstration code.</strong> It opens a sample course ("Demo University", Department of Oral Radiology) so anyone can see how the form works. Answers given with it stay in your own browser, are not saved for the study and are never analysed. It is not the research team's admin code, and it gives no access to the admin page. Real participants receive a personal code from the research team.</p>
        <router-link class="btn" :to="{ path: '/', query: { code: DEMO_CODE } }">Open the form with the demonstration code</router-link>
      </div>
      <div class="downloads" aria-label="Downloads">
        <span class="muted">Download:</span>
        <a v-for="d in DOWNLOADS" :key="d.file" :href="d.href" download>{{ d.label }}</a>
      </div>
    </header>

    <section class="card intro">
      <h2>The main idea</h2>
      <p class="main-q">{{ MAIN_GOAL }}</p>
      <h3>What the survey is for</h3>
      <ol class="kq">
        <li v-for="k in KEY_QUESTIONS" :key="k.label"><span class="kq-label">{{ k.label }}</span>{{ k.text }}</li>
      </ol>

      <h3>Health informatics is the umbrella</h3>
      <p>The benchmark measures <strong>health informatics in dentistry</strong>. Artificial intelligence, robotics, bioinformatics and software development for health are areas <em>inside</em> health informatics, together with its core: the health information systems of the clinic. Every area also depends on the same foundations.</p>
      <div class="umbrella">
        <div class="umb-top">Health informatics in dentistry <span>· benchmark score 0–100</span></div>
        <div class="umb-areas">
          <div v-for="a in HI_AREAS" :key="a.key" class="umb-area"><b>{{ a.l }}</b><span>{{ a.d }}</span></div>
        </div>
        <div class="umb-base"><b>{{ FOUNDATIONS.l }}:</b> {{ FOUNDATIONS.d }}</div>
      </div>
      <p>For each school the reader gets a complete, clear picture: what it has (computers, software, AI tools, data, laboratories, digital and robotic equipment), who can do the work (faculty, researchers, technical staff, training, partners), what students learn and for how many hours, how technology is governed, and whether projects last.</p>

      <h3>Who answers: the head of each course</h3>
      <p>A dental school is organised as <strong>university → departments → courses</strong>. The person who knows a course best is its director, so each course director answers one form for their course. Department scores are built from their courses, and the university score from its departments. A school's benchmark is therefore grounded in what is actually taught and used, course by course.</p>
      <table class="units">
        <thead><tr><th>Level</th><th>How its score is obtained</th></tr></thead>
        <tbody><tr v-for="h in HIERARCHY" :key="h.level"><td>{{ h.level }}</td><td>{{ h.how }}</td></tr></tbody>
      </table>
      <p class="muted">Some items ask about resources or rules the department or school provides (computers, clinic records, policies). Course directors answer for what their course can use or must follow; "Don't know" is always allowed.</p>

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
      <p>AI is already reading radiographs, digital workflows are replacing analogue ones, and students use generative AI every day. Schools are investing at very different speeds, and there is no shared number that says how ready each school is. A benchmark repeated every year gives deans, faculty and funders evidence to plan and invest, and shows progress over time.</p>
      <h3>Comparable beyond the United States</h3>
      <p>The survey starts with US dental schools. Its core items are the same everywhere: US schools see the matching US references (CODA, ADA, HIPAA, FDA), and universities in other countries can answer the same items. Because every score uses the same 0–100 scale, the US benchmark can be compared with schools abroad.</p>
      <h3>A checklist for improvement</h3>
      <p>The same questions also work as a guide for decision makers: deans, department chairs and course directors. Each 1–4 item describes what level 4 ("established") looks like, so the <a href="#checklist" @click.prevent="goTo('checklist')">maturity checklist</a> shows what each course or department is missing to reach the level of maturity it wants, and which steps come next.</p>
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
        <li><strong>Benchmark.</strong> Each course gets a 0–100 index per domain; the benchmark is the mean of the domain indices. Course → department (mean) → university (weighted by the number of courses) → state, national and country summaries.</li>
        <li><strong>Readiness to use new funding.</strong> The mean of the five foundation domains (infrastructure, data, people, governance, implementation) shows which schools are most likely to use a grant well.</li>
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
      <p>Use this list after answering, or before planning. Each point comes from a 1–4 item of the survey. <strong>Target</strong> is level 4 (established); <strong>next step</strong> is level 3 (developing). Tick what is already true for your course, department or school. Ticks stay on this page only and are not saved.</p>
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
.books { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin: 12px 0 6px; }
.book { min-width: 0; overflow-wrap: anywhere; display: flex; flex-direction: column; gap: 4px; text-decoration: none; color: inherit; background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 10px; }
.book:hover { border-color: var(--accent); }
.book img { width: 100%; height: auto; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,.18); margin-bottom: 6px; }
.book-title { font-weight: 700; font-size: .86rem; line-height: 1.3; color: var(--accent); }
.book-meta { font-size: .76rem; }
.book-role { font-size: .8rem; line-height: 1.4; }
.small-print { font-size: .78rem; }
@media (max-width: 720px) { .books { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 480px) { .books { grid-template-columns: minmax(0, 1fr); } .book img { max-width: 180px; } }
.kq { padding-left: 0; list-style: none; margin: 6px 0 4px; }
.kq li { padding: 8px 12px; border-radius: 8px; background: var(--bg); margin-bottom: 6px; }
.kq-label { display: block; font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--accent); }
.umbrella { border: 2px solid var(--accent); border-radius: 12px; padding: 12px; margin: 10px 0 12px; }
.umb-top { background: var(--accent); color: #fff; font-weight: 700; border-radius: 8px; padding: 8px 12px; }
.umb-top span { font-weight: 400; opacity: .85; }
.umb-areas { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; margin: 10px 0; }
.umb-area { background: var(--accent-soft); border-radius: 8px; padding: 8px 10px; font-size: .85rem; display: flex; flex-direction: column; gap: 2px; }
.umb-area b { color: var(--accent); }
.umb-base { background: var(--bg); border-radius: 8px; padding: 8px 12px; font-size: .88rem; }
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
