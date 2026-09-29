import {
  FolderKanban,
  NotebookPen,
  Pin,
  Tags,
} from "lucide-react";

const NotesStats = ({ notes }) => {
  const uniqueProjects = new Set(
    notes
      .map((note) => note.projectId)
      .filter(Boolean)
  ).size;

  const uniqueTags = new Set(
    notes.flatMap((note) => note.tags || [])
  ).size;

  const stats = [
    {
      label: "Total Notes",
      value: notes.length,
      icon: NotebookPen,
    },
    {
      label: "Pinned",
      value: notes.filter((note) => note.isPinned)
        .length,
      icon: Pin,
    },
    {
      label: "Linked Projects",
      value: uniqueProjects,
      icon: FolderKanban,
    },
    {
      label: "Research Tags",
      value: uniqueTags,
      icon: Tags,
    },
  ];

  return (
    <section className="notes-stats">
      {stats.map(({ label, value, icon: Icon }) => (
        <article className="notes-stat" key={label}>
          <span>
            <Icon size={19} />
          </span>

          <div>
            <strong>{value}</strong>
            <p>{label}</p>
          </div>
        </article>
      ))}
    </section>
  );
};

export default NotesStats;