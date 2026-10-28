export function serverStorage(base) {
  let adminToken = ''
  async function call(path, { method = 'GET', body, admin = false, text = false } = {}) {
    const headers = { 'Content-Type': 'application/json' }
    if (admin) headers['X-Admin-Token'] = adminToken
    let res
    try {
      res = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
    } catch {
      throw new Error('Cannot reach the storage server. Please try again later.')
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw Object.assign(new Error(err.error || `Request failed (${res.status})`), { status: res.status })
    }
    return text ? res.text() : res.json()
  }
  return {
    mode: 'server',
    async adminLogin(token) { adminToken = token; await call('/api/admin/check', { admin: true }) },
    async createCode(intake) { return (await call('/api/admin/codes', { method: 'POST', body: { intake }, admin: true })).code },
    async listCodes() { return (await call('/api/admin/codes', { admin: true })).codes },
    async login(code) { return (await call('/api/login', { method: 'POST', body: { code } })).record },
    async save(code, answers, submit = false) {
      return (await call(`/api/responses/${code}`, { method: 'PUT', body: { answers, submit } })).record
    },
    exportResponses() { return call('/api/admin/export/responses.csv', { admin: true, text: true }) },
    exportAccess() { return call('/api/admin/export/access_codes.csv', { admin: true, text: true }) },
    exportCodebook() { return call('/api/export/codebook.csv', { text: true }) },
  }
}
