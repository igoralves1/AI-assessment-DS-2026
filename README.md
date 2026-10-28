# AI Readiness in Dental Schools 2026

**Course-level mapping of artificial intelligence (AI) readiness in dental education in Canada, the United States, Brazil, China and India.**

This repository holds the questionnaire, the data-collection website and the analysis code for a multinational cross-sectional study. The study measures how far AI has been integrated into dental education **department by department and course by course**, then consolidates the results by school and by country.

- Website (questionnaire): https://igoralves1.github.io/AI-assessment-DS-2026/
- Questionnaire (Word): [docs/AI-Readiness-Questionnaire-Dental-Schools-2026.docx](docs/AI-Readiness-Questionnaire-Dental-Schools-2026.docx)
- Questionnaire (PDF): [docs/AI-Readiness-Questionnaire-Dental-Schools-2026.pdf](docs/AI-Readiness-Questionnaire-Dental-Schools-2026.pdf)
- Codebook (one line per data column): [docs/codebook.csv](docs/codebook.csv)

## Proposed article title

> **Course-Level Mapping of Artificial Intelligence Readiness in Dental Education: A Multinational Assessment of Infrastructure, Human Resources, Curriculum Hours and Governance in Canada, the United States, Brazil, China and India**

Alternatives:

- *Which Course, Which Department? A Specificity-Preserving Readiness Assessment of Artificial Intelligence Integration in Dental Schools of the Americas and Asia*
- *From Awareness to Implementation: Department-Level Maturity of Artificial Intelligence in Dental Education in Five Countries — A Cross-Sectional Study Using an Adapted PAHO/WHO Readiness Framework*

## Why this study

