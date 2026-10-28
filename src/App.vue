<script setup>
import { storage } from './storage/index.js'
</script>

<template>
  <header class="topbar">
    <div class="wrap topbar-inner">
      <router-link to="/" class="brand">
        <span class="logo" aria-hidden="true">AI</span>
        <span>
          <strong>AI Readiness in Dental Schools</strong>
          <small>Canada · USA · Brazil · China · India — 2026</small>
        </span>
      </router-link>
    </div>
  </header>
  <div v-if="storage.mode === 'local'" class="demo-banner">
    Demo mode: answers are saved only in this browser. Connect the storage server for real data collection.
  </div>
  <main class="wrap">
    <router-view />
  </main>
  <footer class="wrap footer">
    Answers are confidential and reported only in aggregate. Questions about the study: contact the research team.
  </footer>
</template>
