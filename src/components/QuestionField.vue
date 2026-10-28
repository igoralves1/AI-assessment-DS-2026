<script setup>
// Renders one questionnaire item of any type. Answers are a flat { column: string } object.
import { computed } from 'vue'
import { COUNTRY_CONTEXT } from '../questionnaire/countries.js'
import { DK } from '../questionnaire/questionnaire.js'

const props = defineProps({
  q: { type: Object, required: true },
  answers: { type: Object, required: true },
  country: { type: String, default: '' },
  readonly: { type: Boolean, default: false },
})

const HINT_LABELS = {
  privacy: 'Relevant law',
  accreditation: 'Curriculum / accreditation body',
  professional: 'Professional and regulatory bodies',
  calendarNote: 'Note',
}

const hint = computed(() => {
  const ctx = COUNTRY_CONTEXT[props.country]
  if (!ctx || !props.q.countryHint) return ''
  return `${HINT_LABELS[props.q.countryHint]} in ${ctx.name}: ${ctx[props.q.countryHint]}`
})

const scaleOptions = computed(() =>
  props.q.noDK ? props.q.options : [...props.q.options, { v: DK, l: "Don't know / Not applicable" }],
)

const multiOptions = computed(() =>
  props.q.countryFiltered && props.country
    ? props.q.options.filter((o) => !o.countries || o.countries.includes(props.country))
    : props.q.options,
)

const multiCol = (v) => `${props.q.id}__${v}`
const selectedCount = computed(() => multiOptions.value.filter((o) => props.answers[multiCol(o.v)] === '1').length)

function toggleMulti(o, checked) {
  const a = props.answers
  // Fill every option with 0/1 once the item is touched, so "not selected" differs from "not answered".
  for (const opt of props.q.options) if (a[multiCol(opt.v)] !== '1') a[multiCol(opt.v)] = '0'
  if (checked && o.exclusive) for (const opt of props.q.options) a[multiCol(opt.v)] = '0'
  if (checked && !o.exclusive) for (const opt of props.q.options) if (opt.exclusive) a[multiCol(opt.v)] = '0'
  a[multiCol(o.v)] = checked ? '1' : '0'
}

const atMax = (o) => props.q.type === 'multi' && props.q.max && selectedCount.value >= props.q.max && props.answers[multiCol(o.v)] !== '1'
const name = (suffix = '') => `${props.q.id}${suffix}`
</script>

<template>
  <fieldset class="question" :class="'t-' + q.type" :disabled="readonly">
    <legend>
      <span class="qid">{{ q.id }}</span>
      <span class="qtext">{{ q.text }}<span v-if="q.required" class="req" title="Required"> *</span></span>
    </legend>
    <p v-if="hint" class="hint">{{ hint }}</p>
    <p v-if="q.type === 'multi' && q.max" class="hint">Select up to {{ q.max }}.</p>

    <!-- 1–4 maturity scale and single choice -->
    <div v-if="q.type === 'scale' || q.type === 'single'" class="options">
      <label v-for="o in (q.type === 'scale' ? scaleOptions : q.options)" :key="o.v" class="option" :class="{ dk: o.v === DK }">
        <input type="radio" :name="name()" :value="String(o.v)" v-model="answers[q.id]" />
        <span v-if="q.type === 'scale' && o.v !== DK" class="level">{{ o.v }}</span>
        <span>{{ o.l }}</span>
      </label>
      <input v-if="q.other && answers[q.id] === '99'" class="input other" type="text" placeholder="Please specify" v-model="answers[q.id + '_other']" />
    </div>

    <!-- multiple choice -->
    <div v-else-if="q.type === 'multi'" class="options">
      <label v-for="o in multiOptions" :key="o.v" class="option">
        <input type="checkbox" :checked="answers[multiCol(o.v)] === '1'" :disabled="atMax(o)"
          @change="toggleMulti(o, $event.target.checked)" />
        <span>{{ o.l }}</span>
      </label>
      <input v-if="q.other" class="input other" type="text" placeholder="Other (please specify)" v-model="answers[q.id + '_other']" />
    </div>

    <!-- numbers and text -->
    <div v-else-if="q.type === 'number'" class="inline">
      <input class="input num" type="number" :min="q.min" :max="q.max" :step="q.step || 1" v-model="answers[q.id]" :aria-label="q.title" />
      <span class="unit">{{ q.unit }}</span>
    </div>
    <input v-else-if="q.type === 'text'" class="input" type="text" v-model="answers[q.id]" :aria-label="q.title" />
    <textarea v-else-if="q.type === 'textarea'" class="input" rows="4" v-model="answers[q.id]" :aria-label="q.title"></textarea>

    <!-- grid: rows × shared options (Yes / Partial / No) -->
    <div v-else-if="q.type === 'grid'" class="table-scroll">
      <table class="grid">
        <thead>
          <tr><th></th><th v-for="o in q.options" :key="o.v">{{ o.l }}</th><th>Don't know</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in q.rows" :key="r.v">
            <th scope="row">{{ r.l }}</th>
            <td v-for="o in [...q.options, { v: DK }]" :key="o.v">
              <input type="radio" :name="name('_' + r.v)" :value="String(o.v)" v-model="answers[q.id + '_' + r.v]"
                :aria-label="`${r.l}: ${o.l || 'Don\'t know'}`" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- hours per row -->
    <div v-else-if="q.type === 'hours'" class="hours">
      <label v-for="r in q.rows" :key="r.v" class="hours-row">
        <span>{{ r.l }}</span>
        <input class="input num" type="number" min="0" step="0.5" v-model="answers[q.id + '_' + r.v]" />
      </label>
      <p class="hint">Unit: {{ q.unit }}</p>
    </div>

    <!-- repeated small table (Tool 1..n) -->
    <div v-else-if="q.type === 'repeat'" class="repeat">
      <div v-for="n in q.count" :key="n" class="repeat-item">
        <div class="repeat-n">#{{ n }}</div>
        <div class="repeat-fields">
          <label v-for="f in q.fields" :key="f.id" class="field">
            <span>{{ f.l }}</span>
            <select v-if="f.type === 'single'" class="input" v-model="answers[`${q.id}_${n}_${f.id}`]">
              <option value=""></option>
              <option v-for="o in f.options" :key="o.v" :value="String(o.v)">{{ o.l }}</option>
            </select>
            <input v-else-if="f.type === 'number'" class="input" type="number" :min="f.min" :max="f.max" v-model="answers[`${q.id}_${n}_${f.id}`]" />
            <input v-else class="input" type="text" v-model="answers[`${q.id}_${n}_${f.id}`]" />
          </label>
        </div>
      </div>
    </div>
  </fieldset>
</template>
