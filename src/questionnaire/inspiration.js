// The four PAHO publications that inspired the survey. Covers are rendered from the official PDFs
// (public/covers) and shown only to identify the publications. Links go to PAHO's website or to
// IRIS, PAHO's official publications repository. Checked on 2026-11-02.
export const PAHO_BOOKS = [
  {
    key: 'readiness-toolkit',
    title: 'Artificial Intelligence in Public Health: Readiness Assessment Toolkit',
    publisher: 'PAHO and IDB', year: '2024',
    url: 'https://www.paho.org/en/documents/artificial-intelligence-public-health-readiness-assessment-toolkit',
    role: 'The main inspiration: a questionnaire that measures how ready public health institutions are to use AI. The survey adapts its dimensions, its 1–4 maturity scale and its analysis steps to dental schools.',
  },
  {
    key: 'ai-guard',
    title: 'AI-GUARD Tool: Artificial Intelligence Governance & Use Assessment for Responsible Deployment',
    publisher: 'PAHO and IDB', year: '2026',
    url: 'https://www.paho.org/en/documents/ai-guard-tool-governance-use-assessment-responsible-deployment',
    role: 'A Yes / Partial / No checklist for governing AI tools. It is the basis of the safeguards items for generative AI (F06) and for clinical AI tools (J11).',
  },
  {
    key: 'bias-free-ai',
    title: 'Bias-free Artificial Intelligence in Health: Dos and Don\'ts for Developing and Implementing Algorithms',
    publisher: 'PAHO', year: '2026',
    url: 'https://iris.paho.org/items/76d5aca8-85a7-4427-b097-783d6361da33',
    links: [{ label: 'PAHO technical documents on AI', url: 'https://www.paho.org/en/artificial-intelligence-health/technical-documentation-ai' }],
    role: 'Practical advice to reduce bias in health algorithms. It shapes the items on data representativeness (C15) and on teaching students to check AI across patient groups (J06).',
  },
  {
    key: 'prompt-design',
    title: 'AI Prompt Design for Public Health: Using Generative AI Responsibly',
    publisher: 'PAHO', year: '2025',
    url: 'https://www.paho.org/es/documentos/ai-prompt-design-public-health-using-generative-ai-responsibly',
    links: [{ label: 'IRIS record', url: 'https://iris.paho.org/items/b98d9c0f-6008-4b78-9066-01e1e81c29c5' }],
    role: 'A guide to writing and checking instructions for generative AI. It shapes the items on prompt design and on verifying AI outputs (F04–F05).',
  },
]
