import { useState } from "react";

import NotesHeader from "../components/notes/NotesHeader";
import NotesStats from "../components/notes/NotesStats";
import NotesTabs from "../components/notes/NotesTabs";
import NotesToolbar from "../components/notes/NotesToolbar";
import NotesGrid from "../components/notes/NotesGrid";
import NoteFormModal from "../components/notes/NoteFormModal";

import useNotes from "../hooks/useNotes";
import useProjects from "../hooks/useProjects";
import useToast from "../hooks/useToast";

import "../components/notes/notes.css";

const NotesPage = () => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("all");

  const [query, setQuery] = useState("");

  const [projectId, setProjectId] = useState("");

  const [sort, setSort] = useState("updatedAt");

  const [view, setView] = useState("grid");

  const [formOpen, setFormOpen] = useState(false);

  const [editingNote, setEditingNote] = useState(null);

  /*
   * Each tab maps to a server-side filter rather than
   * client-side slicing, so the counts reflect the
   * whole collection.
   */
  const pinned =
    activeTab === "pinned" ? "true" : "";

  const archived =
    activeTab === "archived" ? "true" : "false";

  const {
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
  } = useNotes({
    search: query,
    projectId,
    pinned,
    archived,
    sort,
    order: sort === "title" ? "asc" : "desc",
  });

  // Only notes with a project, for the Project Notes tab.
  const visibleNotes =
    activeTab === "projects"
      ? notes.filter((note) => note.projectId)
      : notes;

  // Real projects for the toolbar filter.
  const { projects } = useProjects();

  // ---------------------------------------------------
  // Create / Edit
  // ---------------------------------------------------

  const handleCreate = () => {
    setEditingNote(null);
    setFormOpen(true);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingNote(null);
  };

  const handleSubmit = async (values) => {
    if (editingNote?._id) {
      await updateNote(editingNote._id, values);

      toast.success(
        "Note updated",
        `"${values.title || "Untitled Note"}" was saved.`
      );
    } else {
      await createNote(values);

      toast.success(
        "Note created",
        `"${values.title || "Untitled Note"}" was added to your notes.`
      );
    }

    handleCloseForm();
  };

  // ---------------------------------------------------
  // Row actions
  // ---------------------------------------------------

  const handlePin = async (note) => {
    try {
      const updated = await togglePin(note._id);

      toast.success(
        updated?.isPinned ? "Note pinned" : "Note unpinned",
        note.title
      );
    } catch (err) {
      console.error("[Notes] Pin error:", err);

      toast.error(
        "Could not update pin",
        err?.message || "Please try again."
      );
    }
  };

  const handleArchive = async (note) => {
    try {
      const updated = await toggleArchive(note._id);

      toast.success(
        updated?.isArchived
          ? "Note archived"
          : "Note restored",
        note.title
      );
    } catch (err) {
      console.error("[Notes] Archive error:", err);

      toast.error(
        "Could not update archive",
        err?.message || "Please try again."
      );
    }
  };

  const handleDelete = async (note) => {
    const confirmed = window.confirm(
      `Delete "${note.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteNote(note._id);

      toast.success(
        "Note deleted",
        `"${note.title}" was removed.`
      );
    } catch (err) {
      console.error("[Notes] Delete error:", err);

      toast.error(
        "Delete failed",
        err?.message || "Unable to delete this note."
      );
    }
  };

  const handleClearFilters = () => {
    setQuery("");
    setProjectId("");
    setActiveTab("all");
  };

  const isNotesEmpty =
    !query.trim() &&
    !projectId &&
    activeTab !== "pinned" &&
    activeTab !== "archived";

  return (
    <div className="notes-page">
      <NotesHeader onCreateNote={handleCreate} />

      <NotesStats notes={notes} />

      <NotesTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <NotesToolbar
        query={query}
        setQuery={setQuery}
        projectId={projectId}
        setProjectId={setProjectId}
        projects={projects}
        sort={sort}
        setSort={setSort}
        view={view}
        setView={setView}
        resultCount={visibleNotes.length}
      />

      {loading ? (
        <div className="notes-state">
          <p>Loading your research notes...</p>
        </div>
      ) : error ? (
        <div className="notes-state notes-state--error">
          <p>{error}</p>

          <button type="button" onClick={fetchNotes}>
            Try Again
          </button>
        </div>
      ) : (
        <NotesGrid
          notes={visibleNotes}
          view={view}
          onPin={handlePin}
          onArchive={handleArchive}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isNotesEmpty={isNotesEmpty}
          onClearFilters={handleClearFilters}
        />
      )}

      <NoteFormModal
        open={formOpen}
        note={editingNote}
        loading={mutationLoading}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default NotesPage;