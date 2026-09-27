import {
  ArrowUpRight,
  Bot,
  FileText,
  FolderKanban,
  FolderOpen,
  NotebookPen,
  ScrollText,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

const activityConfig = {
  paper: {
    icon: ScrollText,
    label: "Paper",
  },

  project: {
    icon: FolderKanban,
    label: "Project",
  },

  note: {
    icon: NotebookPen,
    label: "Note",
  },

  document: {
    icon: FileText,
    label: "Document",
  },

  ai: {
    icon: Bot,
    label: "AI Research",
  },

  collection: {
    icon: FolderOpen,
    label: "Collection",
  },
};

const ActivityItem = ({
  activity,
}) => {
  const navigate =
    useNavigate();

  const config =
    activityConfig[activity.type];

  const Icon = config.icon;

  return (
    <article className="activity-item">
      <div className="activity-item__marker">
        <span>
          <Icon size={18} />
        </span>
      </div>

      <div className="activity-item__content">
        <div className="activity-item__heading">
          <div>
            <span className="activity-item__type">
              {config.label}
            </span>

            <span className="activity-item__action">
              {activity.action}
            </span>
          </div>

          <time>{activity.time}</time>
        </div>

        <h3>{activity.title}</h3>

        <p>
          {activity.description}
        </p>

        <div className="activity-item__footer">
          <span>
            {activity.context}
          </span>

          <button
            type="button"
            onClick={() =>
              navigate(activity.path)
            }
          >
            Open
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ActivityItem;