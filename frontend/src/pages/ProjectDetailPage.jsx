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
  useMemo,
  useState,
} from "react";

import {
  Navigate,
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

import { projects } from "../data/projectMockData";

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

  const [activeTab, setActiveTab] =
    useState("overview");

  const project = useMemo(
    () =>
      projects.find(
        (item) => item.id === id
      ),
    [id]
  );

  if (!project) {
    return (
      <Navigate
        to="/projects"
        replace
      />
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "papers":
        return <ProjectPapers />;

      case "notes":
        return <ProjectNotes />;

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
    </div>
  );
};

export default ProjectDetailPage;