import {
  Plus,
  Sparkles,
  Upload,
} from "lucide-react";

const UploadsHeader = ({ onUploadDocument }) => {
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
          onClick={onUploadDocument}
        >
          <Upload size={17} />
          Upload Document
        </button>

        <button
          type="button"
          className="uploads-header__primary"
          onClick={onUploadDocument}
        >
          <Plus size={17} />
          Add Files
        </button>
      </div>
    </header>
  );
};

export default UploadsHeader;