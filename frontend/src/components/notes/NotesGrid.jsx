import { NotebookPen } from "lucide-react";

import NoteCard from "./NoteCard";

const NotesGrid = ({
  notes,
  view,
  onPin,
  onArchive,
  onEdit,
  onDelete,
  isNotesEmpty,
  onClearFilters,
}) => {
  if (!notes.length) {
    // Truly empty workspace vs. filters hid everything.
    if (isNotesEmpty) {
      return (
        <div className="notes-empty">
          <NotebookPen size={35} />

          <h2>Your notes workspace is empty</h2>

          <p>
            Capture ideas, synthesize findings
            and connect your thinking with papers
            and research projects.
          </p>
        </div>
      );
    }

    return (
      <div className="notes-empty">
        <NotebookPen size={35} />

        <h2>No notes found</h2>

        <p>
          Try changing your search or selected
          filters.
        </p>

        <button
          type="button"
          onClick={onClearFilters}
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <section
      className={`notes-grid ${
        view === "list"
          ? "notes-grid--list"
          : ""
      }`}
    >
      {notes.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          view={view}
          onPin={onPin}
          onArchive={onArchive}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
};

export default NotesGrid;