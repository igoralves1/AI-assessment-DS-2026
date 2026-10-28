// Site settings. Values can be overridden at build time with VITE_* environment variables.

// Research-team admin code (demo mode). Only its SHA-256 hash is stored here, never the code itself.
// In demo mode this is a deterrent, not real security: the data stays in the visitor's own browser anyway.
// In server mode the admin token is checked by the storage server (ADMIN_TOKEN).
// To change the code: echo -n 'NEW-CODE' | shasum -a 256, then set VITE_ADMIN_CODE_HASH.
export const ADMIN_CODE_HASH = import.meta.env.VITE_ADMIN_CODE_HASH || '1a52cea5bfd5ea33995ffdf6d3a48efa6169d8845bcfc5ed1c340366f6783cda'

export const CONSORTIUM_URL = 'https://igoralves1.github.io/ICARB-D/'
