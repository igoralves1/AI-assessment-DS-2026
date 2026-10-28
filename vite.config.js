import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages serves the site from /AI-assessment-DS-2026/
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? '/AI-assessment-DS-2026/' : '/',
}))
