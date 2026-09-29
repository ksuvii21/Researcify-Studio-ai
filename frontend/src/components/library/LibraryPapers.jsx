import {
  BookOpen,
} from "lucide-react";

import LibraryPaperCard from "./LibraryPaperCard";

const LibraryPapers = ({
  papers,
  view,
  onFavorite,
  onDelete,
  onOpen,
  onOpenDetail,
  isLibraryEmpty,
  onClearFilters,
}) => {
  if (!papers.length) {
    // Truly empty library vs. filters hid everything.
    if (isLibraryEmpty) {
      return (
        <div className="library-empty">
          <BookOpen size={34} />

          <h2>Your research library is empty</h2>

          <p>
            Save papers to organize your research
            and connect them with projects.
          </p>
        </div>
      );
    }

    return (
      <div className="library-empty">
        <BookOpen size={34} />

        <h2>No papers found</h2>

        <p>
          Try changing your search or library
          filters.
        </p>

        <button
          type="button"
          onClick={onClearFilters}
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <section
      className={`library-papers ${
        view === "list"
          ? "library-papers--list"
          : ""
      }`}
    >
      {papers.map((paper) => (
        <LibraryPaperCard
          key={paper._id}
          paper={paper}
          view={view}
          onFavorite={onFavorite}
          onDelete={() => onDelete(paper)}
          onOpen={onOpen}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </section>
  );
};

export default LibraryPapers;