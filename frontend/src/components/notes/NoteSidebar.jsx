import {
  FileText,
  FolderKanban,
  Plus,
  Tag,
} from "lucide-react";

const NoteSidebar = ({ note }) => {
  return (
    <aside className="note-context-sidebar">
      <section>
        <div className="note-context-heading">
          <FolderKanban size={16} />

          <h3>Research Project</h3>
        </div>

        <div className="note-project-link">
          <span>Linked project</span>
          <strong>{note.project}</strong>
        </div>
      </section>

      <section>
        <div className="note-context-heading">
          <Tag size={16} />
          <h3>Tags</h3>
        </div>

        <div className="note-context-tags">
          {note.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}

          <button type="button">
            <Plus size={12} />
          </button>
        </div>
      </section>

      <section>
        <div className="note-context-heading">
          <FileText size={16} />

          <h3>Linked Papers</h3>
        </div>

        {note.linkedPapers.length ? (
          <div className="note-linked-papers">
            {note.linkedPapers.map(
              (paper) => (
                <button
                  type="button"
                  key={paper.id}
                >
                  <FileText size={15} />

                  <span>
                    {paper.title}
                  </span>
                </button>
              )
            )}
          </div>
        ) : (
          <p className="note-context-empty">
            No papers linked to this note.
          </p>
        )}

        <button
          type="button"
          className="note-context-add"
        >
          <Plus size={14} />
          Link Paper
        </button>
      </section>

      <section>
        <div className="note-context-heading">
          <h3>Note Information</h3>
        </div>

        <div className="note-information">
          <div>
            <span>Created</span>
            <strong>{note.created}</strong>
          </div>

          <div>
            <span>Updated</span>
            <strong>{note.updated}</strong>
          </div>
        </div>
      </section>
    </aside>
  );
};

export default NoteSidebar;