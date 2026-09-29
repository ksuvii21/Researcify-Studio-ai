import {
  FileText,
  FolderKanban,
  Tag,
} from "lucide-react";

const NoteSidebar = ({ note }) => {
  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  /*
   * Relationships arrive populated as objects
   * ({ _id, title }), or null when unlinked.
   */
  const projectTitle =
    note.projectId?.title || null;

  const paperTitle =
    note.paperId?.title || null;

  return (
    <aside className="note-context-sidebar">
      <section>
        <div className="note-context-heading">
          <FolderKanban size={16} />

          <h3>Research Project</h3>
        </div>

        {projectTitle ? (
          <div className="note-project-link">
            <span>Linked project</span>
            <strong>{projectTitle}</strong>
          </div>
        ) : (
          <p className="note-context-empty">
            This note is not linked to a project.
          </p>
        )}
      </section>

      <section>
        <div className="note-context-heading">
          <Tag size={16} />
          <h3>Tags</h3>
        </div>

        {note.tags?.length ? (
          <div className="note-context-tags">
            {note.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : (
          <p className="note-context-empty">
            No tags on this note.
          </p>
        )}
      </section>

      <section>
        <div className="note-context-heading">
          <FileText size={16} />

          <h3>Linked Paper</h3>
        </div>

        {paperTitle ? (
          <div className="note-linked-papers">
            <button type="button">
              <FileText size={15} />

              <span>{paperTitle}</span>
            </button>
          </div>
        ) : (
          <p className="note-context-empty">
            No paper linked to this note.
          </p>
        )}
      </section>

      <section>
        <div className="note-context-heading">
          <h3>Note Information</h3>
        </div>

        <div className="note-information">
          <div>
            <span>Created</span>
            <strong>
              {formatDate(note.createdAt)}
            </strong>
          </div>

          <div>
            <span>Updated</span>
            <strong>
              {formatDate(note.updatedAt)}
            </strong>
          </div>

          <div>
            <span>Pinned</span>
            <strong>
              {note.isPinned ? "Yes" : "No"}
            </strong>
          </div>

          <div>
            <span>Archived</span>
            <strong>
              {note.isArchived ? "Yes" : "No"}
            </strong>
          </div>
        </div>
      </section>
    </aside>
  );
};

export default NoteSidebar;