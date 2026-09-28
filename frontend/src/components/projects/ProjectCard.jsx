import {
  ArrowRight,
  Calendar,
  FileText,
  Files,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

const ProjectCard = ({
  project,
  view,
  onEditProject,
  onDeleteProject,
}) => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  const openProject = () => {
    navigate(
      `/projects/${project._id}`
    );
  };

  // Close the menu on outside click / Escape.
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

  const handleEdit = (event) => {
    event.stopPropagation();

    setMenuOpen(false);

    onEditProject?.(project);
  };

  const handleDelete = (event) => {
    event.stopPropagation();

    setMenuOpen(false);

    onDeleteProject?.(project);
  };

  const statusClass =
    project.status?.toLowerCase() || "active";

  const formattedDate = project.updatedAt
    ? new Date(
        project.updatedAt
      ).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  /*
   * Temporary counts.
   *
   * The backend currently stores paperIds and
   * documentIds as arrays on the project. Notes
   * and AI conversations are not integrated yet,
   * so they are not counted here.
   */
  const paperCount =
    project.paperIds?.length || 0;

  const documentCount =
    project.documentIds?.length || 0;

  return (
    <article
      className={`project-card ${
        view === "list"
          ? "project-card--list"
          : ""
      }`}
    >
      <div className="project-card__top">
        <div
          className={`project-card__status project-status ${statusClass}`}
        >
          <span />
          {project.status}
        </div>

        <div
          className="project-card__menu-wrap"
          ref={menuRef}
        >
          <button
            type="button"
            className="project-card__menu"
            aria-label="Project options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((open) => !open);
            }}
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (
            <div
              className="project-card__menu-list"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleEdit}
              >
                <Pencil size={14} />
                Edit project
              </button>

              <button
                type="button"
                role="menuitem"
                className="danger"
                onClick={handleDelete}
              >
                <Trash2 size={14} />
                Delete project
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="project-card__body">
        <p className="project-card__area">
          {project.status}
        </p>

        <h2>{project.title}</h2>

        <p className="project-card__description">
          {project.description ||
            "No description added yet."}
        </p>
      </div>

      <div className="project-card__stats">
        <span>
          <Files size={15} />
          <strong>{paperCount}</strong>
          Papers
        </span>

        <span>
          <FileText size={15} />
          <strong>{documentCount}</strong>
          Documents
        </span>

        <span>
          <Calendar size={15} />
          <strong>{formattedDate}</strong>
          Updated
        </span>
      </div>

      <footer className="project-card__footer">
        <span>
          {project.researchQuestion
            ? "Research question set"
            : "No research question yet"}
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