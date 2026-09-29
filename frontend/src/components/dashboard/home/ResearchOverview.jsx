import {
  BookMarked,
  FolderKanban,
  Heart,
  MessageSquareText,
  NotebookPen,
} from "lucide-react";

import useDashboardProjects from "../../../hooks/useDashboardProjects";
import useDashboardPapers from "../../../hooks/useDashboardPapers";
import useDashboardNotes from "../../../hooks/useDashboardNotes";

/*
 * These cards show current totals only.
 *
 * There are deliberately no sparklines and no time window.
 * The previous version of this component drew a
 * MiniTrend polyline from a hardcoded array per card
 * (trend: [35, 48, 42, 62, 57, 76, 82]) under a "Last 30
 * days" label, which asserted a history that no record
 * supported.
 *
 * Real trends become possible once Activity stores
 * timestamped events (Phase 8F); until then the honest
 * presentation is a count with no implied trajectory.
 */

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
   * Projects, Papers and Notes all read real records
   * (Phases 8A / 8B / 8C).
   *
   * AI Conversations is not connected yet, so it shows an
   * em dash rather than a sample number that could be
   * mistaken for real data. AI lands in 8G.
   */
  const stats = [
    {
      label: "Total Papers",
      value: papersLoading ? "—" : totalPapers,
      change: "Saved in your library",
      icon: BookMarked,
    },
    {
      label: "Active Projects",
      value: loading ? "—" : activeProjects,
      change: `${totalProjects} total`,
      icon: FolderKanban,
    },
    {
      label: "Favorite Papers",
      value: papersLoading ? "—" : favoritePapers,
      change: "Starred in your library",
      icon: Heart,
    },
    {
      label: "Research Notes",
      value: notesLoading ? "—" : totalNotes,
      change: notesLoading
        ? "Loading"
        : `${pinnedNotes} pinned`,
      icon: NotebookPen,
    },
    {
      label: "AI Conversations",
      value: "—",
      change: "Not connected yet",
      icon: MessageSquareText,
    },
  ];

  return (
    <section className="dashboard-section">
      <div className="dashboard-section__header">
        <div>
          <h2>Research Overview</h2>
          <p>Your workspace at a glance.</p>
        </div>
      </div>

      <div className="research-overview-grid">
        {stats.map(
          ({
            label,
            value,
            change,
            icon: Icon,
          }) => (
            <article
              className="overview-card"
              key={label}
            >
              <div className="overview-card__top">
                <div className="overview-card__icon">
                  <Icon size={17} />
                </div>
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
