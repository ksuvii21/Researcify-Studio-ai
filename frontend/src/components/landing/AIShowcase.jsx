import {
  ArrowRight,
  Check,
  Paperclip,
  Send,
  Sparkles,
} from "lucide-react";

import Button from "../ui/Button";

const capabilities = [
  "Summarize research papers",
  "Compare multiple papers",
  "Explain complex concepts",
  "Generate research questions",
  "Identify research gaps",
  "Find conflicting findings",
  "Extract key insights",
];

const AIShowcase = () => {
  return (
    <section
      className="landing-section landing-section--alternate"
      id="ai-research"
    >
      <div className="landing-container ai-showcase-grid">
        <div className="ai-showcase-copy">
          <div className="landing-section-heading">
            <span>
              <Sparkles />
              Researcify AI
            </span>

            <h2>
              Your research deserves
              <br />
              <em>more than a chatbot.</em>
            </h2>

            <p>
              Researcify AI understands the context of your papers,
              projects and notes, helping you move from reading
              information to understanding it.
            </p>
          </div>

          <ul className="ai-capabilities">
            {capabilities.map((item) => (
              <li key={item}>
                <Check />
                {item}
              </li>
            ))}
          </ul>

          <Button
            variant="outline"
            icon={ArrowRight}
            iconPosition="right"
          >
            Meet Your AI Research Assistant
          </Button>
        </div>

        <div className="ai-chat-demo">
          <div className="ai-chat-demo__header">
            <div className="ai-chat-demo__avatar">
              <Sparkles />
            </div>

            <div>
              <strong>Researcify AI</strong>
              <span>Research Assistant</span>
            </div>

            <i />
          </div>

          <div className="ai-chat-demo__body">
            <div className="chat-message chat-message--user">
              Compare the findings of these three papers.
            </div>

            <div className="chat-message chat-message--ai">
              <div className="chat-ai-label">
                <Sparkles />
                Researcify AI
              </div>

              <p>
                Across the selected studies, three major themes emerge:
                personalized learning, improved student engagement and
                concerns around transparency and academic integrity.
              </p>

              <div className="chat-citations">
                <span>Paper 01</span>
                <span>Paper 02</span>
                <span>Paper 03</span>
              </div>
            </div>

            <div className="chat-suggestions">
              <button>Find contradictions</button>
              <button>Research gaps</button>
              <button>Create notes</button>
            </div>
          </div>

          <div className="ai-chat-demo__input">
            <Paperclip />
            <span>Ask about your research...</span>
            <button type="button">
              <Send />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIShowcase;