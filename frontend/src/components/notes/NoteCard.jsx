import {
  ArrowRight,
  FileText,
  Heart,
  MoreHorizontal,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const NoteCard = ({
  note,
  view,
  onFavorite,
}) => {
  const navigate = useNavigate();

  return (
    <article
      className={`note-card ${
        view === "list"
          ? "note-card--list"
          : ""
      }`}
    >
      <div className="note-card__top">
        <span className="note-card__project">
          {note.project}
        </span>

        <div>
          <button
            type="button"
            className={
              note.favorite ? "favorite" : ""
            }
            onClick={() => onFavorite(note.id)}
            aria-label="Favorite note"
          >
            <Heart
              size={16}
              fill={
                note.favorite
                  ? "currentColor"
                  : "none"
              }
            />
          </button>

          <button
            type="button"
            aria-label="Note options"
          >
            <MoreHorizontal size={17} />
          </button>
        </div>
      </div>

      <div className="note-card__content">
        <h2>{note.title}</h2>

        <p>{note.preview}</p>

        <div className="note-card__tags">
          {note.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>

      {note.linkedPapers.length > 0 && (
        <div className="note-card__linked">
          <FileText size={14} />

          <span>
            {note.linkedPapers.length} linked{" "}
            {note.linkedPapers.length === 1
              ? "paper"
              : "papers"}
          </span>
        </div>
      )}

      <footer>
        <span>Updated {note.updated}</span>

        <button
          type="button"
          onClick={() =>
            navigate(`/notes/${note.id}`)
          }
        >
          Open Note
          <ArrowRight size={15} />
        </button>
      </footer>
    </article>
  );
};

export default NoteCard;