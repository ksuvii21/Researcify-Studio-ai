import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  deleteDocument as deleteDocumentApi,
  getDocuments,
  updateDocument as updateDocumentApi,
  uploadDocument as uploadDocumentApi,
} from "../api/documentApi";

/*
 * Owns the user's uploaded documents.
 *
 * Requests are guarded with a monotonically
 * increasing sequence number so a slow, stale response
 * cannot overwrite a newer one when filters change.
 */
const useDocuments = ({
  search = "",
  projectId = "",
  status = "",
  sort = "updatedAt",
  order = "desc",
  autoFetch = true,
} = {}) => {
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(autoFetch);

  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [mutationLoading, setMutationLoading] =
    useState(false);

  const requestSequence = useRef(0);

  const fetchDocuments = useCallback(async () => {
    const requestId = ++requestSequence.current;

    try {
      setLoading(true);
      setError("");

      const response = await getDocuments({
        search,
        projectId,
        status,
        sort,
        order,
      });

      if (requestId !== requestSequence.current) {
        return;
      }

      setDocuments(response?.data || []);
    } catch (err) {
      if (requestId !== requestSequence.current) {
        return;
      }

      console.error(
        "[Documents] Fetch error:",
        err
      );

      setError(
        err?.message ||
        "Unable to load your documents."
      );
    } finally {
      if (requestId === requestSequence.current) {
        setLoading(false);
      }
    }
  }, [search, projectId, status, sort, order]);

  useEffect(() => {
    if (!autoFetch) return undefined;

    const timer = setTimeout(() => {
      fetchDocuments();
    }, 300);

    return () => clearTimeout(timer);
  }, [autoFetch, fetchDocuments]);

  // ---------------------------------------------------
  // Upload
  // ---------------------------------------------------

  const uploadDocument = async (data) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await uploadDocumentApi(
        data,
        (event) => {
          const total = event.total || event.loaded;

          setUploadProgress(
            Math.round((event.loaded * 100) / total)
          );
        }
      );

      await fetchDocuments();

      return response?.data;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ---------------------------------------------------
  // Update
  // ---------------------------------------------------

  const updateDocument = async (
    documentId,
    documentData
  ) => {
    try {
      setMutationLoading(true);

      const response = await updateDocumentApi(
        documentId,
        documentData
      );

      const updated = response?.data;

      if (updated) {
        setDocuments((current) =>
          current.map((document) =>
            document._id === updated._id
              ? updated
              : document
          )
        );
      }

      return updated;
    } finally {
      setMutationLoading(false);
    }
  };

  // ---------------------------------------------------
  // Delete
  // ---------------------------------------------------

  const deleteDocument = async (documentId) => {
    try {
      setMutationLoading(true);

      await deleteDocumentApi(documentId);

      setDocuments((current) =>
        current.filter(
          (document) => document._id !== documentId
        )
      );
    } finally {
      setMutationLoading(false);
    }
  };

  return {
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
  };
};

export default useDocuments;