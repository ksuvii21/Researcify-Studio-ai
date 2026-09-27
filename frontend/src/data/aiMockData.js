export const aiConversations = [
  {
    id: "chat-001",
    title: "Research gaps in explainable AI",
    preview: "Identify underexplored areas in explainable AI...",
    date: "Today",
  },
  {
    id: "chat-002",
    title: "Compare adaptive learning papers",
    preview: "Compare the methodologies and findings...",
    date: "Today",
  },
  {
    id: "chat-003",
    title: "AI ethics literature review",
    preview: "Summarize recurring ethical concerns...",
    date: "Yesterday",
  },
  {
    id: "chat-004",
    title: "Human-AI collaboration framework",
    preview: "Help me structure a conceptual framework...",
    date: "Sep 25",
  },
  {
    id: "chat-005",
    title: "Sustainable IoT findings",
    preview: "What findings appear consistently...",
    date: "Sep 23",
  },
];

export const researchModes = [
  {
    id: "research",
    label: "Research",
    description: "Explore a research topic",
  },
  {
    id: "summarize",
    label: "Summarize",
    description: "Condense papers and documents",
  },
  {
    id: "compare",
    label: "Compare",
    description: "Compare findings and methods",
  },
  {
    id: "gaps",
    label: "Research Gaps",
    description: "Find underexplored areas",
  },
];

export const aiContextPapers = [
  {
    id: "paper-001",
    title: "Generative AI and Personalized Learning Environments",
    authors: "Mitchell, Wong & Sharma",
    selected: true,
  },
  {
    id: "paper-002",
    title: "Explainable Artificial Intelligence in Adaptive Learning Systems",
    authors: "Chen & Rodriguez",
    selected: true,
  },
  {
    id: "paper-003",
    title: "Human-AI Collaboration: Emerging Research Directions",
    authors: "Williams, Patel & Thompson",
    selected: false,
  },
];

export const aiContextDocuments = [
  {
    id: "doc-001",
    name: "AI Education Literature Review.pdf",
    type: "PDF",
    selected: false,
  },
  {
    id: "doc-002",
    name: "Research Methodology Notes.docx",
    type: "DOCX",
    selected: false,
  },
];

export const suggestedPrompts = [
  "Find research gaps in these papers",
  "Compare the methodologies",
  "Summarize the main findings",
  "Identify conflicting conclusions",
  "Generate research questions",
  "Create a literature review outline",
];

export const initialMessages = [
  {
    id: "message-001",
    role: "assistant",
    content:
      "Hi! I’m your Researcify research assistant. I can help you analyze papers, compare findings, identify research gaps, generate research questions and work with the sources in your research workspace.",
  },
];