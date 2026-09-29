import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getPaperById,
  togglePaperFavorite,
} from "../api/paperApi";

/*
 * Loads a single paper by its MongoDB _id.
 * Used by PaperDetailPage.
 */
const usePaper = (paperId) => {
  const [paper, setPaper] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!paperId) {
        if (active) {
          setPaper(null);
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getPaperById(paperId);

        if (!active) return;

        setPaper(response?.data || null);
      } catch (err) {
        if (!active) return;

        console.error(
          "[Paper] Fetch error:",
          err
        );

        setPaper(null);

        setError(
          err?.message ||
          "Unable to load this paper."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [paperId]);

  // Manual retry from the error state.
  const refetch = useCallback(async () => {
    if (!paperId) return;

    try {
      setLoading(true);
      setError("");

      const response = await getPaperById(paperId);

      setPaper(response?.data || null);
    } catch (err) {
      console.error("[Paper] Fetch error:", err);

      setPaper(null);

      setError(
        err?.message || "Unable to load this paper."
      );
    } finally {
      setLoading(false);
    }
  }, [paperId]);

  const toggleFavorite = async () => {
    if (!paper?._id) return null;

    const response = await togglePaperFavorite(
      paper._id
    );

    if (response?.data) {
      setPaper(response.data);
    }

    return response?.data || null;
  };

  return {
    paper,
    loading,
    error,
    refetch,
    toggleFavorite,
  };
};

export default usePaper;