// Picks the storage backend.
//   VITE_API_URL set   -> "server" mode: answers go to the storage server (CSV files in data/).
//   VITE_API_URL empty -> "local" demo mode: answers stay in this browser (localStorage) and can be exported as CSV.
import { serverStorage } from './server.js'
import { localStorageBackend } from './local.js'

const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
export const storage = apiUrl ? serverStorage(apiUrl) : localStorageBackend()

export function downloadText(filename, text) {
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }) // BOM so Excel opens UTF-8 correctly
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
