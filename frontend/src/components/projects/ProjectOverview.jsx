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
  paperCount,
  noteCount,
  documentCount,
}) => {
  /*
   * Only papers and documents are backed by real
   * data right now.
   *
   * Notes, AI conversations, collections and
   * activity are not integrated yet, so they show
   * an em dash rather than an invented number.
   *
   * Papers  -> Phase 8B
   * Notes    -> Phase 8C
   * Activity -> Phase 8F
   * AI       -> Phase 8G
   */
  /*
   * Prefer the live count from GET /projects/:id/papers.
   * project.paperIds.length is only as fresh as the last
   * project fetch, so it goes stale the moment a paper is
   * attached or detached without refetching the project.
   */
  const papers =
    typeof paperCount === "number"
      ? paperCount
      : project.paperIds?.length || 0;

  /*
   * Prefer the live count from GET /documents?projectId=.
   * project.documentIds is no longer the source of truth:
   * UploadedDocument.projectId is canonical, and the old
   * array is retained only for backward compatibility.
   */
  const documents =
    typeof documentCount === "number"
      ? documentCount
      : project.documentIds?.length || 0;

  const stats = [
    {
      label: "Research Papers",
      value: papers,
      icon: Files,
    },
    {
      label: "Research Notes",
      value:
        typeof noteCount === "number" ? noteCount : "—",
      icon: NotebookPen,
    },
    {
      label: "Documents",
      value: documents,
      icon: FileText,
    },
    {
      label: "AI Conversations",
      value: "—",
      icon: Bot,
    },
  ];

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

  const createdDate = formatDate(
    project.createdAt
  );

  const updatedDate = formatDate(
    project.updatedAt
  );

  const statusClass =
    project.status?.toLowerCase() || "active";

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
              <h2>Research Question</h2>
              <p>
                The focus of this project.
              </p>
            </div>

            <TrendingUp size={19} />
          </div>

          {project.researchQuestion ? (
            <p className="project-panel__question">
              {project.researchQuestion}
            </p>
          ) : (
            <p className="project-panel__question project-panel__question--empty">
              No research question has been added
              yet. Edit this project to add one.
            </p>
          )}
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
              <span>Created</span>
              <strong>{createdDate}</strong>
            </div>

            <div>
              <span>Last updated</span>
              <strong>{updatedDate}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong
                className={`project-status ${statusClass}`}
              >
                {project.status}
              </strong>
            </div>

            <div>
              <span>Project ID</span>
              <strong className="project-detail-info__id">
                {project._id}
              </strong>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ProjectOverview;