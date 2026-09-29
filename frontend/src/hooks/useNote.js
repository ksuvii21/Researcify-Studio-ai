import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getNoteById,
  updateNote,
} from "../api/noteApi";

/*
 * Loads a single note by its MongoDB _id.
 * Used by the real NoteEditorPage.
 */
const useNote = (noteId) => {
  const [note, setNote] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!noteId) {
        if (active) {
          setNote(null);
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getNoteById(noteId);

        if (!active) return;

        setNote(response?.data || null);
      } catch (err) {
        if (!active) return;

        console.error("[Note] Fetch error:", err);

        setNote(null);

        setError(
          err?.message ||
          "Unable to load this note."
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
  }, [noteId]);

  // Manual retry from the error state.
  const refetch = useCallback(async () => {
    if (!noteId) return;

    try {
      setLoading(true);
      setError("");

      const response = await getNoteById(noteId);

      setNote(response?.data || null);
    } catch (err) {
      console.error("[Note] Fetch error:", err);

      setNote(null);

      setError(
        err?.message || "Unable to load this note."
      );
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  /*
   * Memoised so the autosave effect in the editor
   * does not re-run on every render.
   */
  const saveNote = useCallback(
    async (data) => {
      const response = await updateNote(noteId, data);

      if (response?.data) {
        setNote(response.data);
      }

      return response?.data;
    },
    [noteId]
  );

  return {
    note,
    loading,
    error,
    refetch,
    saveNote,
  };
};

export default useNote;