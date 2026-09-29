import {
  Archive,
  FileText,
  FolderOpen,
  Pin,
  ScrollText,
  Trash2,
} from "lucide-react";

/*
 * Counts come straight from the API's paperCount and
 * documentCount fields rather than being derived from a
 * nested item list. There are deliberately no reading
 * progress, collaborator or research score values: none of
 * those exist in the Collection schema, so rendering them
 * would mean inventing data.
 */
const CollectionCard = ({
  collection,
  view,
  onOpen,
  onTogglePin,
  onDelete,
}) => {
  const hasItems =
    collection.paperCount > 0 ||
    collection.documentCount > 0;

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
              collection.pinned ? "active" : ""
            }`}
            onClick={() =>
              onTogglePin(collection.id)
            }
            title={
              collection.pinned
                ? "Unpin collection"
                : "Pin collection"
            }
            aria-label={
              collection.pinned
                ? "Unpin collection"
                : "Pin collection"
            }
          >
            <Pin size={16} />
          </button>

          {/*
           * Delete removes only the container. The
           * confirmation states that explicitly, because
           * the papers and documents inside are untouched.
           */}
          <button
            type="button"
            className="collection-more danger"
            onClick={() => onDelete(collection)}
            title="Delete collection"
            aria-label="Delete collection"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="collection-card__content">
        <span className="collection-card__label">
          {collection.archived
            ? "Archived"
            : "Research Collection"}
        </span>

        <h2>{collection.name}</h2>

        <p>
          {collection.description ||
            "No description for this collection."}
        </p>

        <div className="collection-card__items">
          {hasItems ? (
            <>
              <span>
                <ScrollText size={14} />
                {collection.paperCount} paper
                {collection.paperCount === 1 ? "" : "s"}
              </span>

              <span>
                <FileText size={14} />
                {collection.documentCount} document
                {collection.documentCount === 1
                  ? ""
                  : "s"}
              </span>
            </>
          ) : (
            <span>
              <Archive size={14} />
              Empty collection
            </span>
          )}
        </div>
      </div>

      <footer className="collection-card__footer">
        <span>
          Updated {collection.updatedAt}
        </span>

        <button
          type="button"
          onClick={() => onOpen(collection.id)}
        >
          Open Collection
        </button>
      </footer>
    </article>
  );
};

export default CollectionCard;
