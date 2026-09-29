import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  FileText,
  FolderPlus,
  Link2,
  Pencil,
  Pin,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

import { useState } from "react";

import { useParams } from "react-router-dom";

import AddPaperToProjectModal from "../components/projects/AddPaperToProjectModal";
import AddToCollectionModal from "../components/collections/AddToCollectionModal";
import NoteFormModal from "../components/notes/NoteFormModal";

import usePaper from "../hooks/usePaper";
import useNotes from "../hooks/useNotes";
import useToast from "../hooks/useToast";

import { addPaperToProject } from "../api/projectApi";

import "../components/library/library.css";

const PaperDetailPage = () => {
  const { id } = useParams();

  const toast = useToast();

  const [addOpen, setAddOpen] = useState(false);

  const [collectionOpen, setCollectionOpen] = useState(false);

  const [noteFormOpen, setNoteFormOpen] = useState(false);

  const [editingNote, setEditingNote] = useState(null);

  const {
    paper,
    loading,
    error,
    refetch,
    toggleFavorite,
  } = usePaper(id);

  const {
    notes: paperNotes,
    loading: notesLoading,
    error: notesError,
    mutationLoading: noteMutationLoading,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
  } = useNotes({
    paperId: paper?._id || "",
    autoFetch: Boolean(paper?._id),
  });

  if (loading) {
    return (
      <div className="paper-detail-page">
        <div className="paper-detail-state">
          <p>Loading paper...</p>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="paper-detail-page">
        <div className="paper-detail-state paper-detail-state--error">
          <h2>Paper unavailable</h2>

          <p>
            {error || "This paper could not be found."}
          </p>

          <button type="button" onClick={refetch}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      : "—";

  const handleFavorite = async () => {
    try {
      const updated = await toggleFavorite();

      toast.success(
        updated?.isFavorite
          ? "Added to favorites"
          : "Removed from favorites",
        paper.title
      );
    } catch (err) {
      console.error("[Paper] Favorite error:", err);

      toast.error(
        "Could not update favorite",
        err?.message || "Please try again."
      );
    }
  };

  const handleAddToProject = async (projectId) => {
    await addPaperToProject(projectId, paper._id);

    toast.success(
      "Paper added",
      `"${paper.title}" was attached to the project.`
    );
  };

  /*
   * The paper is the resource here, so the modal only
   * asks for the destination collection. It reuses the same
   * relationship endpoint the Collection Detail page uses.
   */
  const handleAddedToCollection = ({
    collectionName,
    alreadyExisted,
  }) => {
    if (alreadyExisted) {
      toast.info(
        "Already in collection",
        `"${paper.title}" is already in "${collectionName}".`
      );

      return;
    }

    toast.success(
      "Added to collection",
      `"${paper.title}" was added to "${collectionName}".`
    );
  };

  // ---------------------------------------------------
  // Paper notes
  // ---------------------------------------------------

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteFormOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteFormOpen(true);
  };

  const handleCloseNoteForm = () => {
    setNoteFormOpen(false);
    setEditingNote(null);
  };

  const handleNoteSubmit = async (values) => {
    if (editingNote?._id) {
      await updateNote(editingNote._id, values);

      toast.success("Note updated", values.title);
    } else {
      /*
       * The paper is bound automatically, so the user
       * is never asked to pick the paper they are
       * already looking at.
       */
      await createNote({
        ...values,
        paperId: paper._id,
      });

      toast.success("Note created", values.title);
    }

    handleCloseNoteForm();
  };

  const handleDeleteNote = async (note) => {
    const confirmed = window.confirm(
      `Delete "${note.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteNote(note._id);

      toast.success("Note deleted", note.title);
    } catch (err) {
      console.error("[PaperNotes] Delete error:", err);

      toast.error(
        "Delete failed",
        err?.message || "Unable to delete this note."
      );
    }
  };

  const handlePinNote = async (note) => {
    try {
      await togglePin(note._id);
    } catch (err) {
      console.error("[PaperNotes] Pin error:", err);

      toast.error(
        "Could not update pin",
        err?.message || "Please try again."
      );
    }
  };

  const infoRows = [
    { label: "Source", value: paper.source },
    { label: "DOI", value: paper.doi },
    { label: "Year", value: paper.year },
    { label: "Journal", value: paper.journal },
    {
      label: "Citations",
      value:
        typeof paper.citationCount === "number"
          ? paper.citationCount
          : null,
    },
    { label: "Added", value: formatDate(paper.createdAt) },
    {
      label: "Last updated",
      value: formatDate(paper.updatedAt),
    },
  ].filter(
    (row) =>
      row.value !== null &&
      row.value !== undefined &&
      row.value !== ""
  );

  return (
    <div className="paper-detail-page">
      <button
        type="button"
        className="paper-back"
        onClick={() => window.history.back()}
      >
        <ArrowLeft size={16} />
        Research Library
      </button>

      <header className="paper-detail-header">
        <div className="paper-detail-header__main">
          <div>
            <h1>{paper.title}</h1>

            <p className="paper-detail-header__authors">
              {paper.authors?.length
                ? paper.authors.join(" · ")
                : "Unknown authors"}
            </p>

            <div className="paper-detail-header__meta">
              {paper.journal && (
                <span>{paper.journal}</span>
              )}

              {paper.year && <span>{paper.year}</span>}

              {paper.source && (
                <span>{paper.source}</span>
              )}
            </div>
          </div>

          <div className="paper-detail-header__actions">
            <button
              type="button"
              className={
                paper.isFavorite ? "favorite" : ""
              }
              onClick={handleFavorite}
            >
              <Star
                size={15}
                fill={
                  paper.isFavorite
                    ? "currentColor"
                    : "none"
                }
              />

              {paper.isFavorite
                ? "Favorited"
                : "Favorite"}
            </button>

            <button
              type="button"
              className="paper-detail-header__primary"
              onClick={() => setAddOpen(true)}
            >
              <Link2 size={15} />
              Add to Project
            </button>

            <button
              type="button"
              onClick={() =>
                setCollectionOpen(true)
              }
            >
              <FolderPlus size={15} />
              Add to Collection
            </button>

            {paper.url && (
              <a
                className="paper-detail-header__link"
                href={paper.url}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={15} />
                Source
              </a>
            )}

            {paper.pdfUrl && (
              <a
                className="paper-detail-header__link"
                href={paper.pdfUrl}
                target="_blank"
                rel="noreferrer"
              >
                <FileText size={15} />
                PDF
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="paper-detail-grid">
        <article className="project-panel">
          <div className="project-panel__heading">
            <div>
              <h2>Abstract</h2>
              <p>Summary supplied by the source.</p>
            </div>

            <FileText size={19} />
          </div>

          <p className="paper-detail__abstract">
            {paper.abstract ||
              "No abstract available for this paper."}
          </p>

          {paper.keywords?.length > 0 && (
            <div className="paper-detail__keywords">
              <span className="library-preview__label">
                Keywords
              </span>

              <div className="library-preview__tags">
                {paper.keywords.map((keyword) => (
                  <span key={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        <article className="project-panel">
          <div className="project-panel__heading">
            <div>
              <h2>Paper Information</h2>
              <p>Saved library record.</p>
            </div>

            <CalendarDays size={19} />
          </div>

          <div className="project-detail-info">
            {infoRows.map((row) => (
              <div key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>

      <section className="paper-detail-notes">
        <div className="project-section__header">
          <div>
            <h2>My Notes</h2>
            <p>
              Observations and findings while
              reviewing this paper.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddNote}
            disabled={notesLoading}
          >
            <Plus size={15} />
            Add Note
          </button>
        </div>

        {notesLoading ? (
          <div className="project-relation-state">
            <p>Loading notes...</p>
          </div>
        ) : notesError ? (
          <div className="project-relation-state project-relation-state--error">
            <p>{notesError}</p>

            <button type="button" onClick={fetchNotes}>
              Try Again
            </button>
          </div>
        ) : paperNotes.length === 0 ? (
          <div className="project-relation-state">
            <h3>No notes for this paper yet</h3>

            <p>
              Capture observations, findings and ideas
              while reviewing this research paper.
            </p>

            <button type="button" onClick={handleAddNote}>
              Add Note
            </button>
          </div>
        ) : (
          <div className="paper-notes-list">
            {paperNotes.map((note) => (
              <article
                key={note._id}
                className="paper-note"
              >
                <div className="paper-note__top">
                  <h3>
                    {note.isPinned && (
                      <Pin size={13} />
                    )}
                    {note.title}
                  </h3>

                  <div className="paper-note__actions">
                    <button
                      type="button"
                      aria-label="Edit note"
                      onClick={() => handleEditNote(note)}
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      type="button"
                      aria-label="Pin note"
                      className={
                        note.isPinned ? "active" : ""
                      }
                      onClick={() => handlePinNote(note)}
                    >
                      <Pin size={14} />
                    </button>

                    <button
                      type="button"
                      aria-label="Delete note"
                      className="danger"
                      onClick={() => handleDeleteNote(note)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p>
                  {note.content
                    ? `${note.content.slice(0, 180)}${
                        note.content.length > 180
                          ? "…"
                          : ""
                      }`
                    : "No content yet."}
                </p>

                <small>
                  Updated {formatDate(note.updatedAt)}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>

      <AddPaperToProjectModal
        open={addOpen}
        mode="project"
        paper={paper}
        onClose={() => setAddOpen(false)}
        onAddToProject={handleAddToProject}
      />

      <AddToCollectionModal
        open={collectionOpen}
        mode="resource"
        resourceType="paper"
        resourceId={paper._id}
        resourceLabel={paper.title}
        onClose={() => setCollectionOpen(false)}
        onAdded={handleAddedToCollection}
      />

      <NoteFormModal
        open={noteFormOpen}
        note={editingNote}
        defaultPaperId={paper._id}
        loading={noteMutationLoading}
        onClose={handleCloseNoteForm}
        onSubmit={handleNoteSubmit}
      />
    </div>
  );
};

export default PaperDetailPage;