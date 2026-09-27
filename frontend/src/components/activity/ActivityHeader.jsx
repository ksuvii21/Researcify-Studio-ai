import {
  Activity,
  Sparkles,
} from "lucide-react";

const ActivityHeader = () => {
  return (
    <header className="activity-header">
      <div>
        <span className="activity-eyebrow">
          <Sparkles size={16} />
          Research History
        </span>

        <h1>Research Activity</h1>

        <p>
          Review your recent research work,
          saved papers, notes, documents,
          projects and AI research sessions.
        </p>
      </div>

      <div className="activity-header__badge">
        <Activity size={17} />
        Activity Timeline
      </div>
    </header>
  );
};

export default ActivityHeader;