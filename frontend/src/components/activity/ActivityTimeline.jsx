import {
  Activity,
} from "lucide-react";

import ActivityItem from "./ActivityItem";

const ActivityTimeline = ({
  activities,
}) => {
  if (!activities.length) {
    return (
      <section className="activity-empty">
        <Activity size={40} />

        <h2>
          No activity found
        </h2>

        <p>
          Try changing your search
          or activity filters.
        </p>
      </section>
    );
  }

  const groups =
    activities.reduce(
      (result, item) => {
        if (!result[item.date]) {
          result[item.date] = [];
        }

        result[item.date].push(
          item
        );

        return result;
      },
      {}
    );

  return (
    <section className="activity-timeline">
      {Object.entries(groups).map(
        ([date, items]) => (
          <div
            className="activity-group"
            key={date}
          >
            <div className="activity-group__header">
              <h2>{date}</h2>

              <span>
                {items.length}{" "}
                {items.length === 1
                  ? "activity"
                  : "activities"}
              </span>
            </div>

            <div className="activity-group__items">
              {items.map(
                (activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                  />
                )
              )}
            </div>
          </div>
        )
      )}
    </section>
  );
};

export default ActivityTimeline;