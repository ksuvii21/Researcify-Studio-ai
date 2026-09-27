import {
  Clock3,
  FolderKanban,
  Heart,
  NotebookPen,
} from "lucide-react";

const tabs = [
  {
    id: "all",
    label: "All Notes",
    icon: NotebookPen,
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: Heart,
  },
  {
    id: "recent",
    label: "Recent",
    icon: Clock3,
  },
  {
    id: "projects",
    label: "Project Notes",
    icon: FolderKanban,
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