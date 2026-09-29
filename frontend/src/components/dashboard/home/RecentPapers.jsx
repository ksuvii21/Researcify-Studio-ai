import {
  ChevronRight,
  Star,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import useDashboardPapers from "../../../hooks/useDashboardPapers";

const RecentPapers = () => {
  const navigate = useNavigate();

  const {
    recentPapers,
    loading,
    error,
  } = useDashboardPapers();

  return (
    <section className="dashboard-card recent-papers">
      <div className="dashboard-card__header">
        <div>
          <h2>Recent Papers</h2>
          <p>Recently added to your library.</p>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={() => navigate("/library")}
        >
          View Library
          <ChevronRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="recent-papers__state">
          <p>Loading papers...</p>
        </div>
      ) : error ? (
        <div className="recent-papers__state">
          <p>{error}</p>
        </div>
      ) : recentPapers.length === 0 ? (
        <div className="recent-papers__state">
          <h3>No papers yet</h3>

          <p>
            Papers you save will appear here.
          </p>

          <button
            type="button"
            onClick={() => navigate("/library")}
          >
            Go to Library
          </button>
        </div>
      ) : (
        <div className="recent-papers__list">
          {recentPapers.map((paper) => (
            <article
              className="recent-paper"
              key={paper._id}
            >
              <div className="recent-paper__main">
                <div className="recent-paper__top">
                  <span className="paper-status">
                    {paper.source || "Saved"}
                  </span>

                  <div className="recent-paper__top-actions">
                    <button
                      type="button"
                      aria-label="Open paper"
                      onClick={() =>
                        navigate(
                          `/library/${paper._id}`
                        )
                      }
                    >
                      <Star
                        size={14}
                        fill={
                          paper.isFavorite
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>
                </div>

                <h3>{paper.title}</h3>

                <p>
                  {paper.authors?.length
                    ? paper.authors.join(", ")
                    : "Unknown authors"}
                  {paper.year ? ` · ${paper.year}` : ""}
                  {paper.journal
                    ? ` · ${paper.journal}`
                    : ""}
                </p>

                {paper.keywords?.length > 0 && (
                  <div className="recent-paper__tags">
                    {paper.keywords
                      .slice(0, 3)
                      .map((keyword) => (
                        <span key={keyword}>
                          {keyword}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <div className="recent-paper__actions">
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/library/${paper._id}`)
                  }
                >
                  Open
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecentPapers;