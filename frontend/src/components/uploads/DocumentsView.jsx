import {
  FileSearch,
} from "lucide-react";

import DocumentCard from "./DocumentCard";

const DocumentsView = ({
  documents,
  view,
  onDelete,
  onPreview,
  isLibraryEmpty,
  onClearFilters,
}) => {
  if (!documents.length) {
    // Truly empty workspace vs. filters hid everything.
    if (isLibraryEmpty) {
      return (
        <div className="uploads-empty">
          <FileSearch size={39} />

          <h2>No documents uploaded yet</h2>

          <p>
            Upload PDFs, DOCX or TXT files to keep
            your research material together.
          </p>
        </div>
      );
    }

    return (
      <div className="uploads-empty">
        <FileSearch size={39} />

        <h2>No documents found</h2>

        <p>
          Try changing your search or document
          filters.
        </p>

        <button type="button" onClick={onClearFilters}>
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <section
      className={`documents-view ${
        view === "list"
          ? "documents-view--list"
          : ""
      }`}
    >
      {documents.map((document) => (
        <DocumentCard
          key={document._id}
          document={document}
          view={view}
          onDelete={onDelete}
          onPreview={onPreview}
        />
      ))}
    </section>
  );
};

export default DocumentsView;