import { useEffect, useState } from "react";

import { getProjects } from "../api/projectApi";

/*
 * Dashboard project data.
 *
 * Only project-related dashboard values become real
 * in Phase 8A.7. Papers, notes, documents, collections
 * and activity stay on their Phase 7 placeholders until
 * their own phases.
 */
const useDashboardProjects = () => {
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProjects({
          sort: "updatedAt",
          order: "desc",
        });

        if (!active) return;

        setProjects(response?.data || []);
      } catch (err) {
        if (!active) return;

        console.error(
          "[Dashboard] Projects error:",
          err
        );

        setError(
          err?.message ||
          "Unable to load project data."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  // Backend already sorts by updatedAt DESC.
  const recentProjects = projects.slice(0, 4);

  const activeProjects = projects.filter(
    (project) => project.status === "Active"
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const archivedProjects = projects.filter(
    (project) => project.status === "Archived"
  ).length;

  return {
    projects,
    recentProjects,

    totalProjects: projects.length,
    activeProjects,
    completedProjects,
    archivedProjects,

    loading,
    error,
  };
};

export default useDashboardProjects;