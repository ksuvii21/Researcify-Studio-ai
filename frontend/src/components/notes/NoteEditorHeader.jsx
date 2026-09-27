import {
  ArrowLeft,
  Heart,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const NoteEditorHeader = ({
  note,
  favorite,
  onFavorite,
  saveStatus,
}) => {
  const navigate = useNavigate();

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

        <span className="note-save-status">
          <span
            className={
              saveStatus === "Saved"
                ? "saved"
                : ""
            }
          />

          {saveStatus}
        </span>
      </div>

      <div className="note-editor-header__actions">
        <button
          type="button"
          className={
            favorite ? "favorite" : ""
          }
          onClick={onFavorite}
        >
          <Heart
            size={16}
            fill={
              favorite
                ? "currentColor"
                : "none"
            }
          />

          {favorite
            ? "Favorited"
            : "Favorite"}
        </button>

        <button type="button">
          <Trash2 size={16} />
          Delete
        </button>

        <button
          type="button"
          aria-label="More options"
        >
          <MoreHorizontal size={17} />
        </button>
      </div>
    </header>
  );
};

export default NoteEditorHeader;