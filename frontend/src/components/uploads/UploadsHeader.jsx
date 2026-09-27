import {
  FileText,
  Plus,
  Sparkles,
  Upload,
} from "lucide-react";

import useCreateAction from "../../hooks/useCreateAction";

const UploadsHeader = () => {
  const { handleAction } = useCreateAction();

  return (
    <header className="uploads-header">
      <div>
        <span className="uploads-eyebrow">
          <Sparkles size={15} />
          Research Documents
        </span>

        <h1>Uploaded Documents</h1>

        <p>
          Upload research files, extract their
          content and make your documents
          available across your research
          workspace.
        </p>
      </div>

      <div className="uploads-header__actions">
        <button
          type="button"
          onClick={() =>
            handleAction("upload")
          }
        >
          <Upload size={17} />
          Upload Document
        </button>

        <button
          type="button"
          className="uploads-header__primary"
          onClick={() =>
            handleAction("upload")
          }
        >
          <Plus size={17} />
          Add Files
        </button>
      </div>
    </header>
  );
};

export default UploadsHeader;