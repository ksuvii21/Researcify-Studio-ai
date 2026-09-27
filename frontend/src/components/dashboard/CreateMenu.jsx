import {
  FilePlus2,
  FolderPlus,
  Link2,
  MessageSquarePlus,
  NotebookPen,
  Plus,
  Upload,
} from "lucide-react";

const createOptions = [
  {
    label: "New Research Project",
    description: "Create a new research workspace",
    icon: FolderPlus,
    action: "project",
  },
  {
    label: "New Note",
    description: "Capture a research idea or insight",
    icon: NotebookPen,
    action: "note",
  },
  {
    label: "Upload Document",
    description: "Upload a PDF or DOCX file",
    icon: Upload,
    action: "upload",
  },
  {
    label: "Add Paper",
    description: "Add a paper to your library",
    icon: FilePlus2,
    action: "paper",
  },
  {
    label: "New Collection",
    description: "Organize related research",
    icon: Plus,
    action: "collection",
  },
  {
    label: "Start AI Conversation",
    description: "Ask Researcify about your research",
    icon: MessageSquarePlus,
    action: "ai",
  },
  {
    label: "Import DOI / URL",
    description: "Import from DOI, URL or arXiv",
    icon: Link2,
    action: "import",
  },
];

const CreateMenu = ({
  open,
  onToggle,
  onClose,
  onAction,
}) => {
  return (
    <div className="dashboard-dropdown-wrapper">
      <button
        type="button"
        className="dashboard-create-button"
        onClick={onToggle}
        aria-expanded={open}
      >
        <Plus size={17} />
        <span>Create</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="dashboard-dropdown-backdrop"
            onClick={onClose}
            aria-label="Close create menu"
          />

          <div className="dashboard-dropdown dashboard-create-menu">
            <div className="dashboard-dropdown__heading">
              Create New
            </div>

            {createOptions.map(
              ({
                label,
                description,
                icon: Icon,
                action,
              }) => (
                <button
                  type="button"
                  className="dashboard-menu-item"
                  key={action}
                  onClick={() => {
                    onAction?.(action);
                    onClose();
                  }}
                >
                  <div className="dashboard-menu-item__icon">
                    <Icon size={17} />
                  </div>

                  <div>
                    <strong>{label}</strong>
                    <span>{description}</span>
                  </div>
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CreateMenu;