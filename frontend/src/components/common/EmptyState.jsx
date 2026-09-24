import { Inbox } from "lucide-react";

const EmptyState = ({
  title = "Nothing here yet",
  message = "There is currently no content to display.",
  action,
}) => {
  return (
    <div className="empty-state">

      <Inbox size={38} />

      <h3>{title}</h3>

      <p>{message}</p>

      {action}

    </div>
  );
};

export default EmptyState;