import {
  ArrowUp,
  BrainCircuit,
  FileText,
  GitCompareArrows,
  Lightbulb,
  MessageSquareText,
  Paperclip,
  SearchCheck,
  Sparkles,
} from "lucide-react";

const prompts = [
  {
    label: "Summarize papers",
    icon: FileText,
  },
  {
    label: "Compare research",
    icon: GitCompareArrows,
  },
  {
    label: "Find research gaps",
    icon: SearchCheck,
  },
  {
    label: "Generate questions",
    icon: Lightbulb,
  },
];

const recentChats = [
  "Compare AI education papers",
  "Research gaps in adaptive learning",
  "Explain transformer architectures",
];

const AIAssistantCard = () => {
  return (
    <section className="dashboard-card ai-assistant-card">
      <div className="ai-assistant-card__heading">
        <div className="ai-assistant-card__logo">
          <Sparkles size={18} />
        </div>

        <div>
          <span>Researcify AI</span>
          <h2>Ask your research assistant</h2>
        </div>
      </div>

      <p className="ai-assistant-card__description">
        Analyze, compare and understand your research
        without losing context.
      </p>

      <div className="ai-assistant-card__prompts">
        {prompts.map(({ label, icon: Icon }) => (
          <button type="button" key={label}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="ai-assistant-card__composer">
        <textarea
          rows="3"
          placeholder="Ask anything about your research..."
        />

        <div>
          <button
            type="button"
            className="ai-composer-tool"
            aria-label="Attach research document"
          >
            <Paperclip size={15} />
          </button>

          <button
            type="button"
            className="ai-composer-context"
          >
            <BrainCircuit size={14} />
            Project Context
          </button>

          <button
            type="button"
            className="ai-composer-send"
            aria-label="Send message"
          >
            <ArrowUp size={15} />
          </button>
        </div>
      </div>

      <div className="ai-assistant-card__recent">
        <span>
          <MessageSquareText size={13} />
          Recent conversations
        </span>

        {recentChats.map((chat) => (
          <button type="button" key={chat}>
            {chat}
          </button>
        ))}
      </div>
    </section>
  );
};

export default AIAssistantCard;