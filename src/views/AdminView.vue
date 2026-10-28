<script setup>
// Research-team page (open it at #/admin): fill Part A, issue an access code, follow progress, export CSV files.
import { ref, reactive, computed } from 'vue'
import QuestionField from '../components/QuestionField.vue'
import { SECTIONS } from '../questionnaire/questionnaire.js'
import { COUNTRIES } from '../questionnaire/countries.js'
import { storage, downloadText } from '../storage/index.js'

const intake = SECTIONS.find((s) => s.filledBy === 'team')
const token = ref('')
const authed = ref(storage.mode === 'local')
const error = ref('')
const busy = ref(false)
const answers = reactive({})
const issued = ref(null)
const codes = ref([])
const copied = ref(false)

const siteUrl = computed(() => window.location.href.split('#')[0])
const countryName = (v) => COUNTRIES.find((c) => c.v === v)?.l || v
const counts = computed(() => ({
  issued: codes.value.length,
  started: codes.value.filter((c) => c.status === 'in_progress').length,
  submitted: codes.value.filter((c) => c.status === 'submitted').length,
}))

async function login() {
  error.value = ''
  try {
    await storage.adminLogin(token.value)
    authed.value = true
    refresh()
  } catch (e) {
    error.value = e.message
  }
}

async function refresh() {
  try {
    codes.value = (await storage.listCodes()).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  } catch (e) {
    error.value = e.message
  }
}
if (authed.value) refresh()

async function issue() {
  error.value = ''
  const missing = intake.questions.filter((q) => q.required && !answers[q.id])
  if (missing.length) {
    error.value = `Please complete: ${missing.map((q) => q.id + ' ' + q.title).join(', ')}`
    return
  }
  busy.value = true
  try {
    const code = await storage.createCode({ ...answers })
    issued.value = { code, institution: answers.A03, department: answers.A06, name: answers.A10 }
    for (const k of Object.keys(answers)) delete answers[k]
    copied.value = false
    refresh()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

const invitation = computed(() => issued.value && [
  `Dear ${issued.value.name || 'colleague'},`,
  '',
  `Thank you for taking part in the 2026 study on AI readiness in dental education. Please answer the questionnaire for ${issued.value.department} (${issued.value.institution}).`,
  '',
  `1. Open ${siteUrl.value}`,
  `2. Enter your access code: ${issued.value.code}`,
  '',
  'Your answers are saved as you go, so you can stop and return later with the same code.',
].join('\n'))

async function copyInvite() {
  try { await navigator.clipboard.writeText(invitation.value); copied.value = true } catch { copied.value = false }
}

async function exportFile(kind) {
  try {
    const stamp = new Date().toISOString().slice(0, 10)
    if (kind === 'responses') downloadText(`responses_${stamp}.csv`, await storage.exportResponses())
    if (kind === 'access') downloadText(`access_codes_${stamp}.csv`, await storage.exportAccess())
    if (kind === 'codebook') downloadText('codebook.csv', await storage.exportCodebook())
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <section class="admin">
    <h1>Research team</h1>

    <form v-if="!authed" class="card narrow" @submit.prevent="login">
      <label class="field"><span>Admin token</span>
        <input class="input" type="password" v-model="token" autocomplete="current-password" />
      </label>
      <button class="btn primary">Sign in</button>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
    </form>

    <template v-else>
      <div v-if="issued" class="card issued">
        <div class="eyebrow">New access code</div>
        <div class="code-big">{{ issued.code }}</div>
        <p>{{ issued.department }} — {{ issued.institution }}</p>
        <pre class="invite">{{ invitation }}</pre>
        <button class="btn" @click="copyInvite">{{ copied ? 'Copied' : 'Copy invitation text' }}</button>
      </div>

      <div class="card">
        <h2>{{ intake.title }}</h2>
        <p class="intro">{{ intake.intro }}</p>
        <QuestionField v-for="q in intake.questions" :key="q.id" :q="q" :answers="answers" :country="answers.A01 || ''" />
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <button class="btn primary" :disabled="busy" @click="issue">{{ busy ? 'Saving…' : 'Save and generate code' }}</button>
      </div>

      <div class="card">
        <div class="row-between">
          <h2>Issued codes</h2>
          <button class="btn ghost" @click="refresh">Refresh</button>
        </div>
        <p>{{ counts.issued }} issued · {{ counts.started }} in progress · {{ counts.submitted }} submitted</p>
        <div class="table-scroll">
          <table class="codes">
            <thead><tr><th>Code</th><th>Status</th><th>Country</th><th>Institution</th><th>Department / course</th><th>Contact</th><th>Last saved</th></tr></thead>
            <tbody>
              <tr v-for="c in codes" :key="c.code">
                <td class="mono">{{ c.code }}</td>
                <td><span class="badge" :class="c.status">{{ c.status.replace('_', ' ') }}</span></td>
                <td>{{ countryName(c.country) }}</td>
                <td>{{ c.institution }}</td>
                <td>{{ c.department }}<br /><small>{{ c.course }}</small></td>
                <td>{{ c.contact }}</td>
                <td>{{ c.updated_at ? new Date(c.updated_at).toLocaleString() : '' }}</td>
              </tr>
              <tr v-if="!codes.length"><td colspan="7" class="muted">No codes issued yet.</td></tr>
            </tbody>
          </table>
        </div>
        <div class="export">
          <button class="btn" @click="exportFile('responses')">Download responses.csv</button>
          <button class="btn" @click="exportFile('codebook')">Download codebook.csv</button>
          <button class="btn" @click="exportFile('access')">Download access_codes.csv (private)</button>
        </div>
      </div>
    </template>
  </section>
</template>
