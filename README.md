# ICARB-D Annual Survey of Dental Schools

**Main question: which dental schools in the United States are best prepared to adopt and lead innovation in health informatics, artificial intelligence, robotics and bioinformatics, and how do they compare with dental schools in other countries?**

This annual survey answers it by mapping the state of the art of maturity of a **whole dental school, one department, or one course** taught in a department. The reader gets a complete, clear picture of what each unit has, who can do the work, what students learn, how technology is governed, and whether projects last. After answering, the same items work as a **maturity checklist** that shows the steps to the level a school wants to reach.

The idea comes from the Pan American Health Organization (PAHO), which created a questionnaire to measure how ready public health institutions are for AI (*Artificial Intelligence in Public Health: Readiness Assessment Toolkit*, PAHO and IDB, 2024). This survey adapts its dimensions and 1–4 maturity scale to dental schools.

The survey is run independently of the ICARB-D consortium website (https://igoralves1.github.io/ICARB-D/). This repository holds the questionnaire, the data-collection website, the documents and the analysis code.

- Website (questionnaire): https://igoralves1.github.io/AI-assessment-DS-2026/
- **All questions explained:** https://igoralves1.github.io/AI-assessment-DS-2026/#/questions
- **References** (US standards and research bodies, US dental schools, studies and PAHO/WHO frameworks, with summaries): end of the questions guide, data in `src/questionnaire/references.js`
- **Teacher slides** (summary of the main idea and the goal of each group of questions): [PDF](public/downloads/ICARB-D-Survey-Teacher-Slides.pdf) · [PowerPoint](public/downloads/ICARB-D-Survey-Teacher-Slides.pptx), also linked at the top of the questions guide
- **Maturity checklist:** https://igoralves1.github.io/AI-assessment-DS-2026/#/questions?go=checklist (also chapter 4 of the Word/PDF questionnaire)
- Questionnaire (Word): [docs/ICARB-D-Annual-Survey-Dental-Schools.docx](docs/ICARB-D-Annual-Survey-Dental-Schools.docx)
- Questionnaire (PDF): [docs/ICARB-D-Annual-Survey-Dental-Schools.pdf](docs/ICARB-D-Annual-Survey-Dental-Schools.pdf)
- Codebook (one line per data column): [docs/codebook.csv](docs/codebook.csv)

## Proposed article title

> **Mapping the Digital Maturity of US Dental Education: A National, Annual, Course-Level Survey of Artificial Intelligence, Health Informatics, Robotics and Bioinformatics in US Dental Schools**

Alternatives:

- *Which Course, Which Department? Physical and Human Resources for Artificial Intelligence, Health Informatics, Robotics and Bioinformatics in US Dental Schools — Baseline Results of the ICARB-D Annual Survey*
- *From Awareness to Implementation: Department-Level Maturity of Digital Technologies in US Dental Education — A National Cross-Sectional Study Aligned with ADA AI Standards and CODA Accreditation*

## What the survey measures

The survey gives a comprehensive overview of the maturity of each unit (school, department or course) in four technology domains:

| Domain | What is pictured |
|---|---|
| Artificial intelligence | Computing, AI tools used by students, datasets, faculty able to teach AI, AI hours by 16 topics (incl. programming and model development), generative-AI policy |
| Health informatics | Electronic records, imaging archives (PACS), coding, teledentistry, analytics, research data access, informatics teaching and staff |
| Robotics and digital dentistry | Counts of robots, navigation systems, haptic/VR simulators, scanners, CBCT, milling units, 3D printers; student access, digital workflow, maintenance, teaching hours, trained faculty |
| Bioinformatics and omics | Laboratories, sequencers, biobanks, HPC, pipelines, bioinformaticians, teaching hours, research areas, FAIR data sharing |

For every domain it captures **physical resources** (equipment, infrastructure, data) and **human resources** (faculty, technical staff, partners), plus teaching, governance, implementation and sustainability. It also maps each unit's readiness to share data and collaborate on multi-institution AI projects.

The survey is **annual**: each wave maps the state of the art across dental schools, and linking waves shows how each school, department and course develops.

## Who answers

| Unit described (item A17) | Who answers |
|---|---|
| Whole dental school (school-wide) | Dean or associate dean (academic affairs, research, clinical affairs or informatics) |
| One department | Department chair or a faculty member designated by the chair |
| One course taught in a department | Course director or coordinator |

A school can send one school-wide form and as many department and course forms as it wishes. US schools see US references (CODA, ADA, HIPAA, FDA); schools in other countries answer the same items (A01 "Other country"), so all scores share the same 0–100 scale.

## Why it matters for the United States

| US body | How the survey connects |
|---|---|
| American Dental Association (ADA) | Shows how schools teach and apply the ADA standards on dental AI (Technical Report 1109, ANSI/ADA Standard 1110-1:2025) |
| Commission on Dental Accreditation (CODA) | Gives schools evidence on the technology content of their curricula for accreditation planning |
| National Institute of Dental and Craniofacial Research (NIDCR) | Identifies departments ready for the health informatics and data-science research and training its strategic plan calls for |
| Oral health workforce | Shows where training and equipment are missing, in line with the NIH report *Oral Health in America* (2021) |
| FDA, NIST, HIPAA/FERPA | Governance items check how AI devices, AI risk and student and patient data are handled |

## Framework

| Source | Used for |
|---|---|
| PAHO/WHO–IDB *AI in Public Health: Readiness Assessment Toolkit* (2024) | Dimensions, 1–4 maturity scale, analysis steps |
| PAHO/WHO–IDB *AI-GUARD* (2026) | Yes/Partial/No governance checklist for AI tools (J11) and generative-AI safeguards (F06) |
| PAHO *Bias-free AI in Health* (2026) | Data representativeness (C15), subgroup-performance teaching (J06) |
| PAHO *AI Prompt Design for Public Health* (2025) | Prompt-design and output-verification teaching (F04–F05) |
| IADR / ITU-WHO core curriculum for dental AI (Schwendicke et al., 2023); ADEA competencies; CODA standards | Curriculum alignment (E20) |
| ADA AI standards, CODA, HIPAA/FERPA, FDA, NIST AI RMF | US guidance used in teaching and clinics (J08) |

## Questionnaire structure

175 questions in 13 parts, stored as 469 answer columns (plus 3 private contact fields kept in a separate file). The [questions guide](https://igoralves1.github.io/AI-assessment-DS-2026/#/questions) explains each one.

| Part | Content | Filled by |
|---|---|---|
| A | Profile: state, school, department, course, level, role, consent, **survey year**, previous year's code | Research team |
| B | Context: enrollment, faculty, calendar, course hours, domains addressed | Respondent |
| C | Physical resources: computing, software, AI tools used by students, datasets, data quality, privacy, connectivity | Respondent |
| D | Human resources: faculty able to teach AI, researchers, training, partners, technical staff, barriers | Respondent |
| E | AI curriculum: hours by format and 16 topics, programming hours, undergraduate and graduate courses, assessment | Respondent |
| F | Generative AI: policy, permitted uses, prompt design, verification, safeguards | Respondent |
| G | Health informatics: records, PACS, coding, teledentistry, analytics, teaching hours, staff | Respondent |
| H | Robotics and digital dentistry: equipment counts, access, digital workflow, teaching hours, trained faculty, maintenance | Respondent |
| I | Bioinformatics and omics: laboratories, biobank, pipelines, expertise, teaching hours, data sharing | Respondent |
| J | Governance, ethics, bias, regulation, AI-GUARD checklist | Respondent |
| K | Implementation, evaluation, sustainability, funding | Respondent |
| L | Collaboration and the open dental AI model: interest, data that could be shared, preferred models (e.g., federated learning), barriers | Respondent |
| M | Self-assessment of maturity in each of the four domains, barriers, facilitators, open comments | Respondent |

Maturity items use a 1–4 anchored scale (1 = absent … 4 = established) plus "Don't know / Not applicable" (coded −1, treated as missing). Each one belongs to one of ten domains: Infrastructure (INF), Data (DAT), Human resources (HUM), AI curriculum (CUR), Generative AI (GEN), Health informatics (HIN), Robotics and digital dentistry (ROB), Bioinformatics (BIO), Governance & ethics (GOV), Implementation & sustainability (IMP).

### US references

Some items show the matching US law or body next to the question:

| | United States |
|---|---|
| Degree | DDS/DMD |
| Accreditation | CODA |
| Professional and regulatory bodies | ADA, ADEA, state dental boards |
| Privacy law | HIPAA, FERPA |
| AI device regulator | FDA |

Hours are asked **per term**, and item B05 (terms per year) converts them into hours per year, because schools use semesters, trimesters or quarters.

## How data collection works

```
Research team                         Respondent (department head / course director)
─────────────                         ──────────────────────────────────────────────
1. Opens  #/admin, fills Part A  ──►  code issued, e.g.  K7P-3MX
2. Sends code + website link     ──►  3. Opens the website, types the code (only field on the login page)
                                      4. Answers Parts B–M (saved at every section change; can resume later)
                                      5. Submits → form locked
                       data/responses.csv  ◄── one row per code, one column per item
```

- Codes have the format `XXX-XXX`, using 31 characters with no look-alikes (no 0/O, 1/I/L): about 887 million combinations.
- The login is rate-limited (20 attempts per 10 minutes per IP address) to prevent guessing.
- The research-team page is at `#/admin` and asks for the **admin code**. In demo mode the site checks the code against the SHA-256 hash in `src/config.js` (the code itself is never committed). This only deters casual visitors, since demo data stays in each visitor's own browser. In server mode the storage server checks it, so start the server with `ADMIN_TOKEN` set to the same code. To change the code, set the repository variable `VITE_ADMIN_CODE_HASH` to `echo -n 'NEW-CODE' | shasum -a 256`.
- The ICARB-D form page can open the questionnaire with the code already filled in: `#/?code=XXX-XXX`.
- The public guide at `#/questions` lists every question, what it captures and how it is scored.
- Each year the team issues a new code per department/course (item A15 = survey year) and records last year's code (A16) to link the waves.

## Data storage

Answers are kept in plain CSV files ("columns × rows"), ready for Python/R:

| File | Content | Public? |
|---|---|---|
| `data/responses.csv` | One row per access code; metadata + every answer column. **No names or emails.** | Never commit |
| `data/access_codes.csv` | Code ↔ respondent name, email, interviewer | Never commit (private) |
| `docs/codebook.csv` | Column name, item, section, domain, type, label, value codes | Yes |

The `data/` folder is in `.gitignore` because this repository is public.

Column naming: `C01` (single value) · `C06__python` (multiple choice: 1 = selected, 0 = not) · `C08_2_task` (table row 2, field "task") · `J11_validation` (grid row) · `E03_programming` (hours for a topic) · `H01_printer` (equipment count) · `A08_other` (free text for "Other").

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
npm run docs       # docs/*.docx and *.pdf, copied to public/downloads (needs LibreOffice)
npm run slides     # public/downloads teacher slides (.pptx and .pdf)
```

## Analysis

```bash
python3 -m venv .venv && .venv/bin/pip install pandas numpy
.venv/bin/python analysis/make_synthetic.py 200                          # fake data for testing
.venv/bin/python analysis/consolidate.py analysis/synthetic_responses.csv
.venv/bin/python analysis/consolidate.py data/responses.csv              # real data
```

`analysis/consolidate.py` writes to `analysis/output/`:

1. **Form record**: each form is one record keyed by Survey year × Country × State × School × Unit level × Department × Course.
2. **Domain index** (ten domains): mean of the domain's 1–4 items → 0–100 index `(mean − 1) / 3 × 100`. The AI-GUARD (J11) and safeguards (F06) indices score Yes = 2, Partial = 1, No = 0.
3. **Hours per year** for AI, health informatics, robotics and bioinformatics, plus programming hours; **equipment units** and students per unit.
4. **Department roll-up** per year: course and department forms, with the number of forms (n).
5. **School ranking** (`school_scores.csv`): departments weighted by forms, combined with any school-wide form; schools ranked overall and within their country. The script prints the most prepared US schools of the latest year.
6. **State and country summaries** per year (`state_scores.csv`, `country_scores.csv`, US first).
7. **Annual trends**: each school's and department's overall index by survey year (`school_trends.csv`, `department_trends.csv`).
8. **Transparency list**: the named courses behind each school's curriculum score (`curriculum_courses.csv`).
9. **Hours by topic** per year and country (`hours_by_topic.csv`).

## Methods checklist (before fieldwork)

- [ ] IRB approval (coordinating center plus local IRBs where required)
- [ ] Content validity with an expert panel per domain (I-CVI ≥ 0.78) and cognitive interviews with department heads
- [ ] Pilot with about 10 departments; reliability (Cronbach's α / ω per domain, test–retest subsample)
- [ ] Sampling frame from the CODA list of accredited US dental schools and ADEA members; invite the same departments every year
- [ ] Report with STROBE and CHERRIES

## Related studies

| Study | Design | Key finding |
|---|---|---|
| Schwendicke et al., *J Dent* 2023 | IADR + ITU/WHO expert consensus | Core curriculum for dental AI, four domains |
| Uribe et al., *Eur J Dent Educ* 2024 | 428 educators worldwide | 31% used AI chatbots; main concern was lack of guidelines and training |
| Kavadella et al., *BMC Med Educ* 2026 | Multinational dental-student survey | Students want AI education; most feel unprepared |
| El-Hakim et al., *Dent J* 2025 | Scoping review, 17 studies | AI helps feedback and accuracy; weak on dexterity and judgment |
| Sheng et al., *Front Digit Health* 2026 | 243 respondents, UTHealth Houston | 66% of faculty and 73% of students use LLMs |
| Busch et al., *BMC Med Educ* 2024 | 4,596 students, 192 faculties, 48 countries | Strong demand for more AI teaching |

Full references (with DOIs) are in the Word/PDF document, section 5. Citations marked "verify" there could not be fully confirmed online and should be checked before submission.

## Repository layout

```
src/questionnaire/   questionnaire.js (all items + what each captures), countries.js, columns.js (CSV columns)
src/views/           LoginView (code only), SurveyView (Parts B–M), AdminView (Part A, codes, exports),
                     QuestionsView (public guide to every question)
src/storage/         server.js (API) and local.js (browser demo) back-ends
server/index.js      storage server writing data/*.csv
analysis/            consolidate.py, make_synthetic.py
scripts/             build-docx.mjs, build-codebook.mjs, study-text.mjs
docs/                questionnaire .docx/.pdf, codebook.csv
```
