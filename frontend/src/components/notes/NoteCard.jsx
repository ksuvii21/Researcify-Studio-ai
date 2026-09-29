import {
  ArrowRight,
  FileText,
  FolderKanban,
  MoreHorizontal,
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

const NoteCard = ({
  note,
  view,
  onPin,
  onArchive,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [menuOpen]);

  const updatedDate = note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString(
        undefined,
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : "—";

  const preview = note.content
    ? `${note.content.slice(0, 180)}${
        note.content.length > 180 ? "…" : ""
      }`
    : "No content yet.";

  const act = (handler) => (event) => {
    event.stopPropagation();

    setMenuOpen(false);

    handler(note);
  };

  const openEditor = () => {
    navigate(`/notes/${note._id}`);
  };

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
          {note.isPinned && (
            <Pin size={11} className="note-card__pin" />
          )}

          {note.isArchived
            ? "Archived"
            : note.projectId
              ? "Project note"
              : note.paperId
                ? "Paper note"
                : "General note"}
        </span>

        <div
          className="note-card__menu-wrap"
          ref={menuRef}
        >
          <button
            type="button"
            aria-label="Note options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((open) => !open);
            }}
          >
            <MoreHorizontal size={17} />
          </button>

          {menuOpen && (
            <div className="note-card__menu-list" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={act(onEdit)}
              >
                <Pencil size={14} />
                Edit note
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={act(onPin)}
              >
                {note.isPinned ? (
                  <>
                    <PinOff size={14} />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin size={14} />
                    Pin note
                  </>
                )}
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={act(onArchive)}
              >
                {note.isArchived ? (
                  <>
                    <ArchiveRestore size={14} />
                    Unarchive
                  </>
                ) : (
                  <>
                    <Archive size={14} />
                    Archive
                  </>
                )}
              </button>

              <button
                type="button"
                role="menuitem"
                className="danger"
                onClick={act(onDelete)}
              >
                <Trash2 size={14} />
                Delete note
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="note-card__content">
        <h2>{note.title}</h2>

        <p>{preview}</p>

        {note.tags?.length > 0 && (
          <div className="note-card__tags">
            {note.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      {(note.projectId || note.paperId) && (
        <div className="note-card__linked">
          {note.projectId ? (
            <FolderKanban size={14} />
          ) : (
            <FileText size={14} />
          )}

          <span>
            {note.projectId && note.paperId
              ? "Linked to a project and a paper"
              : note.projectId
                ? "Linked to a project"
                : "Linked to a paper"}
          </span>
        </div>
      )}

      <footer>
        <span>Updated {updatedDate}</span>

        <button
          type="button"
          onClick={openEditor}
        >
          Open Note
          <ArrowRight size={15} />
        </button>
      </footer>
    </article>
  );
};

export default NoteCard;