import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import LoginView from './views/LoginView.vue'
import SurveyView from './views/SurveyView.vue'
import AdminView from './views/AdminView.vue'
import QuestionsView from './views/QuestionsView.vue'
import './style.css'

// Hash history works on GitHub Pages without server-side rewrites.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: LoginView },
    { path: '/survey', component: SurveyView },
    { path: '/admin', component: AdminView },
    { path: '/questions', component: QuestionsView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// Scroll to top when changing pages.
router.afterEach(() => window.scrollTo(0, 0))

createApp(App).use(router).mount('#app')
