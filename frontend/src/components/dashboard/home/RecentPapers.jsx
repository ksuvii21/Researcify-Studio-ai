import {
  Bookmark,
  Bot,
  ChevronRight,
  MoreHorizontal,
  Star,
} from "lucide-react";

const papers = [
  {
    id: 1,
    title:
      "Generative AI and Personalized Learning Environments",
    authors: "R. Sharma, A. Mehta",
    year: 2026,
    source: "Journal of AI in Education",
    citations: 42,
    status: "Reading",
    tags: ["Generative AI", "Education"],
    saved: true,
  },
  {
    id: 2,
    title:
      "Explainable Artificial Intelligence in Adaptive Learning Systems",
    authors: "L. Chen, M. Williams",
    year: 2025,
    source: "Computers & Education",
    citations: 118,
    status: "Unread",
    tags: ["XAI", "Adaptive Learning"],
    saved: false,
  },
  {
    id: 3,
    title:
      "Human-AI Collaboration: Emerging Research Directions",
    authors: "S. Patel, J. Kim",
    year: 2026,
    source: "ACM Computing Surveys",
    citations: 36,
    status: "Completed",
    tags: ["HCI", "AI"],
    saved: true,
  },
  {
    id: 4,
    title:
      "Ethical Challenges of Large Language Models in Higher Education",
    authors: "E. Martin, K. Roy",
    year: 2025,
    source: "Educational Technology Research",
    citations: 73,
    status: "Unread",
    tags: ["LLM", "Ethics"],
    saved: false,
  },
];

const RecentPapers = () => {
  return (
    <section className="dashboard-card recent-papers">
      <div className="dashboard-card__header">
        <div>
          <h2>Recent Papers</h2>
          <p>Recently added and opened research.</p>
        </div>

        <button type="button" className="text-button">
          View Library
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="recent-papers__list">
        {papers.map((paper) => (
          <article
            className="recent-paper"
            key={paper.id}
          >
            <div className="recent-paper__main">
              <div className="recent-paper__top">
                <span
                  className={`paper-status paper-status--${paper.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {paper.status}
                </span>

                <div className="recent-paper__top-actions">
                  <button
                    type="button"
                    aria-label="Favorite paper"
                  >
                    <Star size={14} />
                  </button>

                  <button
                    type="button"
                    aria-label="More paper options"
                  >
                    <MoreHorizontal size={15} />
                  </button>
                </div>
              </div>

              <h3>{paper.title}</h3>

              <p>
                {paper.authors} · {paper.year} ·{" "}
                {paper.source}
              </p>

              <div className="recent-paper__tags">
                {paper.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}

                <small>
                  {paper.citations} citations
                </small>
              </div>
            </div>

            <div className="recent-paper__actions">
              <button type="button">
                Read
              </button>

              <button type="button">
                <Bot size={13} />
                AI Summary
              </button>

              <button
                type="button"
                className={
                  paper.saved ? "is-saved" : ""
                }
              >
                <Bookmark size={13} />
                {paper.saved ? "Saved" : "Save"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RecentPapers;