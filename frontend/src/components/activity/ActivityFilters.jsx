import {
  CalendarDays,
  Search,
} from "lucide-react";

const filters = [
  ["all", "All Activity"],
  ["paper", "Papers"],
  ["project", "Projects"],
  ["note", "Notes"],
  ["document", "Documents"],
  ["ai", "AI"],
  ["collection", "Collections"],
];

const ActivityFilters = ({
  query,
  setQuery,
  type,
  setType,
  period,
  setPeriod,
}) => {
  return (
    <section className="activity-controls">
      <div className="activity-search">
        <Search size={18} />

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search research activity..."
        />
      </div>

      <div className="activity-filter-row">
        <div className="activity-filter-tabs">
          {filters.map(
            ([value, label]) => (
              <button
                type="button"
                key={value}
                className={
                  type === value
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setType(value)
                }
              >
                {label}
              </button>
            )
          )}
        </div>

        <div className="activity-period">
          <CalendarDays size={16} />

          <select
            value={period}
            onChange={(event) =>
              setPeriod(
                event.target.value
              )
            }
          >
            <option value="all">
              All Time
            </option>

            <option value="today">
              Today
            </option>

            <option value="week">
              This Week
            </option>
          </select>
        </div>
      </div>
    </section>
  );
};

export default ActivityFilters;