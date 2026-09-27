import {
  Bookmark,
  BookmarkCheck,
  Bot,
  ExternalLink,
  FolderPlus,
  Quote,
} from "lucide-react";

const PaperResultCard = ({
  paper,
  onSave,
  onSummary,
}) => {
  return (
    <article className="paper-result-card">
      <div className="paper-result-card__main">
        <div className="paper-result-card__meta">
          <span className="paper-type">
            {paper.type}
          </span>

          {paper.openAccess && (
            <span className="paper-access">
              Open Access
            </span>
          )}

          <span>{paper.year}</span>
        </div>

        <h2>{paper.title}</h2>

        <p className="paper-authors">
          {paper.authors}
        </p>

        <p className="paper-journal">
          {paper.journal}
        </p>

        <p className="paper-abstract">
          {paper.abstract}
        </p>

        <div className="paper-tags">
          {paper.tags.map((tag) => (
            <span key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <div className="paper-result-card__footer">
          <div className="paper-stats">
            <span>
              <Quote size={12} />
              {paper.citations} citations
            </span>

            <span>
              {paper.relevance}% match
            </span>
          </div>

          <div className="paper-actions">
            <button
              type="button"
              onClick={() =>
                onSummary(paper)
              }
            >
              <Bot size={14} />
              AI Summary
            </button>

            <button type="button">
              <FolderPlus size={14} />
              Project
            </button>

            <button
              type="button"
              onClick={() =>
                onSave(paper.id)
              }
            >
              {paper.saved ? (
                <BookmarkCheck size={14} />
              ) : (
                <Bookmark size={14} />
              )}

              {paper.saved
                ? "Saved"
                : "Save"}
            </button>

            <button
              type="button"
              className="paper-actions__open"
            >
              <ExternalLink size={14} />
              Open
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PaperResultCard;