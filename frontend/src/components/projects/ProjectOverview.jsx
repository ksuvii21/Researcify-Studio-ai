import {
  Bot,
  CalendarDays,
  FileText,
  Files,
  NotebookPen,
  TrendingUp,
} from "lucide-react";

const ProjectOverview = ({
  project,
}) => {
  const stats = [
    {
      label: "Research Papers",
      value: project.papers,
      icon: Files,
    },
    {
      label: "Research Notes",
      value: project.notes,
      icon: NotebookPen,
    },
    {
      label: "Documents",
      value: project.documents,
      icon: FileText,
    },
    {
      label: "AI Conversations",
      value: project.aiChats,
      icon: Bot,
    },
  ];

  return (
    <div className="project-overview">
      <div className="project-overview__stats">
        {stats.map(
          ({
            label,
            value,
            icon: Icon,
          }) => (
            <article
              key={label}
              className="project-overview-stat"
            >
              <span>
                <Icon size={18} />
              </span>

              <div>
                <strong>{value}</strong>
                <p>{label}</p>
              </div>
            </article>
          )
        )}
      </div>

      <div className="project-overview__grid">
        <article className="project-panel">
          <div className="project-panel__heading">
            <div>
              <h2>Research Progress</h2>
              <p>
                Overall project completion.
              </p>
            </div>

            <TrendingUp size={19} />
          </div>

          <div className="project-large-progress">
            <div>
              <strong>
                {project.progress}%
              </strong>

              <span>completed</span>
            </div>

            <div className="project-large-progress__track">
              <span
                style={{
                  width:
                    `${project.progress}%`,
                }}
              />
            </div>
          </div>

          <div className="project-progress-milestones">
            <span className="completed">
              Literature discovery
            </span>

            <span className="completed">
              Initial review
            </span>

            <span className="active">
              Research synthesis
            </span>

            <span>
              Final analysis
            </span>
          </div>
        </article>

        <article className="project-panel">
          <div className="project-panel__heading">
            <div>
              <h2>Project Details</h2>
              <p>
                Research workspace information.
              </p>
            </div>

            <CalendarDays size={19} />
          </div>

          <div className="project-detail-info">
            <div>
              <span>Research area</span>
              <strong>
                {project.area}
              </strong>
            </div>

            <div>
              <span>Created</span>
              <strong>
                {project.created}
              </strong>
            </div>

            <div>
              <span>Last updated</span>
              <strong>
                {project.updated}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <strong>
                {project.status}
              </strong>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ProjectOverview;