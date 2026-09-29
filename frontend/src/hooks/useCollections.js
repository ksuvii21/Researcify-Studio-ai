import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  addDocument as addDocumentApi,
  addPaper as addPaperApi,
  createCollection as createCollectionApi,
  deleteCollection as deleteCollectionApi,
  getCollectionById,
  getCollections,
  removeDocument as removeDocumentApi,
  removePaper as removePaperApi,
  toggleCollectionArchive,
  toggleCollectionPin,
  updateCollection as updateCollectionApi,
} from "../api/collectionApi";

/*
 * One parameterised hook powers every collections surface:
 *
 *   useCollections()                     -> all collections
 *   useCollections({ search: "rag" })    -> filtered collections
 *   useCollections({ pinned: "true" })   -> pinned collections
 *
 * Requests are guarded with a monotonically increasing
 * sequence number so a slow, stale response cannot
 * overwrite a newer one when filters change quickly.
 */
const useCollections = ({
  search = "",
  pinned = "",
  archived = "false",
  sort = "updatedAt",
  order = "desc",
  autoFetch = true,
} = {}) => {
  const [collections, setCollections] = useState([]);

  const [loading, setLoading] = useState(autoFetch);

  const [error, setError] = useState("");

  const [mutationLoading, setMutationLoading] = useState(false);

  const [singleCollection, setSingleCollection] = useState(null);

  const [singleLoading, setSingleLoading] = useState(false);

  const [singleError, setSingleError] = useState("");

  const requestSequence = useRef(0);

  const fetchCollections = useCallback(async () => {
    const requestId = ++requestSequence.current;

    try {
      setLoading(true);
      setError("");

      const response = await getCollections({
        search,
        pinned,
        archived,
        sort,
        order,
      });

      if (requestId !== requestSequence.current) {
        return;
      }

      setCollections(response?.data || []);
    } catch (err) {
      if (requestId !== requestSequence.current) {
        return;
      }

      console.error("[Collections] Fetch error:", err);

      setError(
        err?.message || "Unable to load your collections."
      );
    } finally {
      if (requestId === requestSequence.current) {
        setLoading(false);
      }
    }
  }, [search, pinned, archived, sort, order]);

  useEffect(() => {
    if (!autoFetch) return undefined;

    const timer = setTimeout(() => {
      fetchCollections();
    }, 300);

    return () => clearTimeout(timer);
  }, [autoFetch, fetchCollections]);

  // ---------------------------------------------------
  // Get Single Collection
  // ---------------------------------------------------

  const fetchCollectionById = useCallback(async (collectionId) => {
    try {
      setSingleLoading(true);
      setSingleError("");

      const response = await getCollectionById(collectionId);

      setSingleCollection(response?.data || null);
    } catch (err) {
      console.error("[Collections] Fetch single error:", err);

      setSingleError(
        err?.message || "Unable to load collection."
      );

      setSingleCollection(null);
    } finally {
      setSingleLoading(false);
    }
  }, []);

  // ---------------------------------------------------
  // Create
  // ---------------------------------------------------

  const createCollection = async (collectionData) => {
    try {
      setMutationLoading(true);

      const response = await createCollectionApi(collectionData);

      await fetchCollections();

      return response?.data;
    } finally {
      setMutationLoading(false);
    }
  };

  // ---------------------------------------------------
  // Update
  // ---------------------------------------------------

  const updateCollection = async (collectionId, collectionData) => {
    try {
      setMutationLoading(true);

      const response = await updateCollectionApi(
        collectionId,
        collectionData
      );

      const updated = response?.data;

      if (updated) {
        setCollections((current) =>
          current.map((collection) =>
            collection._id === updated._id ? updated : collection
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

  const deleteCollection = async (collectionId) => {
    try {
      setMutationLoading(true);

      await deleteCollectionApi(collectionId);

      setCollections((current) =>
        current.filter(
          (collection) => collection._id !== collectionId
        )
      );
    } finally {
      setMutationLoading(false);
    }
  };

  // ---------------------------------------------------
  // Toggles
  // ---------------------------------------------------

  const applyUpdated = (updated) => {
    if (!updated) return null;

    const stillMatches =
      (pinned !== "true" || updated.isPinned) &&
      (archived === "true"
        ? updated.isArchived
        : archived === "all" || !updated.isArchived);

    setCollections((current) =>
      stillMatches
        ? current.map((collection) =>
            collection._id === updated._id ? updated : collection
          )
        : current.filter(
            (collection) => collection._id !== updated._id
          )
    );

    return updated;
  };

  const togglePin = async (collectionId) => {
    const response = await toggleCollectionPin(collectionId);

    return applyUpdated(response?.data);
  };

  const toggleArchive = async (collectionId) => {
    const response = await toggleCollectionArchive(collectionId);

    return applyUpdated(response?.data);
  };

  // ---------------------------------------------------
  // Relationships
  // ---------------------------------------------------

  const addPaper = async (collectionId, paperId) => {
    try {
      setMutationLoading(true);

      const response = await addPaperApi(collectionId, paperId);

      const updated = response?.data;

      if (updated) {
        setCollections((current) =>
          current.map((collection) =>
            collection._id === updated._id ? updated : collection
          )
        );
      }

      return updated;
    } finally {
      setMutationLoading(false);
    }
  };

  const removePaper = async (collectionId, paperId) => {
    try {
      setMutationLoading(true);

      const response = await removePaperApi(collectionId, paperId);

      const updated = response?.data;

      if (updated) {
        setCollections((current) =>
          current.map((collection) =>
            collection._id === updated._id ? updated : collection
          )
        );
      }

      return updated;
    } finally {
      setMutationLoading(false);
    }
  };

  const addDocument = async (collectionId, documentId) => {
    try {
      setMutationLoading(true);

      const response = await addDocumentApi(collectionId, documentId);

      const updated = response?.data;

      if (updated) {
        setCollections((current) =>
          current.map((collection) =>
            collection._id === updated._id ? updated : collection
          )
        );
      }

      return updated;
    } finally {
      setMutationLoading(false);
    }
  };

  const removeDocument = async (collectionId, documentId) => {
    try {
      setMutationLoading(true);

      const response = await removeDocumentApi(collectionId, documentId);

      const updated = response?.data;

      if (updated) {
        setCollections((current) =>
          current.map((collection) =>
            collection._id === updated._id ? updated : collection
          )
        );
      }

      return updated;
    } finally {
      setMutationLoading(false);
    }
  };

  return {
    collections,
    loading,
    error,
    mutationLoading,

    singleCollection,
    singleLoading,
    singleError,

    fetchCollections,
    fetchCollectionById,
    createCollection,
    updateCollection,
    deleteCollection,

    togglePin,
    toggleArchive,

    addPaper,
    removePaper,

    addDocument,
    removeDocument,
  };
};

export default useCollections;