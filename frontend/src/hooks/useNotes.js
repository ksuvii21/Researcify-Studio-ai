import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createNote as createNoteApi,
  deleteNote as deleteNoteApi,
  getNotes,
  toggleNoteArchive,
  toggleNotePin,
  updateNote as updateNoteApi,
} from "../api/noteApi";

/*
 * One parameterised hook powers every notes surface:
 *
 *   useNotes()                     -> all notes
 *   useNotes({ projectId })        -> project notes
 *   useNotes({ paperId })          -> paper notes
 *
 * Requests are guarded with a monotonically increasing
 * sequence number so a slow, stale response cannot
 * overwrite a newer one when filters change quickly.
 */
const useNotes = ({
  search = "",
  projectId = "",
  paperId = "",
  pinned = "",
  archived = "false",
  sort = "updatedAt",
  order = "desc",
  autoFetch = true,
} = {}) => {
  const [notes, setNotes] = useState([]);

  const [loading, setLoading] = useState(autoFetch);

  const [error, setError] = useState("");

  const [mutationLoading, setMutationLoading] =
    useState(false);

  const requestSequence = useRef(0);

  const fetchNotes = useCallback(async () => {
    const requestId = ++requestSequence.current;

    try {
      setLoading(true);
      setError("");

      const response = await getNotes({
        search,
        projectId,
        paperId,
        pinned,
        archived,
        sort,
        order,
      });

      if (requestId !== requestSequence.current) {
        return;
      }

      setNotes(response?.data || []);
    } catch (err) {
      if (requestId !== requestSequence.current) {
        return;
      }

      console.error("[Notes] Fetch error:", err);

      setError(
        err?.message ||
        "Unable to load your research notes."
      );
    } finally {
      if (requestId === requestSequence.current) {
        setLoading(false);
      }
    }
  }, [
    search,
    projectId,
    paperId,
    pinned,
    archived,
    sort,
    order,
  ]);

  useEffect(() => {
    if (!autoFetch) return undefined;

    const timer = setTimeout(() => {
      fetchNotes();
    }, 300);

    return () => clearTimeout(timer);
  }, [autoFetch, fetchNotes]);

  // ---------------------------------------------------
  // Create
  // ---------------------------------------------------

  const createNote = async (noteData) => {
    try {
      setMutationLoading(true);

      const response = await createNoteApi(noteData);

      await fetchNotes();

      return response?.data;
    } finally {
      setMutationLoading(false);
    }
  };

  // ---------------------------------------------------
  // Update
  // ---------------------------------------------------

  const updateNote = async (noteId, noteData) => {
    try {
      setMutationLoading(true);

      const response = await updateNoteApi(
        noteId,
        noteData
      );

      const updated = response?.data;

      if (updated) {
        setNotes((current) =>
          current.map((note) =>
            note._id === updated._id ? updated : note
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

  const deleteNote = async (noteId) => {
    try {
      setMutationLoading(true);

      await deleteNoteApi(noteId);

      setNotes((current) =>
        current.filter((note) => note._id !== noteId)
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

    /*
     * When the active filter no longer matches the note
     * (e.g. pinning while filtering pinned notes, or
     * archiving while the list hides archived), drop it
     * rather than showing a note that no longer belongs.
     */
    const stillMatches =
      (pinned !== "true" || updated.isPinned) &&
      (archived === "true"
        ? updated.isArchived
        : archived === "all" || !updated.isArchived);

    setNotes((current) =>
      stillMatches
        ? current.map((note) =>
          note._id === updated._id ? updated : note
        )
        : current.filter(
          (note) => note._id !== updated._id
        )
    );

    return updated;
  };

  const togglePin = async (noteId) => {
    const response = await toggleNotePin(noteId);

    return applyUpdated(response?.data);
  };

  const toggleArchive = async (noteId) => {
    const response = await toggleNoteArchive(noteId);

    return applyUpdated(response?.data);
  };

  return {
    notes,
    loading,
    error,
    mutationLoading,

    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
  };
};

export default useNotes;