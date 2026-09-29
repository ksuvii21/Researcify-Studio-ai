import { Activity } from "lucide-react";

import useActivities from "../../hooks/useActivities";
import ActivityItem from "../activity/ActivityItem";
import "./ProjectActivity.css";

const ProjectActivity = ({ projectId }) => {
  const {
    activities,
    pagination,
    loading,
    error,

    page,
    setPage,
    refetch,
  } = useActivities({ projectId, autoFetch: true });

  const loadMore = () => {
    if (!loading && page < pagination.pages) {
      setPage(page + 1);
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="project-activity project-activity--loading">
        <div className="activity-skeleton">
          <div className="activity-skeleton__item" />
          <div className="activity-skeleton__item" />
          <div className="activity-skeleton__item" />
        </div>
      </div>
    );
  }

  return (
    <div className="project-activity">
      <div className="project-activity__header">
        <div>
          <h2>Project Activity</h2>

          <p>
            Recent changes across this research workspace.
          </p>
        </div>

        <Activity size={19} />
      </div>

      {error ? (
        <div className="activity-empty">
          <Activity size={32} className="activity-empty__icon" />
          <h3 className="activity-empty__title">Unable to load activity</h3>
          <p className="activity-empty__description">{error}</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="activity-empty">
          <Activity size={32} className="activity-empty__icon" />
          <h3 className="activity-empty__title">
            No activity recorded yet
          </h3>
          <p className="activity-empty__description">
            New research activity will appear here.
          </p>
        </div>
      ) : (
        <>
          {activities.map((activity) => (
            <ActivityItem key={activity._id} activity={activity} />
          ))}

          {page < pagination.pages && (
            <div className="activity-load-more">
              <button onClick={loadMore} disabled={loading}>
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectActivity;