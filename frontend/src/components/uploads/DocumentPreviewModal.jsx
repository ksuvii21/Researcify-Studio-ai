import {
  CalendarDays,
  Download,
  FileText,
  FolderKanban,
  FolderPlus,
  HardDrive,
  Info,
  Pencil,
  Trash2,
} from "lucide-react";

import { useState } from "react";

import Modal from "../common/Modal";

import AddToCollectionModal from "../collections/AddToCollectionModal";

import {
  formatDocumentDate,
  formatFileSize,
  formatFileType,
  formatProcessingStatus,
} from "../../utils/fileFormat";

/*
 * Document details.
 *
 * Every value below comes from the UploadedDocument record
 * in MongoDB. There is deliberately no page count, word
 * count, chunk count, AI summary or tag list: extraction
 * does not run until 8G, so any such number would be
 * fabricated.
 *
 * "Preview" here means metadata, not PDF/DOCX rendering.
 * The file itself is fetched through the authenticated
 * download route.
 *
 * Collections are organized on the Collection record, not
 * stored on the document, so "Add to Collection" reuses the
 * shared relationship modal rather than owning any logic.
 */
const DocumentPreviewModal = ({
  open = false,
  document,
  onClose,
  onDownload,
  onEdit,
  onDelete,
  onAddedToCollection,
  downloading = false,
}) => {
  const [collectionOpen, setCollectionOpen] = useState(false);

  if (!document) return null;

  const statusLabel = formatProcessingStatus(
    document.processingStatus
  );

  const statusClass = statusLabel
    .toLowerCase()
    .replace(/\s+/g, "-");

  /*
   * projectId is populated with { title } by the API, so it
   * is either an object or null. A bare ObjectId string has
   * no title to show.
   */
  const projectTitle =
    document.projectId && typeof document.projectId === "object"
      ? document.projectId.title
      : "";

  const rows = [
    {
      label: "Original filename",
      value: document.originalFileName || "—",
    },
    {
      label: "File type",
      value: formatFileType(document.mimeType),
    },
    {
      label: "File size",
      value: formatFileSize(document.fileSize),
    },
    {
      label: "Uploaded",
      value: formatDocumentDate(
        document.uploadedAt || document.createdAt
      ),
    },
    {
      label: "Updated",
      value: formatDocumentDate(document.updatedAt),
    },
  ];

  return (
    <>
      {/*
       * Suspended while the collection picker is open so
       * only one modal owns the Escape key at a time.
       */}
      <Modal
        open={open && !collectionOpen}
        onClose={onClose}
        title="Document Details"
        description={document.originalFileName}
        icon={FileText}
        size="lg"
      >
      <div className="document-preview">
        <div className="document-preview__hero">
          <span className="document-preview__icon">
            <FileText size={24} />
          </span>

          <div>
            <span>{formatFileType(document.mimeType)}</span>

            <h2>{document.title}</h2>

            <p>
              {formatFileSize(document.fileSize)} ·{" "}
              {formatDocumentDate(
                document.uploadedAt || document.createdAt
              )}
            </p>
          </div>
        </div>

        <div className="document-preview__context">
          <div>
            <FolderKanban size={16} />

            <span>Project</span>

            <strong>{projectTitle || "Not assigned"}</strong>
          </div>

          <div>
            <HardDrive size={16} />

            <span>Status</span>

            <strong>{statusLabel}</strong>
          </div>
        </div>

        <div className="document-preview__overview">
          <section>
            <span className="document-preview__label">
              Description
            </span>

            <p>
              {document.description ||
                "No description added."}
            </p>
          </section>

          <section>
            <span className="document-preview__label">
              Document Information
            </span>

            <div className="document-preview__information">
              {rows.map((row) => (
                <div key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
          </section>

          {document.processingError && (
            <section>
              <span className="document-preview__label">
                Processing Error
              </span>

              <p>{document.processingError}</p>
            </section>
          )}
        </div>

        <div className="document-preview__actions">
          <button
            type="button"
            onClick={() => onDownload?.(document)}
            disabled={downloading}
          >
            <Download size={15} />
            {downloading ? "Downloading..." : "Download"}
          </button>

          <button
            type="button"
            onClick={() => onEdit?.(document)}
          >
            <Pencil size={15} />
            Edit
          </button>

          <button
            type="button"
            onClick={() =>
              setCollectionOpen(true)
            }
          >
            <FolderPlus size={15} />
            Add to Collection
          </button>

          <button
            type="button"
            className="document-preview__delete"
            onClick={() => onDelete?.(document)}
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>

        {/*
         * Surface the processing state honestly rather than
         * implying the document is already searchable.
         */}
        <p className="document-preview__note">
          <Info size={14} />
          {statusLabel === "Ready"
            ? "This document is ready for research."
            : "Text extraction has not run yet. This document becomes searchable once processing lands."}
        </p>

        <span className="document-preview__status">
          <CalendarDays size={13} />
          {statusClass}
        </span>
      </div>
      </Modal>

      <AddToCollectionModal
        open={collectionOpen}
        mode="resource"
        resourceType="document"
        resourceId={document._id}
        resourceLabel={document.title}
        onClose={() => setCollectionOpen(false)}
        onAdded={onAddedToCollection}
      />
    </>
  );
};

export default DocumentPreviewModal;
