import AIMessage from "./AIMessage";
import AIWelcome from "./AIWelcome";

const AIChat = ({
  messages,
  prompts,
  onPrompt,
  isGenerating,
}) => {
  const onlyInitialMessage =
    messages.length === 1;

  return (
    <div className="ai-chat">
      {onlyInitialMessage && (
        <AIWelcome
          prompts={prompts}
          onPrompt={onPrompt}
        />
      )}

      <div className="ai-chat__messages">
        {messages.map((message) => (
          <AIMessage
            key={message.id}
            message={message}
          />
        ))}

        {isGenerating && (
          <div className="ai-thinking">
            <span />
            <span />
            <span />

            <p>
              Analyzing research context...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChat;