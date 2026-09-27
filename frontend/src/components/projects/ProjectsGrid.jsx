import {
  FolderSearch,
} from "lucide-react";

import ProjectCard from "./ProjectCard";

const ProjectsGrid = ({
  projects,
  view,
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
          key={project.id}
          project={project}
          view={view}
        />
      ))}
    </section>
  );
};

export default ProjectsGrid;