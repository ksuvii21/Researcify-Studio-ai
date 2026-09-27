import {
  useMemo,
  useState,
} from "react";

import ProjectHeader from "../components/projects/ProjectHeader";
import ProjectToolbar from "../components/projects/ProjectToolbar";
import ProjectsGrid from "../components/projects/ProjectsGrid";

import { projects } from "../data/projectMockData";

import "../components/projects/projects.css";

const ProjectsPage = () => {
  const [query, setQuery] = useState("");
  const [status, setStatus] =
    useState("all");

  const [view, setView] =
    useState("grid");

  const filteredProjects =
    useMemo(() => {
      return projects.filter(
        (project) => {
          const matchesSearch =
            [
              project.title,
              project.description,
              project.area,
              ...project.tags,
            ]
              .join(" ")
              .toLowerCase()
              .includes(
                query
                  .trim()
                  .toLowerCase()
              );

          const matchesStatus =
            status === "all" ||
            project.status === status;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [query, status]);

  return (
    <div className="projects-page">
      <ProjectHeader />

      <ProjectToolbar
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
        view={view}
        setView={setView}
        resultCount={
          filteredProjects.length
        }
      />

      <ProjectsGrid
        projects={filteredProjects}
        view={view}
      />
    </div>
  );
};

export default ProjectsPage;