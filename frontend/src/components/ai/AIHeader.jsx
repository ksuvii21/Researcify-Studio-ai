import {
  Bot,
  ChevronDown,
  Sparkles,
} from "lucide-react";

const AIHeader = ({
  project,
  setProject,
}) => {
  return (
    <header className="ai-header">
      <div>
        <span className="ai-header__eyebrow">
          <Sparkles size={15} />
          AI Research Workspace
        </span>

        <h1>Research Assistant</h1>

        <p>
          Analyze literature, compare findings and
          explore your research with AI.
        </p>
      </div>

      <label className="ai-project-selector">
        <span>Research Context</span>

        <div>
          <select
            value={project}
            onChange={(event) =>
              setProject(event.target.value)
            }
          >
            <option>
              Artificial Intelligence in Education
            </option>

            <option>
              Sustainable IoT Systems
            </option>

            <option>
              Human-Computer Interaction
            </option>

            <option>
              Ethics of Large Language Models
            </option>
          </select>

          <ChevronDown size={15} />
        </div>
      </label>
    </header>
  );
};

export default AIHeader;