import {
  FolderPlus,
  Sparkles,
} from "lucide-react";

const CollectionsHeader = ({
  onCreate,
}) => {
  return (
    <header className="collections-header">
      <div>
        <span className="collections-eyebrow">
          <Sparkles size={15} />
          Research Organization
        </span>

        <h1>Collections</h1>

        <p>
          Organize papers, research notes and
          uploaded documents into focused
          knowledge collections.
        </p>
      </div>

      <button
        type="button"
        className="collections-create"
        onClick={onCreate}
      >
        <FolderPlus size={18} />
        New Collection
      </button>
    </header>
  );
};

export default CollectionsHeader;