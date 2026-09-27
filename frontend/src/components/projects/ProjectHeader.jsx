import {
  FolderKanban,
  Plus,
  Sparkles,
} from "lucide-react";

import useCreateAction from "../../hooks/useCreateAction";

const ProjectHeader = () => {
  const { handleAction } =
    useCreateAction();

  return (
    <header className="projects-header">
      <div>
        <span className="projects-eyebrow">
          <Sparkles size={14} />
          Research Workspace
        </span>

        <h1>Research Projects</h1>

        <p>
          Organize papers, notes, documents and
          AI research around focused research
          topics.
        </p>
      </div>

      <button
        type="button"
        className="projects-primary-btn"
        onClick={() =>
          handleAction("project")
        }
      >
        <Plus size={17} />
        New Project
      </button>
    </header>
  );
};

export default ProjectHeader;