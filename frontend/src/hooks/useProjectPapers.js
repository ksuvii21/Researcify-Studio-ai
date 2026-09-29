import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  addPaperToProject,
  getProjectPapers,
  removePaperFromProject,
} from "../api/projectApi";

/*
 * Owns the papers attached to one project.
 */
const useProjectPapers = (projectId) => {
  const [papers, setPapers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [mutationLoading, setMutationLoading] =
    useState(false);

  const fetchPapers = useCallback(async () => {
    if (!projectId) {
      setPapers([]);
      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getProjectPapers(
        projectId
      );

      setPapers(response?.data || []);
    } catch (err) {
      console.error(
        "[ProjectPapers] Fetch error:",
        err
      );

      setPapers([]);

      setError(
        err?.message ||
          "Unable to load project papers."
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!projectId) {
        if (active) {
          setPapers([]);
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getProjectPapers(
          projectId
        );

        if (!active) return;

        setPapers(response?.data || []);
      } catch (err) {
        if (!active) return;

        console.error(
          "[ProjectPapers] Fetch error:",
          err
        );

        setPapers([]);

        setError(
          err?.message ||
            "Unable to load project papers."
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
  }, [projectId]);

  // ---------------------------------------------------
  // Attach
  // ---------------------------------------------------

  const addPaper = async (paperId) => {
    try {
      setMutationLoading(true);

      await addPaperToProject(
        projectId,
        paperId
      );

      // Re-read so the list always matches the server.
      await fetchPapers();
    } finally {
      setMutationLoading(false);
    }
  };

  // ---------------------------------------------------
  // Detach
  // ---------------------------------------------------

  const removePaper = async (paperId) => {
    try {
      setMutationLoading(true);

      await removePaperFromProject(
        projectId,
        paperId
      );

      setPapers((current) =>
        current.filter(
          (paper) => paper._id !== paperId
        )
      );
    } finally {
      setMutationLoading(false);
    }
  };

  return {
    papers,
    loading,
    error,
    mutationLoading,

    fetchPapers,
    addPaper,
    removePaper,
  };
};

export default useProjectPapers;