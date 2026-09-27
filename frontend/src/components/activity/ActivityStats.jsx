import {
  Bot,
  FileText,
  FolderKanban,
  ScrollText,
} from "lucide-react";

const ActivityStats = ({
  activities,
}) => {
  const paperCount =
    activities.filter(
      (item) =>
        item.type === "paper"
    ).length;

  const aiCount =
    activities.filter(
      (item) =>
        item.type === "ai"
    ).length;

  const documentCount =
    activities.filter(
      (item) =>
        item.type === "document"
    ).length;

  const projectCount =
    activities.filter(
      (item) =>
        item.type === "project"
    ).length;

  const stats = [
    {
      label: "Paper Actions",
      value: paperCount,
      icon: ScrollText,
    },
    {
      label: "AI Sessions",
      value: aiCount,
      icon: Bot,
    },
    {
      label: "Documents",
      value: documentCount,
      icon: FileText,
    },
    {
      label: "Project Updates",
      value: projectCount,
      icon: FolderKanban,
    },
  ];

  return (
    <section className="activity-stats">
      {stats.map(
        ({
          label,
          value,
          icon: Icon,
        }) => (
          <article
            key={label}
            className="activity-stat"
          >
            <span>
              <Icon size={21} />
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

export default ActivityStats;