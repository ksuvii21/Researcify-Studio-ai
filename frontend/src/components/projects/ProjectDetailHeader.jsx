import {
  ArrowLeft,
  Bot,
  MoreHorizontal,
  Plus,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const ProjectDetailHeader = ({
  project,
}) => {
  const navigate = useNavigate();

  return (
    <header className="project-detail-header">
      <button
        type="button"
        className="project-back"
        onClick={() =>
          navigate("/projects")
        }
      >
        <ArrowLeft size={16} />
        Projects
      </button>

      <div className="project-detail-header__main">
        <div>
          <div className="project-detail-header__meta">
            <span
              className={`project-status ${
                project.status?.toLowerCase() ||
                "active"
              }`}
            >
              {project.status}
            </span>

            <span className="project-detail-header__id">
              {project._id}
            </span>
          </div>

          <h1>{project.title}</h1>

          <p>
            {project.description ||
              "No description added yet."}
          </p>
        </div>

        <div className="project-detail-header__actions">
          <button type="button">
            <Bot size={16} />
            Ask AI
          </button>

          <button
            type="button"
            className="project-detail-header__primary"
          >
            <Plus size={16} />
            Add Research
          </button>

          <button
            type="button"
            aria-label="Project options"
          >
            <MoreHorizontal size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default ProjectDetailHeader;