import { useEffect, useState } from "react";

import { getPapers } from "../api/paperApi";

/*
 * Dashboard paper data.
 *
 * Only paper-related dashboard values become real in
 * Phase 8B. Notes, documents, collections and activity
 * stay on their Phase 7 placeholders until their own
 * phases.
 */
const useDashboardPapers = () => {
  const [papers, setPapers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPapers({
          sort: "createdAt",
          order: "desc",
        });

        if (!active) return;

        setPapers(response?.data || []);
      } catch (err) {
        if (!active) return;

        console.error(
          "[Dashboard] Papers error:",
          err
        );

        setError(
          err?.message ||
          "Unable to load paper data."
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
  }, []);

  return {
    papers,

    totalPapers: papers.length,

    favoritePapers: papers.filter(
      (paper) => paper.isFavorite
    ).length,

    // Backend already sorts by createdAt DESC.
    recentPapers: papers.slice(0, 4),

    loading,
    error,
  };
};

export default useDashboardPapers;