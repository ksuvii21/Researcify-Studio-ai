import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Check,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const SAVE_LABELS = {
  saved: "Saved",
  unsaved: "Unsaved changes",
  saving: "Saving...",
  error: "Save failed",
};

const NoteEditorHeader = ({
  note,
  saveStatus,
  onTogglePin,
  onToggleArchive,
  onDelete,
  onRetrySave,
}) => {
  const navigate = useNavigate();

  const status = saveStatus || "saved";

  return (
    <header className="note-editor-header">
      <div className="note-editor-header__left">
        <button
          type="button"
          onClick={() => navigate("/notes")}
        >
          <ArrowLeft size={16} />
          Notes
        </button>

        <span className={`note-save-status note-save-status--${status}`}>
          {status === "saved" ? (
            <Check size={13} />
          ) : (
            <span className="note-save-dot" />
          )}

          {SAVE_LABELS[status] || "Saved"}
        </span>

        {status === "error" && onRetrySave && (
          <button
            type="button"
            className="note-retry-button"
            onClick={onRetrySave}
          >
            Retry
          </button>
        )}
      </div>

      <div className="note-editor-header__actions">
        <button
          type="button"
          className={note.isPinned ? "favorite" : ""}
          onClick={onTogglePin}
        >
          {note.isPinned ? (
            <PinOff size={16} />
          ) : (
            <Pin size={16} />
          )}

          {note.isPinned ? "Unpin" : "Pin"}
        </button>

        <button
          type="button"
          onClick={onToggleArchive}
        >
          {note.isArchived ? (
            <ArchiveRestore size={16} />
          ) : (
            <Archive size={16} />
          )}

          {note.isArchived ? "Unarchive" : "Archive"}
        </button>

        <button
          type="button"
          className="danger"
          onClick={onDelete}
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </header>
  );
};

export default NoteEditorHeader;