import {
  BookOpen,
  SearchX,
} from "lucide-react";

import PaperResultCard from "./PaperResultCard";

const PaperResults = ({
  papers,
  onSave,
  onSummary,
}) => {
  return (
    <section className="paper-results">
      <div className="paper-results__header">
        <div>
          <h2>Research Papers</h2>

          <p>
            Papers matching your current
            discovery criteria.
          </p>
        </div>

        <BookOpen size={18} />
      </div>

      {papers.length ? (
        <div className="paper-results__list">
          {papers.map((paper) => (
            <PaperResultCard
              key={paper.id}
              paper={paper}
              onSave={onSave}
              onSummary={onSummary}
            />
          ))}
        </div>
      ) : (
        <div className="discover-empty">
          <SearchX size={26} />

          <h3>No papers found</h3>

          <p>
            Try another keyword or change your
            filters.
          </p>
        </div>
      )}
    </section>
  );
};

export default PaperResults;