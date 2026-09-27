import {
  BrainCircuit,
  FileSearch,
  FolderKanban,
  Library,
  Lightbulb,
  Link2,
  NotebookPen,
} from "lucide-react";

const workflow = [
  [FileSearch, "Discover Papers"],
  [Library, "Save to Library"],
  [FolderKanban, "Add to Project"],
  [BrainCircuit, "AI Analysis"],
  [NotebookPen, "Create Notes"],
  [Link2, "Find Connections"],
  [Lightbulb, "Build Research Insights"],
];

const ResearchWorkflow = () => {
  return (
    <section className="landing-section landing-section--alternate">
      <div className="landing-container">
        <div className="landing-section-heading landing-section-heading--center">
          <span>Research Workflow</span>

          <h2>
            One continuous path from
            <br />
            <em>discovery to understanding.</em>
          </h2>
        </div>

        <div className="workflow-list">
          {workflow.map(([Icon, title], index) => (
            <div className="workflow-item" key={title}>
              <div className="workflow-item__icon">
                <Icon />
              </div>

              <span>{title}</span>

              {index < workflow.length - 1 && (
                <div className="workflow-item__line" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResearchWorkflow;