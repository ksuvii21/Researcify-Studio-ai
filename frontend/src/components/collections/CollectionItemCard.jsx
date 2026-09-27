import {
  Bot,
  ExternalLink,
  FileText,
  MoreHorizontal,
  NotebookPen,
  ScrollText,
} from "lucide-react";

const itemConfig = {
  paper: {
    label: "Research Paper",
    icon: ScrollText,
  },

  document: {
    label: "Document",
    icon: FileText,
  },

  note: {
    label: "Research Note",
    icon: NotebookPen,
  },
};

const CollectionItemCard = ({
  item,
}) => {
  const config =
    itemConfig[item.type];

  const Icon = config.icon;

  return (
    <article className="collection-item-card">
      <span className="collection-item-card__icon">
        <Icon size={20} />
      </span>

      <div className="collection-item-card__body">
        <span className="collection-item-card__type">
          {config.label}
        </span>

        <h3>{item.title}</h3>

        <p>
          {item.description}
        </p>

        <span className="collection-item-card__meta">
          {item.meta}
        </span>
      </div>

      <div className="collection-item-card__actions">
        <button
          type="button"
          title="Ask AI"
        >
          <Bot size={16} />
        </button>

        <button
          type="button"
          title="Open"
        >
          <ExternalLink size={16} />
        </button>

        <button
          type="button"
          title="More options"
        >
          <MoreHorizontal size={17} />
        </button>
      </div>
    </article>
  );
};

export default CollectionItemCard;