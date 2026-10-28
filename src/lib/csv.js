// Minimal RFC 4180 CSV reader/writer (no dependencies). Shared by the browser and the server.

const needsQuote = /[",\r\n]/

export function toCsvValue(v) {
  if (v === undefined || v === null) return ''
  const s = String(v)
  return needsQuote.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(columns, rows) {
  const lines = [columns.map(toCsvValue).join(',')]
  for (const row of rows) lines.push(columns.map((c) => toCsvValue(row[c])).join(','))
  return lines.join('\r\n') + '\r\n'
}

export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else inQuotes = false
      } else field += ch
    } else if (ch === '"') inQuotes = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += ch
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  if (!rows.length) return { header: [], records: [] }
  const [header, ...body] = rows
  const records = body.filter((r) => r.some((v) => v !== '')).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])))
  return { header, records }
}
