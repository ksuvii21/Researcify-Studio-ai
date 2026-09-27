import {
  FileSearch,
  FolderPlus,
  Link2,
  MessageSquareText,
  NotebookPen,
  Upload,
} from "lucide-react";
import useCreateAction from "../../../hooks/useCreateAction";

const actions = [
  {
    id: "search",
    title: "Search Papers",
    description: "Discover academic research",
    icon: FileSearch,
  },
  {
    id: "upload",
    title: "Upload Paper",
    description: "Analyze PDF or document",
    icon: Upload,
  },
  {
    id: "ai",
    title: "Start AI Research",
    description: "Ask your research assistant",
    icon: MessageSquareText,
  },
  {
    id: "project",
    title: "Create Project",
    description: "Organize a research topic",
    icon: FolderPlus,
  },
  {
    id: "note",
    title: "Create Note",
    description: "Capture ideas and insights",
    icon: NotebookPen,
  },
  {
    id: "import",
    title: "Import DOI / URL",
    description: "Add external research",
    icon: Link2,
  },
];

const QuickActions = () => {
    const { handleAction } =
    useCreateAction();

  return (
    <section className="dashboard-section">
      <div className="dashboard-section__header">
        <div>
          <h2>Quick Actions</h2>
          <p>Jump back into your research workflow.</p>
        </div>
      </div>

      <div className="quick-actions-grid">
        {actions.map(
          ({ id, title, description, icon: Icon }) => (
            <button
              type="button"
              className="quick-action-card"
              key={id}
              onClick={() => handleAction(id)}
            >
              <div className="quick-action-card__icon">
                <Icon size={18} />
              </div>

              <div>
                <strong>{title}</strong>
                <span>{description}</span>
              </div>
            </button>
          )
        )}
      </div>
    </section>
  );
};

export default QuickActions;