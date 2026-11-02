// References shown at the end of the public questions guide (#/questions).
// Each item: title, source (organization / authors), year, url (+ optional extra links), summary (our own words).
// Links were checked on 2026-10-28; US items added 2026-11-02. Summaries describe the document; they are not quotations.

export const REFERENCE_GROUPS = [
  {
    id: 'united-states',
    title: 'United States: standards, accreditation and research',
    note: 'The US bodies whose standards and priorities the survey results speak to: dental AI standards, accreditation, federal research and the oral health workforce, AI risk management and device regulation.',
    items: [
      {
        title: 'ADA standards on artificial and augmented intelligence',
        source: 'American Dental Association', year: '2024–2025',
        url: 'https://www.ada.org/resources/practice/dental-standards/informatics-standards/artificial-and-augmented-intelligence',
        links: [{ label: 'ADA News on Technical Report 1109', url: 'https://adanews.ada.org/ada-news/2024/october/ada-technical-report-calls-for-external-validation-of-ai-algorithms-in-dentistry/' }],
        summary: 'The ADA\'s AI standards work, including Technical Report 1109 on evaluating dental image-analysis AI and ANSI/ADA Standard 1110-1:2025, the first US national standard on dental AI, which sets rules for annotating and collecting 2D radiographs for validation datasets. The ADA recommends independent external validation of AI algorithms.',
      },
      {
        title: 'CODA Accreditation Standards',
        source: 'Commission on Dental Accreditation (CODA)', year: '2026',
        url: 'https://coda.ada.org/standards',
        summary: 'CODA sets the accreditation standards for US dental education programs (DDS/DMD), allied dental programs and advanced dental education programs, and revises them regularly. The survey maps the technology content of curricula that schools can use when planning for accreditation.',
      },
      {
        title: 'NIDCR Strategic Plan 2021–2026',
        source: 'National Institute of Dental and Craniofacial Research (NIH)', year: '2022',
        url: 'https://www.nidcr.nih.gov/about-us/strategic-plan',
        links: [{ label: 'Full plan (PDF)', url: 'https://www.nidcr.nih.gov/sites/default/files/2022-01/NIDCR-Strategic-Plan-2021-2026.pdf' }],
        summary: 'The federal plan for dental, oral and craniofacial research. It calls for health informatics and data-science research, new training programs that use data science, and a larger pool of dentist-scientists, and it expects AI-based methods for diagnosis to reach clinical practice.',
      },
      {
        title: 'Oral Health in America: Advances and Challenges',
        source: 'National Institutes of Health (NIDCR)', year: '2021',
        url: 'https://www.nidcr.nih.gov/research/oralhealthinamerica',
        links: [{ label: 'Section 4: the oral health workforce', url: 'https://www.nidcr.nih.gov/research/oralhealthinamerica/section-4-summary' }, { label: 'Section 6: emerging science and technology', url: 'https://www.nidcr.nih.gov/research/oralhealthinamerica/section-6-summary' }],
        summary: 'A national report by more than 400 contributors on the state of oral health in the United States. It notes that AI, 3D printing and digital imaging are reshaping care, that the US oral health workforce had more than 750,000 practitioners in 2020, and that about 60 million Americans live in areas with too few providers.',
      },
      {
        title: 'AI Risk Management Framework (AI RMF 1.0)',
        source: 'National Institute of Standards and Technology (NIST)', year: '2023',
        url: 'https://www.nist.gov/itl/ai-risk-management-framework',
        summary: 'A voluntary US framework, released in January 2023, for managing the risks of AI and building trustworthiness into the design, development, use and evaluation of AI systems. A Generative AI Profile followed in July 2024.',
      },
      {
        title: 'List of AI-enabled medical devices',
        source: 'US Food and Drug Administration (FDA)', year: '2026',
        url: 'https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-enabled-medical-devices',
        summary: 'The FDA\'s regularly updated list of AI-enabled devices authorized for marketing in the United States. It includes dental tools, such as AI systems that read dental radiographs and CBCT scans, which students may meet in clinics.',
      },
    ],
  },
  {
    id: 'universities',
    title: 'US dental school initiatives',
    note: 'Examples of AI and digital dentistry initiatives at US dental schools.',
    items: [
      {
        title: 'Harvard School of Dental Medicine — Artificial Intelligence',
        source: 'Harvard University, USA', year: '2024–2027',
        url: 'https://www.hsdm.harvard.edu/news-and-events/artificial-intelligence',
        links: [{ label: 'AI-enhanced dental education project', url: 'https://hsdm.harvard.edu/news/exploring-how-ai-can-enhance-dental-education' }],
        summary: 'Harvard\'s dental school hosts the Global Symposium on AI in Dentistry (hundreds of participants from more than 50 countries) and runs AI education research, including a funded project that uses de-identified dental records to train a language model that creates synthetic patient cases for teaching, plus summer research on algorithmic fairness.',
      },
      {
        title: 'University of Rochester, Eastman Institute for Oral Health — AI for oral disease screening',
        source: 'University of Rochester, USA', year: '2021–2030',
        url: 'https://www.urmc.rochester.edu/people/27338278-jin-xiao',
        summary: 'Dr. Jin Xiao\'s team (with computer science and biostatistics) develops AICaries and SMARTeeth, AI smartphone tools that detect early tooth decay and gum disease outside the dental clinic, funded by the US National Institute of Dental and Craniofacial Research. The Eastman Institute also runs a Center of Excellence for Digital Dentistry in its clinics and curriculum.',
      },
    ],
  },
  {
    id: 'papers',
    title: 'Research on AI in dental education',
    items: [
      {
        title: 'Artificial intelligence for oral and dental healthcare: Core education curriculum',
        source: 'Schwendicke F, et al. Journal of Dentistry 128:104363', year: '2023',
        url: 'https://research.vu.nl/en/publications/artificial-intelligence-for-oral-and-dental-healthcare-core-educa/',
        summary: 'International consensus (IADR, ITU/WHO, ADEE experts; Delphi method) on the minimum AI learning outcomes for dental students: basic AI concepts and validation, dental use cases, evaluation and impact on patients, and accountability and governance. Item E20 of this survey refers to it.',
      },
      {
        title: 'AI chatbots and large language models in dental education: Worldwide survey of educators',
        source: 'Uribe SE, et al. European Journal of Dental Education 28(4):865–876', year: '2024',
        url: 'https://doi.org/10.1111/eje.13009',
        summary: '428 dental educators from many countries: about a third already used AI chatbots and most saw potential for learning, research and clinical decisions, but the main concern was the lack of clear guidelines and training.',
      },
      {
        title: 'Dental students\' knowledge, perceptions, and educational needs regarding AI: a multinational survey',
        source: 'Kavadella A, et al. BMC Medical Education 26:401', year: '2026',
        url: 'https://link.springer.com/article/10.1186/s12909-026-08699-6',
        summary: 'Dental students in several countries want AI in their undergraduate education, prefer case-based teaching, and most feel their current education has not prepared them for AI.',
      },
      {
        title: 'Artificial Intelligence in Dental Education: A Scoping Review of Applications, Challenges, and Gaps',
        source: 'El-Hakim M, Anthonappa R, Fawzy A. Dentistry Journal 13(9):384', year: '2025',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12468998/',
        summary: '17 studies grouped into preclinical training, clinical and radiographic training, assessment and feedback, and AI-generated content. AI improved accuracy, confidence and feedback, but struggled to assess dexterity and judgment; the authors warn that virtual reality is often mislabelled as AI.',
      },
      {
        title: 'Evaluating large language models in dental education at a U.S. dental school',
        source: 'Sheng C, et al. Frontiers in Digital Health 8:1786363', year: '2026',
        url: 'https://www.frontiersin.org/journals/digital-health/articles/10.3389/fdgth.2026.1786363/full',
        summary: '243 faculty, residents and students at UTHealth Houston: two-thirds of faculty and three-quarters of students use AI language tools, mainly for writing and study; faculty report a stronger need for AI training.',
      },
      {
        title: 'Global student survey on AI in medical, dental, and veterinary education at 192 faculties',
        source: 'Busch F, et al. BMC Medical Education', year: '2024',
        url: 'https://pubmed.ncbi.nlm.nih.gov/39342231/',
        summary: 'More than 4,500 students in 48 countries are positive about AI and want more AI teaching; dental students were a small part of the sample.',
      },
      {
        title: 'AI in medicine: a multinational multi-center survey on medical and dental students\' perception',
        source: 'Bisdas S, et al. Frontiers in Public Health 9:795284', year: '2021',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8739771/',
        summary: 'More than 3,000 students in 63 countries; most see AI as a partner rather than a competitor and call for AI teaching.',
      },
    ],
  },
  {
    id: 'paho-tools',
    title: 'PAHO/WHO documents this survey is built on',
    note: 'The four Pan American Health Organization publications used to design the survey. Each links to its official page on paho.org or PAHO\'s digital repository (IRIS).',
    items: [
      {
        title: 'Artificial Intelligence in Public Health: Readiness Assessment Toolkit',
        source: 'PAHO/WHO and Inter-American Development Bank', year: '2024 (version 2.0, 2026)',
        url: 'https://www.paho.org/en/documents/artificial-intelligence-public-health-readiness-assessment-toolkit',
        links: [{ label: 'PDF', url: 'https://www.paho.org/sites/default/files/2026/06/aitoolkiting-1.pdf' }],
        summary: 'A structured questionnaire for governments to measure how ready their health systems are to adopt AI. It covers governance and leadership, infrastructure, workforce, data quality and privacy, funding, stakeholder engagement, implementation, and monitoring, and explains how to average scores per category and turn gaps into action plans. This survey adapts its dimensions and 1–4 maturity scale to dental school departments.',
      },
      {
        title: 'AI-GUARD Tool: Artificial Intelligence Governance & Use Assessment for Responsible Deployment',
        source: 'PAHO/WHO and Inter-American Development Bank', year: '2026',
        url: 'https://www.paho.org/en/documents/ai-guard-tool-governance-use-assessment-responsible-deployment',
        links: [{ label: 'PDF', url: 'https://www.paho.org/sites/default/files/2026/06/aiguardtoolsing.pdf' }],
        summary: 'A tiered checklist to decide whether an AI initiative in health should proceed. An entry scan rates strategic value, risk and readiness, then assigns one of three tiers (responsible use of tools like chatbots, program-level AI, or high-impact AI). Each tier checks governance, human control, bias safeguards and deployment readiness with Yes / Partial / No scoring. Annexes cover vendor model cards and emergency deactivation. Items F06 and J11 of this survey are adapted from it.',
      },
      {
        title: 'Bias-free artificial intelligence in health: Dos and don\'ts for developing and implementing algorithms',
        source: 'PAHO/WHO', year: '2026', code: 'PAHO/EIH/IS/26-0001',
        url: 'https://iris.paho.org/items/76d5aca8-85a7-4427-b097-783d6361da33',
        summary: 'Practical recommendations for ministries, regulators, universities and developers to prevent bias across the AI life cycle. It asks for representative datasets, performance reported by sex, age, region and other subgroups, transparent documentation (model cards), external validation before rollout, continuous monitoring for drift, human oversight and clear accountability. It also stresses building local expertise through academic programs. Items C15 and J06 of this survey follow it.',
      },
      {
        title: 'AI prompt design for public health: Using generative AI responsibly',
        source: 'PAHO/WHO', year: '2025', code: 'PAHO/EIH/IS/25-0008',
        url: 'https://iris.paho.org/items/b98d9c0f-6008-4b78-9066-01e1e81c29c5',
        links: [
          { label: 'PAHO page', url: 'https://www.paho.org/es/documentos/ai-prompt-design-public-health-using-generative-ai-responsibly' },
          { label: 'News release', url: 'https://www.paho.org/en/news/20-10-2025-paho-publishes-guide-designing-artificial-intelligence-instructions-public-health' },
        ],
        summary: 'A guide to writing clear prompts for generative AI in health work. It breaks a prompt into objective, audience, format, tone and context, compares good prompts with SMART objectives, shows how vague prompts produce poor or biased output, and recommends reusable prompt libraries and human review of everything AI produces. It is part of PAHO\'s Digital Literacy Program. Items F04–F05 of this survey are based on it.',
      },
    ],
  },
  {
    id: 'public-health',
    title: 'Public health strategies and initiatives (PAHO, WHO, ITU)',
    note: 'Global and regional policies that frame digital health, AI and oral health.',
    items: [
      {
        title: 'PAHO — Artificial intelligence in health: technical documentation',
        source: 'PAHO/WHO', year: 'ongoing',
        url: 'https://www.paho.org/en/artificial-intelligence-health/technical-documentation-ai',
        links: [{ label: 'AI tools for public health', url: 'https://www.paho.org/en/artificial-intelligence-health/artificial-intelligence-tools-public-health' }],
        summary: 'PAHO\'s hub for AI in health: its own technical documents (AI in public health, questions and answers, bias, prompt design, cybersecurity), WHO guidance on ethics, regulation and evidence for AI devices, regional policies, and articles. The best single starting point for the PAHO material cited here.',
      },
      {
        title: 'Eight Guiding Principles for Digital Transformation of the Health Sector',
        source: 'PAHO/WHO', year: '2021',
        url: 'https://www.paho.org/en/documents/guiding-principles-8-digital-transformation-health-sector',
        summary: 'A call to action adopted by countries of the Americas: universal connectivity, digital public goods, inclusive digital health, interoperable systems, human rights, global cooperation on AI, information security, and a renewed public health architecture. It grew out of the Information Systems for Health (IS4H) initiative and frames the health-informatics part of this survey.',
      },
      {
        title: 'Plan of Action for Strengthening Information Systems for Health 2024–2030',
        source: 'PAHO/WHO, Directing Council document CD61/7', year: '2024',
        url: 'https://iris.paho.org/items/1b7d56e7-b364-4368-9dd5-27cb19db6201',
        summary: 'PAHO\'s regional plan to strengthen health information systems in the Americas: data governance, interoperability, digital health and workforce. It sets the regional policy context for electronic records and data use measured in Part G.',
      },
      {
        title: 'Policy on the application of data science in public health using artificial intelligence and other emerging technologies',
        source: 'PAHO/WHO, Directing Council resolution CD59.R2', year: '2021',
        url: 'https://iris.paho.org/items/828a5fe6-5c44-4137-9b6e-8858aebf011e',
        summary: 'A regional policy adopted by PAHO Member States on using data science and AI in public health responsibly, covering governance, ethics, workforce capacity, data and infrastructure. It is the policy basis for PAHO\'s later AI toolkits.',
      },
      {
        title: 'PAHO Oral Health Program',
        source: 'PAHO/WHO', year: 'ongoing',
        url: 'https://www.paho.org/en/topics/oral-health',
        links: [{ label: 'Global oral health strategy (PAHO page)', url: 'https://www.paho.org/en/documents/global-strategy-and-action-plan-oral-health-2023-2030' }],
        summary: 'PAHO\'s oral health program supports policy, evidence-based strategies and partnerships in its 35 Member States, with a focus on the most vulnerable groups. The page links regional status reports, country profiles and WHO oral health documents.',
      },
      {
        title: 'Global strategy and action plan on oral health 2023–2030',
        source: 'World Health Organization', year: '2024',
        url: 'https://www.who.int/publications/i/item/9789240090538',
        summary: 'Brings together the WHO oral health resolution (2021), global strategy (2022) and action plan (2023). It aims at universal health coverage for oral health by 2030, with 100 actions and 11 global targets across governance, prevention, workforce, care, information systems and research.',
      },
      {
        title: 'Global strategy on digital health 2020–2025 (extended to 2027)',
        source: 'World Health Organization', year: '2021; extension 2025',
        url: 'https://www.who.int/publications/i/item/9789240020924',
        links: [{ label: 'Extension news (2025)', url: 'https://www.who.int/news/item/23-05-2025-world-health-assembly-endorses-extension-of-the-global-digital-health-strategy-to-2027' }],
        summary: 'WHO\'s global plan for digital health: national strategies, governance, interoperability, people-centred digital services and workforce skills. In 2025 the World Health Assembly extended it to 2027 and asked WHO to prepare a new strategy for 2028–2033.',
      },
      {
        title: 'Ethics and governance of artificial intelligence for health',
        source: 'World Health Organization', year: '2021',
        url: 'https://www.who.int/publications/i/item/9789240029200',
        summary: 'WHO\'s first global guidance on AI in health. It sets six principles (protect autonomy; promote well-being and safety; transparency and explainability; responsibility and accountability; inclusiveness and equity; responsive and sustainable AI) and recommendations for governments, developers and health workers.',
      },
      {
        title: 'Ethics and governance of AI for health: Guidance on large multi-modal models',
        source: 'World Health Organization', year: '2024',
        url: 'https://www.who.int/publications/i/item/9789240084759',
        summary: 'Guidance on generative AI models that handle text, images and other inputs. It describes uses in diagnosis, patient self-care, administration, education and research, risks such as automation bias and unequal access, and more than 40 recommendations for governments, companies and providers. Relevant to Part F (generative AI).',
      },
      {
        title: 'Regulatory considerations on artificial intelligence for health',
        source: 'World Health Organization', year: '2023',
        url: 'https://iris.who.int/items/21da9dd6-f2b7-441f-823d-2f34fb1f39ea',
        summary: 'Key regulatory topics for AI health products: documentation and transparency, risk management, intended use and validation, data quality, privacy and data protection, and collaboration between regulators, developers and users.',
      },
      {
        title: 'ITU/WHO Focus Group on AI for Health — Topic Group on Dental Diagnostics and Digital Dentistry',
        source: 'International Telecommunication Union and WHO', year: '2019–2023',
        url: 'https://www.itu.int/en/ITU-T/focusgroups/ai4h/Documents/tg/CfP-TG-Dental.pdf',
        summary: 'An international group of clinicians, engineers and regulators that worked on fair benchmarking of dental AI, so different models can be compared on the same data. Its outputs include a description of dental use cases, an ethics checklist for dental AI and, with IADR, a core curriculum for dental AI education.',
      },
    ],
  },
  {
    id: 'global-dental',
    title: 'Global dental organizations',
    items: [
      {
        title: 'FDI policy statement: Artificial intelligence in dentistry',
        source: 'FDI World Dental Federation', year: '2024',
        url: 'https://fdiworlddental.org/node/2502',
        links: [{ label: 'PDF', url: 'https://fdiworlddental.org/sites/default/files/2024-11/DPS4-Artificial-Intelligence-in-Dentistry_0.pdf' }],
        summary: 'Adopted by the FDI General Assembly in Istanbul (September 2024). It asks dentists, educators, researchers, manufacturers and policy makers to act on AI, recommends basic AI literacy for all dental professionals, warns against over-reliance on AI (automation bias), and notes the lack of standard datasets to measure AI performance.',
      },
      {
        title: 'Artificial Intelligence for Dentistry — FDI white paper',
        source: 'FDI Artificial Intelligence Working Group (Schwendicke et al.)', year: '2023',
        url: 'https://www.fdiworlddental.org/sites/default/files/2023-01/FDI%20ARTIFICIAL%20INTELLIGENCE%20WORKING%20GROUP%20WHITE%20PAPER_0.pdf',
        summary: 'Explains AI for the dental community and how it can support individual care, public health, workforce planning and research, in line with FDI Vision 2030. It discusses risks such as bias and limited generalizability, and the balance between data protection and data access.',
      },
      {
        title: 'IADR e-Oral Health Network — AI in e-oral health and dentistry',
        source: 'International Association for Dental, Oral, and Craniofacial Research', year: '2023',
        url: 'https://www.iadr.org/about/news-reports/press-releases/future-artificial-intelligence-e-oral-health-and-dentistry',
        summary: 'IADR\'s network on digital oral health brings researchers together on AI, teledentistry, ethics and regulation. With ITU/WHO it produced the dental AI core curriculum and a reporting checklist for dental AI studies.',
      },
    ],
  },
]
