import {
  Grid2X2,
  List,
  Search,
} from "lucide-react";

const ProjectToolbar = ({
  query,
  setQuery,
  status,
  setStatus,
  view,
  setView,
  resultCount,
}) => {
  return (
    <section className="projects-toolbar">
      <div className="projects-search">
        <Search size={17} />

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search projects..."
        />
      </div>

      <div className="projects-toolbar__right">
        <span className="projects-result-count">
          {resultCount} projects
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

          <option value="In Progress">
            In Progress
          </option>

          <option value="Researching">
            Researching
          </option>

          <option value="Review">
            Review
          </option>

          <option value="Planning">
            Planning
          </option>
        </select>

        <div className="projects-view-toggle">
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

export default ProjectToolbar;