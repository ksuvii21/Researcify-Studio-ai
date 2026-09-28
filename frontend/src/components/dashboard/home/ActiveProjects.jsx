import {
  ArrowUpRight,
  BookOpen,
  MoreHorizontal,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import useDashboardProjects from "../../../hooks/useDashboardProjects";

const ActiveProjects = () => {
  const navigate = useNavigate();

  const {
    recentProjects,
    loading,
    error,
  } = useDashboardProjects();

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString(
          undefined,
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        )
      : "—";

  return (
    <section className="dashboard-card dashboard-projects">
      <div className="dashboard-card__header">
        <div>
          <h2>Active Research Projects</h2>
          <p>Continue where you left off.</p>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={() => navigate("/projects")}
        >
          View all
          <ArrowUpRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="dashboard-projects__state">
          <p>Loading projects...</p>
        </div>
      ) : error ? (
        <div className="dashboard-projects__state">
          <p>{error}</p>
        </div>
      ) : recentProjects.length === 0 ? (
        <div className="dashboard-projects__state">
          <h3>No projects yet</h3>

          <p>
            Create a research project to see it
            here.
          </p>

          <button
            type="button"
            onClick={() => navigate("/projects")}
          >
            Go to Projects
          </button>
        </div>
      ) : (
        <div className="project-list">
          {recentProjects.map((project) => (
            <article
              className="project-card"
              key={project._id}
            >
              <div className="project-card__heading">
                <div>
                  <span className="project-card__status">
                    {project.status}
                  </span>

                  <h3>{project.title}</h3>
                </div>

                <button
                  type="button"
                  className="icon-ghost-button"
                  aria-label={`More options for ${project.title}`}
                  onClick={() =>
                    navigate(
                      `/projects/${project._id}`
                    )
                  }
                >
                  <MoreHorizontal size={17} />
                </button>
              </div>

              <p>
                {project.description ||
                  "No description added yet."}
              </p>

              <div className="project-card__footer">
                <div className="project-card__stats">
                  <span>
                    <BookOpen size={13} />
                    {project.paperIds?.length || 0}{" "}
                    papers
                  </span>
                </div>
              </div>

              <div className="project-card__bottom">
                <small>
                  Updated {formatDate(project.updatedAt)}
                </small>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/projects/${project._id}`
                    )
                  }
                >
                  Open Project
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ActiveProjects;