import {
  Heart,
  Star,
  Trash2,
} from "lucide-react";

const LibraryPaperCard = ({
  paper,
  view,
  onFavorite,
  onDelete,
  onOpen,
  onOpenDetail,
}) => {
  const authors = paper.authors?.length
    ? paper.authors.join(", ")
    : "Unknown authors";

  const journalLine = [paper.journal, paper.year]
    .filter(Boolean)
    .join(" · ");

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
    <article
      className={`library-paper ${
        view === "list"
          ? "library-paper--list"
          : ""
      }`}
    >
      <div className="library-paper__top">
        <div className="library-paper__badges">
          <span>{paper.source}</span>

          {paper.isFavorite && (
            <span className="open-access">
              Favorite
            </span>
          )}
        </div>

        <button
          type="button"
          className="library-paper__more"
          aria-label="Remove from library"
          onClick={onDelete}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="library-paper__content">
        <h2
          className="library-paper__title"
          onClick={() => onOpenDetail(paper)}
          role="link"
          tabIndex={0}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              onOpenDetail(paper);
            }
          }}
        >
          {paper.title}
        </h2>

        <p className="library-paper__authors">
          {authors}
        </p>

        {journalLine && (
          <p className="library-paper__journal">
            {journalLine}
          </p>
        )}

        {paper.abstract && (
          <p className="library-paper__abstract">
            {paper.abstract}
          </p>
        )}

        {paper.keywords?.length > 0 && (
          <div className="library-paper__tags">
            {paper.keywords.map((keyword) => (
              <span key={keyword}>
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="library-paper__metadata">
        {paper.doi ? (
          <span>DOI {paper.doi}</span>
        ) : (
          <span>No DOI</span>
        )}

        <span>Added {addedDate}</span>
      </div>

      <footer className="library-paper__actions">
        <button
          type="button"
          onClick={() => onFavorite(paper._id)}
          className={
            paper.isFavorite ? "favorite" : ""
          }
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

        <button
          type="button"
          className="library-paper__open"
          onClick={() => onOpen(paper)}
        >
          <Heart size={15} />
          Quick Preview
        </button>
      </footer>
    </article>
  );
};

export default LibraryPaperCard;