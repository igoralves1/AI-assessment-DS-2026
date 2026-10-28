// Access codes look like "K7P-3MX": 6 characters from an alphabet without look-alikes (0/O, 1/I/L).
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const CODE_PATTERN = /^[A-HJKMNP-Z2-9]{3}-[A-HJKMNP-Z2-9]{3}$/

export function normalizeCode(input) {
  const raw = String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  return raw.length > 3 ? `${raw.slice(0, 3)}-${raw.slice(3)}` : raw
}

export function isValidCode(code) {
  return CODE_PATTERN.test(code)
}

// randomInt(n) must return a uniform integer in [0, n). Pass crypto-based generators only.
export function generateCode(randomInt, exists = () => false) {
  for (let attempt = 0; attempt < 1000; attempt++) {
    let s = ''
    for (let i = 0; i < 6; i++) s += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
    const code = `${s.slice(0, 3)}-${s.slice(3)}`
    if (!exists(code)) return code
  }
  throw new Error('Could not generate a unique code')
}