Most published work on AI in dental education surveys the **perceptions** of students or educators, usually at one institution (see [Related studies](#related-studies)). Few studies measure what schools actually **provide**: computing resources, AI tools students use, trained faculty, hours of AI teaching by topic (including programming and formal model development), governance and funding. No study has measured this at the level of named departments and courses across several countries. China and India, which together train a large share of the world's dentists, are underrepresented.

## Objectives

1. Describe physical infrastructure: computing, AI-enabled equipment, software, datasets, connectivity, interoperability and cybersecurity.
2. Describe human resources: faculty able to teach AI, AI researchers, faculty training, technical staff and interdisciplinary partners.
3. Quantify AI teaching: dedicated undergraduate and graduate courses, **hours per term by format and by topic**, programming and model-development hours, assessment and materials.
4. Assess generative-AI policy, governance, ethics, bias and regulatory alignment, with country-specific references.
5. Assess implementation, monitoring, evaluation and financial sustainability.
6. Build a maturity index per department, school and country.

## Framework

The questionnaire adapts four PAHO/WHO publications (with the Inter-American Development Bank):

| Source | Used for |
|---|---|
| *AI in Public Health: Readiness Assessment Toolkit* (2024) | Domains, 1–4 maturity scale, analysis steps |
| *AI-GUARD: AI Governance & Use Assessment for Responsible Deployment* (2026) | Yes/Partial/No governance checklist for AI tools (G11) and generative-AI safeguards (F06) |
| *Bias-free AI in Health: Dos and don'ts* (2026) | Data representativeness (C16), subgroup-performance teaching (G06) |
| *AI Prompt Design for Public Health* (2025) | Prompt-design and output-verification teaching (F04–F05) |

It also references the IADR / ITU-WHO core curriculum for dental AI (Schwendicke et al., 2023).

## Questionnaire structure

About 120 items in 9 parts, stored as 364 data columns.

| Part | Content | Filled by |
|---|---|---|
| A | Department/course profile: country, institution, department, course, level, respondent role, consent | Research team |
| B | Context: enrollment, faculty, academic calendar, course hours | Respondent |
| C | Physical resources, infrastructure and data (23 items, including a table of up to 6 AI tools) | Respondent |
| D | Human resources and expertise (16 items) | Respondent |
| E | Curriculum and teaching: AI hours by format and by 16 topics, programming hours, undergraduate and graduate AI courses, assessment (24 items) | Respondent |
| F | Generative AI in teaching and learning (8 items) | Respondent |
| G | Governance, ethics, bias and regulation (12 items) | Respondent |
| H | Implementation, monitoring, evaluation and sustainability (14 items) | Respondent |
| I | Self-assessment and open response (8 items) | Respondent |

Maturity items use a 1–4 anchored scale (1 = absent … 4 = established) plus "Don't know / Not applicable" (coded −1, treated as missing). Each one belongs to one of seven domains: Infrastructure (INF), Data (DAT), Human resources (HUM), Curriculum (CUR), Generative AI (GEN), Governance & ethics (GOV), Implementation & sustainability (IMP).

### Country adaptation

The form adapts examples and option lists to the country chosen in Part A:

| | Canada | USA | Brazil | China | India |
|---|---|---|---|---|---|
| Degree | DDS/DMD | DDS/DMD | Bacharelado em Odontologia | 口腔医学 Bachelor (5-yr) / 8-yr | BDS |
| Curriculum body | CDAC | CODA | MEC/INEP (DCN 2021), CAPES | Ministry of Education | DCI / National Dental Commission |
| Privacy law | PIPEDA, PHIPA, Quebec Law 25 | HIPAA, FERPA | LGPD | PIPL, Data Security Law | DPDP Act 2023 |
| AI device regulator | Health Canada | FDA | ANVISA | NMPA | CDSCO |

Hours are asked **per term**, and item B05 (terms per year) converts them into hours per year, because Indian BDS programs often use an annual system.

## How data collection works

```
Research team                         Respondent (department head / course director)
─────────────                         ──────────────────────────────────────────────
1. Opens  #/admin, fills Part A  ──►  code issued, e.g.  K7P-3MX
2. Sends code + website link     ──►  3. Opens the website, types the code (only field on the login page)
                                      4. Answers Parts B–I (saved at every section change; can resume later)
                                      5. Submits → form locked
                       data/responses.csv  ◄── one row per code, one column per item
```

- Codes have the format `XXX-XXX`, using 31 characters with no look-alikes (no 0/O, 1/I/L): about 887 million combinations.
- The login is rate-limited (20 attempts per 10 minutes per IP address) to prevent guessing.
- The research-team page is at `#/admin` and needs the admin token in server mode.

## Data storage

Answers are kept in plain CSV files ("columns × rows"), ready for Python/R:

| File | Content | Public? |
|---|---|---|
| `data/responses.csv` | One row per access code; metadata + every answer column. **No names or emails.** | Never commit |
| `data/access_codes.csv` | Code ↔ respondent name, email, interviewer | Never commit (private) |
| `docs/codebook.csv` | Column name, item, section, domain, type, label, value codes | Yes |

The `data/` folder is in `.gitignore` because this repository is public.

Column naming: `C01` (single value) · `C06__python` (multiple choice: 1 = selected, 0 = not) · `C08_2_task` (table row 2, field "task") · `G11_validation` (grid row) · `E03_programming` (hours for a topic) · `A08_other` (free text for "Other").

### Storage modes

GitHub Pages only serves static files, so it cannot write to a file by itself. The website has two modes:

1. **Server mode (real data collection).** A small Node.js server (`server/index.js`, no extra dependencies) receives the answers and writes the CSV files. Run it on any machine or host reachable from the internet (university server, Render, Railway, Fly.io, a VM), then build the website with its address:
   ```bash
   ADMIN_TOKEN='a-long-secret' ALLOWED_ORIGINS='https://igoralves1.github.io' npm run server
   ```
   Then add a repository variable `VITE_API_URL` (Settings → Secrets and variables → Actions → Variables) with the server URL, e.g. `https://ai-ds-2026.example.org`, and re-run the Pages workflow.
2. **Demo mode (default until `VITE_API_URL` is set).** Answers stay in the browser's local storage. Useful for testing and pilots on one computer; a code issued on one computer does not work on another. The admin page can export the CSV files.

## Running locally

```bash
npm install
ADMIN_TOKEN='local-dev-token-123' npm run server          # storage server on :8787
VITE_API_URL=http://localhost:8787 npm run dev            # website on :5173
```

Open http://localhost:5173/#/admin to issue a code and http://localhost:5173/ to answer.

Regenerate the documents after editing the questionnaire (`src/questionnaire/questionnaire.js` is the single source of truth):

```bash
npm run codebook   # docs/codebook.csv
npm run docs       # docs/*.docx and *.pdf (needs LibreOffice for the PDF)
```

## Analysis

```bash
python3 -m venv .venv && .venv/bin/pip install pandas numpy
.venv/bin/python analysis/make_synthetic.py 150                          # fake data for testing
.venv/bin/python analysis/consolidate.py analysis/synthetic_responses.csv
.venv/bin/python analysis/consolidate.py data/responses.csv              # real data
```

`analysis/consolidate.py` applies the consolidation rules and writes to `analysis/output/`:

1. **Course record**: each form is one record keyed by School × Department × Course.
2. **Domain index**: mean of the domain's 1–4 items → 0–100 index `(mean − 1) / 3 × 100`. The AI-GUARD (G11) and safeguards (F06) indices score Yes = 2, Partial = 1, No = 0.
3. **Department roll-up**: mean across its courses, with the number of contributing courses (n).
4. **School roll-up**: department scores weighted by the number of courses each contributed.
5. **Country summary**: mean of school scores.
6. **Transparency list**: the named courses behind each school's curriculum score (`curriculum_courses.csv`).
7. **AI hours by topic** per year and country (`ai_hours_by_topic.csv`).

## Methods checklist (before fieldwork)

- [ ] Ethics approval (coordinating center plus local approvals, e.g., CONEP in Brazil)
- [ ] Forward–backward translation: French (Quebec), Portuguese, Chinese
- [ ] Content validity with an expert panel (I-CVI ≥ 0.78) and cognitive interviews in each country
- [ ] Pilot with about 10 departments; reliability (Cronbach's α / ω per domain, test–retest subsample)
- [ ] Sampling frame from national lists (ADEA/CODA, ACFD, e-MEC/ABENO, MOE/CSA, DCI/NDC)
- [ ] Report with STROBE and CHERRIES

## Related studies

| Study | Design | Key finding |
|---|---|---|
| Schwendicke et al., *J Dent* 2023 | IADR + ITU/WHO expert consensus | Core curriculum for dental AI, four domains |
| Uribe et al., *Eur J Dent Educ* 2024 | 428 educators worldwide | 31% used AI chatbots; main concern was lack of guidelines and training |
| Kavadella et al., *BMC Med Educ* 2026 | Multinational dental-student survey | Students want AI education; most feel unprepared |
| El-Hakim et al., *Dent J* 2025 | Scoping review, 17 studies | AI helps feedback and accuracy; weak on dexterity and judgment |
| Ardabil (Iran), *BMC Med Educ* 2025 | MAIRS, faculty vs students | Faculty readiness higher than students' |
| Dantas & da Silva, *Int J Dent* 2026 | 92 Brazilian master's programs | AI in well under 1% of disciplines |
| Wu et al., *Front Public Health* 2026 | 343 students, Wuhan (China) | 89.8% support AI; 84.2% want AI education |
| Sheng et al., *Front Digit Health* 2026 | 243 respondents, UTHealth Houston (USA) | 66% of faculty and 73% of students use LLMs |
| Rifaat et al., *Int J Dent* 2026 | 388 students and faculty (Saudi Arabia) | Faculty know far more about AI than students |
| Busch et al., *BMC Med Educ* 2024 | 4,596 students, 192 faculties, 48 countries | Strong demand for more AI teaching |
| Teng et al., *JMIR Med Educ* 2022 | Health-care students (Canada) | Students want AI in curricula |

Full references (with DOIs) are in the Word/PDF document, section 4. Citations marked "verify" there could not be fully confirmed online and should be checked before submission.

## Repository layout

```
src/questionnaire/   questionnaire.js (all items), countries.js (country adaptation), columns.js (CSV columns)
src/views/           LoginView (code only), SurveyView (Parts B–I), AdminView (Part A, codes, exports)
src/storage/         server.js (API) and local.js (browser demo) back-ends
server/index.js      storage server writing data/*.csv
analysis/            consolidate.py, make_synthetic.py
scripts/             build-docx.mjs, build-codebook.mjs, study-text.mjs
docs/                questionnaire .docx/.pdf, codebook.csv
```
