import {
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";

const AIConversationSidebar = ({
  conversations,
  activeConversation,
  onSelect,
  onNewChat,
}) => {
  return (
    <aside className="ai-history">
      <button
        type="button"
        className="ai-new-chat"
        onClick={onNewChat}
      >
        <Plus size={17} />
        New Research Chat
      </button>

      <div className="ai-history__search">
        <Search size={16} />

        <input
          type="search"
          placeholder="Search conversations..."
        />
      </div>

      <div className="ai-history__label">
        Recent Conversations
      </div>

      <div className="ai-history__list">
        {conversations.map((conversation) => (
          <button
            type="button"
            key={conversation.id}
            className={`ai-history-item ${
              activeConversation === conversation.id
                ? "active"
                : ""
            }`}
            onClick={() =>
              onSelect(conversation.id)
            }
          >
            <MessageSquare size={16} />

            <div>
              <strong>
                {conversation.title}
              </strong>

              <p>
                {conversation.preview}
              </p>

              <span>
                {conversation.date}
              </span>
            </div>

            <MoreHorizontal
              className="ai-history-item__more"
              size={16}
            />
          </button>
        ))}
      </div>
    </aside>
  );
};

export default AIConversationSidebar;