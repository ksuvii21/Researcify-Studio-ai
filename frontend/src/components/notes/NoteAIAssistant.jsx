import {
  ArrowUp,
  Bot,
  Sparkles,
} from "lucide-react";

const suggestions = [
  "Improve this writing",
  "Summarize this note",
  "Find research gaps",
  "Generate research questions",
];

const NoteAIAssistant = () => {
  return (
    <aside className="note-ai">
      <div className="note-ai__header">
        <span>
          <Bot size={19} />
        </span>

        <div>
          <h3>Research AI</h3>
          <p>Note-aware assistant</p>
        </div>
      </div>

      <div className="note-ai__message">
        <Sparkles size={16} />

        <div>
          <strong>
            Work with this note
          </strong>

          <p>
            I can help synthesize ideas,
            improve your writing or identify
            potential research directions.
          </p>
        </div>
      </div>

      <div className="note-ai__suggestions">
        {suggestions.map((item) => (
          <button
            type="button"
            key={item}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="note-ai__input">
        <textarea
          rows="3"
          placeholder="Ask about this note..."
        />

        <button
          type="button"
          aria-label="Send"
        >
          <ArrowUp size={16} />
        </button>
      </div>

      <small>
        Uses the current note and linked
        research context.
      </small>
    </aside>
  );
};

export default NoteAIAssistant;