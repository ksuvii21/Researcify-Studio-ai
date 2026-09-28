import {
  ArrowRight,
  Clock3,
  Sparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import useDashboardProjects from "../../../hooks/useDashboardProjects";

const ContinueResearch = () => {
  const navigate = useNavigate();

  const {
    recentProjects,
    loading,
  } = useDashboardProjects();

  const project = recentProjects[0];

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
    <section className="dashboard-card continue-research">
      <div className="dashboard-card__header">
        <div>
          <h2>Continue Research</h2>
          <p>Pick up from your latest session.</p>
        </div>

        <div className="continue-research__spark">
          <Sparkles size={16} />
        </div>
      </div>

      {loading ? (
        <div className="continue-research__project">
          <span>Active Project</span>
          <h3>Loading...</h3>
        </div>
      ) : project ? (
        <div className="continue-research__project">
          <span>{project.status} Project</span>

          <h3>{project.title}</h3>

          <small className="continue-research__updated">
            <Clock3 size={12} />
            Last updated {formatDate(project.updatedAt)}
          </small>
        </div>
      ) : (
        <div className="continue-research__project">
          <span>Active Project</span>

          <h3>No projects yet</h3>

          <small className="continue-research__updated">
            Create a project to start your research.
          </small>
        </div>
      )}

      <button
        type="button"
        className="continue-research__button"
        disabled={!project}
        onClick={() =>
          project &&
          navigate(`/projects/${project._id}`)
        }
      >
        Continue Research
        <ArrowRight size={15} />
      </button>
    </section>
  );
};

export default ContinueResearch;