import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  deletePaper as deletePaperApi,
  getPapers,
  togglePaperFavorite,
} from "../api/paperApi";

/*
 * Owns the user's saved-paper library.
 *
 * Requests are guarded with a monotonically
 * increasing sequence number so that a slow, stale
 * response can never overwrite the results of a
 * newer one (e.g. when typing quickly in search).
 */
const usePapers = ({
  search = "",
  favorite = "",
  sort = "createdAt",
  order = "desc",
  autoFetch = true,
} = {}) => {
  const [papers, setPapers] = useState([]);

  const [loading, setLoading] = useState(autoFetch);

  const [error, setError] = useState("");

  const requestSequence = useRef(0);

  const fetchPapers = useCallback(async () => {
    const requestId = ++requestSequence.current;

    try {
      setLoading(true);
      setError("");

      const response = await getPapers({
        search,
        favorite,
        sort,
        order,
      });

      // A newer request has started; discard this one.
      if (requestId !== requestSequence.current) {
        return;
      }

      setPapers(response?.data || []);
    } catch (err) {
      if (requestId !== requestSequence.current) {
        return;
      }

      console.error(
        "[Papers] Fetch error:",
        err
      );

      setError(
        err?.message ||
        "Unable to load your research library."
      );
    } finally {
      if (requestId === requestSequence.current) {
        setLoading(false);
      }
    }
  }, [search, favorite, sort, order]);

  useEffect(() => {
    if (!autoFetch) return undefined;

    const timer = setTimeout(() => {
      fetchPapers();
    }, 300);

    return () => clearTimeout(timer);
  }, [autoFetch, fetchPapers]);

  // ---------------------------------------------------
  // Favorite
  // ---------------------------------------------------

  const toggleFavorite = async (paperId) => {
    const response = await togglePaperFavorite(
      paperId
    );

    const updated = response?.data;

    if (updated) {
      setPapers((current) =>
        current.map((paper) =>
          paper._id === updated._id
            ? updated
            : paper
        )
      );
    }

    return updated;
  };

  // ---------------------------------------------------
  // Delete
  // ---------------------------------------------------

  const deletePaper = async (paperId) => {
    await deletePaperApi(paperId);

    setPapers((current) =>
      current.filter(
        (paper) => paper._id !== paperId
      )
    );
  };

  return {
    papers,
    loading,
    error,

    fetchPapers,
    toggleFavorite,
    deletePaper,
  };
};

export default usePapers;