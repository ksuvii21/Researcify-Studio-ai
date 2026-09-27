import {
  NotebookPen,
  Plus,
  Sparkles,
} from "lucide-react";

import useCreateAction from "../../hooks/useCreateAction";

const NotesHeader = () => {
  const { handleAction } = useCreateAction();

  return (
    <header className="notes-header">
      <div>
        <span className="notes-eyebrow">
          <Sparkles size={14} />
          Research Knowledge
        </span>

        <h1>Research Notes</h1>

        <p>
          Capture ideas, synthesize findings and
          connect your thinking with papers and
          research projects.
        </p>
      </div>

      <button
        type="button"
        className="notes-primary-button"
        onClick={() => handleAction("note")}
      >
        <Plus size={17} />
        New Note
      </button>
    </header>
  );
};

export default NotesHeader;