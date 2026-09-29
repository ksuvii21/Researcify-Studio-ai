import {
  BookOpen,
  ExternalLink,
  Star,
  Trash2,
} from "lucide-react";

import Modal from "../common/Modal";

const LibraryPaperModal = ({
  paper,
  onClose,
  onFavorite,
  onDelete,
}) => {
  if (!paper) return null;

  const authors = paper.authors?.length
    ? paper.authors.join(", ")
    : "Unknown authors";

  const addedDate = paper.createdAt
    ? new Date(paper.createdAt).toLocaleDateString(
        undefined,
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : "—";

  return (
    <Modal
      open={Boolean(paper)}
      onClose={onClose}
      title="Paper Preview"
      description="Research Library"
      icon={BookOpen}
      size="lg"
    >
      <div className="library-preview">
        <div className="library-preview__badges">
          <span>{paper.source}</span>

          {paper.year && <span>{paper.year}</span>}

          {paper.isFavorite && (
            <span>Favorite</span>
          )}
        </div>

        <h2>{paper.title}</h2>

        <p className="library-preview__authors">
          {authors}
        </p>

        {paper.journal && (
          <p className="library-preview__journal">
            {paper.journal}
          </p>
        )}

        <div className="library-preview__stats">
          {paper.doi && (
            <span>DOI {paper.doi}</span>
          )}

          <span>Added {addedDate}</span>
        </div>

        <section>
          <span className="library-preview__label">
            Abstract
          </span>

          <p>
            {paper.abstract ||
              "No abstract available for this paper."}
          </p>
        </section>

        {paper.keywords?.length > 0 && (
          <section>
            <span className="library-preview__label">
              Research Topics
            </span>

            <div className="library-preview__tags">
              {paper.keywords.map((keyword) => (
                <span key={keyword}>
                  {keyword}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="library-preview__actions">
          <button
            type="button"
            onClick={() => onFavorite(paper._id)}
          >
            <Star
              size={15}
              fill={
                paper.isFavorite
                  ? "currentColor"
                  : "none"
              }
            />

            {paper.isFavorite
              ? "Favorited"
              : "Favorite"}
          </button>

          {paper.url && (
            <a
              className="library-preview__link"
              href={paper.url}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={15} />
              View source
            </a>
          )}

          <button
            type="button"
            className="library-preview__delete"
            onClick={() => onDelete(paper)}
          >
            <Trash2 size={15} />
            Remove
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LibraryPaperModal;