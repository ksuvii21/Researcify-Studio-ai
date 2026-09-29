/*
 * Format a byte count for display.
 *
 * Only ever used for presentation: the database stores
 * raw bytes so sorting and future limits stay correct.
 */
export const formatFileSize = (bytes = 0) => {
  if (!bytes || bytes < 1024) {
    return `${bytes || 0} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/*
 * Map a MIME type to a short label for document cards.
 */
export const formatFileType = (mimeType = "") => {
  if (mimeType === "application/pdf") {
    return "PDF";
  }

  if (mimeType === "text/plain") {
    return "TXT";
  }

  if (mimeType.includes("wordprocessingml")) {
    return "DOCX";
  }

  return "File";
};

export const formatDocumentDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "—";

/*
 * Human-readable processing status for the UI.
 *
 * Mirrors the RAG lifecycle on UploadedDocument:
 *   Uploaded | Extracting | Chunking | Ready | Failed
 *
 * 'Failed' is returned verbatim because it is the only
 * state that needs the user's attention.
 */
export const formatProcessingStatus = (status = "") => {
  if (status === "Failed") return "Failed";
  if (status === "Ready") return "Ready";
  if (status === "Extracting") return "Extracting";
  if (status === "Chunking") return "Chunking";

  return "Uploaded";
};

/*
 * Whether a status still needs processing work. Used to
 * decide the clock-vs-check icon on a document card.
 */
export const isPendingStatus = (label = "") =>
  label === "Uploaded" ||
  label === "Extracting" ||
  label === "Chunking";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_UPLOAD_TYPES =
  ".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document";