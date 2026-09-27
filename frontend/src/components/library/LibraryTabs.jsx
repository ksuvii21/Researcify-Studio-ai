import {
  BookOpen,
  Clock3,
  FolderOpen,
  Heart,
  Upload,
} from "lucide-react";

const tabs = [
  {
    id: "all",
    label: "All Papers",
    icon: BookOpen,
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: Heart,
  },
  {
    id: "recent",
    label: "Recently Added",
    icon: Clock3,
  },
  {
    id: "uploaded",
    label: "Uploaded",
    icon: Upload,
  },
  {
    id: "collections",
    label: "Collections",
    icon: FolderOpen,
  },
];

const LibraryTabs = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <nav className="library-tabs">
      {tabs.map(
        ({
          id,
          label,
          icon: Icon,
        }) => (
          <button
            key={id}
            type="button"
            className={
              activeTab === id
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(id)
            }
          >
            <Icon size={16} />
            {label}
          </button>
        )
      )}
    </nav>
  );
};

export default LibraryTabs;