export const initialCollections = [
  {
    id: "ai-education",
    name: "AI in Education",
    description:
      "Research papers, notes and documents exploring artificial intelligence in modern learning environments.",
    pinned: true,
    updatedAt: "Today",
    tags: ["AI", "Education", "Adaptive Learning"],
    items: [
      {
        id: "paper-001",
        type: "paper",
        title:
          "Generative AI and Personalized Learning Environments",
        description:
          "Research on generative AI for personalized and adaptive learning.",
        meta: "Mitchell, Wong & Sharma · 2026",
      },
      {
        id: "paper-002",
        type: "paper",
        title:
          "Explainable Artificial Intelligence in Adaptive Learning Systems",
        description:
          "Examines explainability and learner trust in AI-supported education.",
        meta: "Chen & Rodriguez · 2025",
      },
      {
        id: "doc-001",
        type: "document",
        title:
          "AI Education Literature Review.pdf",
        description:
          "Processed literature review containing research themes and findings.",
        meta: "PDF · 28 pages",
      },
      {
        id: "note-001",
        type: "note",
        title: "Research Gaps",
        description:
          "Potential research gaps identified while reviewing explainable AI literature.",
        meta: "Updated today",
      },
    ],
  },

  {
    id: "explainable-ai",
    name: "Explainable AI",
    description:
      "Studies related to interpretability, transparency and explainable machine learning.",
    pinned: true,
    updatedAt: "Yesterday",
    tags: ["XAI", "Machine Learning"],
    items: [
      {
        id: "paper-003",
        type: "paper",
        title:
          "Evaluating Explainability in Human-Centered AI",
        description:
          "Evaluation approaches for explanation quality and human understanding.",
        meta: "Research Paper · 2026",
      },
      {
        id: "doc-002",
        type: "document",
        title: "Explainable AI Survey.pdf",
        description:
          "Survey of explainability methods and open research challenges.",
        meta: "PDF · 42 pages",
      },
    ],
  },

  {
    id: "research-methodology",
    name: "Research Methodology",
    description:
      "Methodology references, research design notes and academic writing resources.",
    pinned: false,
    updatedAt: "Sep 25",
    tags: ["Methodology", "Research Design"],
    items: [
      {
        id: "note-002",
        type: "note",
        title: "Qualitative vs Quantitative",
        description:
          "Comparison of qualitative, quantitative and mixed-method research approaches.",
        meta: "Research Note",
      },
      {
        id: "doc-003",
        type: "document",
        title: "Research Methodology Notes.docx",
        description:
          "Methodology notes covering sampling, research design and evaluation.",
        meta: "DOCX · 14 pages",
      },
    ],
  },

  {
    id: "human-ai-collaboration",
    name: "Human-AI Collaboration",
    description:
      "Research exploring collaborative systems involving humans and artificial intelligence.",
    pinned: false,
    updatedAt: "Sep 23",
    tags: ["HCI", "Human-AI"],
    items: [
      {
        id: "paper-004",
        type: "paper",
        title:
          "Human-AI Collaboration: Emerging Research Directions",
        description:
          "Review of emerging approaches for collaborative intelligent systems.",
        meta: "Williams, Patel & Thompson",
      },
    ],
  },

  {
    id: "sustainable-iot",
    name: "Sustainable IoT",
    description:
      "Energy-efficient IoT systems, edge computing and sustainable connected devices.",
    pinned: false,
    updatedAt: "Sep 21",
    tags: ["IoT", "Sustainability"],
    items: [
      {
        id: "doc-004",
        type: "document",
        title: "Sustainable IoT Research.pdf",
        description:
          "Research material related to sustainable and low-power IoT systems.",
        meta: "PDF · 35 pages",
      },
    ],
  },
];

export const collectionColors = [
  "slate",
  "blue",
  "sand",
  "green",
];