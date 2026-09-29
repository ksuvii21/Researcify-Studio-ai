import {
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
} from "lucide-react";

/*
 * Year and type filters from Phase 7 are not wired
 * yet.
 *
 * year  -> the model stores a per-paper `year`, but
 *          the option list was hard-coded to
 *          2024-2026, so it would silently hide real
 *          papers. It becomes a real filter in 8B.5.
 * type  -> the Paper model has no `type` field.
 *
 * Both are therefore rendered disabled so they are
 * visibly not yet active rather than silently broken.
 */
const LibraryToolbar = ({
  query,
  setQuery,
  sort,
  setSort,
  view,
  setView,
  resultCount,
}) => {
  return (
    <section className="library-toolbar">
      <div className="library-search">
        <Search size={17} />

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search title, author, journal or keyword..."
        />
      </div>

      <div className="library-toolbar__controls">
        <span className="library-result-count">
          {resultCount} papers
        </span>

        <span className="library-filter-label">
          <SlidersHorizontal size={15} />
          Filters
        </span>

        <select value="all" disabled title="Available in Phase 8B.5">
          <option value="all">
            Any Year
          </option>
        </select>

        <select value="all" disabled title="Available in Phase 8B.5">
          <option value="all">
            All Types
          </option>
        </select>

        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value)
          }
        >
          <option value="createdAt">
            Recently Added
          </option>

          <option value="year">
            Publication Year
          </option>

          <option value="title">
            Title A–Z
          </option>
        </select>

        <div className="library-view-toggle">
          <button
            type="button"
            className={
              view === "grid" ? "active" : ""
            }
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <Grid2X2 size={16} />
          </button>

          <button
            type="button"
            className={
              view === "list" ? "active" : ""
            }
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <List size={17} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default LibraryToolbar;