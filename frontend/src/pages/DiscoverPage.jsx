import { useMemo, useState } from "react";

import { Search, Sparkles } from "lucide-react";

import DiscoverHeader from "../components/discover/DiscoverHeader";
import DiscoverSearch from "../components/discover/DiscoverSearch";
import DiscoverFilters from "../components/discover/DiscoverFilters";
import PaperResults from "../components/discover/PaperResults";
import TrendingTopics from "../components/discover/TrendingTopics";
import SuggestedSearches from "../components/discover/SuggestedSearches";
import PaperSummaryModal from "../components/discover/PaperSummaryModal";

import "../components/discover/discover.css";

const DiscoverPage = () => {
  const [papers, setPapers] = useState([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    year: "all",
    type: "all",
    access: "all",
    sort: "relevance",
  });
  const [summaryPaper, setSummaryPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="discover-page">
      <DiscoverHeader />

      <DiscoverSearch query={query} onQueryChange={setQuery} />

      {!query && (
        <div className="discover-explore">
          <SuggestedSearches onSelect={setQuery} />
          <TrendingTopics onSelect={setQuery} />
        </div>
      )}

      {query && (
        <>
          <DiscoverFilters
            filters={filters}
            setFilters={setFilters}
            resultCount={papers.length}
          />

          {loading ? (
            <PaperResults papers={[]} loading />
          ) : error ? (
            <div className="discover-error">
              <Sparkles size={32} className="discover-error__icon" />
              <h3 className="discover-error__title">
                Unable to search
              </h3>
              <p className="discover-error__description">{error}</p>
            </div>
          ) : papers.length === 0 ? (
            <div className="discover-empty">
              <Search size={32} className="discover-empty__icon" />
              <h3 className="discover-empty__title">
                No results for "{query}"
              </h3>
              <p className="discover-empty__description">
                Try another keyword or check your spelling.
              </p>
            </div>
          ) : (
            <PaperResults
              papers={papers}
              onSave={toggleSaved}
              onSummary={setSummaryPaper}
            />
          )}
        </>
      )}

      <PaperSummaryModal
        paper={summaryPaper}
        onClose={() => setSummaryPaper(null)}
      />
    </div>
  );
};

export default DiscoverPage;