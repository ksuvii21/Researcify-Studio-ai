import { useState } from "react";

import ProjectHeader from "../components/projects/ProjectHeader";
import ProjectToolbar from "../components/projects/ProjectToolbar";
import ProjectsGrid from "../components/projects/ProjectsGrid";
import ProjectFormModal from "../components/projects/ProjectFormModal";

import useProjects from "../hooks/useProjects";
import useToast from "../hooks/useToast";

const ProjectsPage = () => {
  const toast = useToast();

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [formOpen, setFormOpen] = useState(false);

  const [editingProject, setEditingProject] =
    useState(null);

  const {
    projects,
    loading,
    error,
    mutationLoading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects({ search, status });

  // ---------------------------------------------------
  // Create / Edit
  // ---------------------------------------------------

  const handleCreate = () => {
    setEditingProject(null);
    setFormOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingProject(null);
  };

  const handleProjectSubmit = async (values) => {
    if (editingProject?._id) {
      const updated = await updateProject(
        editingProject._id,
        values
      );

      toast.success(
        "Project updated",
        `"${updated?.title || values.title}" was saved.`
      );
    } else {
      const created = await createProject(values);

      toast.success(
        "Project created",
        `"${created?.title || values.title}" is ready for research.`
      );
    }

    handleCloseForm();
  };

  // ---------------------------------------------------
  // Delete
  // ---------------------------------------------------

  const handleDelete = async (project) => {
    const confirmed = window.confirm(
      `Delete "${project.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteProject(project._id);

      toast.success(
        "Project deleted",
        `"${project.title}" was removed.`
      );
    } catch (err) {
      console.error(
        "[Projects] Delete error:",
        err
      );

      toast.error(
        "Delete failed",
        err?.message ||
          "Unable to delete this project."
      );
    }
  };

  return (
    <div className="projects-page">
      <ProjectHeader onCreateProject={handleCreate} />

      <ProjectToolbar
        query={search}
        setQuery={setSearch}
        status={status === "" ? "all" : status}
        setStatus={(value) =>
          setStatus(value === "all" ? "" : value)
        }
      />

      {loading ? (
        <div className="projects-state">
          <p>Loading your research projects...</p>
        </div>
      ) : error ? (
        <div className="projects-state projects-error">
          <p>{error}</p>

          <button
            type="button"
            onClick={fetchProjects}
          >
            Try Again
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="projects-state">
          <h3>No projects found</h3>

          <p>
            Create a research project to organize
            your papers, notes, documents and AI
            research.
          </p>

          <button
            type="button"
            onClick={handleCreate}
          >
            New Project
          </button>
        </div>
      ) : (
        <ProjectsGrid
          projects={projects}
          onEditProject={handleEdit}
          onDeleteProject={handleDelete}
        />
      )}

      <ProjectFormModal
        open={formOpen}
        project={editingProject}
        loading={mutationLoading}
        onClose={handleCloseForm}
        onSubmit={handleProjectSubmit}
      />
    </div>
  );
};

export default ProjectsPage;