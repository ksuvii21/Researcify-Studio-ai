import {
  ChevronRight,
  FileText,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import useDashboardDocuments from "../../../hooks/useDashboardDocuments";

import {
  formatDocumentDate,
  formatFileSize,
  formatFileType,
  formatProcessingStatus,
} from "../../../utils/fileFormat";

/*
 * Recent Documents.
 *
 * Real UploadedDocument records only, mirroring
 * RecentPapers. Every value shown is stored in MongoDB:
 * there is no page count, word count or chunk count,
 * because extraction does not run until 8G.
 *
 * Clicking through goes to the Documents workspace, where
 * the details modal lives. The dashboard deliberately does
 * not grow a second preview surface.
 */
const RecentDocuments = () => {
  const navigate = useNavigate();

  const {
    recentDocuments,
    totalDocuments,
    loading,
    error,
  } = useDashboardDocuments();

  return (
    <section className="dashboard-card recent-documents">
      <div className="dashboard-card__header">
        <div>
          <h2>Recent Documents</h2>
          <p>Uploaded research material.</p>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={() => navigate("/uploads")}
        >
          View Documents
          <ChevronRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="recent-papers__state">
          <p>Loading documents...</p>
        </div>
      ) : error ? (
        <div className="recent-papers__state">
          <p>{error}</p>
        </div>
      ) : recentDocuments.length === 0 ? (
        <div className="recent-papers__state">
          <h3>No documents yet</h3>

          <p>
            Uploaded PDFs, DOCX and TXT files appear
            here.
          </p>

          <button
            type="button"
            onClick={() => navigate("/uploads")}
          >
            Go to Documents
          </button>
        </div>
      ) : (
        <>
          <div className="recent-documents__list">
            {recentDocuments.map((document) => {
              const statusLabel = formatProcessingStatus(
                document.processingStatus
              );

              return (
                <button
                  type="button"
                  className="recent-document"
                  key={document._id}
                  onClick={() => navigate("/uploads")}
                >
                  <span className="recent-document__icon">
                    <FileText size={16} />
                  </span>

                  <span className="recent-document__info">
                    <strong>{document.title}</strong>

                    <span>
                      {document.projectId?.title ||
                        "Not assigned"}
                    </span>
                  </span>

                  <span className="recent-document__meta">
                    {formatFileType(document.mimeType)} ·{" "}
                    {formatFileSize(document.fileSize)}
                  </span>

                  <span
                    className={`document-status document-status--${statusLabel
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {statusLabel}
                  </span>

                  <span className="recent-document__date">
                    {formatDocumentDate(
                      document.uploadedAt ||
                      document.createdAt
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {totalDocuments > recentDocuments.length && (
            <p className="recent-documents__more">
              Showing {recentDocuments.length} of{" "}
              {totalDocuments} documents.
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default RecentDocuments;
