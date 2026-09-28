import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getProjectById } from "../api/projectApi";

/*
 * Loads a single project by its MongoDB _id.
 * Used by ProjectDetailPage.
 */
const useProject = (projectId) => {
  const [project, setProject] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

    useEffect(() => {
      let active = true;

      const load = async () => {
        if (!projectId) {
          if (active) {
            setProject(null);
            setLoading(false);
          }

          return;
        }

        try {
          setLoading(true);
          setError("");

          const response = await getProjectById(
            projectId
          );

          if (!active) return;

          setProject(response?.data || null);
        } catch (err) {
          if (!active) return;

          console.error(
            "[Project] Fetch error:",
            err
          );

          setProject(null);

          setError(
            err?.message ||
              "Unable to load this research project."
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

    // Manual retry from the error state.
    const refetch = useCallback(async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        setError("");

        const response = await getProjectById(
          projectId
        );

        setProject(response?.data || null);
      } catch (err) {
        console.error(
          "[Project] Fetch error:",
          err
        );

        setProject(null);

        setError(
          err?.message ||
            "Unable to load this research project."
        );
      } finally {
        setLoading(false);
      }
    }, [projectId]);

    return {
      project,
      loading,
      error,
      refetch,
    };
  };

export default useProject;