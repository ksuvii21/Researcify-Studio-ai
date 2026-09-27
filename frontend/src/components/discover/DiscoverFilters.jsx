import {
  Filter,
  SlidersHorizontal,
} from "lucide-react";

const DiscoverFilters = ({
  filters,
  setFilters,
  resultCount,
}) => {
  const updateFilter = (
    name,
    value
  ) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  return (
    <section className="discover-filterbar">
      <div className="discover-filterbar__results">
        <SlidersHorizontal size={14} />

        <span>
          <strong>{resultCount}</strong>{" "}
          results
        </span>
      </div>

      <div className="discover-filterbar__controls">
        <span className="filter-label">
          <Filter size={13} />
          Filters
        </span>

        <select
          value={filters.year}
          onChange={(event) =>
            updateFilter(
              "year",
              event.target.value
            )
          }
        >
          <option value="all">
            Any Year
          </option>

          <option value="2026">
            2026
          </option>

          <option value="2025">
            2025
          </option>
        </select>

        <select
          value={filters.type}
          onChange={(event) =>
            updateFilter(
              "type",
              event.target.value
            )
          }
        >
          <option value="all">
            All Types
          </option>

          <option value="Journal Article">
            Journal Article
          </option>

          <option value="Research Paper">
            Research Paper
          </option>

          <option value="Review">
            Review
          </option>
        </select>

        <select
          value={filters.access}
          onChange={(event) =>
            updateFilter(
              "access",
              event.target.value
            )
          }
        >
          <option value="all">
            Any Access
          </option>

          <option value="open">
            Open Access
          </option>
        </select>

        <select
          value={filters.sort}
          onChange={(event) =>
            updateFilter(
              "sort",
              event.target.value
            )
          }
        >
          <option value="relevance">
            Most Relevant
          </option>

          <option value="newest">
            Newest
          </option>

          <option value="citations">
            Most Cited
          </option>
        </select>
      </div>
    </section>
  );
};

export default DiscoverFilters;