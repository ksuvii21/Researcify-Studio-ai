import {
  BookMarked,
  FolderKanban,
  MessageSquareText,
  NotebookPen,
  TrendingUp,
} from "lucide-react";

import useDashboardProjects from "../../../hooks/useDashboardProjects";
import useDashboardPapers from "../../../hooks/useDashboardPapers";
import useDashboardNotes from "../../../hooks/useDashboardNotes";

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

  const {
    totalPapers,
    favoritePapers,
    loading: papersLoading,
  } = useDashboardPapers();

  const {
    totalNotes,
    pinnedNotes,
    loading: notesLoading,
  } = useDashboardNotes();

  /*
   * Projects and Papers are real (Phases 8A / 8B).
   *
   * Notes, Documents, Collections and AI are not
   * integrated yet, so they show an em dash rather
   * than a Phase 7 sample number that could be
   * mistaken for real data.
   *
   * Notes     -> Phase 8C
   * Documents -> Phase 8D
   * Activity  -> Phase 8F
   * AI        -> Phase 8G
   */
  const stats = [
    {
      label: "Total Papers",
      value: papersLoading ? "—" : totalPapers,
      change: "Saved in your library",
      icon: BookMarked,
      trend: [35, 48, 42, 62, 57, 76, 82],
    },
    {
      label: "Active Projects",
      value: loading ? "—" : activeProjects,
      change: `${totalProjects} total`,
      icon: FolderKanban,
      trend: [32, 35, 43, 41, 52, 57, 61],
    },
    {
      label: "Favorite Papers",
      value: papersLoading ? "—" : favoritePapers,
      change: "Starred in your library",
      icon: TrendingUp,
      trend: [28, 40, 37, 51, 65, 61, 77],
    },
    {
      label: "Research Notes",
      value: notesLoading ? "—" : totalNotes,
      change: notesLoading
        ? "Loading"
        : `${pinnedNotes} pinned`,
      icon: NotebookPen,
      trend: [25, 31, 47, 43, 58, 65, 72],
    },
    {
      label: "AI Conversations",
      value: "—",
      change: "Not connected yet",
      icon: MessageSquareText,
      trend: [22, 36, 31, 48, 44, 64, 70],
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

              <small>{change}</small>
            </article>
          )
        )}
      </div>
    </section>
  );
};

export default ResearchOverview;