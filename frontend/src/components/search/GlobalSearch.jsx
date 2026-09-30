import { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

import useSearch from "../../hooks/useSearch";
import SearchResults from "./SearchResults";
import "./GlobalSearch.css";

const GlobalSearch = ({ isOpen, onClose, onOpenDocument }) => {
  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  const {
    query,
    setQuery,
    results,
    counts,
    loading,
    error,
  } = useSearch({ debounceMs: 300 });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setQuery("");
    if (inputRef.current) inputRef.current.focus();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="global-search-overlay"
      onClick={handleOverlayClick}
    >
      <div className="global-search-modal">
        <header className="global-search__header">
          <div className="global-search__input-wrapper">
            <Search
              size={18}
              className="global-search__icon"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search your research..."
              className="global-search__input"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="global-search__clear"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="global-search__close"
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </header>

        <div className="global-search__body">
          {loading ? (
            <div className="global-search__loading">
              <Search size={24} className="spin" />
              <span>Searching...</span>
            </div>
          ) : error ? (
            <div className="global-search__error">
              <Search size={24} />
              <span>{error}</span>
            </div>
          ) : (
            <SearchResults
              results={results}
              counts={counts}
              query={query}
              onNavigate={onClose}
              onOpenDocument={onOpenDocument}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;