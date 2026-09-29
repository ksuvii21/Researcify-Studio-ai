import {
  Archive,
  Clock3,
  FolderKanban,
  NotebookPen,
} from "lucide-react";

const tabs = [
  {
    id: "all",
    label: "All Notes",
    icon: NotebookPen,
  },
  {
    id: "pinned",
    label: "Pinned",
    icon: Clock3,
  },
  {
    id: "projects",
    label: "Project Notes",
    icon: FolderKanban,
  },
  {
    id: "archived",
    label: "Archived",
    icon: Archive,
  },
];

const NotesTabs = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <nav className="notes-tabs">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={
            activeTab === id ? "active" : ""
          }
          onClick={() => setActiveTab(id)}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </nav>
  );
};

export default NotesTabs;