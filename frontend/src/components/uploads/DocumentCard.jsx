import {
  Bot,
  CircleAlert,
  CircleCheck,
  Clock3,
  Eye,
  FileText,
  FolderKanban,
  Layers3,
  MoreHorizontal,
  RefreshCw,
  Trash2,
} from "lucide-react";

const DocumentCard = ({
  document,
  view,
  onPreview,
  onDelete,
  onRetry,
}) => {
  const ready =
    document.status === "ready";

  const processing =
    document.status === "processing";

  const failed =
    document.status === "failed";

  return (
    <article
      className={`document-card ${
        view === "list"
          ? "document-card--list"
          : ""
      }`}
    >
      <div className="document-card__top">
        <span className="document-card__file-icon">
          <FileText size={21} />
        </span>

        <div className="document-card__status-wrap">
          <span
            className={`document-status document-status--${document.status}`}
          >
            {ready && (
              <CircleCheck size={14} />
            )}

            {processing && (
              <Clock3 size={14} />
            )}

            {failed && (
              <CircleAlert size={14} />
            )}

            {ready && "Ready"}
            {processing && "Processing"}
            {failed && "Failed"}
          </span>

          <button
            type="button"
            className="document-card__more"
            aria-label="Document options"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="document-card__content">
        <span className="document-card__type">
          {document.type}
        </span>

        <h2>{document.name}</h2>

        <p className="document-card__meta">
          {document.size}

          {document.pages > 0 && (
            <>
              <span>•</span>
              {document.pages} pages
            </>
          )}
        </p>

        <div className="document-card__project">
          <FolderKanban size={14} />

          <span>
            {document.project}
          </span>
        </div>

        {ready && document.summary && (
          <p className="document-card__summary">
            {document.summary}
          </p>
        )}

        {processing && (
          <div className="document-processing">
            <div className="document-processing__heading">
              <span>
                Processing document
              </span>

              <strong>
                {document.progress}%
              </strong>
            </div>

            <div className="document-processing__track">
              <span
                style={{
                  width: `${document.progress}%`,
                }}
              />
            </div>

            <p>
              Extracting and indexing research
              content...
            </p>
          </div>
        )}

        {failed && (
          <div className="document-failed">
            <CircleAlert size={16} />

            <div>
              <strong>
                Processing failed
              </strong>

              <p>
                Researcify could not process this
                document.
              </p>
            </div>
          </div>
        )}

        {ready && (
          <div className="document-card__research-meta">
            <span>
              <Layers3 size={14} />
              {document.chunks} chunks
            </span>

            <span>
              {document.words.toLocaleString()} words
            </span>
          </div>
        )}

        {document.tags.length > 0 && (
          <div className="document-card__tags">
            {document.tags
              .slice(0, 3)
              .map((tag) => (
                <span key={tag}>
                  {tag}
                </span>
              ))}
          </div>
        )}
      </div>

      <footer className="document-card__footer">
        <span>
          {document.uploadedAt}
        </span>

        <div>
          {ready && (
            <>
              <button
                type="button"
                onClick={() =>
                  onPreview(document)
                }
              >
                <Eye size={15} />
                Preview
              </button>

              <button type="button">
                <Bot size={15} />
                Ask AI
              </button>
            </>
          )}

          {failed && (
            <button
              type="button"
              onClick={() =>
                onRetry(document.id)
              }
            >
              <RefreshCw size={15} />
              Retry
            </button>
          )}

          <button
            type="button"
            className="document-delete"
            onClick={() =>
              onDelete(document.id)
            }
            aria-label="Delete document"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </footer>
    </article>
  );
};

export default DocumentCard;