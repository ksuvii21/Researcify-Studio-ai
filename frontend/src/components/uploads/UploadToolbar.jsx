import {
  Grid2X2,
  List,
  Search,
  SlidersHorizontal,
} from "lucide-react";

/*
 * Status options are the model's real enum values.
 * Project options come from the user's actual
 * projects, not a hard-coded list.
 */
const UploadToolbar = ({
  query,
  setQuery,
  status,
  setStatus,
  projectId,
  setProjectId,
  projects,
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
          <option value="">All Status</option>

          <option value="Uploaded">Uploaded</option>

          <option value="Extracting">Extracting</option>

          <option value="Chunking">Chunking</option>

          <option value="Ready">Ready</option>

          <option value="Failed">Failed</option>
        </select>

        <select
          value={projectId}
          onChange={(event) =>
            setProjectId(event.target.value)
          }
        >
          <option value="">All Projects</option>

          {projects.map((project) => (
            <option
              key={project._id}
              value={project._id}
            >
              {project.title}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value)
          }
        >
          <option value="updatedAt">
            Recently Uploaded
          </option>

          <option value="title">Name A–Z</option>

          <option value="fileSize">
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