import {
  BookOpen,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const ProjectPapers = ({
  papers,
  loading,
  error,
  onAddPaper,
  onRemovePaper,
  onRetry,
}) => {
  const navigate = useNavigate();

  const renderBody = () => {
    if (loading) {
      return (
        <div className="project-relation-state">
          <p>Loading project papers...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="project-relation-state project-relation-state--error">
          <p>{error}</p>

          <button type="button" onClick={onRetry}>
            Try Again
          </button>
        </div>
      );
    }

    if (!papers.length) {
      return (
        <div className="project-relation-state">
          <h3>No papers added yet</h3>

          <p>
            Connect papers from your research
            library to keep this project organized.
          </p>

          <button type="button" onClick={onAddPaper}>
            Add Paper
          </button>
        </div>
      );
    }

    return (
      <div className="project-resource-list">
        {papers.map((paper) => (
          <article
            key={paper._id}
            className="project-resource"
          >
            <span className="project-resource__icon">
              <BookOpen size={18} />
            </span>

            <div className="project-resource__content">
              <h3>{paper.title}</h3>

              <p>
                {paper.authors?.length
                  ? paper.authors.join(", ")
                  : "Unknown authors"}
              </p>

              <div>
                {paper.journal && (
                  <span>{paper.journal}</span>
                )}

                {paper.year && (
                  <span>{paper.year}</span>
                )}

                {paper.source && (
                  <span>{paper.source}</span>
                )}
              </div>
            </div>

            <button
              type="button"
              aria-label={`Open ${paper.title}`}
              onClick={() =>
                navigate(`/library/${paper._id}`)
              }
            >
              <ExternalLink size={16} />
            </button>

            <button
              type="button"
              aria-label={`Remove ${paper.title} from project`}
              className="project-resource__remove"
              onClick={() => onRemovePaper(paper)}
            >
              <Trash2 size={16} />
            </button>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="project-section">
      <div className="project-section__header">
        <div>
          <h2>Research Papers</h2>
          <p>
            Literature connected to this research
            project.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddPaper}
          disabled={loading}
        >
          <Plus size={15} />
          Add Paper
        </button>
      </div>

      {renderBody()}
    </div>
  );
};

export default ProjectPapers;