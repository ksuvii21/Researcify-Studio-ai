import { useMemo, useState } from "react";

import DiscoverHeader from "../components/discover/DiscoverHeader";
import DiscoverSearch from "../components/discover/DiscoverSearch";
import DiscoverFilters from "../components/discover/DiscoverFilters";
import PaperResults from "../components/discover/PaperResults";
import TrendingTopics from "../components/discover/TrendingTopics";
import SuggestedSearches from "../components/discover/SuggestedSearches";
import PaperSummaryModal from "../components/discover/PaperSummaryModal";

import "../components/discover/discover.css";

const initialPapers = [
  {
    id: 1,
    title:
      "Generative AI and Personalized Learning Environments",
    authors:
      "Sarah Mitchell, Daniel Wong, Priya Sharma",
    journal:
      "Journal of Artificial Intelligence in Education",
    year: 2026,
    citations: 142,
    type: "Journal Article",
    openAccess: true,
    saved: true,
    relevance: 98,
    abstract:
      "This study examines the use of generative artificial intelligence within personalized learning environments and explores its influence on adaptive instruction, student engagement and learning outcomes.",
    tags: [
      "Generative AI",
      "Education",
      "Personalized Learning",
    ],
  },
  {
    id: 2,
    title:
      "Explainable Artificial Intelligence in Adaptive Learning Systems",
    authors:
      "Michael Chen, Elena Rodriguez",
    journal:
      "Computers & Education: Artificial Intelligence",
    year: 2026,
    citations: 87,
    type: "Research Paper",
    openAccess: true,
    saved: false,
    relevance: 94,
    abstract:
      "The paper investigates explainability techniques for adaptive educational systems and discusses how transparent AI recommendations may improve trust among students and educators.",
    tags: [
      "XAI",
      "Adaptive Learning",
      "Education",
    ],
  },
  {
    id: 3,
    title:
      "Human-AI Collaboration: Emerging Research Directions",
    authors:
      "A. Williams, J. Patel, R. Thompson",
    journal:
      "ACM Computing Surveys",
    year: 2025,
    citations: 213,
    type: "Review",
    openAccess: false,
    saved: false,
    relevance: 91,
    abstract:
      "A review of emerging approaches to human-AI collaboration, including shared decision-making, explainability, augmentation and interaction design.",
    tags: [
      "Human-AI",
      "HCI",
      "Collaboration",
    ],
  },
  {
    id: 4,
    title:
      "Ethical Challenges of Large Language Models in Higher Education",
    authors:
      "Laura Kim, Robert Evans",
    journal:
      "International Journal of Educational Technology",
    year: 2025,
    citations: 64,
    type: "Journal Article",
    openAccess: true,
    saved: true,
    relevance: 87,
    abstract:
      "This work analyzes ethical issues surrounding large language model adoption in higher education, including transparency, academic integrity, privacy and algorithmic bias.",
    tags: [
      "LLMs",
      "Ethics",
      "Higher Education",
    ],
  },
];

const DiscoverPage = () => {
  const [papers, setPapers] =
    useState(initialPapers);

  const [query, setQuery] = useState("");

  const [filters, setFilters] = useState({
    year: "all",
    type: "all",
    access: "all",
    sort: "relevance",
  });

  const [summaryPaper, setSummaryPaper] =
    useState(null);

  const filteredPapers = useMemo(() => {
    let result = [...papers];

    const normalized =
      query.trim().toLowerCase();

    if (normalized) {
      result = result.filter((paper) => {
        const searchable = [
          paper.title,
          paper.authors,
          paper.journal,
          ...paper.tags,
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(normalized);
      });
    }

    if (filters.year !== "all") {
      result = result.filter(
        (paper) =>
          String(paper.year) === filters.year
      );
    }

    if (filters.type !== "all") {
      result = result.filter(
        (paper) =>
          paper.type === filters.type
      );
    }

    if (filters.access === "open") {
      result = result.filter(
        (paper) => paper.openAccess
      );
    }

    if (filters.sort === "citations") {
      result.sort(
        (a, b) => b.citations - a.citations
      );
    }

    if (filters.sort === "newest") {
      result.sort(
        (a, b) => b.year - a.year
      );
    }

    if (filters.sort === "relevance") {
      result.sort(
        (a, b) => b.relevance - a.relevance
      );
    }

    return result;
  }, [papers, query, filters]);

  const toggleSaved = (paperId) => {
    setPapers((current) =>
      current.map((paper) =>
        paper.id === paperId
          ? {
              ...paper,
              saved: !paper.saved,
            }
          : paper
      )
    );
  };

  return (
    <div className="discover-page">
      <DiscoverHeader />

      <DiscoverSearch
        query={query}
        onQueryChange={setQuery}
      />

      {!query && (
        <div className="discover-explore">
          <SuggestedSearches
            onSelect={setQuery}
          />

          <TrendingTopics
            onSelect={setQuery}
          />
        </div>
      )}

      <DiscoverFilters
        filters={filters}
        setFilters={setFilters}
        resultCount={filteredPapers.length}
      />

      <PaperResults
        papers={filteredPapers}
        onSave={toggleSaved}
        onSummary={setSummaryPaper}
      />

      <PaperSummaryModal
        paper={summaryPaper}
        onClose={() =>
          setSummaryPaper(null)
        }
      />
    </div>
  );
};

export default DiscoverPage;