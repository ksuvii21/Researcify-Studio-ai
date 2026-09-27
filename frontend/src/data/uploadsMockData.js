export const initialUploadedDocuments = [
  {
    id: "doc-001",
    name: "AI Education Literature Review.pdf",
    type: "PDF",
    size: "3.4 MB",
    pages: 28,
    status: "ready",
    progress: 100,

    project: "Artificial Intelligence in Education",

    uploadedAt: "Today, 11:42 AM",

    chunks: 74,

    words: 12840,

    tags: [
      "AI Education",
      "Literature Review",
      "Generative AI",
    ],

    summary:
      "A literature review examining artificial intelligence in education, including personalized learning, generative AI, adaptive systems and responsible adoption.",

    extractedText:
      `Artificial intelligence is increasingly being integrated into educational environments through adaptive learning systems, intelligent tutoring platforms and generative AI tools.

The literature indicates that AI-supported learning can provide personalized feedback, automate educational tasks and support individualized learning pathways.

However, important research challenges remain around explainability, student trust, privacy, bias and the long-term educational impact of AI-assisted learning systems.

A recurring limitation across existing studies is the emphasis on technical system performance rather than longitudinal educational outcomes.`,
  },

  {
    id: "doc-002",
    name: "Research Methodology Notes.docx",
    type: "DOCX",
    size: "1.1 MB",
    pages: 14,
    status: "ready",
    progress: 100,

    project: "Artificial Intelligence in Education",

    uploadedAt: "Yesterday",

    chunks: 31,

    words: 6240,

    tags: [
      "Methodology",
      "Research Design",
    ],

    summary:
      "Research methodology notes covering research design, qualitative and quantitative approaches, sampling and evaluation methods.",

    extractedText:
      `Research methodology defines the systematic approach used to answer a research question.

A research design should align the research problem, objectives, data collection methods and analysis strategy.

Quantitative research focuses on measurable variables and statistical analysis, while qualitative research explores experiences, meanings and contextual factors.

Mixed-method approaches combine quantitative and qualitative evidence when a single method is insufficient.`,
  },

  {
    id: "doc-003",
    name: "Explainable AI Survey.pdf",
    type: "PDF",
    size: "5.8 MB",
    pages: 42,
    status: "ready",
    progress: 100,

    project: "Artificial Intelligence in Education",

    uploadedAt: "Sep 26",

    chunks: 116,

    words: 21850,

    tags: [
      "Explainable AI",
      "Survey",
      "Machine Learning",
    ],

    summary:
      "A survey of explainable AI approaches, evaluation strategies and open research challenges.",

    extractedText:
      `Explainable artificial intelligence aims to make AI system decisions more understandable to humans.

Existing approaches include feature attribution, example-based explanations, counterfactual explanations and interpretable surrogate models.

A major challenge is that explanation quality is often evaluated using technical metrics without sufficient consideration of whether explanations are actually useful to end users.`,
  },

  {
    id: "doc-004",
    name: "Human AI Collaboration Framework.pdf",
    type: "PDF",
    size: "2.6 MB",
    pages: 19,
    status: "processing",
    progress: 67,

    project: "Human-Computer Interaction",

    uploadedAt: "10 minutes ago",

    chunks: 34,

    words: 0,

    tags: [
      "Human-AI",
      "HCI",
    ],

    summary: "",

    extractedText: "",
  },

  {
    id: "doc-005",
    name: "Sustainable IoT Research.pdf",
    type: "PDF",
    size: "4.2 MB",
    pages: 35,
    status: "processing",
    progress: 31,

    project: "Sustainable IoT Systems",

    uploadedAt: "4 minutes ago",

    chunks: 0,

    words: 0,

    tags: [
      "IoT",
      "Sustainability",
    ],

    summary: "",

    extractedText: "",
  },

  {
    id: "doc-006",
    name: "Incomplete Research Paper.pdf",
    type: "PDF",
    size: "7.3 MB",
    pages: 0,
    status: "failed",
    progress: 0,

    project: "Ethics of Large Language Models",

    uploadedAt: "Sep 24",

    chunks: 0,

    words: 0,

    tags: [],

    summary: "",

    extractedText: "",
  },
];

export const uploadProjects = [
  "Artificial Intelligence in Education",
  "Human-Computer Interaction",
  "Sustainable IoT Systems",
  "Ethics of Large Language Models",
];