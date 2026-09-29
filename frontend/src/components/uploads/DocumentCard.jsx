import {
  CircleAlert,
  CircleCheck,
  Clock3,
  Eye,
  FileText,
  FolderKanban,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  formatDocumentDate,
  formatFileSize,
  formatFileType,
  formatProcessingStatus,
  isPendingStatus,
} from "../../utils/fileFormat";

const DocumentCard = ({
  document: doc,
  view,
  onPreview,
  onEdit,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [menuOpen]);

  const statusLabel = formatProcessingStatus(
    doc.processingStatus
  );

  const statusClass = statusLabel
    .toLowerCase()
    .replace(/\s+/g, "-");

  const projectTitle = doc.projectId?.title;

  return (
    <article
      className={`document-card ${
        view === "list" ? "document-card--list" : ""
      }`}
    >
      <div className="document-card__top">
        <span className="document-card__file-icon">
          <FileText size={21} />
        </span>

        <div
          className="document-card__status-wrap"
          ref={menuRef}
        >
          <span
            className={`document-status document-status--${statusClass}`}
          >
            {statusLabel === "Ready" && (
              <CircleCheck size={14} />
            )}

            {isPendingStatus(statusLabel) && (
              <Clock3 size={14} />
            )}

            {statusLabel === "Failed" && (
              <CircleAlert size={14} />
            )}

            {statusLabel}
          </span>

          <button
            type="button"
            className="document-card__more"
            aria-label="Document options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (
            <div
              className="document-card__menu-list"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onPreview?.(doc);
                }}
              >
                <Eye size={14} />
                View details
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit?.(doc);
                }}
              >
                <Pencil size={14} />
                Edit metadata
              </button>

              <button
                type="button"
                role="menuitem"
                className="danger"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(doc);
                }}
              >
                <Trash2 size={14} />
                Delete document
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className="document-card__content"
        onClick={() => onPreview?.(doc)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onPreview?.(doc);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <span className="document-card__type">
          {formatFileType(doc.mimeType)}
        </span>

        <h2>{doc.title}</h2>

        <p className="document-card__meta">
          {formatFileSize(doc.fileSize)}
          <span>•</span>
          {formatDocumentDate(
            doc.uploadedAt || doc.createdAt
          )}
        </p>

        {doc.originalFileName &&
          doc.originalFileName !== doc.title && (
            <p className="document-card__filename">
              {doc.originalFileName}
            </p>
          )}

        {projectTitle ? (
          <div className="document-card__project">
            <FolderKanban size={14} />
            <span>{projectTitle}</span>
          </div>
        ) : (
          <div className="document-card__project document-card__project--none">
            <FolderKanban size={14} />
            <span>Not linked to a project</span>
          </div>
        )}

        {doc.description && (
          <p className="document-card__summary">
            {doc.description}
          </p>
        )}

        {doc.processingError && (
          <div className="document-failed">
            <CircleAlert size={16} />

            <div>
              <strong>Processing failed</strong>
              <p>{doc.processingError}</p>
            </div>
          </div>
        )}
      </div>

      <footer className="document-card__footer">
        <span>
          {statusLabel === "Ready"
            ? "Ready for research"
            : "Awaiting processing"}
        </span>

        <div>
          <button
            type="button"
            className="document-delete"
            onClick={() => onDelete(doc)}
            aria-label={`Delete ${doc.title}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </footer>
    </article>
  );
};

export default DocumentCard;