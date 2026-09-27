import {
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const LibraryToolbar = ({
  query,
  setQuery,
  year,
  setYear,
  type,
  setType,
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
          placeholder="Search your library..."
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

        <select
          value={year}
          onChange={(event) =>
            setYear(event.target.value)
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

          <option value="2024">
            2024
          </option>
        </select>

        <select
          value={type}
          onChange={(event) =>
            setType(event.target.value)
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
          value={sort}
          onChange={(event) =>
            setSort(event.target.value)
          }
        >
          <option value="recent">
            Recently Added
          </option>

          <option value="newest">
            Publication Year
          </option>

          <option value="citations">
            Most Cited
          </option>

          <option value="title">
            Title A–Z
          </option>
        </select>

        <div className="library-view-toggle">
          <button
            type="button"
            className={
              view === "grid"
                ? "active"
                : ""
            }
            onClick={() =>
              setView("grid")
            }
            aria-label="Grid view"
          >
            <Grid2X2 size={16} />
          </button>

          <button
            type="button"
            className={
              view === "list"
                ? "active"
                : ""
            }
            onClick={() =>
              setView("list")
            }
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