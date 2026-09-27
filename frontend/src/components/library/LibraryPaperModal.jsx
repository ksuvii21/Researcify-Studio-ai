import {
  Bot,
  BookOpen,
  FolderPlus,
  Heart,
  Quote,
  Sparkles,
} from "lucide-react";

import Modal from "../common/Modal";

const LibraryPaperModal = ({
  paper,
  onClose,
  onFavorite,
}) => {
  if (!paper) return null;

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
          <span>{paper.type}</span>

          <span>{paper.year}</span>

          {paper.openAccess && (
            <span>Open Access</span>
          )}
        </div>

        <h2>{paper.title}</h2>

        <p className="library-preview__authors">
          {paper.authors.join(", ")}
        </p>

        <p className="library-preview__journal">
          {paper.journal}
        </p>

        <div className="library-preview__stats">
          <span>
            <Quote size={14} />
            {paper.citations} citations
          </span>

          <span>
            Added {paper.added}
          </span>
        </div>

        <section>
          <span className="library-preview__label">
            Abstract
          </span>

          <p>{paper.abstract}</p>
        </section>

        <section>
          <span className="library-preview__label">
            Research Topics
          </span>

          <div className="library-preview__tags">
            {paper.tags.map((tag) => (
              <span key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </section>

        <div className="library-preview__context">
          <Sparkles size={18} />

          <div>
            <strong>
              Research Context
            </strong>

            <p>
              This paper is currently connected
              to the{" "}
              <b>{paper.project}</b> project and
              the <b>{paper.collection}</b>{" "}
              collection.
            </p>
          </div>
        </div>

        <div className="library-preview__actions">
          <button
            type="button"
            onClick={() =>
              onFavorite(paper.id)
            }
          >
            <Heart
              size={15}
              fill={
                paper.favorite
                  ? "currentColor"
                  : "none"
              }
            />

            {paper.favorite
              ? "Favorited"
              : "Favorite"}
          </button>

          <button type="button">
            <FolderPlus size={15} />
            Add to Project
          </button>

          <button
            type="button"
            className="library-preview__ai"
          >
            <Bot size={15} />
            Ask AI
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LibraryPaperModal;