import {
  BookMarked,
  FolderKanban,
  MessageSquareText,
  NotebookPen,
  TrendingUp,
} from "lucide-react";

import useDashboardProjects from "../../../hooks/useDashboardProjects";

const MiniTrend = ({ points }) => {
  const coordinates = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 38 - (point / 100) * 34;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className="overview-card__trend"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={coordinates}
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

const ResearchOverview = () => {
  const {
    totalProjects,
    activeProjects,
    loading,
  } = useDashboardProjects();

  /*
   * Only project values are real in Phase 8A.
   *
   * Papers   -> Phase 8B
   * Notes    -> Phase 8C
   * Activity -> Phase 8F
   * AI       -> Phase 8G
   *
   * The remaining cards keep their Phase 7
   * placeholder values and are marked so they are
   * not mistaken for real data.
   */
  const stats = [
    {
      label: "Total Papers",
      value: 128,
      change: "+12 this month",
      icon: BookMarked,
      trend: [35, 48, 42, 62, 57, 76, 82],
      placeholder: true,
    },
    {
      label: "Active Projects",
      value: loading ? "—" : activeProjects,
      change: `${totalProjects} total`,
      icon: FolderKanban,
      trend: [32, 35, 43, 41, 52, 57, 61],
    },
    {
      label: "Saved Papers",
      value: 84,
      change: "+8 this week",
      icon: TrendingUp,
      trend: [28, 40, 37, 51, 65, 61, 77],
      placeholder: true,
    },
    {
      label: "Research Notes",
      value: 47,
      change: "+5 this week",
      icon: NotebookPen,
      trend: [25, 31, 47, 43, 58, 65, 72],
      placeholder: true,
    },
    {
      label: "AI Conversations",
      value: 23,
      change: "+7 this month",
      icon: MessageSquareText,
      trend: [22, 36, 31, 48, 44, 64, 70],
      placeholder: true,
    },
  ];

  return (
    <section className="dashboard-section">
      <div className="dashboard-section__header">
        <div>
          <h2>Research Overview</h2>
          <p>Your workspace at a glance.</p>
        </div>

        <span className="dashboard-section__meta">
          Last 30 days
        </span>
      </div>

      <div className="research-overview-grid">
        {stats.map(
          ({
            label,
            value,
            change,
            icon: Icon,
            trend,
            placeholder,
          }) => (
            <article
              className="overview-card"
              key={label}
            >
              <div className="overview-card__top">
                <div className="overview-card__icon">
                  <Icon size={17} />
                </div>

                <MiniTrend points={trend} />
              </div>

              <strong className="overview-card__value">
                {value}
              </strong>

              <span className="overview-card__label">
                {label}
              </span>

              <small>
                {placeholder
                  ? "Sample data — not yet connected"
                  : change}
              </small>
            </article>
          )
        )}
      </div>
    </section>
  );
};

export default ResearchOverview;