import {
  FileText,
  FolderOpen,
  NotebookPen,
  ScrollText,
} from "lucide-react";

const CollectionStats = ({
  collections,
}) => {
  const items = collections.flatMap(
    (collection) => collection.items
  );

  const papers = items.filter(
    (item) => item.type === "paper"
  ).length;

  const documents = items.filter(
    (item) => item.type === "document"
  ).length;

  const notes = items.filter(
    (item) => item.type === "note"
  ).length;

  const stats = [
    {
      label: "Collections",
      value: collections.length,
      icon: FolderOpen,
    },
    {
      label: "Research Papers",
      value: papers,
      icon: ScrollText,
    },
    {
      label: "Documents",
      value: documents,
      icon: FileText,
    },
    {
      label: "Research Notes",
      value: notes,
      icon: NotebookPen,
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