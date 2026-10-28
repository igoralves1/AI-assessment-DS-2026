<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storage } from '../storage/index.js'
import { normalizeCode, isValidCode } from '../lib/code.js'
import { setSession } from '../session.js'

const router = useRouter()
const route = useRoute()
const code = ref('')
const error = ref('')
const busy = ref(false)

function onInput(e) {
  code.value = normalizeCode(e.target.value)
  error.value = ''
}

async function enter() {
  if (!isValidCode(code.value)) {
    error.value = 'Enter the 6-character code you received, for example K7P-3MX.'
    return
  }
  busy.value = true
  try {
    const record = await storage.login(code.value)
    setSession(code.value, record)
    router.push('/survey')
  } catch (e) {
    error.value = e.status === 404 ? 'This code was not found. Please check it and try again.' : e.message
  } finally {
    busy.value = false
  }
}

// Links from the ICARB-D site arrive as #/?code=XXX-XXX
onMounted(() => {
  if (route.query.code) {
    code.value = normalizeCode(route.query.code)
    enter()
  }
})
</script>

<template>
  <section class="login">
    <h1>AI readiness of dental school departments and courses</h1>
    <p class="lead">Enter the access code you received from the research team.</p>
    <form class="code-form" @submit.prevent="enter">
      <label for="code" class="sr-only">Access code</label>
      <input id="code" class="code-input" :value="code" @input="onInput" placeholder="XXX-XXX"
        autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="text" maxlength="7" autofocus />
      <button class="btn primary" :disabled="busy">{{ busy ? 'Checking…' : 'Enter' }}</button>
    </form>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
  </section>
</template>
