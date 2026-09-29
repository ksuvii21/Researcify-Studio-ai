import {
  Grid2X2,
  List,
  Search,
} from "lucide-react";

/*
 * Project filtering is done server-side via
 * ?projectId=, so the options come from the user's
 * real projects rather than a hard-coded list.
 */
const NotesToolbar = ({
  query,
  setQuery,
  projectId,
  setProjectId,
  projects,
  sort,
  setSort,
  view,
  setView,
  resultCount,
}) => {
  return (
    <section className="notes-toolbar">
      <div className="notes-search">
        <Search size={17} />

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search notes, tags or ideas..."
        />
      </div>

      <div className="notes-toolbar__controls">
        <span>{resultCount} notes</span>

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
            Recently Updated
          </option>

          <option value="createdAt">
            Recently Created
          </option>

          <option value="title">
            Title A–Z
          </option>
        </select>

        <div className="notes-view-toggle">
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

export default NotesToolbar;