import { Search, X } from "lucide-react";

import { useEffect, useRef, useState } from "react";

import GlobalSearch from "../search/GlobalSearch";

const DashboardGlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const closeSearch = () => {
    setOpen(false);
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

      <GlobalSearch
        isOpen={open}
        onClose={closeSearch}
        onOpenDocument={() => {}}
      />
    </>
  );
};

export default DashboardGlobalSearch;