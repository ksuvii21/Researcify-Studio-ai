import {
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

import {
  formatDocumentDate,
  formatFileSize,
  formatFileType,
  formatProcessingStatus,
} from "../../utils/fileFormat";

const ProjectDocuments = ({
  documents,
  loading,
  error,
  onUploadDocument,
  onDeleteDocument,
  onRetry,
}) => {
  const renderBody = () => {
    if (loading) {
      return (
        <div className="project-relation-state">
          <p>Loading project documents...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="project-relation-state project-relation-state--error">
          <p>{error}</p>

          <button type="button" onClick={onRetry}>
            Try Again
          </button>
        </div>
      );
    }

    if (!documents.length) {
      return (
        <div className="project-relation-state">
          <h3>No documents yet</h3>

          <p>
            Upload PDFs, DOCX or TXT files to keep
            this project's research material together.
          </p>

          <button type="button" onClick={onUploadDocument}>
            Upload Document
          </button>
        </div>
      );
    }

    return (
      <div className="project-documents">
        {documents.map((document) => {
          const statusLabel = formatProcessingStatus(
            document.processingStatus
          );

          return (
            <article
              key={document._id}
              className="project-document"
            >
              <span className="project-resource__icon">
                <FileText size={18} />
              </span>

              <div>
                <strong>{document.title}</strong>

                <p>
                  {formatFileType(document.mimeType)} ·{" "}
                  {formatFileSize(document.fileSize)} ·{" "}
                  {formatDocumentDate(
                    document.uploadedAt ||
                      document.createdAt
                  )}
                </p>
              </div>

              <span
                className={`document-status document-status--${statusLabel
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                {statusLabel}
              </span>

              <button
                type="button"
                aria-label={`Delete ${document.title}`}
                onClick={() => onDeleteDocument(document)}
              >
                <Trash2 size={16} />
              </button>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <div className="project-section">
      <div className="project-section__header">
        <div>
          <h2>Project Documents</h2>

          <p>
            Uploaded research material connected
            to this project.
          </p>
        </div>

        <button
          type="button"
          onClick={onUploadDocument}
          disabled={loading}
        >
          <Plus size={15} />
          Upload
        </button>
      </div>

      {renderBody()}
    </div>
  );
};

export default ProjectDocuments;