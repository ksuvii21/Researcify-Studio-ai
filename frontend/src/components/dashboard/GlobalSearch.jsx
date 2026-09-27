import {
  FileText,
  FolderKanban,
  History,
  NotebookPen,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

const filters = [
  {
    label: "Papers",
    icon: FileText,
  },
  {
    label: "Projects",
    icon: FolderKanban,
  },
  {
    label: "Notes",
    icon: NotebookPen,
  },
  {
    label: "Authors",
    icon: UserRound,
  },
];

const suggestions = [
  {
    type: "Paper",
    title: "Generative AI and Personalized Learning Environments",
    meta: "R. Sharma et al. · 2026",
    icon: FileText,
  },
  {
    type: "Project",
    title: "Artificial Intelligence in Education",
    meta: "24 papers · 12 notes",
    icon: FolderKanban,
  },
  {
    type: "Note",
    title: "Research gaps in explainable AI",
    meta: "Edited recently",
    icon: NotebookPen,
  },
];

const recentSearches = [
  "Generative AI in education",
  "Human-AI collaboration",
  "Explainable AI",
];

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Papers");

  const inputRef = useRef(null);

  const closeSearch = () => {
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;

      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        setOpen(true);
      }

      if (event.key === "Escape") {
        closeSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => window.clearTimeout(timeout);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="dashboard-search-trigger"
        onClick={() => setOpen(true)}
      >
        <Search size={17} />

        <span>
          Search papers, projects, notes, authors...
        </span>

        <kbd>/</kbd>
      </button>

      {open && (
        <div
          className="global-search-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSearch();
            }
          }}
        >
          <div className="global-search-modal">
            <div className="global-search-modal__input">
              <Search size={19} />

              <input
                ref={inputRef}
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search your research workspace..."
              />

              <button
                type="button"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <X size={17} />
              </button>
            </div>

            <div className="global-search-modal__filters">
              {filters.map(({ label, icon: Icon }) => (
                <button
                  type="button"
                  key={label}
                  className={
                    activeFilter === label ? "active" : ""
                  }
                  onClick={() => setActiveFilter(label)}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {!query && (
              <section className="global-search-group">
                <span className="global-search-group__title">
                  Recent Searches
                </span>

                {recentSearches.map((item) => (
                  <button
                    type="button"
                    className="global-search-recent"
                    key={item}
                    onClick={() => setQuery(item)}
                  >
                    <History size={14} />
                    {item}
                  </button>
                ))}
              </section>
            )}

            <section className="global-search-group">
              <span className="global-search-group__title">
                {query
                  ? `Results for "${query}"`
                  : "Suggested Results"}
              </span>

              {suggestions.map(
                ({
                  type,
                  title,
                  meta,
                  icon: Icon,
                }) => (
                  <button
                    type="button"
                    className="global-search-result"
                    key={title}
                    onClick={closeSearch}
                  >
                    <div className="global-search-result__icon">
                      <Icon size={17} />
                    </div>

                    <div>
                      <strong>{title}</strong>
                      <span>{meta}</span>
                    </div>

                    <small>{type}</small>
                  </button>
                )
              )}
            </section>

            <div className="global-search-modal__footer">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                Navigate
              </span>

              <span>
                <kbd>Enter</kbd>
                Open
              </span>

              <span>
                <kbd>Esc</kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;