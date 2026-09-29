import {
  NotebookPen,
  Pin,
  Plus,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const ProjectNotes = ({
  notes,
  loading,
  error,
  onAddNote,
  onDeleteNote,
  onRetry,
}) => {
  const navigate = useNavigate();

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const renderBody = () => {
    if (loading) {
      return (
        <div className="project-relation-state">
          <p>Loading project notes...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="project-relation-state project-relation-state--error">
          <p>{error}</p>

          <button type="button" onClick={onRetry}>
            Try Again
          </button>
        </div>
      );
    }

    if (!notes.length) {
      return (
        <div className="project-relation-state">
          <h3>No notes yet</h3>

          <p>
            Capture findings, observations and ideas
            for this research project.
          </p>

          <button type="button" onClick={onAddNote}>
            Create Note
          </button>
        </div>
      );
    }

    return (
      <div className="project-notes-grid">
        {notes.map((note) => (
          <article
            key={note._id}
            className="project-note-card"
          >
            <span>
              {note.isPinned ? (
                <Pin size={18} />
              ) : (
                <NotebookPen size={18} />
              )}
            </span>

            <h3>{note.title}</h3>

            <p>
              {note.content
                ? `${note.content.slice(0, 150)}${
                    note.content.length > 150
                      ? "…"
                      : ""
                  }`
                : "No content yet."}
            </p>

            {note.tags?.length > 0 && (
              <div className="project-note-card__tags">
                {note.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}

            <small>
              Updated {formatDate(note.updatedAt)}
            </small>

            <div className="project-note-card__actions">
              <button
                type="button"
                onClick={() =>
                  navigate(`/notes/${note._id}`)
                }
              >
                Open
              </button>

              <button
                type="button"
                className="danger"
                aria-label={`Delete ${note.title}`}
                onClick={() => onDeleteNote(note)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="project-section">
      <div className="project-section__header">
        <div>
          <h2>Research Notes</h2>

          <p>
            Ideas, observations and findings
            captured during research.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddNote}
          disabled={loading}
        >
          <Plus size={15} />
          New Note
        </button>
      </div>

      {renderBody()}
    </div>
  );
};

export default ProjectNotes;