import { useState } from "react";

import UploadsHeader from "../components/uploads/UploadsHeader";
import UploadStats from "../components/uploads/UploadStats";
import UploadToolbar from "../components/uploads/UploadToolbar";
import DocumentsView from "../components/uploads/DocumentsView";
import DocumentUploadModal from "../components/uploads/DocumentUploadModal";
import DocumentEditModal from "../components/uploads/DocumentEditModal";
import DocumentPreviewModal from "../components/uploads/DocumentPreviewModal";

import { saveDocumentDownload, downloadDocument } from "../api/documentApi";

import useDocuments from "../hooks/useDocuments";
import useProjects from "../hooks/useProjects";
import useToast from "../hooks/useToast";

import "../components/uploads/uploads.css";

const UploadsPage = () => {
  const toast = useToast();

  const [query, setQuery] = useState("");

  const [status, setStatus] = useState("");

  const [projectId, setProjectId] = useState("");

  const [sort, setSort] = useState("updatedAt");

  const [view, setView] = useState("grid");

  const [uploadOpen, setUploadOpen] = useState(false);

  const [previewDocument, setPreviewDocument] = useState(null);

  const [editDocument, setEditDocument] = useState(null);

  const [downloadingId, setDownloadingId] = useState("");

  const {
    documents,
    loading,
    error,
    uploading,
    uploadProgress,
    mutationLoading,
    fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
  } = useDocuments({
    search: query,
    status,
    projectId,
    sort,
    order: sort === "title" ? "asc" : "desc",
  });

  // Real projects for the toolbar filter and the modal.
  const { projects } = useProjects();

  // ---------------------------------------------------
  // Upload
  // ---------------------------------------------------

  const handleUpload = async (values) => {
    const created = await uploadDocument(values);

    toast.success(
      "Document uploaded",
      `"${created?.title || values.file.name}" was added.`
    );

    setUploadOpen(false);
  };

  // ---------------------------------------------------
  // Delete
  // ---------------------------------------------------

  const handleDelete = async (document) => {
    const confirmed = window.confirm(
      `Delete "${document.title}"? The uploaded file will be removed permanently.`
    );

    if (!confirmed) return;

    try {
      await deleteDocument(document._id);

      toast.success(
        "Document deleted",
        `"${document.title}" was removed.`
      );
    } catch (err) {
      console.error(
        "[Documents] Delete error:",
        err
      );

      toast.error(
        "Delete failed",
        err?.message ||
          "Unable to delete this document."
      );
    }
  };

  const handleClearFilters = () => {
    setQuery("");
    setStatus("");
    setProjectId("");
  };

  // ---------------------------------------------------
  // Download
  // ---------------------------------------------------

  /*
   * The file is fetched through apiClient so the auth
   * interceptor runs, then handed to the browser as a blob.
   * originalFileName is the fallback when the server's
   * Content-Disposition header cannot be parsed.
   */
  const handleDownload = async (document) => {
    try {
      setDownloadingId(document._id);

      const response = await downloadDocument(document._id);

      const filename = saveDocumentDownload(
        response,
        document.originalFileName || document.title
      );

      toast.success("Download started", `Saving "${filename}".`);
    } catch (err) {
      console.error("[Documents] Download error:", err);

      toast.error(
        "Download failed",
        err?.message || "Unable to download this document."
      );
    } finally {
      setDownloadingId("");
    }
  };

  // ---------------------------------------------------
  // Edit metadata
  // ---------------------------------------------------

  const handleEdit = async (values) => {
    try {
      await updateDocument(editDocument._id, values);

      toast.success(
        "Document updated",
        "The document details were saved."
      );

      setEditDocument(null);

      // Keep the open preview in sync with the saved record.
      setPreviewDocument((current) =>
        current && current._id === editDocument._id
          ? { ...current, ...values }
          : current
      );
    } catch (err) {
      console.error("[Documents] Update error:", err);

      toast.error(
        "Update failed",
        err?.message || "Unable to save these changes."
      );

      throw err;
    }
  };

  // ---------------------------------------------------
  // Collections
  // ---------------------------------------------------

  /*
   * The document itself is never mutated by a collection
   * change, so only a confirmation is needed here. The
   * Collections list refreshes on its own next mount.
   */
  const handleAddedToCollection = ({
    collectionName,
    alreadyExisted,
  }) => {
    if (alreadyExisted) {
      toast.info(
        "Already in collection",
        `This document is already in "${collectionName}".`
      );

      return;
    }

    toast.success(
      "Added to collection",
      `The document was added to "${collectionName}".`
    );
  };

  const isLibraryEmpty =
    !query.trim() && !status && !projectId;
  return (
    <div className="uploads-page">
      <UploadsHeader
        onUploadDocument={() => setUploadOpen(true)}
      />

      <UploadStats documents={documents} />

      <UploadToolbar
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
        projectId={projectId}
        setProjectId={setProjectId}
        projects={projects}
        sort={sort}
        setSort={setSort}
        view={view}
        setView={setView}
        count={documents.length}
      />

      {loading ? (
        <div className="uploads-state">
          <p>Loading your documents...</p>
        </div>
      ) : error ? (
        <div className="uploads-state uploads-state--error">
          <p>{error}</p>

          <button type="button" onClick={fetchDocuments}>
            Try Again
          </button>
        </div>
      ) : (
        <DocumentsView
          documents={documents}
          view={view}
          onPreview={setPreviewDocument}
          onDelete={handleDelete}
          isLibraryEmpty={isLibraryEmpty}
          onClearFilters={handleClearFilters}
        />
      )}

      <DocumentUploadModal
        open={uploadOpen}
        uploading={uploading}
        uploadProgress={uploadProgress}
        onClose={() => setUploadOpen(false)}
        onSubmit={handleUpload}
      />

      <DocumentPreviewModal
        open={Boolean(previewDocument)}
        document={previewDocument}
        downloading={
          downloadingId === previewDocument?._id
        }
        onClose={() => setPreviewDocument(null)}
        onDownload={handleDownload}
        onAddedToCollection={handleAddedToCollection}
        onEdit={(document) => {
          setPreviewDocument(null);
          setEditDocument(document);
        }}
        onDelete={(document) => {
          setPreviewDocument(null);
          handleDelete(document);
        }}
      />

      <DocumentEditModal
        open={Boolean(editDocument)}
        document={editDocument}
        saving={mutationLoading}
        onClose={() => setEditDocument(null)}
        onSubmit={handleEdit}
      />
    </div>
  );
};

export default UploadsPage;