import {
  Activity,
  Bot,
  CircleHelp,
  FileText,
  Files,
  LayoutDashboard,
  NotebookPen,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import ProjectDetailHeader from "../components/projects/ProjectDetailHeader";
import ProjectOverview from "../components/projects/ProjectOverview";
import ProjectPapers from "../components/projects/ProjectPapers";
import ProjectNotes from "../components/projects/ProjectNotes";
import ProjectDocuments from "../components/projects/ProjectDocuments";
import ProjectQuestions from "../components/projects/ProjectQuestions";
import ProjectAI from "../components/projects/ProjectAI";
import ProjectActivity from "../components/projects/ProjectActivity";
import AddPaperToProjectModal from "../components/projects/AddPaperToProjectModal";
import NoteFormModal from "../components/notes/NoteFormModal";

import useProject from "../hooks/useProject";
import useProjectPapers from "../hooks/useProjectPapers";
import useNotes from "../hooks/useNotes";
import useToast from "../hooks/useToast";

import "../components/projects/projects.css";

const tabs = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "papers",
    label: "Papers",
    icon: Files,
  },
  {
    id: "notes",
    label: "Notes",
    icon: NotebookPen,
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
  },
  {
    id: "questions",
    label: "Questions",
    icon: CircleHelp,
  },
  {
    id: "ai",
    label: "AI Research",
    icon: Bot,
  },
  {
    id: "activity",
    label: "Activity",
    icon: Activity,
  },
];

const ProjectDetailPage = () => {
  const { id } = useParams();

  const toast = useToast();

  const [activeTab, setActiveTab] =
    useState("overview");

  const [addPaperOpen, setAddPaperOpen] =
    useState(false);

  const [noteFormOpen, setNoteFormOpen] =
    useState(false);

  const [editingNote, setEditingNote] =
    useState(null);

  const {
    project,
    loading,
    error,
    refetch,
  } = useProject(id);

  const {
    papers: projectPapers,
    loading: papersLoading,
    error: papersError,
    addPaper,
    removePaper,
    fetchPapers,
  } = useProjectPapers(project?._id);

  const {
    notes: projectNotes,
    loading: notesLoading,
    error: notesError,
    mutationLoading: noteMutationLoading,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  } = useNotes({
    projectId: project?._id || "",
    autoFetch: Boolean(project?._id),
  });

  // ---------------------------------------------------
  // Project notes
  // ---------------------------------------------------

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteFormOpen(true);
  };

  const handleCloseNoteForm = () => {
    setNoteFormOpen(false);
    setEditingNote(null);
  };

  const handleNoteSubmit = async (values) => {
    if (editingNote?._id) {
      await updateNote(editingNote._id, values);

      toast.success("Note updated", values.title);
    } else {
      await createNote(values);

      toast.success("Note created", values.title);
    }

    handleCloseNoteForm();
  };

  const handleDeleteNote = async (note) => {
    const confirmed = window.confirm(
      `Delete "${note.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteNote(note._id);

      toast.success("Note deleted", note.title);
    } catch (err) {
      console.error("[ProjectNotes] Delete error:", err);

      toast.error(
        "Delete failed",
        err?.message || "Unable to delete this note."
      );
    }
  };

  // ---------------------------------------------------
  // Project paper relationship
  // ---------------------------------------------------

  const handleAddPaper = async (paperId) => {
    await addPaper(paperId);

    toast.success(
      "Paper added",
      "The paper was attached to this project."
    );
  };

  const handleRemovePaper = async (paper) => {
    const confirmed = window.confirm(
      `Remove "${paper.title}" from this project? The paper stays in your library.`
    );

    if (!confirmed) return;

    try {
      await removePaper(paper._id);

      toast.success(
        "Paper removed",
        `"${paper.title}" was detached from this project.`
      );
    } catch (err) {
      console.error(
        "[ProjectPapers] Remove error:",
        err
      );

      toast.error(
        "Could not remove paper",
        err?.message || "Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="project-detail-state">
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-page">
        <div className="project-detail-state project-detail-state--error">
          <h2>Project unavailable</h2>

          <p>
            {error ||
              "This project could not be found."}
          </p>

          <button
            type="button"
            onClick={refetch}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "papers":
        return (
          <ProjectPapers
            papers={projectPapers}
            loading={papersLoading}
            error={papersError}
            onAddPaper={() =>
              setAddPaperOpen(true)
            }
            onRemovePaper={handleRemovePaper}
            onRetry={fetchPapers}
          />
        );

      case "notes":
        return (
          <ProjectNotes
            notes={projectNotes}
            loading={notesLoading}
            error={notesError}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onRetry={fetchNotes}
          />
        );

      case "documents":
        return <ProjectDocuments />;

      case "questions":
        return <ProjectQuestions />;

      case "ai":
        return <ProjectAI />;

      case "activity":
        return <ProjectActivity />;

      default:
        return (
          <ProjectOverview
            project={project}
            paperCount={projectPapers.length}
            noteCount={projectNotes.length}
          />
        );
    }
  };

  return (
    <div className="project-detail-page">
      <ProjectDetailHeader
        project={project}
      />

      <nav className="project-tabs">
        {tabs.map(
          ({
            id: tabId,
            label,
            icon: Icon,
          }) => (
            <button
              type="button"
              key={tabId}
              className={
                activeTab === tabId
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(tabId)
              }
            >
              <Icon size={16} />
              {label}
            </button>
          )
        )}
      </nav>

      <div className="project-tab-content">
        {renderTab()}
      </div>

      <AddPaperToProjectModal
        open={addPaperOpen}
        mode="paper"
        projectPapers={projectPapers}
        onClose={() => setAddPaperOpen(false)}
        onAddPaper={handleAddPaper}
      />

      <NoteFormModal
        open={noteFormOpen}
        note={editingNote}
        lockedProjectId={project._id}
        loading={noteMutationLoading}
        onClose={handleCloseNoteForm}
        onSubmit={handleNoteSubmit}
      />
    </div>
  );
};

export default ProjectDetailPage;