import {
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import {
  uploadProjects,
} from "../../data/uploadsMockData";

const UploadToolbar = ({
  query,
  setQuery,
  status,
  setStatus,
  project,
  setProject,
  sort,
  setSort,
  view,
  setView,
  count,
}) => {
  return (
    <section className="uploads-toolbar">
      <div className="uploads-search">
        <Search size={17} />

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search uploaded documents..."
        />
      </div>

      <div className="uploads-toolbar__controls">
        <span className="uploads-count">
          {count} documents
        </span>

        <span className="uploads-filter-label">
          <SlidersHorizontal size={15} />
          Filters
        </span>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >
          <option value="all">
            All Status
          </option>

          <option value="ready">
            Ready
          </option>

          <option value="processing">
            Processing
          </option>

          <option value="failed">
            Failed
          </option>
        </select>

        <select
          value={project}
          onChange={(event) =>
            setProject(event.target.value)
          }
        >
          <option value="all">
            All Projects
          </option>

          {uploadProjects.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}
        </select>

        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value)
          }
        >
          <option value="recent">
            Recently Uploaded
          </option>

          <option value="name">
            Name A–Z
          </option>

          <option value="size">
            Largest Files
          </option>
        </select>

        <div className="uploads-view-toggle">
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

export default UploadToolbar;