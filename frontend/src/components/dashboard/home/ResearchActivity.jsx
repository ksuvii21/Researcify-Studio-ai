import { Sparkles } from "lucide-react";

import useActivities from "../../../hooks/useActivities";
import ActivityItem from "../../activity/ActivityItem";
import "./ResearchActivity.css";

const ResearchActivity = () => {
  const {
    activities,
    loading,
    error,
  } = useActivities({ limit: 8, autoFetch: true });

  if (loading && activities.length === 0) {
    return (
      <section className="dashboard-card research-activity">
        <div className="dashboard-card__header">
          <div>
            <h2>Research Activity</h2>
            <p>Your recent workspace changes.</p>
          </div>
        </div>

        <div className="research-activity__timeline">
          <div className="activity-skeleton">
            <div className="activity-skeleton__item" />
            <div className="activity-skeleton__item" />
            <div className="activity-skeleton__item" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard-card research-activity">
        <div className="dashboard-card__header">
          <div>
            <h2>Research Activity</h2>
            <p>Your recent workspace changes.</p>
          </div>
        </div>

        <div className="activity-empty">
          <Sparkles size={32} className="activity-empty__icon" />
          <h3 className="activity-empty__title">Unable to load activity</h3>
          <p className="activity-empty__description">{error}</p>
        </div>
      </section>
    );
  }

  if (activities.length === 0) {
    return (
      <section className="dashboard-card research-activity">
        <div className="dashboard-card__header">
          <div>
            <h2>Research Activity</h2>
            <p>Your recent workspace changes.</p>
          </div>
        </div>

        <div className="activity-empty">
          <Sparkles size={32} className="activity-empty__icon" />
          <h3 className="activity-empty__title">
            No research activity yet
          </h3>
          <p className="activity-empty__description">
            Your recent research actions will appear here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-card research-activity">
      <div className="dashboard-card__header">
        <div>
          <h2>Research Activity</h2>
          <p>Your recent workspace changes.</p>
        </div>
      </div>

      <div className="research-activity__timeline">
        {activities.map((activity) => (
          <ActivityItem key={activity._id} activity={activity} />
        ))}
      </div>
    </section>
  );
};

export default ResearchActivity;