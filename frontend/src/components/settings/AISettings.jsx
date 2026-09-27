import {
  Bot,
  Sparkles,
} from "lucide-react";

const AISettings = () => {
  return (
    <section className="settings-section">
      <div className="settings-section__header">
        <span>
          <Bot size={20} />
        </span>

        <div>
          <h2>
            AI Assistant
          </h2>

          <p>
            Configure how the AI
            research assistant works
            with your research
            context.
          </p>
        </div>
      </div>

      <div className="settings-ai-card">
        <Sparkles size={20} />

        <div>
          <strong>
            Research-grounded answers
          </strong>

          <p>
            When research context is
            selected, Researcify will
            use your papers, notes and
            documents to support AI
            responses.
          </p>
        </div>
      </div>

      <div className="settings-toggle-list">
        <label className="setting-toggle">
          <div>
            <strong>
              Include source references
            </strong>

            <p>
              Show supporting research
              sources with AI answers.
            </p>
          </div>

          <input
            type="checkbox"
            defaultChecked
          />

          <span className="toggle-control" />
        </label>

        <label className="setting-toggle">
          <div>
            <strong>
              Use project context
            </strong>

            <p>
              Allow AI to use selected
              project resources as
              research context.
            </p>
          </div>

          <input
            type="checkbox"
            defaultChecked
          />

          <span className="toggle-control" />
        </label>

        <label className="setting-toggle">
          <div>
            <strong>
              Save AI conversations
            </strong>

            <p>
              Keep research conversations
              available in your AI
              workspace.
            </p>
          </div>

          <input
            type="checkbox"
            defaultChecked
          />

          <span className="toggle-control" />
        </label>
      </div>

      <div className="settings-subsection">
        <h3>Default Response Style</h3>

        <select
          className="settings-wide-select"
          defaultValue="Academic and concise"
        >
          <option>
            Academic and concise
          </option>

          <option>
            Detailed research analysis
          </option>

          <option>
            Simple explanation
          </option>
        </select>
      </div>
    </section>
  );
};

export default AISettings;