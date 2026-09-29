import {
  Plus,
  Sparkles,
  Upload,
} from "lucide-react";

import useCreateAction from "../../hooks/useCreateAction";

const LibraryHeader = () => {
  const { handleAction } =
    useCreateAction();

  return (
    <header className="library-header">
      <div>
        <span className="library-eyebrow">
          <Sparkles size={14} />
          Knowledge Workspace
        </span>

        <h1>Research Library</h1>

        <p>
          Organize papers, manage your research
          knowledge and quickly return to the
          literature that matters.
        </p>
      </div>

      <div className="library-header__actions">
        <button
          type="button"
          onClick={() =>
            handleAction("upload")
          }
        >
          <Upload size={16} />
          Upload
        </button>

        <button
          type="button"
          className="library-primary-button"
          onClick={() =>
            handleAction("paper")
          }
        >
          <Plus size={16} />
          Add Paper
        </button>
      </div>
    </header>
  );
};

export default LibraryHeader;