import {
  ArrowRight,
  Search,
  Sparkles,
} from "lucide-react";

const DiscoverSearch = ({
  query,
  onQueryChange,
}) => {
  return (
    <section className="discover-search">
      <div className="discover-search__content">
        <span className="discover-search__label">
          <Sparkles size={12} />
          Search research literature
        </span>

        <div className="discover-search__box">
          <Search size={19} />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              onQueryChange(event.target.value)
            }
            placeholder="Search papers, topics, authors, keywords..."
          />

          <button type="button">
            Search
            <ArrowRight size={15} />
          </button>
        </div>

        <p>
          Search by topic, paper title, author
          or research keyword.
        </p>
      </div>
    </section>
  );
};

export default DiscoverSearch;