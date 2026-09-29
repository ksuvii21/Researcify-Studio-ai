import {
  BookOpen,
  FolderOpen,
  Library,
  Star,
} from "lucide-react";

const LibraryStats = ({
  papers,
}) => {
  /*
   * Only values derivable from the real Paper model.
   *
   * Collections are not integrated yet (Phase 8E), so
   * that card shows an em dash rather than a number.
   */
  const stats = [
    {
      label: "Total Papers",
      value: papers.length,
      icon: BookOpen,
    },
    {
      label: "Favorites",
      value: papers.filter(
        (paper) => paper.isFavorite
      ).length,
      icon: Star,
    },
    {
      label: "Journal Articles",
      value: papers.filter(
        (paper) => Boolean(paper.journal)
      ).length,
      icon: Library,
    },
    {
      label: "Collections",
      value: "—",
      icon: FolderOpen,
    },
  ];

  return (
    <section className="library-stats">
      {stats.map(
        ({
          label,
          value,
          icon: Icon,
        }) => (
          <article
            key={label}
            className="library-stat"
          >
            <span>
              <Icon size={19} />
            </span>

            <div>
              <strong>{value}</strong>
              <p>{label}</p>
            </div>
          </article>
        )
      )}
    </section>
  );
};

export default LibraryStats;