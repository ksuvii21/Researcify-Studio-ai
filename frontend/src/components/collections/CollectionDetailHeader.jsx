import {
  ArrowLeft,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Sparkles,
} from "lucide-react";

const CollectionDetailHeader = ({
  collection,
  onBack,
}) => {
  return (
    <header className="collection-detail-header">
      <button
        type="button"
        className="collection-back"
        onClick={onBack}
      >
        <ArrowLeft size={17} />
        Collections
      </button>

      <div className="collection-detail-header__main">
        <div>
          <span className="collections-eyebrow">
            <Sparkles size={15} />
            Research Collection
          </span>

          <div className="collection-detail-title">
            <span>
              <FolderOpen size={25} />
            </span>

            <div>
              <h1>
                {collection.name}
              </h1>

              <p>
                {collection.description}
              </p>
            </div>
          </div>
        </div>

        <div className="collection-detail-actions">
          <button type="button">
            <MoreHorizontal size={17} />
          </button>

          <button
            type="button"
            className="primary"
          >
            <Plus size={17} />
            Add Research Item
          </button>
        </div>
      </div>

      <div className="collection-detail-tags">
        {collection.tags.map(
          (tag) => (
            <span key={tag}>
              {tag}
            </span>
          )
        )}
      </div>
    </header>
  );
};

export default CollectionDetailHeader;