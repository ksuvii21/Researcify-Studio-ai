import {
  FileSearch,
} from "lucide-react";

import DocumentCard from "./DocumentCard";

const DocumentsView = ({
  documents,
  view,
  onPreview,
  onDelete,
  onRetry,
}) => {
  if (!documents.length) {
    return (
      <div className="uploads-empty">
        <FileSearch size={39} />

        <h2>
          No documents found
        </h2>

        <p>
          Try changing your search or document
          filters.
        </p>
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
          key={document.id}
          document={document}
          view={view}
          onPreview={onPreview}
          onDelete={onDelete}
          onRetry={onRetry}
        />
      ))}
    </section>
  );
};

export default DocumentsView;