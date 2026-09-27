import {
  ArrowUp,
  AtSign,
  FileText,
  Paperclip,
  Sparkles,
} from "lucide-react";

const AIComposer = ({
  value,
  setValue,
  onSubmit,
  activeMode,
  selectedSourceCount,
  disabled,
}) => {
  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="ai-composer-wrap">
      <div className="ai-composer">
        <textarea
          rows="3"
          value={value}
          disabled={disabled}
          onChange={(event) =>
            setValue(event.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Ask a research question..."
        />

        <div className="ai-composer__footer">
          <div>
            <button
              type="button"
              title="Attach document"
            >
              <Paperclip size={16} />
            </button>

            <button
              type="button"
              title="Reference source"
            >
              <AtSign size={16} />
            </button>

            <span>
              <Sparkles size={13} />
              {activeMode}
            </span>

            {selectedSourceCount > 0 && (
              <span>
                <FileText size={13} />
                {selectedSourceCount} sources
              </span>
            )}
          </div>

          <button
            type="button"
            className="ai-composer__send"
            disabled={
              disabled || !value.trim()
            }
            onClick={onSubmit}
          >
            <ArrowUp size={17} />
          </button>
        </div>
      </div>

      <p className="ai-composer__hint">
        Enter to send · Shift + Enter for a new line
      </p>
    </div>
  );
};

export default AIComposer;