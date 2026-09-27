import {
  BookOpen,
  FolderOpen,
  Heart,
  Upload,
} from "lucide-react";

const LibraryStats = ({
  papers,
}) => {
  const stats = [
    {
      label: "Total Papers",
      value: papers.length,
      icon: BookOpen,
    },
    {
      label: "Favorites",
      value: papers.filter(
        (paper) => paper.favorite
      ).length,
      icon: Heart,
    },
    {
      label: "Uploaded",
      value: papers.filter(
        (paper) =>
          paper.source === "Uploaded"
      ).length,
      icon: Upload,
    },
    {
      label: "Collections",
      value: 4,
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