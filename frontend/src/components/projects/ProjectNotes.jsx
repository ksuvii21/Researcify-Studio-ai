import {
  NotebookPen,
  Plus,
} from "lucide-react";

import { projectNotes } from "../../data/projectMockData";

const ProjectNotes = () => {
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

        <button type="button">
          <Plus size={15} />
          New Note
        </button>
      </div>

      <div className="project-notes-grid">
        {projectNotes.map((note) => (
          <article
            key={note.id}
            className="project-note-card"
          >
            <span>
              <NotebookPen size={18} />
            </span>

            <h3>{note.title}</h3>

            <p>{note.preview}</p>

            <small>
              Updated {note.updated}
            </small>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ProjectNotes;