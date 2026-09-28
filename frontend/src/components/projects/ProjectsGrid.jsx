import {
  FolderSearch,
} from "lucide-react";

import ProjectCard from "./ProjectCard";

const ProjectsGrid = ({
  projects,
  view,
  onEditProject,
  onDeleteProject,
}) => {
  if (!projects.length) {
    return (
      <div className="projects-empty">
        <FolderSearch size={34} />

        <h2>No projects found</h2>

        <p>
          Try changing your search or project
          status filter.
        </p>
      </div>
    );
  }

  return (
    <section
      className={`projects-grid ${
        view === "list"
          ? "projects-grid--list"
          : ""
      }`}
    >
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          view={view}
          onEditProject={onEditProject}
          onDeleteProject={onDeleteProject}
        />
      ))}
    </section>
  );
};

export default ProjectsGrid;