import {
  Bot,
  ExternalLink,
  FolderPlus,
  Heart,
  MoreHorizontal,
  Quote,
} from "lucide-react";

const LibraryPaperCard = ({
  paper,
  view,
  onFavorite,
  onOpen,
}) => {
  return (
    <article
      className={`library-paper ${
        view === "list"
          ? "library-paper--list"
          : ""
      }`}
    >
      <div className="library-paper__top">
        <div className="library-paper__badges">
          <span>{paper.type}</span>

          {paper.openAccess && (
            <span className="open-access">
              Open Access
            </span>
          )}
        </div>

        <button
          type="button"
          className="library-paper__more"
          aria-label="More actions"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="library-paper__content">
        <h2>{paper.title}</h2>

        <p className="library-paper__authors">
          {paper.authors.join(", ")}
        </p>

        <p className="library-paper__journal">
          {paper.journal} · {paper.year}
        </p>

        <p className="library-paper__abstract">
          {paper.abstract}
        </p>

        <div className="library-paper__tags">
          {paper.tags.map((tag) => (
            <span key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="library-paper__metadata">
        <span>
          <Quote size={13} />
          {paper.citations} citations
        </span>

        <span>
          Added {paper.added}
        </span>
      </div>

      <div className="library-paper__relation">
        <div>
          <span>Project</span>
          <strong>{paper.project}</strong>
        </div>

        <div>
          <span>Collection</span>
          <strong>
            {paper.collection}
          </strong>
        </div>
      </div>

      <footer className="library-paper__actions">
        <button
          type="button"
          onClick={() =>
            onFavorite(paper.id)
          }
          className={
            paper.favorite
              ? "favorite"
              : ""
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
          Organize
        </button>

        <button type="button">
          <Bot size={15} />
          AI Summary
        </button>

        <button
          type="button"
          className="library-paper__open"
          onClick={() =>
            onOpen(paper)
          }
        >
          <ExternalLink size={15} />
          Preview
        </button>
      </footer>
    </article>
  );
};

export default LibraryPaperCard;