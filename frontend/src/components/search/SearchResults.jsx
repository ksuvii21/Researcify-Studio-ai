import { useNavigate } from "react-router-dom";
import {
  BookMarked,
  FileText,
  FolderKanban,
  FolderOpen,
  NotebookPen,
  Search,
} from "lucide-react";

import { format } from "date-fns";

const SearchResults = ({
  results,
  counts,
  query,
  onNavigate,
  onOpenDocument,
}) => {
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case "project":
        return FolderKanban;
      case "paper":
        return BookMarked;
      case "note":
        return NotebookPen;
      case "document":
        return FileText;
      case "collection":
        return FolderOpen;
      default:
        return Search;
    }
  };

  const handleResultClick = (result) => {
    switch (result.type) {
      case "project":
        navigate(`/projects/${result.id}`);
        break;
      case "paper":
        navigate(`/library/${result.id}`);
        break;
      case "note":
        navigate(`/notes/${result.id}`);
        break;
      case "document":
        if (onOpenDocument) {
          onOpenDocument(result.id);
        } else {
          navigate("/uploads");
        }
        break;
      case "collection":
        navigate(`/collections/${result.id}`);
        break;
      default:
        break;
    }

    if (onNavigate) onNavigate();
  };

  const renderSection = (type, label) => {
    const items = results[type] || [];

    if (items.length === 0) return null;

    const Icon = getIcon(type);

    return (
      <section className="search-results__section" key={type}>
        <header className="search-results__section-header">
          <Icon size={14} />
          <span>
            {label} ({counts[type] || 0})
          </span>
        </header>

        <ul className="search-results__list">
          {items.map((item) => (
            <li
              key={item.id}
              className="search-results__item"
              onClick={() => handleResultClick(item)}
            >
              <div className="search-results__item-main">
                <strong className="search-results__item-title">
                  {item.title}
                </strong>

                {item.subtitle && (
                  <span className="search-results__item-subtitle">
                    {item.subtitle}
                  </span>
                )}
              </div>

              {item.meta && (
                <span className="search-results__item-meta">
                  {item.meta}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  if (!query?.trim() || query.trim().length < 2) {
    return (
      <div className="search-results search-results--empty">
        <Search size={32} className="search-results__empty-icon" />
        <h3 className="search-results__empty-title">
          {query?.trim().length === 1
            ? "Keep typing to search"
            : "Search across your research workspace"}
        </h3>
        <p className="search-results__empty-description">
          Find projects, papers, notes, documents and collections.
        </p>
      </div>
    );
  }

  if (counts.total === 0) {
    return (
      <div className="search-results search-results--empty">
        <Search size={32} className="search-results__empty-icon" />
        <h3 className="search-results__empty-title">
          No results for "{query}"
        </h3>
        <p className="search-results__empty-description">
          Try another keyword.
        </p>
      </div>
    );
  }

  return (
    <div className="search-results">
      {renderSection("projects", "Projects")}
      {renderSection("papers", "Papers")}
      {renderSection("notes", "Notes")}
      {renderSection("documents", "Documents")}
      {renderSection("collections", "Collections")}
    </div>
  );
};

export default SearchResults;