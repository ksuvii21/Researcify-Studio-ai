import {
  FileText,
  FolderOpen,
  MoreHorizontal,
  NotebookPen,
  Pin,
  ScrollText,
} from "lucide-react";

const CollectionCard = ({
  collection,
  view,
  onOpen,
  onTogglePin,
}) => {
  const paperCount =
    collection.items.filter(
      (item) => item.type === "paper"
    ).length;

  const documentCount =
    collection.items.filter(
      (item) => item.type === "document"
    ).length;

  const noteCount =
    collection.items.filter(
      (item) => item.type === "note"
    ).length;

  return (
    <article
      className={`collection-card ${
        view === "list"
          ? "collection-card--list"
          : ""
      }`}
    >
      <div className="collection-card__top">
        <span className="collection-card__icon">
          <FolderOpen size={23} />
        </span>

        <div>
          <button
            type="button"
            className={`collection-pin ${
              collection.pinned
                ? "active"
                : ""
            }`}
            onClick={() =>
              onTogglePin(collection.id)
            }
            title={
              collection.pinned
                ? "Unpin collection"
                : "Pin collection"
            }
          >
            <Pin size={16} />
          </button>

          <button
            type="button"
            className="collection-more"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="collection-card__content">
        <span className="collection-card__label">
          Research Collection
        </span>

        <h2>{collection.name}</h2>

        <p>
          {collection.description}
        </p>

        <div className="collection-card__items">
          <span>
            <ScrollText size={14} />
            {paperCount} papers
          </span>

          <span>
            <FileText size={14} />
            {documentCount} documents
          </span>

          <span>
            <NotebookPen size={14} />
            {noteCount} notes
          </span>
        </div>

        <div className="collection-card__tags">
          {collection.tags.map(
            (tag) => (
              <span key={tag}>
                {tag}
              </span>
            )
          )}
        </div>
      </div>

      <footer className="collection-card__footer">
        <span>
          Updated {collection.updatedAt}
        </span>

        <button
          type="button"
          onClick={() =>
            onOpen(collection.id)
          }
        >
          Open Collection
        </button>
      </footer>
    </article>
  );
};

export default CollectionCard;