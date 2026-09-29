import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createProject as createProjectApi,
  deleteProject as deleteProjectApi,
  getProjects,
  updateProject as updateProjectApi,
} from "../api/projectApi";

/*
 * Owns the Projects list: fetching, filtering and
 * CRUD mutations. Keeps ProjectsPage as a
 * presentation/controller layer.
 */
const useProjects = ({
  search = "",
  status = "",
  autoFetch = true,
} = {}) => {
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(autoFetch);

  const [error, setError] = useState("");

  const [mutationLoading, setMutationLoading] =
    useState(false);

  /*
   * Guards against a slow, stale fetch overwriting
   * the results of a newer one when filters change
   * quickly.
   */
  const requestSequence = useRef(0);

  const fetchProjects = useCallback(async () => {
    const requestId = ++requestSequence.current;

    try {
      setLoading(true);
      setError("");

      const response = await getProjects({
        search,
        status,
        sort: "updatedAt",
        order: "desc",
      });

      if (requestId !== requestSequence.current) {
        return;
      }

      setProjects(response?.data || []);
    } catch (err) {
      if (requestId !== requestSequence.current) {
        return;
      }

      console.error(
        "[Projects] Fetch error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your research projects."
      );
    } finally {
      if (requestId === requestSequence.current) {
        setLoading(false);
      }
    }
  }, [search, status]);

  // ---------------------------------------------------
  // Initial load / re-fetch on filter change (debounced)
  // ---------------------------------------------------

  useEffect(() => {
    if (!autoFetch) return undefined;

    const timer = setTimeout(() => {
      fetchProjects();
    }, 300);

    return () => clearTimeout(timer);
  }, [autoFetch, fetchProjects]);

  // ---------------------------------------------------
  // Create
  // ---------------------------------------------------

  const createProject = async (projectData) => {
    try {
      setMutationLoading(true);

      const response = await createProjectApi(
        projectData
      );

      const createdProject = response?.data;

      if (createdProject) {
        setProjects((current) => [
          createdProject,
          ...current,
        ]);
      }

      return createdProject;
    } finally {
      setMutationLoading(false);
    }
  };

  // ---------------------------------------------------
  // Update
  // ---------------------------------------------------

  const updateProject = async (
    projectId,
    projectData
  ) => {
    try {
      setMutationLoading(true);

      const response = await updateProjectApi(
        projectId,
        projectData
      );

      const updatedProject = response?.data;

      if (updatedProject) {
        setProjects((current) =>
          current.map((project) =>
            project._id === projectId
              ? updatedProject
              : project
          )
        );
      }

      return updatedProject;
    } finally {
      setMutationLoading(false);
    }
  };

  // ---------------------------------------------------
  // Delete
  // ---------------------------------------------------

  const deleteProject = async (projectId) => {
    try {
      setMutationLoading(true);

      await deleteProjectApi(projectId);

      setProjects((current) =>
        current.filter(
          (project) => project._id !== projectId
        )
      );
    } finally {
      setMutationLoading(false);
    }
  };

  return {
    projects,
    loading,
    error,
    mutationLoading,

    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};

export default useProjects;