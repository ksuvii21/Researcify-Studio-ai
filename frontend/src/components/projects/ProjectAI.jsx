import {
  ArrowRight,
  Bot,
  Sparkles,
} from "lucide-react";

const prompts = [
  "Summarize the key findings across this project",
  "Identify research gaps",
  "Compare methodologies",
  "Suggest research questions",
];

const ProjectAI = () => {
  return (
    <div className="project-section">
      <div className="project-ai">
        <div className="project-ai__heading">
          <span>
            <Bot size={21} />
          </span>

          <div>
            <h2>
              AI Research Assistant
            </h2>

            <p>
              Ask questions using this
              project's research context.
            </p>
          </div>
        </div>

        <div className="project-ai__prompts">
          {prompts.map((prompt) => (
            <button
              type="button"
              key={prompt}
            >
              <Sparkles size={14} />
              {prompt}
            </button>
          ))}
        </div>

        <div className="project-ai__input">
          <textarea
            rows="3"
            placeholder="Ask Researcify AI about this project..."
          />

          <button
            type="button"
            aria-label="Send question"
          >
            <ArrowRight size={17} />
          </button>
        </div>

        <small>
          Project context includes connected
          papers, notes and documents.
        </small>
      </div>
    </div>
  );
};

export default ProjectAI;