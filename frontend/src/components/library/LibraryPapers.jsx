import {
  BookOpen,
} from "lucide-react";

import LibraryPaperCard from "./LibraryPaperCard";

const LibraryPapers = ({
  papers,
  view,
  onFavorite,
  onOpen,
}) => {
  if (!papers.length) {
    return (
      <div className="library-empty">
        <BookOpen size={34} />

        <h2>No papers found</h2>

        <p>
          Try another search or change the
          selected library filters.
        </p>
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
          key={paper.id}
          paper={paper}
          view={view}
          onFavorite={onFavorite}
          onOpen={onOpen}
        />
      ))}
    </section>
  );
};

export default LibraryPapers;