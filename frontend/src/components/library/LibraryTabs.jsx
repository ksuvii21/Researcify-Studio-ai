import {
  BookOpen,
  Clock3,
  FolderOpen,
  Heart,
} from "lucide-react";

/*
 * Documents are not listed here. /uploads is the dedicated
 * Documents workspace, and repeating them under the Library
 * would create a second, differently-behaving document UI.
 *
 * The previous "Uploaded" tab was worse than absent: it
 * matched none of the branches in LibraryPage, so it fell
 * through to the all-papers view and silently showed papers
 * under a documents label.
 */
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