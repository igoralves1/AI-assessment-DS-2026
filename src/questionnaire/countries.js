// US context used to show the matching laws, regulators and accreditation bodies in some items.
// Keys are the stored values of question A01 (country). The survey covers US dental schools.

export const COUNTRIES = [
  { v: 'US', l: 'United States' },
]

export const COUNTRY_CONTEXT = {
  US: {
    name: 'United States',
    degree: 'DDS/DMD',
    regionLabel: 'State',
    accreditation: 'CODA (Commission on Dental Accreditation)',
    professional: 'ADA, ADEA and state dental boards',
    privacy: 'HIPAA and FERPA',
    deviceRegulator: 'FDA',
    languages: 'English',
    calendarNote: 'Programs use semesters, trimesters or quarters.',
  },
}

// Guidance documents a department may know or use (question J08).
export const GUIDANCE_DOCS = [
  { v: 'ada_standards', l: 'ADA Technical Report 1109, ANSI/ADA Standard 1110-1:2025, ADA White Paper 1106' },
  { v: 'coda', l: 'CODA accreditation standards (AI/technology-related elements)' },
  { v: 'adea', l: 'ADEA guidance or competencies relating to AI' },
  { v: 'hipaa', l: 'HIPAA privacy and security rules applied to AI tools' },
  { v: 'fda_ai', l: 'FDA guidance on AI-enabled device software functions' },
  { v: 'nist_rmf', l: 'NIST AI Risk Management Framework (AI RMF 1.0) and Generative AI Profile' },
  { v: 'iadr_itu_core', l: 'IADR / ITU-WHO Focus Group — Core curriculum for oral and dental AI (Schwendicke et al., 2023)' },
  { v: 'ai_reporting', l: 'AI reporting guidelines (CONSORT-AI, SPIRIT-AI, TRIPOD+AI, STARD-AI, CLAIM, dental AI checklist)' },
  { v: 'paho_toolkits', l: 'PAHO/WHO AI toolkits (Readiness Assessment, AI-GUARD, Bias-free AI, Prompt design)' },
  { v: 'who_ethics', l: 'WHO — Ethics and governance of AI for health (2021) and guidance on large multi-modal models (2024/2025)' },
  { v: 'unesco_genai', l: 'UNESCO — Guidance for generative AI in education and research (2023)' },
  { v: 'none', l: 'None of these', exclusive: true },
]
