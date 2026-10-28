<script setup>
import { storage } from './storage/index.js'
import { CONSORTIUM_URL } from './config.js'
</script>

<template>
  <header class="topbar">
    <div class="wrap topbar-inner">
      <router-link to="/" class="brand">
        <span class="logo" aria-hidden="true">AI</span>
        <span>
          <strong>ICARB-D Annual Survey of Dental Schools</strong>
          <small>AI · Health informatics · Robotics · Bioinformatics</small>
        </span>
      </router-link>
      <a class="consortium" :href="CONSORTIUM_URL">ICARB-D</a>
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
