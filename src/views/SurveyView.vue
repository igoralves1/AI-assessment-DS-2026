<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import QuestionField from '../components/QuestionField.vue'
import { SECTIONS } from '../questionnaire/questionnaire.js'
import { QUESTION_COLUMNS } from '../questionnaire/columns.js'
import { COUNTRIES } from '../questionnaire/countries.js'
import { storage } from '../storage/index.js'
import { session, setSession, clearSession } from '../session.js'

const router = useRouter()
const sections = SECTIONS.filter((s) => s.filledBy === 'respondent')
const intake = SECTIONS.find((s) => s.filledBy === 'team')

const step = ref(0) // 0..sections.length (last = review)
const answers = reactive({})
const saving = ref(false)
const savedAt = ref('')
const error = ref('')
const dirty = ref(false)

const record = computed(() => session.record || {})
const submitted = computed(() => record.value.status === 'submitted')
const country = computed(() => record.value.A01 || '')
const onReview = computed(() => step.value === sections.length)

const colsByQuestion = {}
for (const c of QUESTION_COLUMNS) (colsByQuestion[c.qid] ||= []).push(c.name)
const isAnswered = (q) => (colsByQuestion[q.id] || []).some((n) => {
  const v = answers[n]
  return v !== undefined && v !== '' && !(q.type === 'multi' && v === '0')
})
const progress = (s) => s.questions.filter(isAnswered).length
const totalAnswered = computed(() => sections.reduce((n, s) => n + progress(s), 0))
const totalQuestions = sections.reduce((n, s) => n + s.questions.length, 0)

const optionLabel = (qid, v) => intake.questions.find((q) => q.id === qid)?.options?.find((o) => String(o.v) === String(v))?.l || v
const profile = computed(() => [
  ['Country', COUNTRIES.find((c) => c.v === record.value.A01)?.l || record.value.A01],
  ['Institution', record.value.A03],
  ['Department', record.value.A06],
  ['Course', record.value.A07],
  ['Level', optionLabel('A08', record.value.A08)],
  ['Survey year', record.value.A15],
])

onMounted(() => {
  if (!session.code) return router.replace('/')
  for (const c of QUESTION_COLUMNS) if (record.value[c.name] !== undefined && record.value[c.name] !== '') answers[c.name] = record.value[c.name]
  window.addEventListener('beforeunload', warnUnsaved)
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', warnUnsaved))

function warnUnsaved(e) {
  if (dirty.value && !submitted.value) { e.preventDefault(); e.returnValue = '' }
}

async function save(submit = false) {
  if (submitted.value) return true
  saving.value = true
  error.value = ''
  try {
    const rec = await storage.save(session.code, { ...answers }, submit)
    setSession(session.code, rec)
    dirty.value = false
    savedAt.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return true
  } catch (e) {
    error.value = `Could not save: ${e.message}`
    return false
  } finally {
    saving.value = false
  }
}

async function go(to) {
  if (dirty.value && !(await save())) return
  step.value = to
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const confirming = ref(false)
async function submit() {
  confirming.value = false
  await save(true)
}

function exit() {
  clearSession()
  router.push('/')
}
</script>

<template>
  <section v-if="session.code" class="survey">
    <div class="profile card">
      <div class="profile-head">
        <div>
          <div class="eyebrow">Access code</div>
          <div class="code-chip">{{ session.code }}</div>
        </div>
        <button class="btn ghost" @click="exit">Exit</button>
      </div>
      <dl class="profile-grid">
        <template v-for="[k, v] in profile" :key="k"><dt>{{ k }}</dt><dd>{{ v || '—' }}</dd></template>
      </dl>
      <p class="hint">Answer every item only for this department/course. Your answers are saved each time you move between sections.</p>
    </div>

    <div v-if="submitted" class="card done">
      <h2>Thank you — your answers were submitted.</h2>
      <p>Submitted on {{ new Date(record.submitted_at).toLocaleString() }}. If you need to correct something, contact the research team and quote your code.</p>
    </div>

    <template v-else>
      <nav class="stepper" aria-label="Sections">
        <button v-for="(s, i) in sections" :key="s.id" class="step" :class="{ active: i === step, complete: progress(s) === s.questions.length }"
          @click="go(i)">
          <span class="step-id">{{ s.id }}</span>
          <span class="step-count">{{ progress(s) }}/{{ s.questions.length }}</span>
        </button>
        <button class="step" :class="{ active: onReview }" @click="go(sections.length)">
          <span class="step-id">✓</span><span class="step-count">Submit</span>
        </button>
      </nav>

      <div v-if="!onReview" class="card" @input="dirty = true" @change="dirty = true">
        <h2>{{ sections[step].title }}</h2>
        <p v-if="sections[step].intro" class="intro">{{ sections[step].intro }}</p>
        <QuestionField v-for="q in sections[step].questions" :key="q.id" :q="q" :answers="answers" :country="country" />
      </div>

      <div v-else class="card">
        <h2>Review and submit</h2>
        <p>You answered {{ totalAnswered }} of {{ totalQuestions }} items. Empty items are recorded as missing.</p>
        <ul class="review">
          <li v-for="(s, i) in sections" :key="s.id">
            <button class="linklike" @click="go(i)">{{ s.title }}</button>
            <span :class="progress(s) === s.questions.length ? 'ok' : 'warn'">{{ progress(s) }}/{{ s.questions.length }}</span>
          </li>
        </ul>
        <button v-if="!confirming" class="btn primary" :disabled="saving" @click="confirming = true">Submit answers</button>
        <div v-else class="confirm" role="alertdialog" aria-label="Confirm submission">
          <p><strong>Submit now?</strong> You cannot change your answers after submitting.
            <span v-if="totalAnswered < totalQuestions">{{ totalQuestions - totalAnswered }} item(s) are still empty.</span></p>
          <button class="btn primary" :disabled="saving" @click="submit">Yes, submit</button>
          <button class="btn ghost" @click="confirming = false">Cancel</button>
        </div>
      </div>

      <div class="actions">
        <button class="btn" :disabled="step === 0 || saving" @click="go(step - 1)">Back</button>
        <span class="status" aria-live="polite">
          <span v-if="saving">Saving…</span>
          <span v-else-if="error" class="error">{{ error }}</span>
          <span v-else-if="savedAt">Saved at {{ savedAt }}</span>
        </span>
        <button v-if="!onReview" class="btn primary" :disabled="saving" @click="go(step + 1)">Save and continue</button>
      </div>
    </template>
  </section>
</template>
