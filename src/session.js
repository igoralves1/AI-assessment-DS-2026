// The respondent's open form, kept for this browser tab only.
import { reactive } from 'vue'

const KEY = 'ai-ds-2026-session'
export const session = reactive({ code: '', record: null })

try {
  const saved = JSON.parse(sessionStorage.getItem(KEY))
  if (saved?.code) Object.assign(session, saved)
} catch { /* storage unavailable: start empty */ }

export function setSession(code, record) {
  session.code = code
  session.record = record
  try { sessionStorage.setItem(KEY, JSON.stringify({ code, record })) } catch { /* ignore */ }
}

export function clearSession() {
  session.code = ''
  session.record = null
  try { sessionStorage.removeItem(KEY) } catch { /* ignore */ }
}
