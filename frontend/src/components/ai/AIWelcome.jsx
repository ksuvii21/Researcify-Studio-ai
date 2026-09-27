import {
  ArrowUpRight,
  Bot,
  Sparkles,
} from "lucide-react";

const AIWelcome = ({
  prompts,
  onPrompt,
}) => {
  return (
    <section className="ai-welcome">
      <span className="ai-welcome__icon">
        <Bot size={29} />
      </span>

      <span className="ai-welcome__badge">
        <Sparkles size={14} />
        Research-aware AI
      </span>

      <h2>
        What would you like to research?
      </h2>

      <p>
        Ask questions about your literature,
        compare papers, identify research gaps
        or generate new research directions.
      </p>

      <div className="ai-welcome__prompts">
        {prompts.slice(0, 4).map((prompt) => (
          <button
            type="button"
            key={prompt}
            onClick={() => onPrompt(prompt)}
          >
            <span>{prompt}</span>
            <ArrowUpRight size={15} />
          </button>
        ))}
      </div>
    </section>
  );
};

export default AIWelcome;