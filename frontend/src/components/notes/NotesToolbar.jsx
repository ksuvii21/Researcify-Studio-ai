import {
  Grid2X2,
  List,
  Search,
} from "lucide-react";

import { noteProjects } from "../../data/notesMockData";

const NotesToolbar = ({
  query,
  setQuery,
  project,
  setProject,
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
          value={project}
          onChange={(event) =>
            setProject(event.target.value)
          }
        >
          <option value="all">
            All Projects
          </option>

          {noteProjects.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value)
          }
        >
          <option value="recent">
            Recently Updated
          </option>

          <option value="title">
            Title A–Z
          </option>

          <option value="favorites">
            Favorites First
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