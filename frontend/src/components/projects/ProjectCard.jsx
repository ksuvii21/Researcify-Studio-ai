import {
  ArrowRight,
  Bot,
  FileText,
  Files,
  MoreHorizontal,
  NotebookPen,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const ProjectCard = ({
  project,
  view,
}) => {
  const navigate = useNavigate();

  const openProject = () => {
    navigate(
      `/projects/${project.id}`
    );
  };

  return (
    <article
      className={`project-card ${
        view === "list"
          ? "project-card--list"
          : ""
      }`}
    >
      <div className="project-card__top">
        <div className="project-card__status">
          <span />
          {project.status}
        </div>

        <button
          type="button"
          className="project-card__menu"
          aria-label="Project options"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="project-card__body">
        <p className="project-card__area">
          {project.area}
        </p>

        <h2>{project.title}</h2>

        <p className="project-card__description">
          {project.description}
        </p>

        <div className="project-card__tags">
          {project.tags.map((tag) => (
            <span key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="project-progress">
        <div className="project-progress__labels">
          <span>Research progress</span>

          <strong>
            {project.progress}%
          </strong>
        </div>

        <div className="project-progress__track">
          <span
            style={{
              width: `${project.progress}%`,
            }}
          />
        </div>
      </div>

      <div className="project-card__stats">
        <span>
          <Files size={15} />
          <strong>{project.papers}</strong>
          Papers
        </span>

        <span>
          <NotebookPen size={15} />
          <strong>{project.notes}</strong>
          Notes
        </span>

        <span>
          <FileText size={15} />
          <strong>
            {project.documents}
          </strong>
          Files
        </span>

        <span>
          <Bot size={15} />
          <strong>{project.aiChats}</strong>
          AI Chats
        </span>
      </div>

      <footer className="project-card__footer">
        <span>
          Updated {project.updated}
        </span>

        <button
          type="button"
          onClick={openProject}
        >
          Open Project
          <ArrowRight size={15} />
        </button>
      </footer>
    </article>
  );
};

export default ProjectCard;