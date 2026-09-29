import {
  FileText,
  FolderOpen,
  ScrollText,
} from "lucide-react";

const CollectionStats = ({
  collections,
}) => {
  const totalPapers = collections.reduce(
    (sum, c) => sum + (c.paperCount || 0),
    0
  );

  const totalDocuments = collections.reduce(
    (sum, c) => sum + (c.documentCount || 0),
    0
  );

  const stats = [
    {
      label: "Collections",
      value: collections.length,
      icon: FolderOpen,
    },
    {
      label: "Research Papers",
      value: totalPapers,
      icon: ScrollText,
    },
    {
      label: "Documents",
      value: totalDocuments,
      icon: FileText,
    },
  ];

  return (
    <section className="collection-stats">
      {stats.map(
        ({
          label,
          value,
          icon: Icon,
        }) => (
          <article
            className="collection-stat"
            key={label}
          >
            <span>
              <Icon size={20} />
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

export default CollectionStats;