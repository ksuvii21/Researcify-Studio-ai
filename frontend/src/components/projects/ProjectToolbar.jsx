import { Search } from "lucide-react";

const ProjectToolbar = ({
  query,
  setQuery,
  status,
  setStatus,
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
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >
          <option value="all">
            All Status
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Completed">
            Completed
          </option>

          <option value="Archived">
            Archived
          </option>
        </select>
      </div>
    </section>
  );
};

export default ProjectToolbar;