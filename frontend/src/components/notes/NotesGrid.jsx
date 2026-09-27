import { NotebookPen } from "lucide-react";

import NoteCard from "./NoteCard";

const NotesGrid = ({
  notes,
  view,
  onFavorite,
}) => {
  if (!notes.length) {
    return (
      <div className="notes-empty">
        <NotebookPen size={35} />

        <h2>No notes found</h2>

        <p>
          Try changing your search or selected
          project filter.
        </p>
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
          key={note.id}
          note={note}
          view={view}
          onFavorite={onFavorite}
        />
      ))}
    </section>
  );
};

export default NotesGrid;