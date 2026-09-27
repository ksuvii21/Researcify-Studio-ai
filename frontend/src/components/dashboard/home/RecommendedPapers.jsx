import {
  ArrowUpRight,
  Bookmark,
  Sparkles,
} from "lucide-react";

const recommendations = [
  {
    id: 1,
    title:
      "Large Language Models for Personalized Learning: A Systematic Review",
    authors: "M. Lee et al.",
    year: 2026,
    source: "IEEE Access",
    relevance: "96% match",
    tags: ["LLM", "Education"],
  },
  {
    id: 2,
    title:
      "AI-Assisted Learning Analytics in Higher Education",
    authors: "A. Kumar et al.",
    year: 2025,
    source: "Springer",
    relevance: "91% match",
    tags: ["Analytics", "AI"],
  },
  {
    id: 3,
    title:
      "Trust and Transparency in Intelligent Tutoring Systems",
    authors: "J. Wilson et al.",
    year: 2026,
    source: "ACM",
    relevance: "88% match",
    tags: ["Trust", "XAI"],
  },
];

const RecommendedPapers = () => {
  return (
    <section className="dashboard-card recommended-papers">
      <div className="dashboard-card__header">
        <div>
          <h2>Recommended for You</h2>
          <p>
            Based on your projects and saved research.
          </p>
        </div>

        <Sparkles
          className="dashboard-card__accent-icon"
          size={17}
        />
      </div>

      <div className="recommended-papers__list">
        {recommendations.map((paper) => (
          <article
            className="recommended-paper"
            key={paper.id}
          >
            <div className="recommended-paper__match">
              {paper.relevance}
            </div>

            <h3>{paper.title}</h3>

            <p>
              {paper.authors} · {paper.year} ·{" "}
              {paper.source}
            </p>

            <div className="recommended-paper__tags">
              {paper.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className="recommended-paper__actions">
              <button type="button">
                Preview
                <ArrowUpRight size={12} />
              </button>

              <button type="button">
                <Bookmark size={12} />
                Save
              </button>

              <button type="button">
                <Sparkles size={12} />
                AI Summary
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RecommendedPapers;