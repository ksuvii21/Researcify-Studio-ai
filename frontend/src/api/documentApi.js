import apiClient from "./apiClient";

// -----------------------------------------------------
// Get documents
// -----------------------------------------------------

export const getDocuments = async (params = {}) => {
  const response = await apiClient.get("/documents", {
    params,
  });

  return response.data;
};

// -----------------------------------------------------
// Get one document
// -----------------------------------------------------

export const getDocumentById = async (documentId) => {
  const response = await apiClient.get(
    `/documents/${documentId}`
  );

  return response.data;
};

// -----------------------------------------------------
// Upload document (multipart)
// -----------------------------------------------------
/*
 * Content-Type is deliberately NOT set. The browser
 * must generate the multipart boundary itself; setting
 * the header manually produces a request the server
 * cannot parse.
 */
export const uploadDocument = async (
  data,
  onUploadProgress
) => {
  const formData = new FormData();

  formData.append("file", data.file);

  if (data.title) {
    formData.append("title", data.title);
  }

  if (data.description) {
    formData.append("description", data.description);
  }

  if (data.projectId) {
    formData.append("projectId", data.projectId);
  }

  const response = await apiClient.post(
    "/documents",
    formData,
    { onUploadProgress }
  );

  return response.data;
};

// -----------------------------------------------------
// Update document
// -----------------------------------------------------

export const updateDocument = async (
  documentId,
  documentData
) => {
  const response = await apiClient.patch(
    `/documents/${documentId}`,
    documentData
  );

  return response.data;
};

// -----------------------------------------------------
// Delete document
// -----------------------------------------------------

export const deleteDocument = async (documentId) => {
  const response = await apiClient.delete(
    `/documents/${documentId}`
  );

  return response.data;
};

// -----------------------------------------------------
// Download document (file)
// -----------------------------------------------------
/*
 * Returns the full response, not just the blob, so the
 * caller can read Content-Disposition for the filename.
 *
 * responseType: "blob" lets the browser hand the raw bytes
 * back to us. This goes through apiClient, so the auth
 * interceptor attaches the token. A plain
 * window.open(`/documents/${id}/download`) would bypass it
 * and be rejected as unauthenticated.
 */
export const downloadDocument = async (documentId) => {
  const response = await apiClient.get(
    `/documents/${documentId}/download`,
    {
      responseType: "blob",
    }
  );

  return response;
};

/*
 * Derive the download filename from the response headers,
 * falling back to the document's real originalName.
 */
export const readDownloadFilename = (
  response,
  fallbackName = "document"
) => {
  const disposition =
    response?.headers?.["content-disposition"] || "";

  /*
   * res.download sends both a filename= and a
   * filename*=UTF-8'' value. Prefer the UTF-8 one when it
   * is present, since it survives non-ASCII names.
   */
  const utf8Match = disposition.match(
    /filename\*=UTF-8''([^;]+)/i
  );

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      /* fall through to the plain match */
    }
  }

  const plainMatch = disposition.match(
    /filename="?([^";]+)"?/i
  );

  return plainMatch?.[1] || fallbackName;
};

/*
 * Push the downloaded blob to the user's disk.
 *
 * An object URL is created, clicked and revoked so no
 * navigation happens and no temporary file is left in the
 * page's memory.
 */
export const saveDocumentDownload = (
  response,
  fallbackName = "document"
) => {
  const filename = readDownloadFilename(
    response,
    fallbackName
  );

  const blobUrl = URL.createObjectURL(response.data);

  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = filename;

  document.body.appendChild(link);

  link.click();
  link.remove();

  URL.revokeObjectURL(blobUrl);

  return filename;
};

const documentApi = {
  getDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  saveDocumentDownload,
};

export default documentApi;