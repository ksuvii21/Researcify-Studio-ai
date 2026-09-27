import {
  Bot,
  Check,
  Clipboard,
  FilePlus2,
  RefreshCw,
  User,
} from "lucide-react";

import {
  useState,
} from "react";

const AIMessage = ({
  message,
}) => {
  const [copied, setCopied] =
    useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        message.content
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  const isAssistant =
    message.role === "assistant";

  return (
    <article
      className={`ai-message ${
        isAssistant
          ? "ai-message--assistant"
          : "ai-message--user"
      }`}
    >
      <span className="ai-message__avatar">
        {isAssistant ? (
          <Bot size={18} />
        ) : (
          <User size={18} />
        )}
      </span>

      <div className="ai-message__body">
        <div className="ai-message__author">
          {isAssistant
            ? "Researcify AI"
            : "You"}
        </div>

        <div className="ai-message__content">
          {message.content}
        </div>

        {message.sources?.length > 0 && (
          <div className="ai-message__sources">
            <span>Sources used</span>

            {message.sources.map(
              (source, index) => (
                <button
                  type="button"
                  key={source.id}
                >
                  [{index + 1}] {source.title}
                </button>
              )
            )}
          </div>
        )}

        {isAssistant && (
          <div className="ai-message__actions">
            <button
              type="button"
              onClick={handleCopy}
            >
              {copied ? (
                <Check size={14} />
              ) : (
                <Clipboard size={14} />
              )}

              {copied ? "Copied" : "Copy"}
            </button>

            <button type="button">
              <FilePlus2 size={14} />
              Save to Notes
            </button>

            <button type="button">
              <RefreshCw size={14} />
              Regenerate
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default AIMessage;