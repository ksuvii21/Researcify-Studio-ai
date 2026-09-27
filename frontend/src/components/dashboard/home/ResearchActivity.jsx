import {
  BookMarked,
  FileText,
  FolderPlus,
  NotebookPen,
  Sparkles,
} from "lucide-react";

const activities = [
  {
    id: 1,
    icon: Sparkles,
    title: "AI summary generated",
    description:
      "Generative AI and Personalized Learning Environments",
    time: "12 min ago",
  },
  {
    id: 2,
    icon: BookMarked,
    title: "Paper saved to library",
    description:
      "Explainable AI in Adaptive Learning Systems",
    time: "46 min ago",
  },
  {
    id: 3,
    icon: NotebookPen,
    title: "Research note created",
    description: "Limitations of current XAI methods",
    time: "2 hrs ago",
  },
  {
    id: 4,
    icon: FolderPlus,
    title: "Project updated",
    description: "Artificial Intelligence in Education",
    time: "Yesterday",
  },
  {
    id: 5,
    icon: FileText,
    title: "Document uploaded",
    description: "literature-review-draft.pdf",
    time: "Yesterday",
  },
];

const ResearchActivity = () => {
  return (
    <section className="dashboard-card research-activity">
      <div className="dashboard-card__header">
        <div>
          <h2>Research Activity</h2>
          <p>Your recent workspace changes.</p>
        </div>
      </div>

      <div className="research-activity__timeline">
        {activities.map(
          ({
            id,
            icon: Icon,
            title,
            description,
            time,
          }) => (
            <article
              className="research-activity__item"
              key={id}
            >
              <div className="research-activity__icon">
                <Icon size={14} />
              </div>

              <div>
                <strong>{title}</strong>
                <p>{description}</p>
                <span>{time}</span>
              </div>
            </article>
          )
        )}
      </div>

      <button
        type="button"
        className="research-activity__all"
      >
        View Full Activity
      </button>
    </section>
  );
};

export default ResearchActivity;