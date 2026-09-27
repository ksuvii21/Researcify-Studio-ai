import {
  useMemo,
  useState,
} from "react";

import ActivityHeader from "../components/activity/ActivityHeader";
import ActivityStats from "../components/activity/ActivityStats";
import ActivityFilters from "../components/activity/ActivityFilters";
import ActivityTimeline from "../components/activity/ActivityTimeline";

import {
  activityData,
} from "../data/activityMockData";

import "../components/activity/activity.css";

const ActivityPage = () => {
  const [query, setQuery] =
    useState("");

  const [type, setType] =
    useState("all");

  const [period, setPeriod] =
    useState("all");

  const filteredActivities =
    useMemo(() => {
      const normalized =
        query
          .trim()
          .toLowerCase();

      return activityData.filter(
        (activity) => {
          const matchesSearch =
            [
              activity.action,
              activity.title,
              activity.description,
              activity.context,
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalized);

          const matchesType =
            type === "all" ||
            activity.type === type;

          let matchesPeriod = true;

          if (period === "today") {
            matchesPeriod =
              activity.date === "Today";
          }

          if (period === "week") {
            matchesPeriod =
              [
                "Today",
                "Yesterday",
                "September 25",
                "September 24",
                "September 23",
                "September 22",
              ].includes(
                activity.date
              );
          }

          return (
            matchesSearch &&
            matchesType &&
            matchesPeriod
          );
        }
      );
    }, [
      query,
      type,
      period,
    ]);

  return (
    <div className="activity-page">
      <ActivityHeader />

      <ActivityStats
        activities={activityData}
      />

      <ActivityFilters
        query={query}
        setQuery={setQuery}
        type={type}
        setType={setType}
        period={period}
        setPeriod={setPeriod}
      />

      <ActivityTimeline
        activities={
          filteredActivities
        }
      />
    </div>
  );
};

export default ActivityPage;