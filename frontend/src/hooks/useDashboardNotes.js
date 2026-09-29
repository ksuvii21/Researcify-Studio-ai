import { useEffect, useState } from "react";

import { getNotes } from "../api/noteApi";

/*
 * Dashboard note data.
 *
 * `archived: "all"` is used deliberately so that
 * "Total Notes" really is the total. The default API
 * filter hides archived notes, which would make a
 * card labelled "Total" misleading.
 */
const useDashboardNotes = () => {
  const [notes, setNotes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getNotes({
          archived: "all",
          sort: "updatedAt",
          order: "desc",
        });

        if (!active) return;

        setNotes(response?.data || []);
      } catch (err) {
        if (!active) return;

        console.error(
          "[Dashboard] Notes error:",
          err
        );

        setError(
          err?.message ||
          "Unable to load note data."
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
    notes,

    totalNotes: notes.length,

    pinnedNotes: notes.filter(
      (note) => note.isPinned
    ).length,

    recentNotes: notes.slice(0, 4),

    loading,
    error,
  };
};

export default useDashboardNotes;