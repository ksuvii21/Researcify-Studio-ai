import {
  Grid2X2,
  List,
  Search,
} from "lucide-react";

const CollectionsToolbar = ({
  query,
  setQuery,
  sort,
  setSort,
  view,
  setView,
  count,
}) => {
  return (
    <section className="collections-toolbar">
      <div className="collections-search">
        <Search size={17} />

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search collections..."
        />
      </div>

      <div className="collections-toolbar__right">
        <span>
          {count} collections
        </span>

        <select
          value={sort}
          onChange={(event) =>
            setSort(event.target.value)
          }
        >
          <option value="updated">
            Recently Updated
          </option>

          <option value="name">
            Name A–Z
          </option>

          <option value="items">
            Most Items
          </option>
        </select>

        <div className="collections-view-toggle">
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
          >
            <List size={17} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CollectionsToolbar;